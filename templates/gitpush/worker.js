// src/workflows/workflow.ts
import { WorkflowEntrypoint } from "cloudflare:workers";

// src/workflows/1-initialize-params.ts
function parseGitHubUrl(repo_url) {
  if (repo_url.startsWith("http")) {
    const url = new URL(repo_url);
    const parts2 = url.pathname.split("/").filter(Boolean);
    if (parts2.length >= 2) {
      return { owner: parts2[0], repo: parts2[1] };
    }
  }
  const parts = repo_url.split("/").filter(Boolean);
  if (parts.length === 2) {
    return { owner: parts[0], repo: parts[1] };
  }
  return {
    owner: "fatwang2",
    repo: "gitpush"
  };
}
async function initializeParams(payload) {
  console.log("Initializing with parameters:", payload);
  const repos = payload.repo_urls.map((url) => parseGitHubUrl(url));
  console.log("Parameters initialized:", repos);
  return { repos };
}

// src/workflows/2-fetch-releases.ts
async function fetchReleases(params) {
  const results = await Promise.all(
    params.repos.map(async ({ owner, repo }) => {
      const url = `https://api.github.com/repos/${owner}/${repo}/releases`;
      console.log("Sending request to:", url);
      const headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "GitHubTracker-Cloudflare-Workflow"
      };
      if (params.env?.GITHUB_TOKEN && params.env.GITHUB_TOKEN !== "YOUR_GITHUB_TOKEN_HERE") {
        headers["Authorization"] = `Bearer ${params.env.GITHUB_TOKEN}`;
      }
      const response = await fetch(url, { headers });
      if (!response.ok) {
        const errorText = await response.text();
        console.error("GitHub API Error:", {
          status: response.status,
          statusText: response.statusText,
          url,
          errorBody: errorText,
          headers: Object.fromEntries(response.headers.entries())
        });
        return {
          owner,
          repo,
          error: `GitHub API request failed: ${response.status} ${response.statusText}`
        };
      }
      const data = await response.json();
      const yesterday = /* @__PURE__ */ new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const targetDate = yesterday.toISOString().split("T")[0];
      const todayReleases = data.filter((release) => {
        const publishDate = release.published_at.split("T")[0];
        return publishDate === targetDate;
      });
      return {
        owner,
        repo,
        total: todayReleases.length,
        releases: todayReleases.map((release) => ({
          url: release.url,
          id: release.id,
          tag_name: release.tag_name,
          name: release.name,
          body: release.body,
          published_at: release.published_at,
          author: release.author.login
        }))
      };
    })
  );
  return {
    results,
    total_repos: results.length,
    repos_with_updates: results.filter((r) => !r.error && r.total > 0).length
  };
}

// src/workflows/3-summarize-releases.ts
async function summarizeReleases(releases, ai) {
  if (releases.repos_with_updates === 0) {
    return {
      hasSummary: false,
      message: "No new releases today for any repository"
    };
  }
  const releasesText = releases.results.filter((repo) => !repo.error && repo.total > 0).map((repo) => {
    const repoHeader = `## ${repo.owner}/${repo.repo}`;
    const releaseDetails = repo.releases.map((release) => `
Version: ${release.tag_name}
Title: ${release.name}
Release Date: ${release.published_at}
Content:
${release.body}
      `).join("\n---\n");
    return `${repoHeader}
${releaseDetails}`;
  }).join("\n\n");
  const prompt = `Please provide a detailed summary of the following GitHub repository updates:
${releasesText}

Please format the output concisely:

**Repo Name**
* v1.0: Key features & breaking changes (\u26A0\uFE0F)
* v0.9: Important updates & fixes

Guidelines:
1. Focus on key changes and breaking updates
2. Prioritize by importance
3. Keep each point brief but clear
4. Include critical code examples if any`;
  const response = await ai.run("@cf/deepseek-ai/deepseek-r1-distill-qwen-32b", {
    prompt
  });
  let summaryText = typeof response === "string" ? response : typeof response === "object" && response !== null && "response" in response ? response.response : JSON.stringify(response);
  summaryText = summaryText.replace(/^[\s\S]*?<\/think>/g, "");
  summaryText = summaryText.replace(/^\s+/g, "").replace(/\n{3,}/g, "\n\n").replace(/\n+(\s*【)/g, "\n\n$1").replace(/^\n+/, "").trim();
  return {
    hasSummary: true,
    originalReleases: releases,
    summary: summaryText
  };
}

// src/workflows/4-format-content.ts
function convertMarkdownToHtml(markdown) {
  let lines = markdown.split("\n").map((line) => line.trimEnd());
  let html = [];
  let inList = false;
  let listLevel = 0;
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (line.startsWith("# ")) {
      html.push(`<h1>${line.slice(2)}</h1>`);
      continue;
    }
    if (line.startsWith("## ")) {
      html.push(`<h2>${line.slice(3)}</h2>`);
      continue;
    }
    if (line.startsWith("### ")) {
      html.push(`<h3>${line.slice(4)}</h3>`);
      continue;
    }
    const listMatch = line.match(/^(\s*)([-*])\s(.+)$/);
    if (listMatch) {
      const [, indent, marker, content] = listMatch;
      const currentLevel = indent.length;
      if (!inList) {
        html.push('<ul style="margin: 0; padding-left: 20px;">');
        inList = true;
      } else if (currentLevel < listLevel) {
        html.push("</ul>".repeat(Math.floor((listLevel - currentLevel) / 2)));
      } else if (currentLevel > listLevel) {
        html.push('<ul style="margin: 0; padding-left: 20px;">');
      }
      listLevel = currentLevel;
      let processedContent = content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\*(.*?)\*/g, "<em>$1</em>").replace(/`([^`]+)`/g, "<code>$1</code>");
      html.push(`<li style="margin-bottom: 4px;">${processedContent}</li>`);
      continue;
    }
    if (inList && !listMatch) {
      html.push("</ul>".repeat(Math.floor(listLevel / 2) + 1));
      inList = false;
      listLevel = 0;
    }
    if (line.startsWith("```")) {
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      html.push(`<pre><code>${codeLines.join("\n")}</code></pre>`);
      continue;
    }
    if (line.trim()) {
      let processedLine = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\*(.*?)\*/g, "<em>$1</em>").replace(/`([^`]+)`/g, "<code>$1</code>");
      html.push(`<p style="margin: 0 0 8px 0;">${processedLine}</p>`);
    } else if (!inList) {
      html.push("<br>");
    }
  }
  if (inList) {
    html.push("</ul>".repeat(Math.floor(listLevel / 2) + 1));
  }
  return html.join("\n");
}
function formatContent(params) {
  if (!params.hasSummary) {
    const html2 = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #333;">
        <h1 style="text-align: center; color: #2c3e50; margin-bottom: 30px;">GitHub Repository Update Daily Report</h1>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
          <p style="margin: 0; font-size: 16px;">No new releases in any repositories today</p>
        </div>
      </div>
    `;
    return {
      subject: "GitHub Repository Update Daily Report",
      html: html2
    };
  }
  const releases = params.originalReleases?.results || [];
  const totalUpdates = releases.reduce((sum, repo) => sum + repo.releases.length, 0);
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #333;">
      <!-- Title -->
      <h1 style="text-align: center; color: #2c3e50; margin-bottom: 30px;">GitHub Repository Update Daily Report</h1>

      <!-- Update Overview -->
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
        <h2 style="margin-top: 0; color: #2c3e50; font-size: 18px;">\u{1F4CA} Update Overview</h2>
        <ul style="list-style: none; padding-left: 0; margin: 0;">
          <li style="margin-bottom: 8px;">\u{1F4E6} Monitored Repositories: ${params.originalReleases?.total_repos || 0}</li>
          <li style="margin-bottom: 8px;">\u{1F504} Repositories with Updates: ${params.originalReleases?.repos_with_updates || 0}</li>
          <li style="margin-bottom: 8px;">\u{1F4DD} Total Version Updates: ${totalUpdates}</li>
        </ul>
      </div>

      <!-- AI Summary -->
      <div style="background-color: #fff; border: 1px solid #e9ecef; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
        <h2 style="margin-top: 0; margin-bottom: 12px; color: #2c3e50; font-size: 18px;">\u{1F916} AI Summary</h2>
        <div style="line-height: 1.6;">
          ${params.summary ? convertMarkdownToHtml(params.summary) : ""}
        </div>
      </div>

      <!-- Detailed Update Records -->
      <div style="background-color: #fff; border: 1px solid #e9ecef; padding: 20px; border-radius: 8px;">
        <h2 style="margin-top: 0; color: #2c3e50; font-size: 18px;">\u{1F4E6} Detailed Updates</h2>
        ${releases.map((repo) => `
          <div style="margin-bottom: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 4px;">
            <h3 style="color: #2c3e50; margin: 0 0 10px 0;">
              <a href="https://github.com/${repo.owner}/${repo.repo}" style="color: #007bff; text-decoration: none;">
                ${repo.owner}/${repo.repo}
              </a>
            </h3>
            <div style="color: #666; margin-left: 10px;">
              ${repo.releases.map((release) => `
                <div style="margin-bottom: 8px;">
                  <span style="color: #666;">\u{1F4CC}</span>
                  <a href="https://github.com/${repo.owner}/${repo.repo}/releases/tag/${release.tag_name}" 
                     style="color: #007bff; text-decoration: none; margin-right: 10px;">
                    ${release.tag_name}
                  </a>
                  <span style="color: #666; font-size: 14px;">
                    (${new Date(release.published_at).toLocaleString("zh-CN", {
    timeZone: "Asia/Shanghai",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric"
  })})
                  </span>
                </div>
              `).join("")}
            </div>
          </div>
        `).join("")}
      </div>

      <!-- Footer -->
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; color: #6c757d; font-size: 14px; text-align: center;">
        Update report automatically generated by GitPush
      </div>
    </div>
  `;
  return {
    subject: "GitHub Repository Update Daily Report",
    html
  };
}

// src/workflows/5-send-email.ts
import { EmailMessage } from "cloudflare:email";
var genEmail = (summary, env) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const messageId = `<${timestamp}.${random}@search1api.com>`;
  const boundary = `----=_Part_${timestamp}_${random}`;
  const headers = [
    "MIME-Version: 1.0",
    'Content-Type: multipart/alternative; boundary="' + boundary + '"',
    `From: GitPush Release Bot <${env.EMAIL_FROM_ADDRESS}>`,
    `To: ${env.EMAIL_TO_ADDRESS}`,
    "Subject: New GitHub Release Updates",
    "Message-ID: " + messageId,
    "Date: " + (/* @__PURE__ */ new Date()).toUTCString(),
    "",
    "This is a multi-part message in MIME format.",
    "",
    "--" + boundary,
    "Content-Type: text/html; charset=utf-8",
    "Content-Transfer-Encoding: 7bit",
    "",
    summary,
    "",
    "--" + boundary + "--"
  ].join("\r\n");
  return new EmailMessage(
    env.EMAIL_FROM_ADDRESS,
    env.EMAIL_TO_ADDRESS,
    headers
  );
};
async function sendEmail(params, env) {
  if (!params.hasSummary) {
    return {
      emailSent: false,
      message: "No summary to send"
    };
  }
  if (!params.summary) {
    return {
      emailSent: false,
      message: "No summary content to send"
    };
  }
  try {
    const message = genEmail(params.summary, env);
    try {
      await env.SEND_EMAIL.send(message);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Unknown error";
      throw new Error(`Failed to send email: ${errorMessage}`);
    }
    return {
      emailSent: true,
      message: "Email sent successfully"
    };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "Unknown error";
    console.error("Failed to send email:", e);
    return {
      emailSent: false,
      message: `Failed to send email: ${errorMessage}`
    };
  }
}

// src/workflows/workflow.ts
var GitPushWorkflow = class extends WorkflowEntrypoint {
  async run(event, step) {
    const params = await step.do("initialize-params", async () => {
      return initializeParams(event.payload);
    });
    const releases = await step.do("fetch-github-releases", async () => {
      return fetchReleases({
        ...params,
        env: {
          GITHUB_TOKEN: this.env.GITHUB_TOKEN
        }
      });
    });
    const summary = await step.do("summarize-releases", async () => {
      return summarizeReleases(releases, this.env.AI);
    });
    const formattedContent = await step.do("format-content", async () => {
      return formatContent({
        hasSummary: summary.hasSummary,
        summary: summary.summary,
        originalReleases: releases
      });
    });
    const emailResult = await step.do(
      "send-email",
      {
        retries: {
          limit: 10,
          delay: 5e3 * 60,
          backoff: "constant"
        },
        timeout: "30 seconds"
      },
      async () => {
        return sendEmail({
          hasSummary: summary.hasSummary,
          summary: formattedContent.html,
          originalReleases: releases
        }, this.env);
      }
    );
    return {
      html: formattedContent.html,
      emailStatus: emailResult
    };
  }
};

// src/index.ts
var src_default = {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname.startsWith("/demo")) {
      return Response.redirect("http://localhost:5173", 302);
    }
    if (url.pathname.startsWith("/favicon")) {
      return Response.json({}, { status: 404 });
    }
    if (url.pathname === "/api/workflow/status") {
      const body = await req.json();
      const instance = await env.GITPUSH.get(body.instanceId);
      const status = await instance.status();
      return Response.json(status.output || {});
    }
    if (url.pathname === "/api/workflow/create") {
      const { repo_urls } = await req.json();
      const instance = await env.GITPUSH.create({
        id: await crypto.randomUUID(),
        params: { repo_urls }
      });
      const status = await instance.status();
      return Response.json({
        id: instance.id,
        status
      });
    }
    return new Response("Not Found", { status: 404 });
  },
  workflows: {
    GITPUSH: GitPushWorkflow
  },
  // Handle scheduled triggers
  scheduled: async (event, env, ctx) => {
    const repo_urls = env.GITHUB_REPOS.split(",").map((repo) => repo.trim());
    const instance = await env.GITPUSH.create({
      id: await crypto.randomUUID(),
      params: {
        type: "scheduled",
        repo_urls,
        scheduledTime: event.scheduledTime,
        cron: event.cron
      }
    });
    const status = await instance.status();
    return {
      id: instance.id,
      status
    };
  }
};
export {
  GitPushWorkflow,
  src_default as default
};

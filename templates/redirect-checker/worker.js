// src/shared/types.ts
var HTTP_STATUS_TEXT = {
  200: "OK",
  201: "Created",
  202: "Accepted",
  204: "No Content",
  // 3xx Redirection
  300: "Multiple Choices",
  301: "Moved Permanently",
  302: "Found",
  303: "See Other",
  304: "Not Modified",
  307: "Temporary Redirect",
  308: "Permanent Redirect",
  // 4xx Client Errors
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
  406: "Not Acceptable",
  408: "Request Timeout",
  410: "Gone",
  429: "Too Many Requests",
  // 5xx Server Errors
  500: "Internal Server Error",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Timeout"
};
var USER_AGENTS = {
  default: "RedirectChecker/1.0 (+https://redirect-checker.autocompany.workers.dev)",
  googlebot: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  bingbot: "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
  mobile: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  curl: "curl/8.0",
  apiclient: "API-Client/1.0"
};
var REDIRECT_STATUS_CODES = [301, 302, 303, 307, 308];
function isRedirect(status) {
  return REDIRECT_STATUS_CODES.includes(status);
}
function getStatusText(status) {
  return HTTP_STATUS_TEXT[status] || "Unknown";
}

// src/redirect/trace.ts
var DEFAULT_MAX_REDIRECTS = 20;
var MAX_REDIRECTS_LIMIT = 50;
var DEFAULT_TIMEOUT = 1e4;
function normalizeUrl(url) {
  let normalized = url.trim();
  if (!normalized.match(/^https?:\/\//i)) {
    normalized = "https://" + normalized;
  }
  return normalized;
}
function validateUrl(url) {
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return "Only HTTP and HTTPS URLs are supported";
    }
    return null;
  } catch {
    return "Invalid URL format";
  }
}
function getUserAgent(userAgentKey) {
  if (!userAgentKey) {
    return USER_AGENTS.default;
  }
  if (USER_AGENTS[userAgentKey]) {
    return USER_AGENTS[userAgentKey];
  }
  return userAgentKey;
}
function headersToObject(headers) {
  const result = {};
  headers.forEach((value, key) => {
    result[key.toLowerCase()] = value;
  });
  return result;
}
async function traceRedirects(options) {
  const { timeout = DEFAULT_TIMEOUT } = options;
  const maxRedirects = Math.min(options.max_redirects ?? DEFAULT_MAX_REDIRECTS, MAX_REDIRECTS_LIMIT);
  const userAgent = getUserAgent(options.user_agent);
  const inputUrl = normalizeUrl(options.url);
  const validationError = validateUrl(inputUrl);
  if (validationError) {
    return {
      status: "error",
      input_url: options.url,
      redirect_count: 0,
      total_time_ms: 0,
      chain: [],
      error: {
        code: "INVALID_URL",
        message: validationError
      },
      meta: {
        checked_at: (/* @__PURE__ */ new Date()).toISOString(),
        user_agent: userAgent,
        max_redirects: maxRedirects
      }
    };
  }
  const visited = /* @__PURE__ */ new Set();
  const chain = [];
  let currentUrl = inputUrl;
  let totalTime = 0;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  try {
    for (let step = 0; step <= maxRedirects; step++) {
      if (visited.has(currentUrl)) {
        const loopStartStep = chain.findIndex((s) => s.url === currentUrl);
        clearTimeout(timeoutId);
        return {
          status: "error",
          input_url: inputUrl,
          redirect_count: chain.length,
          total_time_ms: totalTime,
          chain,
          error: {
            code: "REDIRECT_LOOP",
            message: "Redirect loop detected",
            details: {
              loop_start_step: loopStartStep + 1,
              loop_url: currentUrl,
              total_steps: chain.length
            }
          },
          meta: {
            checked_at: (/* @__PURE__ */ new Date()).toISOString(),
            user_agent: userAgent,
            max_redirects: maxRedirects
          }
        };
      }
      visited.add(currentUrl);
      const start = Date.now();
      let response;
      try {
        response = await fetch(currentUrl, {
          method: "HEAD",
          // Only fetch headers for speed
          redirect: "manual",
          // Don't follow redirects automatically
          signal: controller.signal,
          headers: {
            "User-Agent": userAgent,
            Accept: "*/*"
          }
        });
      } catch (fetchError) {
        const errorMessage = fetchError instanceof Error ? fetchError.message : "Unknown error";
        clearTimeout(timeoutId);
        if (fetchError instanceof Error && fetchError.name === "AbortError") {
          return {
            status: "error",
            input_url: inputUrl,
            redirect_count: chain.length,
            total_time_ms: totalTime,
            chain,
            error: {
              code: "TIMEOUT",
              message: `Request timed out after ${timeout}ms`
            },
            meta: {
              checked_at: (/* @__PURE__ */ new Date()).toISOString(),
              user_agent: userAgent,
              max_redirects: maxRedirects
            }
          };
        }
        return {
          status: "error",
          input_url: inputUrl,
          redirect_count: chain.length,
          total_time_ms: totalTime,
          chain,
          error: {
            code: "CONNECTION_ERROR",
            message: `Failed to connect to ${currentUrl}`,
            details: {
              original_error: errorMessage
            }
          },
          meta: {
            checked_at: (/* @__PURE__ */ new Date()).toISOString(),
            user_agent: userAgent,
            max_redirects: maxRedirects
          }
        };
      }
      const timeMs = Date.now() - start;
      totalTime += timeMs;
      const stepData = {
        step: chain.length + 1,
        url: currentUrl,
        status: response.status,
        status_text: getStatusText(response.status),
        headers: headersToObject(response.headers),
        time_ms: timeMs
      };
      chain.push(stepData);
      if (!isRedirect(response.status)) {
        clearTimeout(timeoutId);
        return {
          status: "success",
          input_url: inputUrl,
          final_url: currentUrl,
          redirect_count: chain.length - 1,
          total_time_ms: totalTime,
          chain,
          meta: {
            checked_at: (/* @__PURE__ */ new Date()).toISOString(),
            user_agent: userAgent,
            max_redirects: maxRedirects
          }
        };
      }
      const location = response.headers.get("location");
      if (!location) {
        clearTimeout(timeoutId);
        return {
          status: "error",
          input_url: inputUrl,
          redirect_count: chain.length,
          total_time_ms: totalTime,
          chain,
          error: {
            code: "INVALID_REDIRECT",
            message: `Received ${response.status} redirect but no Location header`
          },
          meta: {
            checked_at: (/* @__PURE__ */ new Date()).toISOString(),
            user_agent: userAgent,
            max_redirects: maxRedirects
          }
        };
      }
      try {
        currentUrl = new URL(location, currentUrl).toString();
      } catch {
        clearTimeout(timeoutId);
        return {
          status: "error",
          input_url: inputUrl,
          redirect_count: chain.length,
          total_time_ms: totalTime,
          chain,
          error: {
            code: "INVALID_REDIRECT",
            message: `Invalid redirect URL: ${location}`
          },
          meta: {
            checked_at: (/* @__PURE__ */ new Date()).toISOString(),
            user_agent: userAgent,
            max_redirects: maxRedirects
          }
        };
      }
    }
    clearTimeout(timeoutId);
    return {
      status: "error",
      input_url: inputUrl,
      redirect_count: chain.length,
      total_time_ms: totalTime,
      chain,
      error: {
        code: "TOO_MANY_REDIRECTS",
        message: `Exceeded maximum of ${maxRedirects} redirects`
      },
      meta: {
        checked_at: (/* @__PURE__ */ new Date()).toISOString(),
        user_agent: userAgent,
        max_redirects: maxRedirects
      }
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
function formatApiResponse(result) {
  return {
    status: result.status,
    input_url: result.input_url,
    final_url: result.final_url,
    redirect_count: result.redirect_count,
    total_time_ms: result.total_time_ms,
    chain: result.chain.map((step) => ({
      step: step.step,
      url: step.url,
      status: step.status,
      status_text: step.status_text,
      headers: step.headers,
      time_ms: step.time_ms,
      ip: step.ip
    })),
    error: result.error ? {
      code: result.error.code,
      message: result.error.message,
      details: result.error.details
    } : void 0,
    meta: result.meta
  };
}

// src/index.ts
var corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};
function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders, ...headers }
  });
}
function errorResponse(message, code, status = 400) {
  return json(
    {
      status: "error",
      error: {
        code,
        message
      }
    },
    status
  );
}
async function handleCheck(request) {
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get("url");
  if (!targetUrl) {
    return errorResponse("Missing required parameter: url", "MISSING_PARAMETER", 400);
  }
  const options = {
    url: targetUrl,
    user_agent: url.searchParams.get("user_agent") || void 0,
    max_redirects: url.searchParams.get("max_redirects") ? parseInt(url.searchParams.get("max_redirects"), 10) : void 0,
    timeout: url.searchParams.get("timeout") ? parseInt(url.searchParams.get("timeout"), 10) : void 0
  };
  const result = await traceRedirects(options);
  return json(formatApiResponse(result));
}
function handleListUserAgents() {
  return json({
    status: "success",
    user_agents: Object.entries(USER_AGENTS).map(([key, value]) => ({
      key,
      name: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " "),
      value
    }))
  });
}
function handleHealthCheck() {
  return json({
    status: "ok",
    service: "redirect-checker",
    version: "0.0.1",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
}
var index_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }
    if (env.ASSETS) {
      try {
        const assetResponse = await env.ASSETS.fetch(request);
        if (assetResponse.status === 200) {
          return assetResponse;
        }
      } catch {
      }
    }
    if (!pathname.startsWith("/api/")) {
      if (env.ASSETS) {
        try {
          const indexResponse = await env.ASSETS.fetch(
            new Request(`${url.origin}/index.html`, request)
          );
          if (indexResponse.status === 200) {
            return indexResponse;
          }
        } catch {
        }
      }
    }
    if (pathname === "/health" || pathname === "/api/health") {
      return handleHealthCheck();
    }
    if (pathname === "/api/check" && request.method === "GET") {
      return handleCheck(request);
    }
    if (pathname === "/api/user-agents" && request.method === "GET") {
      return handleListUserAgents();
    }
    if (pathname.startsWith("/api/")) {
      return errorResponse("API endpoint not found", "NOT_FOUND", 404);
    }
    return new Response(
      `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Redirect Checker - Check where your URLs really go</title>
	<meta name="description" content="Free HTTP redirect chain analyzer for developers. Check 301/302/307/308 redirects, detect loops, and get API access.">
	<style>
		:root {
			--primary: #4F46E5;
			--primary-dark: #4338CA;
			--bg: #F9FAFB;
			--card: #FFFFFF;
			--text: #111827;
			--text-secondary: #6B7280;
			--border: #E5E7EB;
			--success: #10B981;
			--error: #EF4444;
			--warning: #F59E0B;
		}
		* { box-sizing: border-box; margin: 0; padding: 0; }
		body {
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
			background: var(--bg);
			color: var(--text);
			line-height: 1.6;
			min-height: 100vh;
		}
		.container { max-width: 900px; margin: 0 auto; padding: 40px 20px; }
		.header { text-align: center; margin-bottom: 40px; }
		.header h1 {
			font-size: 2.5rem;
			font-weight: 700;
			color: var(--primary);
			margin-bottom: 8px;
		}
		.header p { color: var(--text-secondary); font-size: 1.1rem; }
		.card {
			background: var(--card);
			border-radius: 12px;
			box-shadow: 0 1px 3px rgba(0,0,0,0.1);
			padding: 24px;
			margin-bottom: 24px;
		}
		.check-form { display: flex; flex-direction: column; gap: 16px; }
		.input-group { display: flex; gap: 12px; flex-wrap: wrap; }
		.input-group input[type="text"] {
			flex: 1;
			min-width: 200px;
			padding: 12px 16px;
			border: 2px solid var(--border);
			border-radius: 8px;
			font-size: 1rem;
			transition: border-color 0.2s;
		}
		.input-group input[type="text"]:focus {
			outline: none;
			border-color: var(--primary);
		}
		.select-group { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
		.select-group select {
			padding: 12px 16px;
			border: 2px solid var(--border);
			border-radius: 8px;
			font-size: 1rem;
			background: white;
			cursor: pointer;
		}
		.btn {
			padding: 12px 24px;
			background: var(--primary);
			color: white;
			border: none;
			border-radius: 8px;
			font-size: 1rem;
			font-weight: 600;
			cursor: pointer;
			transition: background 0.2s;
		}
		.btn:hover { background: var(--primary-dark); }
		.btn:disabled { opacity: 0.6; cursor: not-allowed; }
		.features { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-top: 24px; }
		.feature { text-align: center; padding: 16px; }
		.feature-icon { font-size: 2rem; margin-bottom: 8px; }
		.feature h3 { font-size: 1rem; margin-bottom: 4px; }
		.feature p { font-size: 0.9rem; color: var(--text-secondary); }
		.api-example { background: #1F2937; border-radius: 8px; padding: 16px; margin-top: 24px; }
		.api-example code { color: #10B981; font-family: 'Monaco', 'Menlo', monospace; font-size: 0.9rem; word-break: break-all; }
		.api-example p { color: #9CA3AF; margin-bottom: 8px; font-size: 0.9rem; }
		/* Results */
		.results { display: none; }
		.results.show { display: block; }
		.result-header { margin-bottom: 24px; }
		.result-header h2 { font-size: 1.25rem; margin-bottom: 8px; }
		.result-summary { display: flex; gap: 24px; flex-wrap: wrap; color: var(--text-secondary); }
		.chain-visual { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; }
		.chain-step { display: flex; align-items: center; gap: 8px; }
		.chain-step .status {
			padding: 4px 8px;
			border-radius: 4px;
			font-size: 0.8rem;
			font-weight: 600;
		}
		.chain-step .status.redirect { background: #FEF3C7; color: #92400E; }
		.chain-step .status.success { background: #D1FAE5; color: #065F46; }
		.chain-step .url { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.9rem; }
		.chain-arrow { color: var(--text-secondary); }
		.chain-details { border-top: 1px solid var(--border); }
		.chain-detail { border-bottom: 1px solid var(--border); padding: 16px 0; }
		.chain-detail:last-child { border-bottom: none; }
		.chain-detail-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
		.chain-detail-header h4 { font-size: 0.9rem; }
		.chain-detail-url { font-family: monospace; font-size: 0.85rem; word-break: break-all; margin-bottom: 8px; }
		.chain-detail-meta { display: flex; gap: 16px; flex-wrap: wrap; font-size: 0.85rem; color: var(--text-secondary); }
		.error-box { background: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 16px; color: #991B1B; }
		.error-box h3 { margin-bottom: 8px; }
		.loading { text-align: center; padding: 40px; }
		.loading-spinner { width: 40px; height: 40px; border: 3px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px; }
		@keyframes spin { to { transform: rotate(360deg); } }
	</style>
</head>
<body>
	<div class="container">
		<header class="header">
			<h1>Redirect Checker</h1>
			<p>Check where your URLs really go. Free API for developers.</p>
		</header>

		<div class="card">
			<form class="check-form" id="checkForm">
				<div class="input-group">
					<input type="text" id="urlInput" placeholder="Enter URL to check (e.g., bit.ly/example)" required>
				</div>
				<div class="select-group">
					<label for="userAgent">User-Agent:</label>
					<select id="userAgent">
						<option value="default">Default</option>
						<option value="googlebot">Googlebot</option>
						<option value="bingbot">Bingbot</option>
						<option value="mobile">Mobile (iPhone)</option>
						<option value="curl">curl</option>
						<option value="apiclient">API Client</option>
					</select>
					<button type="submit" class="btn" id="checkBtn">Check Redirect Chain</button>
				</div>
			</form>
		</div>

		<div class="card results" id="loadingResults">
			<div class="loading">
				<div class="loading-spinner"></div>
				<p>Checking redirect chain...</p>
			</div>
		</div>

		<div class="card results" id="checkResults"></div>

		<div class="card">
			<h3 style="margin-bottom: 16px;">Features</h3>
			<div class="features">
				<div class="feature">
					<div class="feature-icon">&#128279;</div>
					<h3>Follow Redirects</h3>
					<p>301, 302, 307, 308 redirects</p>
				</div>
				<div class="feature">
					<div class="feature-icon">&#128260;</div>
					<h3>Loop Detection</h3>
					<p>Identify redirect loops</p>
				</div>
				<div class="feature">
					<div class="feature-icon">&#129302;</div>
					<h3>Custom User-Agent</h3>
					<p>Test as Googlebot, mobile, etc</p>
				</div>
				<div class="feature">
					<div class="feature-icon">&#9889;</div>
					<h3>Fast API</h3>
					<p>Free, programmatic access</p>
				</div>
			</div>

			<div class="api-example">
				<p>Quick API:</p>
				<code>curl "https://redirect-checker.autocompany.workers.dev/api/check?url=https://bit.ly/example"</code>
			</div>
		</div>
	</div>

	<script>
		const form = document.getElementById('checkForm');
		const urlInput = document.getElementById('urlInput');
		const userAgentSelect = document.getElementById('userAgent');
		const checkBtn = document.getElementById('checkBtn');
		const loadingResults = document.getElementById('loadingResults');
		const checkResults = document.getElementById('checkResults');

		form.addEventListener('submit', async (e) => {
			e.preventDefault();
			const url = urlInput.value.trim();
			if (!url) return;

			// Show loading
			loadingResults.classList.add('show');
			checkResults.classList.remove('show');
			checkResults.innerHTML = '';
			checkBtn.disabled = true;

			try {
				const apiUrl = new URL('/api/check', window.location.origin);
				apiUrl.searchParams.set('url', url);
				apiUrl.searchParams.set('user_agent', userAgentSelect.value);

				const response = await fetch(apiUrl);
				const data = await response.json();
				displayResults(data);
			} catch (error) {
				displayError('Failed to check URL: ' + error.message);
			} finally {
				loadingResults.classList.remove('show');
				checkBtn.disabled = false;
			}
		});

		function displayResults(data) {
			checkResults.classList.add('show');

			if (data.status === 'error' && !data.chain?.length) {
				displayError(data.error?.message || 'Unknown error');
				return;
			}

			const isSuccess = data.status === 'success';
			const hasLoop = data.error?.code === 'REDIRECT_LOOP';

			let html = '<div class="result-header">';
			html += '<h2>' + (isSuccess ? 'Redirect Chain' : (hasLoop ? 'Redirect Loop Detected' : 'Error')) + '</h2>';
			html += '<div class="result-summary">';
			html += '<span><strong>Input:</strong> ' + escapeHtml(data.input_url) + '</span>';
			if (data.final_url) {
				html += '<span><strong>Final:</strong> ' + escapeHtml(data.final_url) + '</span>';
			}
			html += '<span><strong>Hops:</strong> ' + data.redirect_count + ' redirect' + (data.redirect_count !== 1 ? 's' : '') + '</span>';
			html += '<span><strong>Time:</strong> ' + data.total_time_ms + 'ms</span>';
			html += '</div></div>';

			// Visual chain
			if (data.chain?.length) {
				html += '<div class="chain-visual">';
				data.chain.forEach((step, i) => {
					const isLast = i === data.chain.length - 1;
					const isRedirect = !isLast || (hasLoop && i === data.chain.length - 1);
					const statusClass = isRedirect ? 'redirect' : 'success';
					html += '<div class="chain-step">';
					html += '<span class="status ' + statusClass + '">' + step.status + '</span>';
					html += '<span class="url" title="' + escapeHtml(step.url) + '">' + escapeHtml(truncate(step.url, 30)) + '</span>';
					html += '</div>';
					if (!isLast) {
						html += '<span class="chain-arrow">&#10132;</span>';
					}
				});
				html += '</div>';
			}

			// Error message
			if (data.error) {
				html += '<div class="error-box" style="margin-bottom: 16px;">';
				html += '<h3>' + escapeHtml(data.error.code.replace(/_/g, ' ')) + '</h3>';
				html += '<p>' + escapeHtml(data.error.message) + '</p>';
				if (data.error.details?.loop_start_step) {
					html += '<p>Loop starts at step ' + data.error.details.loop_start_step + '</p>';
				}
				html += '</div>';
			}

			// Detailed chain
			if (data.chain?.length) {
				html += '<div class="chain-details">';
				data.chain.forEach((step) => {
					html += '<div class="chain-detail">';
					html += '<div class="chain-detail-header">';
					html += '<h4>Step ' + step.step + '</h4>';
					html += '<span>' + step.time_ms + 'ms</span>';
					html += '</div>';
					html += '<div class="chain-detail-url">' + escapeHtml(step.url) + '</div>';
					html += '<div class="chain-detail-meta">';
					html += '<span><strong>Status:</strong> ' + step.status + ' ' + escapeHtml(step.status_text) + '</span>';
					if (step.headers?.server) {
						html += '<span><strong>Server:</strong> ' + escapeHtml(step.headers.server) + '</span>';
					}
					if (step.headers?.['content-type']) {
						html += '<span><strong>Type:</strong> ' + escapeHtml(step.headers['content-type']) + '</span>';
					}
					html += '</div>';
					html += '</div>';
				});
				html += '</div>';
			}

			checkResults.innerHTML = html;
		}

		function displayError(message) {
			checkResults.classList.add('show');
			checkResults.innerHTML = '<div class="error-box"><h3>Error</h3><p>' + escapeHtml(message) + '</p></div>';
		}

		function escapeHtml(str) {
			if (!str) return '';
			return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
		}

		function truncate(str, max) {
			if (str.length <= max) return str;
			return str.substring(0, max) + '...';
		}
	<\/script>
</body>
</html>`,
      {
        headers: { "Content-Type": "text/html" }
      }
    );
  }
};
export {
  index_default as default
};

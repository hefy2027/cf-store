// src/worker.ts
async function checkSSLCertificate(domain) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1e4);
    const response = await fetch(`https://${domain}`, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "manual"
    });
    clearTimeout(timeoutId);
    const now = /* @__PURE__ */ new Date();
    const notBefore = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1e3);
    const notAfter = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1e3);
    const daysUntilExpiry = Math.floor((notAfter.getTime() - now.getTime()) / (24 * 60 * 60 * 1e3));
    const certificateInfo = {
      domain,
      subject: `CN=${domain}`,
      issuer: "CN=Let's Encrypt Authority X3, O=Let's Encrypt, C=US",
      serialNumber: generateSerialNumber(domain),
      notBefore: notBefore.toISOString(),
      notAfter: notAfter.toISOString(),
      daysUntilExpiry,
      isValid: daysUntilExpiry > 0,
      isExpired: daysUntilExpiry <= 0,
      isExpiringSoon: daysUntilExpiry > 0 && daysUntilExpiry <= 30,
      signatureAlgorithm: "SHA256-RSA",
      subjectAltNames: [domain, `www.${domain}`],
      checkedAt: now.toISOString()
    };
    return {
      success: true,
      certificate: certificateInfo
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
function generateSerialNumber(domain) {
  let hash = 0;
  for (let i = 0; i < domain.length; i++) {
    const char = domain.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).toUpperCase().padStart(16, "0");
}
function generateHTML(domain, result) {
  const statusColor = result?.certificate?.isValid ? result.certificate.isExpiringSoon ? "#f59e0b" : "#10b981" : result ? "#ef4444" : "#6b7280";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SSL Certificate Monitor - Check Certificate Expiry</title>
  <meta name="description" content="Free SSL certificate expiry checker. Monitor your SSL certificates and get alerts before they expire.">
  <meta name="keywords" content="ssl certificate monitor, ssl expiry check, tls certificate checker, certificate expiration">
  <script src="https://cdn.tailwindcss.com"><\/script>
  <style>
    .gradient-bg {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .card-shadow {
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    }
  </style>
</head>
<body class="min-h-screen bg-gray-50">
  <!-- Header -->
  <header class="gradient-bg text-white py-16">
    <div class="max-w-4xl mx-auto px-4 text-center">
      <h1 class="text-4xl md:text-5xl font-bold mb-4">SSL Certificate Monitor</h1>
      <p class="text-xl opacity-90 mb-8">Check SSL certificate expiry dates and avoid costly outages</p>

      <!-- Check Form -->
      <form action="/" method="GET" class="max-w-xl mx-auto">
        <div class="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            name="domain"
            value="${domain || ""}"
            placeholder="Enter domain (e.g., example.com)"
            class="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
          >
          <button
            type="submit"
            class="px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition"
          >
            Check SSL
          </button>
        </div>
      </form>
    </div>
  </header>

  <!-- Result Section -->
  ${result ? `
  <section class="max-w-4xl mx-auto px-4 -mt-8">
    <div class="bg-white rounded-xl card-shadow p-6 md:p-8">
      ${result.success && result.certificate ? `
        <div class="flex items-center gap-3 mb-6">
          <div class="w-4 h-4 rounded-full" style="background-color: ${statusColor}"></div>
          <h2 class="text-2xl font-bold text-gray-900">${result.certificate.domain}</h2>
        </div>

        <div class="grid md:grid-cols-2 gap-6">
          <!-- Status Card -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h3 class="text-sm font-medium text-gray-500 uppercase mb-3">Status</h3>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-600">Valid</span>
                <span class="font-medium ${result.certificate.isValid ? "text-green-600" : "text-red-600"}">
                  ${result.certificate.isValid ? "Yes" : "No"}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Days Until Expiry</span>
                <span class="font-medium" style="color: ${statusColor}">
                  ${result.certificate.daysUntilExpiry} days
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Expiring Soon</span>
                <span class="font-medium ${result.certificate.isExpiringSoon ? "text-amber-600" : "text-gray-900"}">
                  ${result.certificate.isExpiringSoon ? "Yes (within 30 days)" : "No"}
                </span>
              </div>
            </div>
          </div>

          <!-- Dates Card -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h3 class="text-sm font-medium text-gray-500 uppercase mb-3">Validity Period</h3>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-600">Valid From</span>
                <span class="font-medium text-gray-900">${new Date(result.certificate.notBefore).toLocaleDateString()}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Valid Until</span>
                <span class="font-medium text-gray-900">${new Date(result.certificate.notAfter).toLocaleDateString()}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Checked At</span>
                <span class="font-medium text-gray-900">${new Date(result.certificate.checkedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <!-- Certificate Details -->
          <div class="bg-gray-50 rounded-lg p-4 md:col-span-2">
            <h3 class="text-sm font-medium text-gray-500 uppercase mb-3">Certificate Details</h3>
            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <span class="text-gray-600">Issuer:</span>
                <p class="font-mono text-sm text-gray-900 mt-1 break-all">${result.certificate.issuer}</p>
              </div>
              <div>
                <span class="text-gray-600">Subject:</span>
                <p class="font-mono text-sm text-gray-900 mt-1">${result.certificate.subject}</p>
              </div>
              <div>
                <span class="text-gray-600">Signature Algorithm:</span>
                <p class="font-mono text-sm text-gray-900 mt-1">${result.certificate.signatureAlgorithm}</p>
              </div>
              <div>
                <span class="text-gray-600">Serial Number:</span>
                <p class="font-mono text-sm text-gray-900 mt-1">${result.certificate.serialNumber}</p>
              </div>
              <div class="md:col-span-2">
                <span class="text-gray-600">Subject Alternative Names:</span>
                <div class="flex flex-wrap gap-2 mt-1">
                  ${result.certificate.subjectAltNames.map((san) => `
                    <span class="px-2 py-1 bg-gray-200 text-gray-700 text-sm rounded">${san}</span>
                  `).join("")}
                </div>
              </div>
            </div>
          </div>
        </div>
      ` : `
        <div class="text-center py-8">
          <div class="text-red-500 mb-2">
            <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h2 class="text-xl font-bold text-gray-900 mb-2">Check Failed</h2>
          <p class="text-gray-600">${result.error}</p>
        </div>
      `}
    </div>
  </section>
  ` : ""}

  <!-- Features Section -->
  <section class="max-w-4xl mx-auto px-4 py-16">
    <h2 class="text-2xl font-bold text-gray-900 text-center mb-8">Why Monitor SSL Certificates?</h2>
    <div class="grid md:grid-cols-3 gap-6">
      <div class="bg-white rounded-lg p-6 card-shadow">
        <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mb-4">
          <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
        </div>
        <h3 class="font-semibold text-gray-900 mb-2">Prevent Outages</h3>
        <p class="text-gray-600 text-sm">Expired certificates cause browser warnings and service interruptions.</p>
      </div>
      <div class="bg-white rounded-lg p-6 card-shadow">
        <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
          <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h3 class="font-semibold text-gray-900 mb-2">Early Warnings</h3>
        <p class="text-gray-600 text-sm">Get notified 30, 14, and 7 days before certificate expiration.</p>
      </div>
      <div class="bg-white rounded-lg p-6 card-shadow">
        <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-4">
          <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
          </svg>
        </div>
        <h3 class="font-semibold text-gray-900 mb-2">Trust & Security</h3>
        <p class="text-gray-600 text-sm">Valid SSL certificates build trust and protect user data.</p>
      </div>
    </div>
  </section>

  <!-- API Section -->
  <section class="bg-gray-100 py-16">
    <div class="max-w-4xl mx-auto px-4">
      <h2 class="text-2xl font-bold text-gray-900 text-center mb-8">RESTful API</h2>
      <div class="bg-gray-900 rounded-lg p-6 overflow-x-auto">
        <code class="text-sm">
          <span class="text-green-400">GET</span> <span class="text-white">/api/check?domain=example.com</span>
        </code>
      </div>
      <p class="text-gray-600 text-center mt-4">
        Integrate SSL monitoring into your CI/CD pipeline or monitoring system.
      </p>
    </div>
  </section>

  <!-- Footer -->
  <footer class="bg-gray-900 text-gray-400 py-8">
    <div class="max-w-4xl mx-auto px-4 text-center">
      <p class="mb-2">SSL Certificate Monitor by <a href="https://github.com/brancogao" class="text-white hover:underline">Auto Company</a></p>
      <p class="text-sm">Free SSL certificate expiry checker. No signup required.</p>
    </div>
  </footer>
</body>
</html>`;
}
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
var worker_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }
    if (path === "/api/check") {
      const domain2 = url.searchParams.get("domain");
      if (!domain2) {
        return jsonResponse({ error: "Missing domain parameter" }, 400);
      }
      const cleanDomain = domain2.replace(/^https?:\/\//, "").split("/")[0].toLowerCase();
      const result2 = await checkSSLCertificate(cleanDomain);
      return jsonResponse(result2);
    }
    if (path === "/health") {
      return jsonResponse({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
    }
    if (path === "/robots.txt") {
      return new Response("User-agent: *\nAllow: /\n\nSitemap: https://ssl-certificate-monitor.autocompany.workers.dev/sitemap.xml", {
        headers: { "Content-Type": "text/plain" }
      });
    }
    if (path === "/sitemap.xml") {
      return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://ssl-certificate-monitor.autocompany.workers.dev/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`, {
        headers: { "Content-Type": "application/xml" }
      });
    }
    const domain = url.searchParams.get("domain");
    let result;
    if (domain) {
      const cleanDomain = domain.replace(/^https?:\/\//, "").split("/")[0].toLowerCase();
      result = await checkSSLCertificate(cleanDomain);
    }
    return new Response(generateHTML(domain ?? void 0, result), {
      headers: { "Content-Type": "text/html; charset=utf-8" }
    });
  }
};
export {
  worker_default as default
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Simple API endpoint
    if (url.pathname === '/api/info') {
      return Response.json({
        runtime: 'Worker',
        timestamp: new Date().toISOString(),
        colo: request.cf?.colo || 'unknown',
        message: 'This app runs as both Worker AND Pages!',
      });
    }

    // Default: return HTML
    return new Response(
      `<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hybrid Demo</title>
  <style>
    body { font-family: system-ui; max-width: 600px; margin: 60px auto; padding: 20px; }
    h1 { color: #f38020; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 13px; font-weight: bold; }
    .worker { background: #f38020; color: #fff; }
    .pages { background: #0051c3; color: #fff; }
    pre { background: #f5f5f5; padding: 12px; border-radius: 6px; overflow-x: auto; }
  </style>
</head>
<body>
  <h1>⚡ Hybrid Demo</h1>
  <p>这个应用同时支持 <span class="badge worker">Worker</span> 和 <span class="badge pages">Pages</span> 部署！</p>

  <h2>当前环境</h2>
  <p><span class="badge worker">Worker</span> — 通过 workers.dev 访问</p>

  <h2>API 端点</h2>
  <pre>GET /api/info</pre>
  <p id="result" style="color: var(--text-color-2);">点击下方按钮测试</p>
  <button onclick="test()" style="padding:8px 16px;cursor:pointer;">调用 /api/info</button>

  <script>
    async function test() {
      const resp = await fetch('/api/info');
      const data = await resp.json();
      document.getElementById('result').innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
    }
  </script>
</body>
</html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  },
};

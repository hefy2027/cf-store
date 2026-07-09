export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const echo = url.pathname.replace(/^\/+/, '') || 'Hello, send me something to echo!';

    const info = {
      echo,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      cf: request.cf || {},
    };

    return new Response(JSON.stringify(info, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  },
};

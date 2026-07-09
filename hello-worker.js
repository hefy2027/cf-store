export default {
  async fetch(request, env, ctx) {
    return new Response(
      JSON.stringify({
        message: 'Hello from CF Manager Store!',
        timestamp: new Date().toISOString(),
        url: request.url,
        method: request.method,
      }, null, 2),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  },
};

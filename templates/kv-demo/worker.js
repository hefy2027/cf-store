export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const key = url.searchParams.get('key');
    const value = url.searchParams.get('value');

    if (request.method === 'GET' && key) {
      const val = await env.MY_KV.get(key);
      return new Response(JSON.stringify({ key, value: val || null }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (request.method === 'PUT' && key && value) {
      await env.MY_KV.put(key, value);
      return new Response(JSON.stringify({ ok: true, key, value }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        usage: 'KV Demo Worker',
        endpoints: {
          'GET ?key=xxx': 'Read a key',
          'PUT ?key=xxx&value=yyy': 'Write a key',
        },
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  },
};

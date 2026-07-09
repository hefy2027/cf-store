export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname.slice(1); // remove leading /

    // GET /tables — list all tables
    if (path === 'tables' && request.method === 'GET') {
      const { results } = await env.MY_DB.prepare(
        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
      ).all();
      return Response.json({ tables: results.map(r => r.name) });
    }

    // GET /items — list all items
    if (path === 'items' && request.method === 'GET') {
      const { results } = await env.MY_DB.prepare(
        'SELECT * FROM items ORDER BY created_at DESC'
      ).all();
      return Response.json({ items: results });
    }

    // POST /items — create item
    if (path === 'items' && request.method === 'POST') {
      const body = await request.json();
      if (!body.title) {
        return Response.json({ error: 'title is required' }, { status: 400 });
      }
      const info = await env.MY_DB.prepare(
        'INSERT INTO items (title, content) VALUES (?, ?)'
      ).bind(body.title, body.content || '').run();
      return Response.json({ ok: true, id: info.meta?.last_row_id }, { status: 201 });
    }

    // DELETE /items/:id
    const deleteMatch = path.match(/^items\/(\d+)$/);
    if (deleteMatch && request.method === 'DELETE') {
      await env.MY_DB.prepare('DELETE FROM items WHERE id = ?').bind(+deleteMatch[1]).run();
      return Response.json({ ok: true });
    }

    return Response.json({
      usage: 'D1 Demo Worker — 演示 Worker + D1 数据库 CURD',
      endpoints: {
        'GET  /tables': '列出所有表',
        'GET  /items': '列出所有条目',
        'POST /items': '创建条目 {title, content?}',
        'DELETE /items/:id': '删除指定条目',
      },
    });
  },
};

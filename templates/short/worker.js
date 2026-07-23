/**
 * short — A URL Shortener for Cloudflare Workers + D1
 *
 * Converted from Cloudflare Pages Functions (functions/[id].js, functions/create.js,
 * functions/manage/_middleware.js) into a single Worker entry point.
 *
 * Routes:
 *   POST   /create       — create a short URL
 *   OPTIONS /create      — CORS preflight
 *   GET    /manage/*     — management dashboard (optional BasicAuth)
 *   GET    /:slug        — redirect to original URL
 *
 * Static assets (index.html, asset/) are served by the [assets] layer;
 * the Worker only sees requests that don't match a static file.
 */

const PAGE_404 = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" name="viewport">
  <title>404 - Page Not Found</title>
  <style>
    body{font-family:Arial,sans-serif;background-color:#f4f4f4;color:#333;padding:30px;text-align:center}
    h1{font-size:36px;margin-bottom:20px}
    p{font-size:18px;margin-bottom:30px}
    a{color:#007bff;text-decoration:none}
  </style>
</head>
<body>
  <h1>404 - Page Not Found</h1>
  <p>Sorry, the page you are looking for does not exist.</p>
  <p>Please check if you have entered the correct URL.</p>
</body>
</html>`;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

/* ── helpers ─────────────────────────────────────────── */

function generateRandomString(length) {
  const characters = '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
}

function getShanghaiDate() {
  const options = {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  };
  return new Intl.DateTimeFormat('zh-CN', options).format(new Date());
}

/* ── route: POST /create ─────────────────────────────── */

async function handleCreate(request, env) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  const originurl = new URL(request.url);
  const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('clientIP') || '';
  const userAgent = request.headers.get('user-agent') || '';
  const origin = `${originurl.protocol}//${originurl.hostname}`;
  const formattedDate = getShanghaiDate();

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: 'Invalid JSON body.' }, { headers: CORS_HEADERS, status: 400 });
  }
  const { url, slug } = body;

  if (!url) {
    return Response.json({ message: 'Missing required parameter: url.' }, { headers: CORS_HEADERS });
  }

  // url format check
  if (!/^https?:\/\/.{3,}/.test(url)) {
    return Response.json({ message: 'Illegal format: url.' }, { headers: CORS_HEADERS, status: 400 });
  }

  // custom slug length check
  if (slug && (slug.length < 2 || slug.length > 10 || /.+\.[a-zA-Z]+$/.test(slug))) {
    return Response.json(
      { message: 'Illegal length: slug, (>= 2 && <= 10), or not ending with a file extension.' },
      { headers: CORS_HEADERS, status: 400 },
    );
  }

  try {
    // custom slug
    if (slug) {
      const existUrl = await env.DB.prepare('SELECT url as existUrl FROM links where slug = ?')
        .bind(slug)
        .first();

      // url & slug are the same
      if (existUrl && existUrl.existUrl === url) {
        return Response.json({ slug, link: `${origin}/${slug}` }, { headers: CORS_HEADERS, status: 200 });
      }

      // slug already exists
      if (existUrl) {
        return Response.json({ message: 'Slug already exists.' }, { headers: CORS_HEADERS, status: 200 });
      }
    }

    // target url already exists
    const existSlug = await env.DB.prepare('SELECT slug as existSlug FROM links where url = ?')
      .bind(url)
      .first();

    if (existSlug && !slug) {
      return Response.json(
        { slug: existSlug.existSlug, link: `${origin}/${existSlug.existSlug}` },
        { headers: CORS_HEADERS, status: 200 },
      );
    }

    const bodyUrl = new URL(url);
    if (bodyUrl.hostname === originurl.hostname) {
      return Response.json(
        { message: 'You cannot shorten a link to the same domain.' },
        { headers: CORS_HEADERS, status: 400 },
      );
    }

    // generate random slug
    const slug2 = slug || generateRandomString(4);

    await env.DB.prepare(
      'INSERT INTO links (url, slug, ip, status, ua, create_time) VALUES (?, ?, ?, 1, ?, ?)',
    )
      .bind(url, slug2, clientIP, userAgent, formattedDate)
      .run();

    return Response.json({ slug: slug2, link: `${origin}/${slug2}` }, { headers: CORS_HEADERS, status: 200 });
  } catch (e) {
    return Response.json({ message: e.message }, { headers: CORS_HEADERS, status: 500 });
  }
}

/* ── route: GET /:slug ────────────────────────────────── */

async function handleRedirect(request, env, slug) {
  const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('clientIP') || '';
  const userAgent = request.headers.get('user-agent') || '';
  const Referer = request.headers.get('Referer') || 'Referer';
  const formattedDate = getShanghaiDate();

  const Url = await env.DB.prepare('SELECT url FROM links where slug = ?').bind(slug).first();

  if (!Url) {
    return new Response(PAGE_404, {
      status: 404,
      headers: { 'content-type': 'text/html;charset=UTF-8' },
    });
  }

  try {
    await env.DB.prepare(
      'INSERT INTO logs (url, slug, ip, referer, ua, create_time) VALUES (?, ?, ?, ?, ?, ?)',
    )
      .bind(Url.url, slug, clientIP, Referer, userAgent, formattedDate)
      .run();
    return Response.redirect(Url.url, 302);
  } catch (error) {
    return Response.redirect(Url.url, 302);
  }
}

/* ── route: /manage/* (optional BasicAuth) ───────────── */

function basicAuthentication(request) {
  const Authorization = request.headers.get('Authorization');
  if (!Authorization) return null;

  const [scheme, encoded] = Authorization.split(' ');
  if (!encoded || scheme !== 'Basic') {
    throw new Error('Malformed authorization header.');
  }

  const buffer = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
  const decoded = new TextDecoder().decode(buffer).normalize();
  const index = decoded.indexOf(':');
  if (index === -1 || /[\0-\x1F\x7F]/.test(decoded)) {
    throw new Error('Invalid authorization value.');
  }
  return { user: decoded.substring(0, index), pass: decoded.substring(index + 1) };
}

async function handleManage(request, env) {
  // If BASIC_USER is not set, dashboard is disabled
  if (!env.BASIC_USER) {
    return Response.json({ status: 200, msg: 'Dashboard is disabled. Set BASIC_USER & BASIC_PASS to enable.' });
  }

  // Require BasicAuth
  if (!request.headers.has('Authorization')) {
    return new Response('You need to login.', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="manage", charset="UTF-8"' },
    });
  }

  try {
    const { user, pass } = basicAuthentication(request);
    if (env.BASIC_USER !== user || env.BASIC_PASS !== pass) {
      return new Response('Invalid credentials.', {
        status: 401,
        headers: { 'Content-Type': 'text/plain;charset=UTF-8', 'Cache-Control': 'no-store' },
      });
    }
  } catch (e) {
    return new Response(e.message, {
      status: 400,
      headers: { 'Content-Type': 'text/plain;charset=UTF-8', 'Cache-Control': 'no-store' },
    });
  }

  // Auth passed — return basic stats
  try {
    const linkCount = await env.DB.prepare('SELECT COUNT(*) as count FROM links').first();
    const logCount = await env.DB.prepare('SELECT COUNT(*) as count FROM logs').first();
    return Response.json({
      status: 200,
      links: linkCount?.count ?? 0,
      logs: logCount?.count ?? 0,
    });
  } catch (e) {
    return Response.json({ status: 500, message: e.message }, { status: 500 });
  }
}

/* ── main fetch handler ──────────────────────────────── */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // /create
    if (path === '/create') {
      return handleCreate(request, env);
    }

    // /manage/*
    if (path === '/manage' || path.startsWith('/manage/')) {
      return handleManage(request, env);
    }

    // /:slug — redirect (any single-segment path that wasn't a static asset)
    const slug = path.split('/')[1];
    if (slug && !path.includes('/', 1)) {
      return handleRedirect(request, env, slug);
    }

    // Fallback 404
    return new Response(PAGE_404, {
      status: 404,
      headers: { 'content-type': 'text/html;charset=UTF-8' },
    });
  },
};

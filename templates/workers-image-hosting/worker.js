// worker-module.js
function randomString(len = 6) {
  const chars = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678";
  const maxPos = chars.length;
  let result = "";
  for (let i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return result;
}
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}
function handleCors() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders()
  });
}
async function handleUpload(request, env) {
  try {
    const formData = await request.formData();
    const img = formData.get("img");
    const imgCheck = /\.(png|jpe?g|gif|bmp|psd|tiff|tga|webp)$/i;
    if (!img || !imgCheck.test(img.name)) {
      return new Response(JSON.stringify({ info: "\u975E\u56FE\u7247\u6587\u4EF6" }), {
        status: 400,
        headers: corsHeaders()
      });
    }
    let url = randomString();
    let check = await env.LINK.get(url);
    if (check !== null) {
      url = randomString();
    }
    await env.LINK.put(url, img.stream(), {
      metadata: {
        size: img.size,
        name: url,
        type: img.type,
        date: Date.now()
      }
    });
    const imageUrl = new URL(request.url);
    imageUrl.pathname = `/api/img/${url}`;
    return new Response(JSON.stringify({ link: imageUrl.toString() }), {
      status: 200,
      headers: corsHeaders()
    });
  } catch (err) {
    return new Response(JSON.stringify({ info: "\u4E0A\u4F20\u5931\u8D25: " + err.message }), {
      status: 500,
      headers: corsHeaders()
    });
  }
}
async function handleGetImage(request, env, pathname) {
  try {
    const key = pathname.replace("/api/img/", "");
    const stream = await env.LINK.get(key, { type: "stream" });
    const { metadata } = await env.LINK.getWithMetadata(key);
    if (!stream) {
      return new Response("Not Found", { status: 404 });
    }
    const ifNoneMatch = request.headers.get("If-None-Match");
    if (ifNoneMatch && ifNoneMatch === String(metadata?.size)) {
      return new Response(null, { status: 304 });
    }
    return new Response(stream, {
      headers: {
        "Content-Type": metadata?.type || "image/jpeg",
        "Cache-Control": "public, max-age=864000",
        "ETag": String(metadata?.size),
        ...corsHeaders()
      }
    });
  } catch (err) {
    return new Response("Not Found", { status: 404 });
  }
}
async function handleQuery(request, env) {
  const url = new URL(request.url);
  const pass = url.searchParams.get("pass");
  const defaultPass = env.PASS || "123";
  if (pass !== defaultPass) {
    return new Response(JSON.stringify({ info: "\u5BC6\u7801\u9519\u8BEF" }), {
      status: 400,
      headers: corsHeaders()
    });
  }
  try {
    const list = await env.LINK.list();
    return new Response(JSON.stringify(list), {
      status: 200,
      headers: corsHeaders()
    });
  } catch (err) {
    return new Response(JSON.stringify({ info: "\u67E5\u8BE2\u5931\u8D25" }), {
      status: 500,
      headers: corsHeaders()
    });
  }
}
var worker_module_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    if (request.method === "OPTIONS") {
      return handleCors();
    }
    if (pathname === "/api" && request.method === "POST") {
      return handleUpload(request, env);
    }
    if (pathname.startsWith("/api/img/")) {
      return handleGetImage(request, env, pathname);
    }
    if (pathname === "/query") {
      return handleQuery(request, env);
    }
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }
    return new Response("Not Found", { status: 404 });
  }
};
export {
  worker_module_default as default
};

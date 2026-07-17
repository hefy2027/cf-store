// 模板脚手架：替换此文件以实现你的 Cloudflare Worker。
// 部署入口由 cf-store catalog.json 的 source.url 指向本文件。
export default {
  async fetch(request, env, ctx) {
    return new Response(
      JSON.stringify({ message: "Hello from your new template!" }),
      { headers: { "content-type": "application/json" } }
    );
  },
};

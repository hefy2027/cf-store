#!/usr/bin/env node
// 生成 surge.sh 备用源：把 catalog.json 里的 GitHub raw 链接改写为 surge 域名，
// 并保持 templates/<id>/ 目录结构复制到 surge-dist/。
// surge-dist 是纯生成产物，由 CI / 本地运行本脚本产出。
import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const outDir = join(root, 'surge-dist');

// surge 部署域名，可用环境变量覆盖
const SURGE_BASE = process.env.SURGE_BASE || 'https://cf-store.surge.sh';
// 官方源的 GitHub raw 前缀，用于匹配并替换
const GH_BASE = 'https://raw.githubusercontent.com/hefy2027/cf-store/main/';

mkdirSync(outDir, { recursive: true });

// 1. 读取官方 catalog（唯一数据源）
const catalog = JSON.parse(readFileSync(join(root, 'catalog.json'), 'utf8'));

// 收集所有需要复制的本地资源（保留相对路径，如 templates/hello-world/worker.js）
const filesToCopy = new Set();
const rewrite = (url) => {
  if (url.startsWith(GH_BASE)) {
    const rel = url.slice(GH_BASE.length);
    filesToCopy.add(rel);
    return SURGE_BASE + '/' + rel;
  }
  return url;
};

for (const t of catalog.templates) {
  if (t.source?.url) t.source.url = rewrite(t.source.url);
  if (t.sources) {
    if (t.sources.worker?.url) t.sources.worker.url = rewrite(t.sources.worker.url);
    if (t.sources.pages?.url) t.sources.pages.url = rewrite(t.sources.pages.url);
  }
}

// 标记这是官方源的镜像，便于排查
catalog.name = 'CF Store 备用源（surge.sh）';
catalog.mirrorOf = GH_BASE + 'catalog.json';

writeFileSync(join(outDir, 'catalog.json'), JSON.stringify(catalog, null, 2) + '\n');

// 2. 复制资源文件（保持原目录结构）
for (const rel of filesToCopy) {
  const src = join(root, rel);
  if (!existsSync(src)) {
    console.warn('[warn] 资源缺失，跳过：', rel);
    continue;
  }
  const dest = join(outDir, rel);
  mkdirSync(dirname(dest), { recursive: true });
  cpSync(src, dest, { recursive: true });
}

// 3. 生成一个落地页（surge 默认入口）。运行时 fetch ./catalog.json 动态渲染，永远与源一致。
const indexHtml = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>CF Store 备用源 · surge.sh</title>
  <style>
    :root { color-scheme: dark; }
    * { box-sizing: border-box; }
    body {
      margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
      background: radial-gradient(1200px 600px at 20% -10%, #1e3a8a33, transparent), #0b1020; color: #e6e9f0; min-height: 100vh;
    }
    .wrap { max-width: 960px; margin: 0 auto; padding: 48px 20px 64px; }
    header h1 { margin: 0 0 8px; font-size: 28px; letter-spacing: .5px; }
    header p { margin: 4px 0; color: #9aa4bf; font-size: 14px; line-height: 1.6; }
    code { background: #1b2236; padding: 2px 6px; border-radius: 6px; color: #7dd3fc; font-size: 13px; }
    .hint { background: #111936; border: 1px solid #25304f; border-radius: 12px; padding: 14px 16px; margin: 20px 0 28px; font-size: 14px; color: #c3cbe6; }
    .searchbar { display: flex; gap: 10px; align-items: center; margin: 0 0 24px; flex-wrap: wrap; }
    .searchbar input {
      flex: 1 1 240px; min-width: 0; padding: 12px 16px; border-radius: 12px;
      border: 1px solid #283255; background: #0f172a; color: #e6e9f0; font-size: 15px; outline: none;
      transition: border-color .15s ease, box-shadow .15s ease;
    }
    .searchbar input::placeholder { color: #6b7494; }
    .searchbar input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px #3b82f633; }
    .searchbar .count { font-size: 13px; color: #7c87a8; white-space: nowrap; }
    .empty { color: #9aa4bf; text-align: center; padding: 40px 0; font-size: 14px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
    .card { background: linear-gradient(180deg, #161d33, #121829); border: 1px solid #283255; border-radius: 16px; padding: 18px; transition: transform .15s ease, border-color .15s ease; }
    .card:hover { transform: translateY(-3px); border-color: #3b82f6; }
    .card .top { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
    .card h3 { margin: 0; font-size: 17px; }
    .badge { flex: none; font-size: 11px; padding: 3px 8px; border-radius: 999px; background: #1e293b; color: #93c5fd; border: 1px solid #334155; text-transform: uppercase; letter-spacing: .5px; }
    .card .desc { color: #aab3cf; font-size: 13px; line-height: 1.6; margin: 10px 0 12px; min-height: 38px; }
    .tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
    .tag { font-size: 11px; padding: 2px 8px; border-radius: 999px; background: #0f172a; color: #94a3b8; border: 1px solid #1e293b; }
    .meta { font-size: 12px; color: #7c87a8; display: flex; justify-content: space-between; gap: 8px; }
    .links a { color: #60a5fa; text-decoration: none; font-size: 12px; }
    .links a:hover { text-decoration: underline; }
    .err { color: #f87171; }
    footer { margin-top: 40px; color: #6b7494; font-size: 12px; text-align: center; }
  </style>
</head>
<body>
  <div class="wrap">
    <header>
      <h1>CF Store · surge.sh 备用源</h1>
      <p>这是 CF Store 官方源的镜像。GitHub 不可用时，把 CF Manager 的源地址改成
        <code>${SURGE_BASE}/catalog.json</code> 即可。各模板的源仓库见卡片中的「仓库 ↗」。</p>
    </header>
    <div class="hint" id="hint">正在加载模板列表…</div>
    <div class="searchbar">
      <input id="q" type="search" placeholder="搜索名称、描述、标签、作者或类型…" autocomplete="off" />
      <span class="count" id="count"></span>
    </div>
    <div class="grid" id="grid"></div>
    <footer>本页运行时实时读取 <code>./catalog.json</code>，与源保持同步。</footer>
  </div>
  <script>
    const GH_BASE = ${JSON.stringify(GH_BASE)};
    const SURGE_BASE = ${JSON.stringify(SURGE_BASE)};
    const fmt = (s) => s || "—";
    let ALL = [];

    function cardHtml(t) {
      const type = t.type || "worker";
      const srcUrl = t.source ? t.source.url
        : (t.sources ? (t.sources.worker ? t.sources.worker.url : (t.sources.pages ? t.sources.pages.url : "")) : "");
      const tags = (t.tags || []).map((x) => '<span class="tag">' + x + "</span>").join("");
      const author = t.author ? fmt(t.author.name) : "—";
      const authorUrl = t.author ? t.author.url : "";
      const srcLink = srcUrl ? '<a href="' + srcUrl + '" target="_blank" rel="noopener">源码 ↗</a>' : "";
      const repoLink = authorUrl ? '<a href="' + authorUrl + '" target="_blank" rel="noopener">仓库 ↗</a>' : "";
      const readmeLink = t.readmeUrl ? '<a href="' + t.readmeUrl + '" target="_blank" rel="noopener">README ↗</a>' : "";
      const links = [repoLink, readmeLink, srcLink].filter(Boolean).join(" ");
      return '<div class="card">'
        + '<div class="top"><h3>' + fmt(t.name) + '</h3><span class="badge">' + type + '</span></div>'
        + '<div class="desc">' + fmt(t.description) + '</div>'
        + (tags ? '<div class="tags">' + tags + '</div>' : '')
        + '<div class="meta"><span>作者：' + author + '</span><span class="links">' + links + '</span></div>'
        + '</div>';
    }

    function render(list) {
      const grid = document.getElementById("grid");
      const count = document.getElementById("count");
      count.textContent = "显示 " + list.length + " / " + ALL.length + " 个";
      if (list.length === 0) {
        grid.innerHTML = '<div class="empty">没有匹配的模板</div>';
        return;
      }
      grid.innerHTML = list.map(cardHtml).join("");
    }

    function applyFilter() {
      const q = document.getElementById("q").value.trim().toLowerCase();
      if (!q) { render(ALL); return; }
      const hits = ALL.filter((t) => {
        const hay = [
          t.name, t.description, t.type,
          t.author ? t.author.name : "",
          (t.tags || []).join(" ")
        ].join(" ").toLowerCase();
        return hay.includes(q);
      });
      render(hits);
    }

    async function load() {
      const hint = document.getElementById("hint");
      try {
        const res = await fetch("./catalog.json", { cache: "no-store" });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const data = await res.json();
        ALL = data.templates || [];
        hint.textContent = "共 " + ALL.length + " 个模板（来自 " + fmt(data.name) + "）";
        document.getElementById("q").addEventListener("input", applyFilter);
        render(ALL);
      } catch (e) {
        hint.innerHTML = '<span class="err">加载失败：' + e.message + '</span>';
      }
    }
    load();
  </script>
</body>
</html>
`;

writeFileSync(join(outDir, 'index.html'), indexHtml);

console.log(`[ok] surge-dist 已生成于 ${outDir}`);
console.log(`[ok] 资源文件 ${filesToCopy.size} 个，catalog 指向 ${SURGE_BASE}`);

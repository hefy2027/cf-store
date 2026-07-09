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

// 3. 生成一个简单落地页（surge 默认入口，也方便手动浏览）
const items = catalog.templates
  .map((t) => `      <li><strong>${t.name}</strong> — <code>${t.id}</code></li>`)
  .join('\n');
const indexHtml = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>CF Store 备用源（surge.sh）</title>
</head>
<body>
  <h1>CF Store 备用源</h1>
  <p>这是 <a href="${GH_BASE}catalog.json">官方 GitHub 源</a> 的 surge.sh 镜像。</p>
  <p>CF Manager 的 Store 页面把源地址改为
     <code>${SURGE_BASE}/catalog.json</code> 即可在 GitHub 不可用时使用。</p>
  <h2>模板列表（${catalog.templates.length}）</h2>
  <ul>
${items}
  </ul>
</body>
</html>
`;
writeFileSync(join(outDir, 'index.html'), indexHtml);

console.log(`[ok] surge-dist 已生成于 ${outDir}`);
console.log(`[ok] 资源文件 ${filesToCopy.size} 个，catalog 指向 ${SURGE_BASE}`);

import { createRequire } from 'module';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const require = createRequire(import.meta.url);
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const c = require(join(repoRoot, 'catalog.json'));

const esc = s => (s || '').replace(/\|/g, '\\|');
const rows = c.templates.map(t => {
  const name = t.homepage ? `[${esc(t.name)}](${t.homepage})` : esc(t.name);
  const tags = (t.tags || []).join(', ');
  return `| ${name} | \`${t.id}\` | ${t.type} | ${esc(t.description)} | ${esc(tags)} |`;
}).join('\n');

const table =
`## 已收录模板

> 共 ${c.templates.length} 个模板。本表由 \`catalog.json\` 同步生成（运行 \`node scripts/gen-readme-table.mjs\` 刷新），请勿手改，保持与 \`catalog.json\` 一致。

| 名称 | ID | 类型 | 描述 | 标签 |
|------|----|------|------|------|
${rows}
`;

const START = '<!-- CATALOG_TABLE_START -->';
const END = '<!-- CATALOG_TABLE_END -->';
const readme = readFileSync(join(repoRoot, 'README.md'), 'utf8');
if (readme.includes(START) && readme.includes(END)) {
  const replaced = readme.replace(
    new RegExp(`${START}[\\s\\S]*?${END}`),
    `${START}\n${table}\n${END}`
  );
  writeFileSync(join(repoRoot, 'README.md'), replaced);
  console.log('updated README table, templates = ' + c.templates.length);
} else {
  // 没有标记时，把表格写到「目录结构」之前，并加上标记
  const withMarkers = `${START}\n${table}\n${END}\n\n## 目录结构`;
  const out = readme.replace('## 目录结构', withMarkers);
  writeFileSync(join(repoRoot, 'README.md'), out);
  console.log('inserted README table (no markers found), templates = ' + c.templates.length);
}

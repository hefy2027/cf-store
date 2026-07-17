#!/usr/bin/env node
// github-to-catalog 快速自检脚本（零第三方依赖）
// 仅做高频错误的快速校验；完整校验请用：npx ajv-cli validate -s catalog.schema.json -d catalog.json

import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, parse } from 'node:path';

// 向上查找包含 catalog.json 的仓库根（不依赖脚本所在的层级，
// 因此技能目录可放在任意 X/skills/github-to-catalog/ 下均可工作）。
function findRoot(startDir) {
  let dir = startDir;
  const { root: fsRoot } = parse(dir);
  while (true) {
    if (existsSync(join(dir, 'catalog.json'))) return dir;
    if (dir === fsRoot) return null;
    dir = dirname(dir);
  }
}

const root = findRoot(dirname(fileURLToPath(import.meta.url)));
if (!root) {
  console.error('未找到 catalog.json（请在包含 catalog.json 的仓库内运行）');
  process.exit(2);
}
const catalogPath = join(root, 'catalog.json');

let catalog;
try {
  catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
} catch (e) {
  console.error(`无法读取/解析 catalog.json: ${e.message}`);
  process.exit(2);
}

const errors = [];
const idPat = /^[a-z0-9-]+$/;
const capPat = /^[A-Z][A-Z0-9_]*$/;
const httpsPat = /^https:\/\//;
const semver = /^\d+\.\d+\.\d+$/;
const bindingTypes = ['kv', 'd1', 'r2', 'ai', 'var'];

function checkUrl(key, val, where) {
  if (typeof val === 'string' && !httpsPat.test(val)) {
    errors.push(`${where}: ${key} 必须以 https:// 开头 (得到 "${val}")`);
  }
}

if (!semver.test(catalog.version || '')) {
  errors.push(`顶层 version 必须是语义化版本 (得到 "${catalog.version}")`);
}
if (catalog.updated && !/^\d{4}-\d{2}-\d{2}T/.test(catalog.updated)) {
  errors.push(`updated 应为 ISO 时间字符串`);
}

const ids = new Set();
for (const [i, t] of (catalog.templates || []).entries()) {
  const w = `templates[${i}] (id=${t.id ?? '?'})`;
  if (!idPat.test(t.id || '')) errors.push(`${w}: id "${t.id}" 必须匹配 ^[a-z0-9-]+$`);
  if (ids.has(t.id)) errors.push(`${w}: id "${t.id}" 重复`);
  ids.add(t.id);
  if (!semver.test(t.version || '')) errors.push(`${w}: version 必须是语义化版本`);
  if (!['worker', 'pages', 'hybrid'].includes(t.type)) {
    errors.push(`${w}: type 必须是 worker/pages/hybrid`);
  }
  checkUrl('homepage', t.homepage, w);
  checkUrl('readmeUrl', t.readmeUrl, w);

  if (t.type === 'hybrid') {
    if (!t.sources) errors.push(`${w}: hybrid 需要 sources`);
    if (t.source) errors.push(`${w}: hybrid 不能使用 source，请用 sources`);
  } else {
    if (!t.source) errors.push(`${w}: ${t.type} 需要 source`);
    if (t.sources) errors.push(`${w}: ${t.type} 不能使用 sources，请用 source`);
  }

  const checkKind = (src, label) => {
    if (!src) return;
    const k = src.kind;
    if (k === 'repo-archive' && label === 'source' && t.type === 'worker') {
      errors.push(`${w}: worker 的 source.kind 不能是 repo-archive`);
    }
    if (k === 'raw' && label === 'pages') {
      errors.push(`${w}: pages 的 source.kind 不能是 raw（Pages 需要 zip）`);
    }
    if (label === 'sources.pages' && k === 'raw') {
      errors.push(`${w}: sources.pages.kind 不能是 raw`);
    }
    if (label.startsWith('sources.worker') && k === 'repo-archive') {
      errors.push(`${w}: sources.worker.kind 不能是 repo-archive`);
    }
    checkUrl('url', src.url, `${w}.${label}`);
  };

  if (t.source) checkKind(t.source, 'source');
  if (t.sources) {
    checkKind(t.sources.worker, 'sources.worker');
    checkKind(t.sources.pages, 'sources.pages');
  }
  if (t.assets) {
    if (!t.assets.source) {
      errors.push(`${w}: assets 需要 source`);
    } else {
      checkUrl('url', t.assets.source.url, `${w}.assets.source`);
    }
  }


  for (const [bi, b] of (t.bindings || []).entries()) {
    const bw = `${w}.bindings[${bi}]`;
    if (!bindingTypes.includes(b.type)) {
      errors.push(`${bw}: type 必须是 ${bindingTypes.join('/')}`);
    }
    if (!capPat.test(b.name || '')) {
      errors.push(`${bw}: name "${b.name}" 必须全大写匹配 ^[A-Z][A-Z0-9_]*$`);
    }
    if (b.type !== 'd1' && (b.initSql || b.initSqlUrl)) {
      errors.push(`${bw}: initSql/initSqlUrl 仅 d1 可用`);
    }
    if (b.type !== 'var' && b.secret !== undefined) {
      errors.push(`${bw}: secret 仅 var 可用`);
    }
  }
}

if (errors.length) {
  console.error('❌ 自检发现以下问题：\n' + errors.map((e) => '  - ' + e).join('\n'));
  process.exit(1);
}
console.log('✅ 快速自检通过（建议再运行 ajv-cli 做完整 Schema 校验）');

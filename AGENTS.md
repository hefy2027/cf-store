# AGENTS.md — CF Store

CF Manager 的官方模板源（catalog）。CF Manager 的 Store 页面会从本仓库的 `catalog.json` 拉取可一键部署的 Cloudflare Worker / Pages / Hybrid 模板。本文件为在此仓库工作的 AI 编码助手提供约定与操作指引。

## 项目结构

```
cf-store/
├── catalog.json              # 模板清单（Store 入口，唯一必须文件）
├── catalog.schema.json       # catalog.json 的校验 Schema（唯一真实来源）
├── scripts/
│   └── build-surge.mjs       # 生成 surge.sh 备用源（改写 URL + 复制 templates/）
├── .github/workflows/
│   └── deploy-surge.yml      # push 到 main 自动部署到 cf-store.surge.sh
├── templates/                # 本仓库自带的模板源码，按 id 分目录
│   ├── hello-world/worker.js
│   ├── echo-server/worker.js
│   ├── kv-demo/worker.js
│   ├── d1-demo/worker.js
│   ├── ai-demo/worker.js
│   └── hybrid-demo/         # worker.js + pages.zip（hybrid 双模）
├── skills/                   # 工具无关的技能正本（跨 AI 工具共享，见下节）
│   └── github-to-catalog/    # 「把 GitHub 仓库加入 catalog」技能
│       ├── SKILL.md          # 技能说明与流程
│       ├── references/       # schema 约束等参考文档
│       ├── scripts/          # validate_catalog.mjs 等自检脚本
│       └── assets/           # worker-boilerplate 等样板文件
└── .gitignore                # 忽略 surge-dist/（生成产物）
```

## 核心约定

- **唯一数据源是 `catalog.json`**，结构由 `catalog.schema.json` 严格校验（基于 JSON Schema draft 2020-12，`additionalProperties: false`）。修改模板时必须对照 Schema。
- 任何 JSON 改动后用 JSON Schema 工具自检（如 `ajv-cli`：`npx ajv-cli validate -s catalog.schema.json -d catalog.json`）。
- 顶层必填：`version`（语义化版本 `^\d+\.\d+\.\d+$`）、`templates`。可选：`updated`（ISO 字符串，改模板后更新以便缓存失效）、`name`、`defaultLanguage`。
- 每个模板必填：`id`、`name`、`version`、`type`。

## 字段约束（来自 Schema，务必遵守）

### type 与 source 的关系
- `worker` / `pages`：使用 `source`。
- `hybrid`：使用 `sources`（含 `worker` 和/或 `pages`，至少其一），**不能用** `source`。
- 非 hybrid **不能用** `sources`。

### compatibility_date / compatibility_flags（可选）
- `compatibility_date`：`^\d{4}-\d{2}-\d{2}$`，缺省时部署端用较新安全默认值；React Router v7 / 含 node 构建产物的 worker 通常需要更新的日期。
- `compatibility_flags`：字符串数组，最常用 `["nodejs_compat"]`。
- **决定规则**：打包产物（worker.js 或 zip 解压后的 chunk）若含 CJS 互操作（`__commonJS` / `require(`）或 `process` / `Buffer` / `node:` 等 Node 内置引用，必须加 `compatibility_flags: ["nodejs_compat"]`，否则运行时抛 `Error 1101`。SSR 框架构建建议同时给较新的 `compatibility_date`。

### source.kind 的允许值
| type | 字段 | kind 允许值 |
|------|------|--------------|
| `worker` | `source` | `raw` / `release`（**不能** `repo-archive`） |
| `pages` | `source` | `release` / `repo-archive`（**不能** `raw`，Pages 需 zip） |
| `hybrid` | `sources.worker` | `raw` / `release`（不能 `repo-archive`） |
| `hybrid` | `sources.pages` | `release` / `repo-archive`（不能 `raw`） |

### id 与 URL 规则
- `id`：正则 `^[a-z0-9-]+$`，全局唯一。
- 所有 `url` 必须 `https://` 开头（Schema 强制 `^https://`）。
- 不要求指向本仓库。`templates/` 下自带文件 URL：`https://raw.githubusercontent.com/hefy2027/cf-store/main/templates/<id>/<文件>`。
- 第三方源也可直接引用（如 `github.com/cmliu/edgetunnel` 的 raw / release / archive）。注意：surge 备用源只改写本仓库 `main/` 前缀的 URL，引用第三方文件时备用源不会镜像它们——如需镜像，请先把文件下载进本仓库 `templates/` 再引用。

### bindings 规则
- `type`：`kv` / `d1` / `r2` / `ai` / `var`。
- `name`：**必须全大写**，正则 `^[A-Z][A-Z0-9_]*$`（如 `MY_KV`）。
- `action`：`create-or-reuse`（默认）或 `prompt`（部署时询问用户）。
- `d1` 专属：`initSql`（内联 SQL）或 `initSqlUrl`（SQL 文件地址），仅 `d1` 可用，其余类型禁止。
- `var` 专属：`secret`（true/缺省 = 加密 secret_text，前端密码框；false = 明文环境变量，前端普通文本框）。
- 其余字段：`title`、`required`。

### assets 规则（Worker with Assets / 静态资源，可选）
- 用于让 `worker`（也含 `pages`/`hybrid`）顺带托管静态文件（favicon、前端资源等），对应 wrangler 的 `[assets] directory`。
- `source`：**必填**，复用 `source` 对象；zip 内文件应放在**根目录**（对应 `directory` 所指目录内容）。
- `binding`：资产绑定变量名，可选，缺省 `ASSETS`。
- `config`：可选，`{ html_handling, not_found_handling, run_worker_first }`，仅需自定义 SPA 回退 / 404 / 路径优先级时填。`run_worker_first` 为字符串数组，指定由 Worker 优先处理的路径前缀（如 `["/api/*"]`），避免被 assets 层拦截。
- **优先级**：有 `[assets] directory` 或只需托管静态文件时，用 `worker` + `assets`，而非拆成 `hybrid`。

## 如何新增模板

1. 在 `templates/` 下新建 `templates/<id>/`，放入源码（如 `templates/my-tpl/worker.js` 或 hybrid 的 `worker.js` + `pages.zip`）。
2. 在 `catalog.json` 的 `templates` 数组追加一条，填好 `id` / `name` / `version` / `type` 与对应 `source` / `sources`（`url` 指向第 1 步文件）。
3. 更新 `catalog.json` 的 `updated` 字段（ISO 时间字符串）。
4. 用 JSON Schema 工具对照 `catalog.schema.json` 自检。
5. 提交并推送到 `main`；在 CF Manager Store 页面点「刷新」即可看到新模板。

## 技能：跨工具共享（skills/）

本仓库把可复用的 AI 技能放在**工具无关的中立目录 `skills/`** 作为唯一正本，不做打包、不建软链、不向各工具目录放副本，以避免内容漂移。

- **正本位置**：`skills/<name>/`（如 `skills/github-to-catalog/`，含 `SKILL.md` + `references/` + `scripts/`）。
- **跨工具使用**：各 AI 工具默认读自己的技能目录（CodeBuddy → `.codebuddy/skills/`、Claude Code → `.claude/skills/`、Cursor → `.cursor/skills/`），并**无统一的公用技能目录**。因此约定：以本仓库 `skills/` 为准；任何工具需要时，直接引用/读取 `skills/<name>/SKILL.md` 即可。
- **脚本可移植**：`scripts/*.mjs` 通过**向上查找 `catalog.json`** 定位仓库根（不依赖所在层级），所以技能目录被复制到任意 `X/skills/<name>/` 下都能正常运行自检。
- **现有技能**：`github-to-catalog` —— 把给定 GitHub 仓库分析、按需打包并加入 `catalog.json` 的模板条目；`scripts/validate_catalog.mjs` 为零依赖快速自检（完整校验仍用 `ajv-cli`）。

## 备用源：surge.sh 镜像

- 每次 push 到 `main`，`.github/workflows/deploy-surge.yml` 自动运行 `scripts/build-surge.mjs` 重新生成 `surge-dist/`，再 `npx surge publish surge-dist --domain cf-store.surge.sh --token $SURGE_TOKEN` 部署。
- `surge-dist/` 是生成产物，已被 `.gitignore` 忽略，**不要手动提交**。
- 需要的仓库 Secrets：`SURGE_TOKEN`（surge 登录后 `surge token` 获取）。
- 本地预览：`node scripts/build-surge.mjs && npx surge publish surge-dist --domain cf-store.surge.sh --token <你的token>`。
- 镜像源地址：`https://cf-store.surge.sh/catalog.json`。`build-surge.mjs` 会把本仓库 `main/` 前缀的 URL 改写为 surge 域名，并写入 `catalog.mirrorOf` 指向官方源。

## 操作注意事项

- 编辑 `catalog.json` 时保持 2 空格缩进与尾随换行，避免破坏 diff。
- 不要修改 `catalog.json` 里第三方模板的 `url`（除非同步更新其上游版本），它们指向外部公共仓库。
- 本仓库为纯数据 + 校验 + 构建脚本，**不含部署逻辑**（部署逻辑在 CF Manager 的 backend / worker 端，读取 `catalog.json`）。

## 环境

- 需要 Node.js 运行 `scripts/build-surge.mjs`（仅用 Node 内置模块，无第三方依赖）。
- 部署到 surge 需要全局安装 `surge`（`npx surge` 即可）。

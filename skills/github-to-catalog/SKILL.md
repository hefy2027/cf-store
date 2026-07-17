---
name: github-to-catalog
description: 当用户给出一个 GitHub 仓库链接，希望把它作为 Cloudflare 模板（Worker、Pages 或 Hybrid）加入 cf-store 的 catalog.json 时使用。技能会先分析仓库里是否已存在可直接部署的打包产物（单文件入口、Release 压缩包等）；若没有，则克隆仓库、按需打包（单文件 worker 或构建出 pages.zip），放入 templates/，再生成符合 Schema 的目录条目并校验。
---

# 从 GitHub 仓库导入 Cloudflare 模板

## 概述

给定一个 GitHub 仓库链接，先判断其中是否已包含"打包好的部署包"（即可直接交给 Cloudflare 部署的产物）。据此决定是**直接引用外部 URL**，还是**克隆下来打包后放入本仓库 templates/**，最终向 `catalog.json` 追加一条符合 Schema 的模板条目。

## 何时使用

- 用户发来一个 GitHub 链接（如 `https://github.com/<owner>/<repo>`），并希望把它加进 Store 作为可一键部署模板。
- 用户说"把这个 GitHub 项目做成模板""import this repo as a worker template"。

## 关键约束

完整契约见 `references/schema-constraints.md`。最常导致校验失败的要点：

- `id`：正则 `^[a-z0-9-]+$`，全局唯一，仅小写字母/数字/连字符。**只用仓库名（repo name），不要加作者/owner 前缀**。例如仓库 `github.com/Actrue/cf-page-publish-mcp` 的 id 应为 `cf-page-publish-mcp`（而非 `actrue-cf-page-publish-mcp`）。
- 所有 `url`（以及 `homepage`、`readmeUrl`）必须以 `https://` 开头。
- `worker` / `pages` → 只用 `source`；`hybrid` → 只用 `sources`。
- `worker` 源 kind 只能 `raw` / `release`（不能 `repo-archive`）；`pages` 源只能 `release` / `repo-archive`（不能 `raw`）。
- `worker`（或 `pages`/`hybrid`）可附加 `assets` 字段（Worker with Assets / Pages 静态资源）：`"assets": { "source": { "kind": "release", "url": ".../assets.zip" }, "binding"?: "ASSETS", "config"?: { "html_handling"?, "not_found_handling"? } }`。`source` 为必填，zip 内文件应在根目录（对应 wrangler 的 `directory`）；`binding` 缺省为 `ASSETS`，`config` 仅在需要自定义 SPA 回退/404 时填。`⚠️` **assets.source 的 kind 绝不能填 `raw`**：后端 `workerService` 对 `assets.source.kind === 'raw'` 走「单文件」分支，会把整个 zip 当作一个名为 `xxx.zip` 的文件上传，前端拿到的不是网站资源而是打不开的 zip，资产直接失效。assets 是 zip 时必须用 `release` / `repo-archive`。
- `bindings[].name` 必须全大写，正则 `^[A-Z][A-Z0-9_]*$`。

## 工作流

### 1. 解析链接并分析仓库

从 URL 解析出 `owner`、`repo`、默认分支（通常 `main` / `master`）。

**分析"是否有打包好的部署包"**，任选一种手段（按可用性与可靠性排序）：

- 优先 `gh` CLI：
  - `gh api repos/<owner>/<repo>/contents` —— 列根目录文件
  - `gh api repos/<owner>/<repo>/releases` —— 看是否有 zip / tgz 产物
  - `gh repo view <owner>/<repo> --json description,repositoryTopics,defaultBranchRef`
- 无 `gh` 时用 `web_fetch` 打开仓库页读取目录与 README。
- 或浅克隆分析：`git clone --depth 1 https://github.com/<owner>/<repo>.git <临时目录>`。

**判断"打包好的部署包"是否存在**，命中以下任一即为"已有包"：

1. **单文件 Worker 入口**：根目录或常见路径存在 `worker.js`、`_worker.js`、`src/worker.js`、`dist/_worker.js`、`index.js` 等，且无需要打包的依赖（无 `package.json`，或文件为纯单文件无外部 import）。
2. **Release 压缩产物**：releases 中存在 `.zip` / `.tgz` 资产，且为可直接部署的产物。
3. **Pages 项目**：有 `wrangler pages` 配置或 `dist/` 构建输出；若已发布 zip 同 2，否则需从源码构建（见步骤 3）。

> 注：`_worker.js` 在标准入口命名中等价于 `worker.js`，可直接 raw 引用。

**分流**：
- 命中 1 或 2 → 已有打包好的部署包，**跳到步骤 4（直接引用，不克隆）**。
- 都不命中（纯源码需构建、或根本不是 Cloudflare 项目）→ 进入步骤 3（克隆打包）。

### 2. 直接引用（已有包时）

按类型选 `source` 形态：

- `worker` 单文件：`"source": { "kind": "raw", "url": "https://raw.githubusercontent.com/<owner>/<repo>/<branch>/<path>" }`
- `worker` Release：`"source": { "kind": "release", "url": "https://github.com/<owner>/<repo>/releases/latest/download/<asset>" }`（**优先用 `latest/download/` 重定向**，上游发新版本后自动生效，无需改 catalog；除非用户要求锁定具体 `<tag>` 才写死 `releases/download/<tag>/<asset>`）
- `pages`：`"source": { "kind": "release" | "repo-archive", "url": "..." }`（`release` 同理优先 `latest/download/`；`repo-archive` 用 `https://github.com/<owner>/<repo>/archive/refs/heads/<branch>.zip`）
- `hybrid`：用 `sources`，分别给 `worker` 与 `pages` 选上述形态，至少其一。

引用第三方 URL 时，surge 备用源**不会**镜像它们（只改写本仓库 `main/` 前缀）。若希望被 surge 镜像，仍走步骤 3 拉到本仓库。

### 3. 克隆下来打包（没有现成包时）

目标：产出可部署产物并放入本仓库 `templates/<id>/`，以便 surge 镜像覆盖、目录稳定。

1. `git clone --depth 1 https://github.com/<owner>/<repo>.git .tmp/<id>`（统一克隆到仓库内 `.tmp/<id>`，该目录已被 `.gitignore` 忽略，不会误提交）。
2. 判定类型并打包：
   - **Worker（需构建或归一成单文件）**：
     - 带 `package.json` 的构建型项目：`cd .tmp/<id> && npm install && npm run build`，取构建产物（如 `dist/_worker.js` / `dist/index.js`），**按形态二选一**：
       - **单文件**：产物确为单一入口、无外部 import 时，复制为 `templates/<id>/worker.js`。
       - **多模块 zip**（如 React Router v7 / 其他 SSR 框架构建出 `build/server/` + `build/client/`）：将服务端模块目录（`build/server/`，含 `index.js` 入口与其依赖 chunk）整体压缩为 `templates/<id>/server.zip`，catalog 用 `"source": { "kind": "release", "url": ".../server.zip" }` —— 后端按 zip 的 PK 魔数识别并自动解压成多模块上传，无需 esbuild 合并成单文件。**kind 必须填 `release`（或 `repo-archive`），不能用 `raw`**：`raw` 语义是「单文件直链」，塞 zip 虽能靠魔数识别跑起来，但元数据标签是假的，会误导读 catalog 的人。
     - 多文件源码但可合并：整理出单一入口保存为 `templates/<id>/worker.js`，确保无外部 import 依赖。
     - ⚠️ **打包时排除非运行时代码**：构建产物目录里可能含框架自动生成的 `wrangler.json`，其中硬编码了作者自己的 `bucket_name` / `database_name` / `crons` 等。它既不会被当作模块上传、也不该用于用户部署，务必从 zip 中剔除。
   - **Pages（需构建）**：`cd .tmp/<id> && npm install && npm run build`，把输出目录（如 `dist/`）压缩为 `templates/<id>/pages.zip`：`cd dist && zip -r ../pages.zip .`。
   - **Hybrid**：同时产出 `worker.js` 与 `pages.zip`。
   - **Worker with Assets（静态资源）**：若 `wrangler.toml` 含 `[assets] directory` 或应用需托管静态文件（favicon、前端资源等），将静态目录内容压缩为 `templates/<id>/assets.zip`（`cd public && zip -r ../assets.zip .`），并在 catalog 条目加 `assets` 字段指向该 zip，而非改成 hybrid。
3. 删除临时克隆目录：`rm -rf .tmp/<id>`。
4. 引用方式改为本仓库 raw URL：`https://raw.githubusercontent.com/hefy2027/cf-store/main/templates/<id>/<文件>`。

> 若克隆后发现无法干净打包成 Cloudflare 可部署产物（依赖特殊运行时、需私有资源、非 Cloudflare 项目等），应向用户说明并停止，不要硬塞进 catalog。

### 4. 收集元数据并追加目录条目

补齐 `id`、`name`、`description`、`author`（name + url）、`tags`、`homepage`、`readmeUrl`、`version`（语义化 `^\d+\.\d+\.\d+$`）、`type`、所需 `bindings`（缺失则向用户询问，或从 README / wrangler 配置推断）。

**bindings 两个易错点：**

- **`name` 是代码契约，必须匹配项目里实际引用的变量名**：读 `wrangler.json` / `wrangler.toml` 的 `bindings[].name` 或代码里的 `env.XXX`。例如代码用 `env.D1` / `env.R2` / `env.SESSION_SECRETS`，则 `name` 就写 `D1` / `R2` / `SESSION_SECRETS`，**不能改**（否则代码找不到绑定）。
  - 注意区分：`name` 是绑定**变量名**（catalog 必填、全大写）；而 wrangler 里的 `bucket_name` / `database_name` 是 Cloudflare 账户内的**资源实际名**，由 `create-or-reuse` 自动生成即可，**不要照抄作者命名**，catalog 的 binding 也没有这两个字段。
- **D1 必须检查建表迁移**：部署后 D1 是空库，若 Worker 一启动就查表会报错。检查仓库 `migrations/`（或 wrangler 里 `migrations_dir`）是否有 `.sql`；有则把建表 SQL 下载/合并到 `templates/<id>/init.sql`（自托管、可被 surge 镜像），并在 D1 binding 挂 `"initSqlUrl": "https://raw.githubusercontent.com/hefy2027/cf-store/main/templates/<id>/init.sql"`。优先用幂等语句（`IF NOT EXISTS`），表名/字段须与原 SQL 严格一致（作者可能有特殊拼写）。

打开 `catalog.json`，在 `templates` 数组末尾（闭合 `]` 之前）插入新对象，保持 2 空格缩进与尾随换行。必填：`id`、`name`、`version`、`type` + 所选形态的 `source` 或 `sources`。字段顺序参考已有条目。

### 5. 更新 updated 时间戳

顶层 `updated` 设为当前 ISO 时间（如 `2026-07-17T12:00:00.000Z`），以便 Store 缓存失效。

### 6. 校验

```bash
node skills/github-to-catalog/scripts/validate_catalog.mjs   # 内置快速自检（无第三方依赖，脚本会自动向上查找仓库根）
npx ajv-cli validate -s catalog.schema.json -d catalog.json
```

两者都必须通过。常见失败：非 `https://` 的 url、类型对应的 `kind` 错误、`source`/`sources` 错配、binding 名小写。修正后重新运行。

## 补充说明

- 本仓库只放数据 + Schema + 构建脚本，不含部署逻辑。提交并推送到 `main`，Store 页面通过「刷新」即可拉取。
- 切勿手动改动生成的 `surge-dist/`（已被 gitignore）。
- 自托管 worker 起点模板见 `assets/worker-boilerplate/worker.js`。
- **已知表达限制**：catalog 当前无法表达 `crons` 定时触发器、`send_email` 邮件路由等 wrangler 高级能力。若项目依赖这些（如 smail 用 `*/30 * * * *` 清理过期邮件），需向用户说明这部分功能部署后不会生效，或在模板 `description` 中提示。
- binding 的 `initSqlUrl` 若指向本仓库 `main/` 前缀，surge 备用源也会自动改写并镜像该 SQL（见 `scripts/build-surge.mjs`）。

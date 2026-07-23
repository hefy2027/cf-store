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
- `worker`（或 `pages`/`hybrid`）可附加 `assets` 字段（Worker with Assets / Pages 静态资源）：`"assets": { "source": { "kind": "release", "url": ".../assets.zip" }, "binding"?: "ASSETS", "config"?: { "html_handling"?, "not_found_handling"?, "run_worker_first"? } }`。`source` 为必填，zip 内文件应在根目录（对应 wrangler 的 `directory`）；`binding` 缺省为 `ASSETS`，`config` 仅在需要自定义 SPA 回退/404 时填。`⚠️` **assets.source 的 kind 绝不能填 `raw`**：后端 `workerService` 对 `assets.source.kind === 'raw'` 走「单文件」分支，会把整个 zip 当作一个名为 `xxx.zip` 的文件上传，前端拿到的不是网站资源而是打不开的 zip，资产直接失效。assets 是 zip 时必须用 `release` / `repo-archive`。
- `source.mainModule`（可选，仅多模块 Worker 有意义）：显式声明 zip 解压后作为 Worker 入口的文件名（如 `index.js`）。**强烈建议多模块 zip 显式声明**，避免依赖后端默认推断规则（`worker.js → index.js/index.mjs → 根目录首个 JS 模块`；有 `wrangler.toml/jsonc` 时以其中 `main` 字段为准）。单文件 worker 无需此字段。
- `bindings[].type`：`kv` / `d1` / `r2` / `ai` / `var` / `durable_object` / `service` / `queue`。`bindings[].name` 必须全大写，正则 `^[A-Z][A-Z0-9_]*$`。`bindings[].resourceName`（可选）为 Cloudflare 资源名，仅 kv/d1/r2 可用，缺省时自动生成。
- DO 绑定（`durable_object`）：必填 `className`（与入口 `export class` 一致）；`scriptName`（跨 Worker 用）、`environment` 可选。若 wrangler.toml 中有 `[[migrations]]`，模板必须加 `migrations` 字段（`[{ tag, new_classes?, renamed_classes?, deleted_classes? }]`）。
- `compatibility_date` / `compatibility_flags`（可选）：对应 wrangler 同名字段。`compatibility_flags` 目前主要是 `["nodejs_compat"]`。**判定规则**：若打包产物（`worker.js` 或多模块 zip 解压后的 chunk）含 CJS 互操作（`__commonJS` / `require(`）、`process` / `Buffer` / `node:` 等 Node 内置引用，**必须加 `"compatibility_flags": ["nodejs_compat"]`**，否则部署后运行时抛 `Error 1101`；用 React Router v7 / 其他 SSR 框架构建的 worker，建议同时给较新的 `"compatibility_date": "2025-01-01"`。判断方式：在 `templates/<id>/` 内搜索上述关键字，命中即加。

## 打包原理速查

理解 wrangler 的实际打包行为有助于在分析仓库和构建产物时做出正确判断。以下信息来自 wrangler 源码的打包流程分析。

### wrangler 打包总览

```
Worker 路线:
  wrangler deploy → bundleWorker() [esbuild, 默认] 或 noBundleWorker() [--no-bundle]
Pages 路线:
  wrangler pages deploy → 检测模式:
    - functions/ 目录 → buildFunctions() → 路由扫描 → 内部调 bundleWorker()
    - _worker.js 文件 → buildRawWorker() → 内部调 bundleWorker()
    - _worker.js 目录 → produceWorkerBundleForWorkerJSDirectory()
    - 纯静态 → 不打包
```

所有需要打包的路径最终都调用 `bundleWorker()`（基于 esbuild）。

### bundleWorker() 的 esbuild 关键配置

| 配置项 | 值 | 含义 |
|--------|-----|------|
| `format` | `"esm"` (modules) / `"iife"` (service-worker) | 输出模块格式 |
| `target` | `"es2024"` | 目标 ES 版本 |
| `bundle` | `true` | 打包所有依赖 |
| `conditions` | `["workerd", "worker", "browser"]` | 模块解析条件 |
| `define` | `process.env.NODE_ENV → "production"`、`navigator.userAgent → "Cloudflare-Workers"` | 编译时常量替换 |
| `external` | `__STATIC_CONTENT_MANIFEST` (始终 external) | 不打包的外部模块 |
| `loader` | `.js`/`.mjs`/`.cjs` → `jsx` | JSX 语法支持 |
| `sourcemap` | `true` | 始终生成 SourceMap |
| `metafile` | `true` | 生成依赖分析元数据 |

### esbuild 插件链（按执行顺序）

1. **aliasPlugin** — 模块别名（优先于 unenv polyfill）
2. **moduleCollector** — 收集 wasm/text/data 等非 JS 模块作为附加模块
3. **nodejsCompatPlugin** — `nodejs_compat` flag 时 polyfill Node 内置（`node:fs` 等）；v2 用 hybrid 模式
4. **cloudflareInternalPlugin** — `cloudflare:*` 导入标记为 external（运行时提供）
5. **buildResultPlugin** — 捕获 esbuild 构建结果
6. **自定义插件** — 日志输出等
7. **configProviderPlugin** — 中间件配置注入

### 打包产物：BundleResult → WorkerBuildResult

esbuild 先产出 `BundleResult`：
- `resolvedEntryPointPath` — 打包后入口文件路径（在临时目录中）
- `modules` — esbuild 无法内联的附加模块（wasm/text/data 等）
- `bundleType` — `"esm"`（有 ES 导出）或 `"commonjs"`（无导出）
- `dependencies` — 依赖包名 → 文件大小映射
- `sourceMapPath` — SourceMap 文件路径

然后 `buildWorker()` 后处理，读取入口文件内容作为 `content`，与 `modules`、`sourceMaps`、`dependencies` 一起打包为 `WorkerBuildResult` 交给部署。

### Pages Functions 的独特行为

Pages Functions（`functions/` 目录）的入口**不是用户代码**，而是 wrangler 内置的 `templates/pages-template-worker.ts`。用户 `functions/` 下的代码通过路由扫描 + 路由配置注入到模板中。路由规则：`index.js` → `/`、`api/users.js` → `/api/users`、`[id].js` → `/:id`、`[...path].js` → `/*path`。

这意味着：**含 `functions/` 的 Pages 项目不可能通过 raw URL 直接引用**，必须用 wrangler 构建，或者引用其 Release 产物。

### SourceMap 处理

wrangler 构建时总是生成 SourceMap。上传时若开启 `uploadSourceMaps`，会加载 `.map` 文件作为 `CfWorkerSourceMap[]` 随主模块一起上传。**catalog 模板无需关心 SourceMap**（它不影响功能），但多模块 zip 打包时若产物含 `.map` 文件，建议剔除以减小体积。

### 打包后验证

`bundleWorker()` 打包后还会验证：
- **Durable Object 导出**：每个 DO binding 的 `class_name` 必须在入口文件的导出中，否则报错。
- **Workflow 导出**：同 DO 验证逻辑。

如果 catalog 模板声明了 DO/Workflow bindings，务必确认入口文件真的导出了对应类。

---

## 工作流

### 1. 解析链接并分析仓库

从 URL 解析出 `owner`、`repo`、默认分支（通常 `main` / `master`）。

**第一步：检测 wrangler 配置文件**——这是判断是否为 Cloudflare 项目的首要信号。

- 列根目录文件，检查是否存在 `wrangler.toml` 或 `wrangler.json`（或 `.jsonc`）。**有这个文件 = Cloudflare 项目；没有 = 需要进一步判断**（可能是纯单文件 worker、纯静态 Pages，或根本不是 CF 项目）。
- 若存在，读取其内容，提取以下关键信息（贯穿后续所有步骤）：
  - `main` → Worker 入口文件（缺省 `src/index.js`）
  - `compatibility_flags` → 是否需要 `nodejs_compat`
  - `compatibility_date` → 兼容性日期
  - **bindings**：`[[kv_namespaces]]` / `[[d1_databases]]` / `[[r2_buckets]]` / `[[ai]]` / `[vars]` / `[[durable_objects.bindings]]` / `[[services]]` / `[[queues.producers]]`（或 `consumers`）
  - `[[migrations]]` → DO 迁移配置（如有 DO binding 必须提取）
  - `[assets]` → 是否有静态资源目录
  - `[triggers] crons` → 定时任务
  - `env` 块 → 环境变量

**分析仓库内容**，按可靠性与可用性分级选择手段：

1. **先检测 `gh` CLI 是否可用**：执行 `gh --version`。若已安装且已登录（`gh auth status`），优先用它——API 返回结构化 JSON，最可靠：
   - `gh api repos/<owner>/<repo>/contents` —— 列根目录文件
   - `gh api repos/<owner>/<repo>/contents/wrangler.toml` 或 `.../wrangler.json` —— 读取 wrangler 配置
   - `gh api repos/<owner>/<repo>/contents/package.json` —— 看 build 脚本、依赖
   - `gh api repos/<owner>/<repo>/releases` —— 看是否有 zip / tgz 产物
   - `gh repo view <owner>/<repo> --json description,repositoryTopics,defaultBranchRef`
2. **没有 `gh` 时，用 `web_fetch`**（零安装，但解析 HTML 不如 API 精确）：
   - 列目录：`web_fetch https://github.com/<owner>/<repo>` → 看文件列表、README
   - 读文件：`web_fetch https://raw.githubusercontent.com/<owner>/<repo>/<branch>/wrangler.toml` → 获取 wrangler 配置
   - 读 package.json：`web_fetch https://raw.githubusercontent.com/<owner>/<repo>/<branch>/package.json` → 看 build 脚本、依赖
   - 读目录树：`web_fetch https://github.com/<owner>/<repo>/tree/<branch>` → 浏览子目录
   - 看 Release：`web_fetch https://github.com/<owner>/<repo>/releases` → 是否有 zip/tgz 产物
3. **兜底：`git clone --depth 1`**（需 git，无需登录，最可靠但较慢）：
   - `git clone --depth 1 https://github.com/<owner>/<repo>.git .tmp/<id>` → 完整本地分析

**判断"打包好的部署包"是否存在**，命中以下任一即为"已有包"：

1. **单文件 Worker 入口**（可 raw 引用）：根目录或常见路径存在 `worker.js`、`_worker.js`、`src/worker.js`、`dist/_worker.js`、`index.js` 等单文件，且无需要打包的依赖（无 `package.json`，或文件为纯单文件无外部 import）。注意 wrangler 的 esbuild 支持 JSX（`.js`/`.mjs`/`.cjs` 默认按 jsx loader 处理），所以含 JSX 的单文件也算「已有包」——wrangler 打包时会自动处理。**但含 `import` 其他本地模块或 npm 包的单文件不算**，因为它依赖打包。
2. **Release 压缩产物**：releases 中存在 `.zip` / `.tgz` 资产，且为可直接部署的产物（如预构建好的 Worker zip 或 Pages 静态资源 zip）。wrangler 本身不产出 Release zip（wrangler 直接上传到 Cloudflare API），所以这里的 Release 产物通常是 CI/CD 流水线生成的。
3. **Pages 项目**：有 `wrangler pages` 配置或 `dist/` 构建输出。注意区分：
   - **Pages Functions**（有 `functions/` 目录）：入口是 wrangler 内置模板，**不能 raw 引用**，必须走构建或 Release。
   - **Pages Advanced Mode**（有 `_worker.js` 文件）：`_worker.js` 本身可 raw 引用（若它为单文件且无外部 import），否则需构建。
   - **纯静态 Pages**：`dist/` 下只有 HTML/CSS/JS 等静态文件，压缩为 zip 即可用 `repo-archive` 引用。
   - 若已发布 zip 同 2，否则需从源码构建（见步骤 3）。

> 注：`_worker.js` 在 Pages Advanced Mode 中等价于 worker 入口，wrangler 通过 `buildRawWorker()` → `bundleWorker()` 打包它。若它是纯单文件（无外部 npm import），可直接 raw 引用；否则需构建。

**关键反例——这些不算"已有包"**：
- 有 `package.json` 且含 `dependencies`（或 `devDependencies` 中有构建工具如 `esbuild`、`vite`、`remix`、`react-router`），但根目录无预构建产物 → **需克隆打包**。
- 有 `functions/` 目录的 Pages 项目（即便文件看似单文件）→ **需 wrangler 构建**（因为入口是 wrangler 内置模板）。
- 有多文件 Worker 项目（入口 import 了其他本地模块）且无 Release zip → **需打包合并**。

**分流**：
- 命中 1 或 2 → 已有打包好的部署包，**跳到步骤 2（直接引用，不克隆）**。
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

核心思路：wrangler 的打包器本质就是一段**已知配置的 esbuild**（见上方「打包原理速查」）。wrangler 本身**不会运行 `npm run build`**——它总是用自己的 esbuild 管道直接打包源码入口。

因此，**默认走路径 B（esbuild 复制 wrangler）**，这是 wrangler deploy 时的真实行为，结果必定兼容。路径 A 仅在一种情况下才需要：

> **路径 A 仅适用于 SSR 框架适配器项目**：Remix（`@remix-run/cloudflare`）、React Router v7（Cloudflare preset）、SvelteKit（`@sveltejs/adapter-cloudflare`）、SolidStart、Qwik 等——这些框架的 build 脚本会产出专门针对 Cloudflare Workers 的 bundle（服务端 + 客户端分离、路由编译等工作），wrangler 裸 esbuild 无法替代。判断方式：`package.json` 的依赖中是否包含上述框架的 Cloudflare 适配器。

其余所有项目（简单 esbuild/tsc 脚本、甚至没 build 脚本的）一律走路径 B。

1. `git clone --depth 1 https://github.com/<owner>/<repo>.git .tmp/<id>`（统一克隆到仓库内 `.tmp/<id>`，该目录已被 `.gitignore` 忽略，不会误提交）。
2. 安装依赖：`cd .tmp/<id> && npm install`（有 `package.json` 时必须；若项目无 `package.json` 则可跳过）。

#### Worker 项目打包

**先读取 `wrangler.toml` / `wrangler.json`** 确定入口文件（`main` 字段，缺失时默认 `src/index.js` 或 `worker.js`）。

##### 路径 B（默认）：用 esbuild 复制 wrangler 的打包

wrangler deploy 的真实行为。直接用 esbuild + wrangler 配置，产物必然兼容：

```bash
# 确定入口（从 wrangler.toml 的 main 字段或默认推断）
ENTRY="src/index.js"  # 或 worker.js、index.js 等

npx esbuild "$ENTRY" \
  --bundle \
  --format=esm \
  --target=es2024 \
  --conditions=workerd,worker,browser \
  --define:process.env.NODE_ENV=\"production\" \
  --define:navigator.userAgent=\"Cloudflare-Workers\" \
  --external:__STATIC_CONTENT_MANIFEST \
  --loader:.js=jsx --loader:.mjs=jsx --loader:.cjs=jsx \
  --outfile=../../templates/<id>/worker.js \
  --log-level=warning
```

这条命令产出的 `worker.js` 与 wrangler `deploy` 时 esbuild 打包的结果**完全等效**（不含 dev 模式中间件，那些仅 dev 环境需要）。

> **特殊情况 — 项目用了 wrangler 的 nodejs_compat**：若 wrangler.toml 中有 `compatibility_flags = ["nodejs_compat"]`，则 esbuild 打包时需要 `nodejsCompatPlugin` 才能 polyfill Node 内置模块。裸 esbuild（加 `--platform=node`）无法完全替代该插件。此时有两个选择：
> 1. 直接用上述 esbuild 命令打包（node API 引用会保留为 `external`，由 Cloudflare 运行时提供 `nodejs_compat` 兼容层），部署后正常工作——前提是 catalog 条目必须标注 `"compatibility_flags": ["nodejs_compat"]`。
> 2. 若希望彻底 polyfill 进产物（不依赖运行时 compat），则需要 wrangler 自己的 esbuild 插件链，无法通过裸 esbuild CLI 实现。作为替代，可以 `npx wrangler deploy --dry-run` 构建后从临时目录复制产物（见下方「用 wrangler 构建并拦截产物」）。

##### 路径 A（特例）：SSR 框架适配器项目

仅当 `package.json` 的依赖包含 Cloudflare 专用的框架适配器时才走这条路——因为框架的 build 脚本做了 wrangler esbuild 做不到的编译工作（SSR server/client 分离、路由编译等）。

判断条件（满足任一）：
- `@remix-run/cloudflare` / `@remix-run/cloudflare-pages`
- `@react-router/cloudflare`（React Router v7 Cloudflare preset）
- `@sveltejs/adapter-cloudflare` / `@sveltejs/adapter-cloudflare-workers`
- `@builder.io/qwik-city/adapters/cloudflare-pages`
- `solid-start-cloudflare-pages` / `solid-start-cloudflare-workers`

```bash
npm run build
```

取构建产物——根据框架约定的输出位置：
- Remix / React Router v7 → `build/server/index.js` + `build/client/`
- SvelteKit → `build/worker.js`（或 `build/server/`）
- 服务端打包目录整体压缩为 `templates/<id>/server.zip`（加 `mainModule`），静态资源走 assets

##### 产物形态判断

生成 `worker.js` 后判断形态：
- **单文件**：产物确为单一入口、无外部 import 时，直接使用 `worker.js`，catalog 用 `"source": { "kind": "raw", "url": "..." }`。
- **多模块 zip**（路径 A 的 SSR 框架产物，或路径 B 中入口 import 了本地模块无法合并的情况）：将服务端模块目录压缩为 `templates/<id>/server.zip`，catalog 用 `"source": { "kind": "release", "url": ".../server.zip", "mainModule": "index.js" }`。**kind 必须填 `release`（或 `repo-archive`），不能用 `raw`**。

##### 打包清理

⚠️ **打包时排除非运行时代码**：构建产物目录里可能含框架自动生成的 `wrangler.json`/`wrangler.toml`，其中硬编码了作者自己的 `bucket_name` / `database_name` / `crons` 等。务必从 zip 中剔除。同理，`.map` 文件也应剔除（徒增体积）。

#### Pages 项目打包

##### 方式 A：项目有 build 脚本（优先）

```bash
cd .tmp/<id> && npm run build
```

**纯静态 Pages**（输出 `dist/` 下全是 HTML/CSS/JS）：
```bash
cd dist && zip -r ../../templates/<id>/pages.zip .
```

**Pages Functions**（有 `functions/` 目录）：入口是 wrangler 内置模板，不能简单 zip。尝试：
```bash
npx wrangler pages functions build --outdir ../../templates/<id>/pages-functions
```
取输出的打包产物。若此命令不可用，则需要将 `functions/` 源码 + `dist/` 一起放入 pages.zip（但 wrangler 打包后的 `_worker.bundle` 才是真正部署的形态）。最可靠的方式是：只用纯静态 pages.zip，Worker 部分单独用 worker 类型声明（即拆成 hybrid）。

##### 方式 B：没有 build 脚本

- **纯静态 Pages**（`dist/` 已存在或直接是 HTML 项目）：直接用 `repo-archive` 引用 GitHub archive zip（无需克隆打包），或 `cd dist && zip -r ...`。
- **Pages Functions 项目**：这类项目必须通过 wrangler 构建路由。推荐改为参照 `functions/` 入口逻辑，手动收集所有函数文件 + 生成路由，再用 `bundleWorker()` 等价 esbuild 打包。**如果过于复杂，可告知用户该 Pages Functions 项目暂不支持自动化打包。**

#### Hybrid 项目

同时按「Worker 项目打包」和「Pages 项目打包」产出 `worker.js` + `pages.zip`。

#### Worker with Assets（静态资源）

若 `wrangler.toml` 含 `[assets] directory`（如 `directory = "./public"`），将静态目录内容压缩为 `templates/<id>/assets.zip`：
```bash
cd .tmp/<id>/public && zip -r ../../templates/<id>/assets.zip .
```
并在 catalog 条目加 `assets` 字段指向该 zip，而非改成 hybrid。

#### 收尾

3. 删除临时克隆目录：`rm -rf .tmp/<id>`。
4. 引用方式改为本仓库 raw URL：`https://raw.githubusercontent.com/hefy2027/cf-store/main/templates/<id>/<文件>`。

> 若克隆后发现无法干净打包成 Cloudflare 可部署产物（依赖特殊运行时、需私有资源、非 Cloudflare 项目等），应向用户说明并停止，不要硬塞进 catalog。

### 4. 收集元数据并追加目录条目

补齐 `id`、`name`、`description`、`author`（name + url）、`tags`、`homepage`、`readmeUrl`、`version`（语义化 `^\d+\.\d+\.\d+$`）、`type`、所需 `bindings`（缺失则向用户询问，或从 README / wrangler 配置推断）。若 wrangler 配置里有 `triggers.crons`，在模板加 `"crons": [...]`（标准 5 字段 cron 表达式数组，`worker` / `hybrid` 适用，`pages` 不适用，schema 会拒绝）。

**另外检查打包产物是否用到 Node 内置 / CJS**：在 `templates/<id>/` 的 `worker.js` 或解压后的 zip 模块里搜索 `__commonJS`、`require(`、`process.`、`node:`、`Buffer.` 等，命中则在模板加 `"compatibility_flags": ["nodejs_compat"]`；SSR 框架（React Router v7 等）构建产物建议同时给较新的 `"compatibility_date": "2025-01-01"`。不开 `nodejs_compat` 会导致部署后运行时抛 `Error 1101`。

> **为什么这些关键字意味着需要 nodejs_compat？** wrangler 的 esbuild 插件链中，`nodejsCompatPlugin`（或 v2 的 `nodejsHybridPlugin`）正是在 `nodejs_compat` flag 开启时才激活——它 polyfill `node:fs`、`node:path` 等 Node 内置模块，并处理 CJS/ESM 互操作（`__commonJS` 这类 shim）。同时 `asyncLocalStoragePlugin` 也会将 `node:async_hooks` 标记为 external（由运行时提供）。如果不开 flag，这些 polyfill/插件不会加载，导致代码中对 Node API 的引用在 workerd 运行时找不到实现，直接 `Error 1101`。

**bindings 易错点：**

- **`name` 是代码契约，必须匹配项目里实际引用的变量名**：读 `wrangler.json` / `wrangler.toml` 的 bindings name 或代码里的 `env.XXX`。例如代码用 `env.D1` / `env.R2` / `env.SESSION_SECRETS`，则 `name` 就写 `D1` / `R2` / `SESSION_SECRETS`，**不能改**（否则代码找不到绑定）。
  - 注意区分：`name` 是绑定**变量名**（catalog 必填、全大写）；而 wrangler 里的 `bucket_name` / `database_name` 是资源实际名，由 `create-or-reuse` 自动生成，**不要照抄作者命名**。`resourceName` 字段（可选，仅 kv/d1/r2）才对应 Cloudflare 资源名，缺省时部署端自动生成。
- **新增的 binding type 处理**：
  - `durable_object`：从 wrangler.toml 的 `[[durable_objects.bindings]]` 提取 `className`、`scriptName`（可选）、`environment`（可选）。**必须同时检查 `[[migrations]]`**——若有则提取到模板 `migrations` 字段（`[{ tag, new_classes?, renamed_classes?, deleted_classes? }]`）。
  - `service`：从 wrangler.toml 的 `[[services]]` 提取 `service`（目标服务名）、`environment`（可选）、`entrypoint`（可选）。
  - `queue`：从 wrangler.toml 的 `[[queues.producers]]` 或 `[[queues.consumers]]` 提取 `queueName`（必填）、`deliveryDelay`（可选）。
- **Durable Object 导出验证**：wrangler 打包后会自动检查 DO binding 的 `className` 是否在入口文件的导出中（esbuild metafile 分析），不存在则报错。务必确认入口代码有 `export class <className>`。
- **D1 必须检查建表迁移**：部署后 D1 是空库，若 Worker 一启动就查表会报错。检查仓库 `migrations/`（或 wrangler 里 `migrations_dir`）是否有 `.sql`；有则把建表 SQL 下载/合并到 `templates/<id>/init.sql`，并在 D1 binding 挂 `"initSqlUrl": "https://raw.githubusercontent.com/hefy2027/cf-store/main/templates/<id>/init.sql"`。优先用幂等语句（`IF NOT EXISTS`），表名/字段须与原 SQL 严格一致。

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
- **crons 定时触发器已支持**：模板对象内可直接加 `"crons": ["*/30 * * * *"]`（标准 5 字段 cron 表达式数组），仅对 `worker` / `hybrid` 生效，`pages` 类型会被 schema 拒绝。若项目依赖定时任务（如 smail 每 30 分钟清理过期邮件），直接声明即可，后端自动注册 Cron Trigger——无需再在 `description` 里提示。
- **已知表达限制**：`send_email` 邮件路由等极少数 wrangler 高级能力仍无法在 catalog 表达。若项目依赖，需向用户说明部署后不会生效，或在 `description` 中提示。DO、service、queue 绑定现已支持（`durable_object` / `service` / `queue` binding type + DO `migrations` 字段）。
- binding 的 `initSqlUrl` 若指向本仓库 `main/` 前缀，surge 备用源也会自动改写并镜像该 SQL（见 `scripts/build-surge.mjs`）。

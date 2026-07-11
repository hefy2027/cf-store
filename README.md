# CF Store

CF Manager 的官方模板源（catalog）。CF Manager 的 Store 页面会从本仓库的 `catalog.json` 拉取可一键部署的 Worker / Pages / Hybrid 模板。

## 目录结构

```
cf-store/
├── catalog.json              # 模板清单（Store 入口，唯一必须文件）
├── catalog.schema.json       # catalog.json 的校验 Schema（统一真实来源）
├── scripts/
│   └── build-surge.mjs       # 生成 surge.sh 备用源（改写 URL + 复制 templates/）
├── .github/workflows/
│   └── deploy-surge.yml      # push 到 main 自动部署到 cf-store.surge.sh
├── templates/                # 各模板源码 / 资源，按 id 分目录
│   ├── hello-world/worker.js
│   ├── echo-server/worker.js
│   ├── kv-demo/worker.js
│   ├── d1-demo/worker.js
│   ├── ai-demo/worker.js
│   └── hybrid-demo/          # worker.js + pages.zip（hybrid 双模）
└── .gitignore                # 忽略 surge-dist/（生成产物）
```

## catalog.json 与 Schema

`catalog.json` 的结构由 [`catalog.schema.json`](./catalog.schema.json) 严格校验，后端（backend）与 Worker 共用同一份 Schema。新增 / 修改模板前建议先对照 Schema。

顶层字段：

| 字段 | 必填 | 说明 |
|------|------|------|
| `version` | ✅ | 语义化版本号，如 `1.0.0` |
| `templates` | ✅ | 模板数组 |
| `updated` | — | ISO 时间字符串（改了模板后更新，便于缓存失效） |
| `name` / `defaultLanguage` | — | 源名称 / 默认语言 |

每个模板（`templates[]`）的必填字段：`id`、`name`、`version`、`type`。

```jsonc
{
  "id": "hello-world",          // 全局唯一去重，正则 ^[a-z0-9-]+$
  "name": "Hello World",
  "description": "模板描述",
  "author": { "name": "CF Manager" },   // name 必填，可加 url
  "version": "1.0.0",           // 语义化版本
  "tags": ["入门", "worker"],
  "type": "worker",             // worker | pages | hybrid
  "source": {                   // type=worker/pages 用 source
    "kind": "raw",              // raw | release | repo-archive
    "url": "https://raw.githubusercontent.com/hefy2027/cf-store/main/templates/hello-world/worker.js"
  },
  // type=hybrid 用 sources（worker/pages 至少其一，不能用 source）：
  // "sources": {
  //   "worker": { "kind": "raw",     "url": ".../hybrid-demo/worker.js" },
  //   "pages":  { "kind": "release", "url": ".../hybrid-demo/pages.zip" }
  // },
  "bindings": [                 // 可选：部署时需要的绑定
    { "type": "kv", "name": "MY_KV", "title": "demo-kv", "action": "create-or-reuse" }
  ]
}
```

### type 与 source 的约束（来自 Schema）

| `type` | 字段 | `kind` 允许值 |
|--------|------|--------------|
| `worker` | `source` | `raw` / `release`（**不能用** `repo-archive`） |
| `pages` | `source` | `release` / `repo-archive`（**不能用** `raw`，Pages 需 zip） |
| `hybrid` | `sources.worker` | `raw` / `release`（不能用 `repo-archive`） |
| `hybrid` | `sources.pages` | `release` / `repo-archive`（不能用 `raw`） |

### bindings 说明

- `type`：`kv` / `d1` / `r2` / `ai` / `var`
- `name`：**必须全大写**，正则 `^[A-Z][A-Z0-9_]*$`（如 `MY_KV`）
- `action`：`create-or-reuse`（默认）或 `prompt`（部署时询问用户）
- `d1` 专属：`initSql`（内联 SQL）或 `initSqlUrl`（SQL 文件地址），仅 `d1` 可用
- 其余字段：`title`、`required`

### URL 规则

- 所有 `url` 必须为 `https://` 开头（Schema 强制 `^https://`）。
- **不要求必须指向本仓库。** 你可以引用任意可公开访问的 HTTPS 地址——包括本仓库 `templates/` 下的文件，也包括第三方开源项目（如 `github.com/cmliu/edgetunnel` 的 raw 文件或 release/archive 包）。
- 本仓库自带的模板统一放在 `templates/` 下：
  `https://raw.githubusercontent.com/hefy2027/cf-store/main/templates/<id>/<文件>`
- 第三方项目示例（hybrid，worker+pages 双模）：
  - worker：`https://raw.githubusercontent.com/cmliu/edgetunnel/main/_worker.js`
  - pages：`https://github.com/cmliu/edgetunnel/archive/refs/heads/main.zip`

> 注意：引用外部源时，surge.sh 备用镜像**不会**自动镜像这些外部文件（备用源只改写本仓库 `main/` 前缀的 URL）。如需备用源也包含它们，请把对应文件下载进本仓库 `templates/` 后再引用。

## 如何新增模板

1. 在 `templates/` 下新建目录 `templates/<id>/`，把源码放进去（如 `templates/my-tpl/worker.js`）。
2. 在 `catalog.json` 的 `templates` 数组里加一条，填好 `id` / `name` / `version` / `type` 以及对应 `source` / `sources`（`url` 指向第 1 步的文件）。
3. 更新 `catalog.json` 的 `updated` 字段（便于缓存失效）。
4. 可选：用任意 JSON Schema 工具对照 `catalog.schema.json` 自检。
5. 提交并推送到 `main`；在 CF Manager 的 Store 页面点「刷新」即可看到新模板。

## CF Manager 如何消费

Store 路由的默认源地址（两端一致）：

```
https://raw.githubusercontent.com/hefy2027/cf-store/main/catalog.json
```

- 后端：`backend/src/routes/store.ts`
- Worker：`worker/src/routes/store.ts`

前端打开 Store 页会自动调用 `/store/init` 并同步默认源地址，无需手动配置。

## 备用源：surge.sh 镜像

当 GitHub / raw.githubusercontent.com 不可用时，可使用 surge.sh 镜像源。镜像由 CI 自动生成并部署，内容与本仓库完全一致，`catalog.json` 内部所有 URL 都已改写指向 surge 自身，因此镜像可独立工作。

```
https://cf-store.surge.sh/catalog.json
```

在 CF Manager 的 Store 页面把源地址改成上面的地址即可。

### 触发与维护

- 每次 push 到 `main`，GitHub Actions（`.github/workflows/deploy-surge.yml`）自动运行 `scripts/build-surge.mjs` 重新生成 `surge-dist/`，再 `npx surge publish surge-dist --domain cf-store.surge.sh --token $SURGE_TOKEN` 部署。
- `surge-dist/` 是生成产物，已被 `.gitignore` 忽略，无需手动提交。
- 需要的仓库 Secrets：
  - `SURGE_TOKEN`：surge 登录后 `surge token` 获取（与 cf-reg 同账号即可复用）
- 本地预览：`node scripts/build-surge.mjs && npx surge publish surge-dist --domain cf-store.surge.sh --token <你的token>`

## 致谢

本项目的灵感与模板整理参考了 [zhuima/awesome-cloudflare](https://github.com/zhuima/awesome-cloudflare)，在此表示感谢。

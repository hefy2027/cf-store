# CF Store

CF Manager 的官方模板源（catalog）。CF Manager 的 Store 页面会从本仓库的 `catalog.json` 拉取可一键部署的 Worker / Pages 模板。

## 目录结构

```
cf-store/
├── catalog.json            # 模板清单（Store 入口，唯一必须文件）
├── hello-worker.js         # 各模板的源码 / 资源文件
├── echo-worker.js
├── kv-demo-worker.js
├── d1-demo-worker.js
├── ai-demo-worker.js
├── hybrid-demo-worker.js
├── hybrid-demo-pages.zip   # hybrid 模板的 Pages 部分（zip 包）
└── index.html              # hybrid 模板 Pages 部分的静态入口
```

## catalog.json 说明

```jsonc
{
  "version": "1.0.0",
  "updated": "2026-07-08T16:00:00.000Z",
  "name": "CF Store 官方源",
  "defaultLanguage": "zh-CN",
  "templates": [
    {
      "id": "hello-world",            // 全局唯一，去重用
      "name": "Hello World",
      "description": "模板描述",
      "author": { "name": "CF Manager" },
      "version": "1.0.0",
      "tags": ["入门", "worker"],
      "type": "worker",               // worker | hybrid
      "source": {                     // type=worker 用 source
        "kind": "raw",                // 直接取原始文件
        "url": "https://raw.githubusercontent.com/hefy2027/cf-store/main/hello-worker.js"
      },
      // type=hybrid 用 sources：
      // "sources": {
      //   "worker": { "kind": "raw", "url": ".../hybrid-demo-worker.js" },
      //   "pages":  { "kind": "release", "url": ".../hybrid-demo-pages.zip" }
      // },
      "bindings": [                   // 可选：部署时需要的绑定
        { "type": "kv", "name": "MY_KV", "title": "demo-kv", "action": "create-or-reuse" }
      ]
    }
  ]
}
```

- 所有 `url` 必须指向**本仓库** `main` 分支的 raw 地址：
  `https://raw.githubusercontent.com/hefy2027/cf-store/main/<文件名>`
- 普通 Worker 模板用 `source`；同时支持 Worker + Pages 双模部署的用 `sources.worker` / `sources.pages`。

## 如何新增模板

1. 把源码文件（如 `my-worker.js`）放进本仓库根目录。
2. 在 `catalog.json` 的 `templates` 数组里加一条，填好 `id` / `name` / `type` / `source.url`。
3. 提交并推送到 `main`，更新 `catalog.json` 的 `updated` 字段（便于缓存失效）。
4. 在 CF Manager 的 Store 页面点「刷新」即可看到新模板。

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

- 每次 push 到 `main`，GitHub Actions（`.github/workflows/deploy-surge.yml`）自动运行 `scripts/build-surge.mjs` 重新生成 `surge-dist/` 并部署到 `cf-store.surge.sh`。
- `surge-dist/` 是生成产物，已被 `.gitignore` 忽略，无需手动提交。
- 需要以下仓库 Secrets 才能部署：
  - `SURGE_TOKEN`：`surge token` 获取
  - `SURGE_LOGIN`：surge 账号邮箱
- 本地预览：`node scripts/build-surge.mjs && npx surge ./surge-dist --domain cf-store.surge.sh`

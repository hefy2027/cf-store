# catalog.json 字段约束（来自 catalog.schema.json）

唯一真实来源是 `catalog.json`，由 `catalog.schema.json`（JSON Schema draft 2020-12，`additionalProperties: false`）严格校验。修改模板时必须对照本文件与 Schema。

## 顶层字段

| 字段 | 必填 | 说明 |
|------|------|------|
| `version` | 是 | 语义化版本 `^\d+\.\d+\.\d+$` |
| `templates` | 是 | 模板对象数组 |
| `updated` | 否 | ISO 时间字符串；改模板后更新以便缓存失效 |
| `name` | 否 | 目录显示名 |
| `defaultLanguage` | 否 | 默认语言，如 `zh-CN` |
| `description` | 否 | 目录描述 |
| `mirrorOf` | 否 | 镜像源指向的官方源地址（surge 备用源用） |

## 模板必填字段

`id`、`name`、`version`、`type`。`version` 同样须 `^\d+\.\d+\.\d+$`。

## compatibility_date / compatibility_flags（兼容性日期与标志）

模板对象可选字段，对应 wrangler 的 `compatibility_date` 与 `compatibility_flags`。

- `compatibility_date`：`^\d{4}-\d{2}-\d{2}$` 日期字符串。缺省时部署端用安全默认值（约 `2024-11-01`）。使用 React Router v7 / 含 node 构建产物、或依赖较新运行时特性的 worker，通常需要更新的日期（如 `"2025-01-01"`）。
- `compatibility_flags`：字符串数组，目前最常用 `["nodejs_compat"]`。
- **何时必须加 `compatibility_flags: ["nodejs_compat"]`**：Worker 代码（含打包进 zip 的 chunk）使用了以下任一特性就必须开——不开则运行时抛 `Error 1101`（脚本异常）：
  - CJS 互操作 / 调用 `require`（`__commonJS` 这类 esbuild 打包 shim 即属此列）；
  - 访问 Node 内置：`process` / `Buffer` / `node:` 协议 / `AsyncLocalStorage` 等。
- **判定方式**：在 `templates/<id>/` 的产物里搜索 `__commonJS|require\(|process\.|node:|Buffer\.` 等关键字，命中即加 `nodejs_compat`；SSR 框架（RR7 等）构建产物建议额外给较新的 `compatibility_date`。

## type 与 source 的关系

- `worker` / `pages`：使用 `source`（单对象）。**不能使用** `sources`。
- `hybrid`：使用 `sources`（含 `worker` 和/或 `pages`，至少其一）。**不能使用** `source`。

## source.kind 允许值

| type | 字段 | kind 允许值 |
|------|------|--------------|
| `worker` | `source` | `raw` / `release`（**不能** `repo-archive`） |
| `pages` | `source` | `release` / `repo-archive`（**不能** `raw`，Pages 需 zip） |
| `hybrid` | `sources.worker` | `raw` / `release`（不能 `repo-archive`） |
| `hybrid` | `sources.pages` | `release` / `repo-archive`（不能 `raw`） |

`source` 对象字段：`kind`（必填）、`url`（必填，`^https://`）、`assetName`、`subPath`、`size`、`mainModule`（可选）。

- `mainModule`（可选）：仅对**多模块 Worker** 有意义。显式声明 zip 解压后作为 Worker 入口的文件名（如 `index.js`）。**强烈建议多模块 zip 显式声明**，避免依赖后端默认推断规则：`worker.js → index.js/index.mjs → 根目录首个 JS 模块`；若 zip 内附 `wrangler.toml/jsonc`，以其 `main` 字段为准。单文件 worker 无需此字段。

## 多模块源（release + zip，构建型 SSR 项目）

Worker 类型的 `source.kind: release`（或 `repo-archive`）+ **多模块 zip**（如 React Router v7 / 其他 SSR 框架构建出的 `build/server/`）：将服务端模块目录整体压缩为 `server.zip`，`url` 指向它，并加 `"mainModule": "index.js"` 显式声明入口即可。后端按 zip 的 PK 魔数识别并自动解压，以 `mainModule` 指定的文件（如 `index.js`）作为 `main_module`，将其余 chunk 作为多模块 multipart 上传——无需用 esbuild 合并成单文件。**`mainModule` 强烈建议显式声明**（不写则按默认推断：根目录有 `worker.js` 用它、否则 `index.js/index.mjs`、否则根目录首个 JS 模块）。`⚠️` kind **必须填 `release`/`repo-archive`，不能填 `raw`**：`raw` 语义是「单文件直链」，塞 zip 虽能靠魔数识别跑起来，但元数据标签是假的，会误导读 catalog 的人。`⚠️` 打包时务必剔除 `wrangler.json` 等非运行时代码（其内含作者硬编码的 `bucket_name` / `database_name` / `crons`，既不会被当作模块上传，也不该用于用户部署）。

## assets 规则（静态资源 / Worker with Assets）

可选字段，用于 Worker with Assets（或 Pages / hybrid 的静态资源）托管静态文件（favicon、前端资源等）。

- `source`：**必填**，复用 `source` 对象（`kind` 可为 `raw` / `release` / `repo-archive`；zip 内文件应放在根目录，对应 wrangler 的 `directory`）。`⚠️` 若 `source` 是 zip（静态资源目录打包），kind **不能填 `raw`**——后端 `workerService` 对 `assets.source.kind === 'raw'` 走单文件分支，会把整个 zip 当作一个名为 `xxx.zip` 的文件上传，导致资产失效；务必用 `release` / `repo-archive`。`raw` 仅适用于真正的单文件资产。
- `binding`：资产绑定变量名，可选，缺省 `ASSETS`。
- `config`：可选，`{ html_handling, not_found_handling }`，仅需要自定义 SPA 回退 / 404 时填。
- 与 `hybrid` 区别：有 `[assets] directory` 或只需托管静态文件时，**优先用 `worker` + `assets`**，而非拆成 `hybrid`（worker.js + pages.zip）。

## 可选展示字段

- `description`：模板描述。
- `author`：`{ name, url }`，`name` 必填；卡片显示名与链接。
- `tags`：字符串数组。
- `icon`：图标标识。
- `homepage`：项目/仓库主页 URI（访问仓库按钮、兜底仓库入口）。
- `readmeUrl`：README 原始内容地址（详情页加载）。

## id 与 URL 规则

- `id`：正则 `^[a-z0-9-]+$`，全局唯一（小写字母、数字、连字符）。
- 所有 `url` / `homepage` / `readmeUrl` 必须 `https://` 开头（Schema 强制 `^https://`）。
- 不要求指向本仓库。`templates/` 自带文件 URL：`https://raw.githubusercontent.com/hefy2027/cf-store/main/templates/<id>/<文件>`。

## bindings 规则

必填：`type`、`name`。

### 通用字段

- `type`：`kv` / `d1` / `r2` / `ai` / `var` / `durable_object` / `service` / `queue`。
- `name`：**必须全大写**，正则 `^[A-Z][A-Z0-9_]*$`（如 `MY_KV`）。它是绑定**变量名**，必须与项目代码实际引用的 `env.XXX` 一致（如代码用 `env.D1` 则写 `D1`）——这是代码契约、不可改。注意它**不同于** wrangler 里的 `bucket_name` / `database_name`（Cloudflare 账户内的资源实际名，由 `create-or-reuse` 自动生成，catalog 也无此字段，**无需照抄作者命名**）。
- `resourceName`（可选）：Cloudflare 资源名（D1/KV/R2），格式 `^[a-zA-Z0-9][a-zA-Z0-9_-]*$`。缺省时部署端用 `templateId-bindingName` 兜底自动生成。**仅 kv/d1/r2 可用**。
- `action`：`create-or-reuse`（默认）或 `prompt`（部署时询问用户）。
- `title` / `required`：展示与必填标记（可选）。

### d1 专属

- `initSql`（内联 SQL）或 `initSqlUrl`（SQL 文件地址），仅 `d1` 可用，其余类型禁止（schema if/then/else 强制校验）。建议将建表迁移自托管为 `templates/<id>/init.sql` 并用 `initSqlUrl` 引用（优先幂等 `IF NOT EXISTS`，避免 D1 部署后为空库、Worker 查表报错）。若 `initSqlUrl` 指向本仓库 `main/` 前缀（如 `templates/<id>/init.sql`），surge 备用源（`scripts/build-surge.mjs`）会自动改写为 surge 域名并复制该 SQL，使备用源在 GitHub 不可用时仍可用。

### var 专属

- `secret`：true/缺省 = 加密 secret_text，前端密码框；false = 明文环境变量（plain_text），前端普通文本框。**其余类型禁止 `secret`**。

### durable_object 专属

- `className`（必填）：DO class 名，必须与入口文件的 `export class <className>` 一致。wrangler 部署后会验证 class 名是否在入口文件的导出中。
- `scriptName`（可选）：DO 所在脚本名（仅跨 Worker 引用时需要，一般情况下不用写，使用当前脚本）。
- `environment`（可选）：Worker 环境名。

### service 专属

- `service`（必填）：目标 Worker 服务名。
- `environment`（可选）：目标 Worker 环境名。
- `entrypoint`（可选）：入口点（指定调用的具体 handler）。

### queue 专属

- `queueName`（必填）：队列名。
- `deliveryDelay`（可选）：投递延迟秒数（number 类型）。

### Durable Object 迁移：migrations 字段

模板对象的 `migrations` 字段（数组，可选）用于声明 DO 迁移步骤，按顺序执行，每个 tag 代表一次迁移。**仅声明 DO binding 的模板需要关注**。

- 每个迁移对象必填 `tag`（string）。
- 可选字段：
  - `new_classes`（string[]）：新建的 DO class。
  - `renamed_classes`（[{ from: string, to: string }]）：重命名的 class。
  - `deleted_classes`（string[]）：删除的 class。

> **注意区分**：`bindings[].className` 是运行时对外的 DO class 名，`migrations[].tag` 是迁移标记——两者在 wrangler 的 DO 配置中是同一概念的不同维度。如果 wrangler.toml 中有 `[[migrations]]`，就要提取其内容加到 catalog 中。

## env / routes

- `env`：普通对象，静态环境变量（可选）。
- `routes`：字符串数组，自定义路由（可选）。

## crons 规则（Cron Triggers）

模板对象内的 `crons` 字段（数组）用于声明 Worker 定时任务，部署后由 cf-manager 自动注册到该 Worker 脚本。

- 类型：`string[]`，每个元素为**标准 5 字段 cron 表达式**（如 `"*/30 * * * *"`、`"0 0 * * *"`）。正则校验 `^\S+\s+\S+\s+\S+\s+\S+\s+\S+$`（恰好 5 段）。
- 适用范围：**仅 `worker` / `hybrid` 的 worker 部分**；schema 已禁止 `pages` 类型使用 `crons`（定时任务是 Worker 脚本特性，Pages 项目无脚本入口）。
- 用途示例：smail 用 `"crons": ["*/30 * * * *"]` 每 30 分钟清理过期邮件。

## 部署行为控制字段

这些可选字段控制 cf-manager 部署时的 Worker 元数据（对应 wrangler.toml 顶层配置）：

- `keep_vars`（boolean，默认 `true`）：部署时保留已有的明文环境变量。默认 true 更安全（已有 vars 不会被覆盖）。
- `keep_secrets`（boolean，默认 `true`）：部署时保留已有的加密 Secrets。默认 true 更安全。
- `keep_bindings`（boolean，默认 `true`）：部署时保留已有的非 var/secret 绑定（KV、D1、R2 等）。默认 true 更安全。对应 wrangler 的 `metadata.keep_bindings`。
- `placement`（object，可选）：`{ "mode": "smart" | "off" }`。Placement 模式。
- `tail_consumers`（array，可选）：`[{ "service": "xxx", "environment"?: "xxx" }]`。Tail Worker 消费者列表。
- `limits`（object，可选）：`{ "cpu_ms": number, "memory_mb": number }`。Worker 资源限制。
- `logpush`（boolean，默认 `false`）：是否开启 Logpush。

## 已知表达限制

catalog 当前仍无法表达以下 wrangler 能力，新增模板时若项目依赖，需向用户说明其在 cf-manager 部署后不会生效，或在 `description` 中提示：

- `send_email` 邮件路由等高级绑定（`crons` 定时触发器已通过 `crons` 字段支持；DO/service/queue 绑定已通过对应 binding type 支持）。

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

`source` 对象字段：`kind`（必填）、`url`（必填，`^https://`）、`assetName`、`subPath`、`size`（可选）。

## assets 规则（静态资源 / Worker with Assets）

可选字段，用于 Worker with Assets（或 Pages / hybrid 的静态资源）托管静态文件（favicon、前端资源等）。

- `source`：**必填**，复用 `source` 对象（`kind` 可为 `raw` / `release` / `repo-archive`；zip 内文件应放在根目录，对应 wrangler 的 `directory`）。
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

- `type`：`kv` / `d1` / `r2` / `ai` / `var`。
- `name`：**必须全大写**，正则 `^[A-Z][A-Z0-9_]*$`（如 `MY_KV`）。
- `action`：`create-or-reuse`（默认）或 `prompt`（部署时询问用户）。
- `title` / `required`：展示与必填标记（可选）。
- `d1` 专属：`initSql`（内联 SQL）或 `initSqlUrl`（SQL 文件地址），仅 `d1` 可用，其余类型禁止。
- `var` 专属：`secret`（true/缺省 = 加密 secret_text，前端密码框；false = 明文环境变量，前端普通文本框）。其余类型禁止 `secret`。

## env / routes

- `env`：普通对象，静态环境变量（可选）。
- `routes`：字符串数组，自定义路由（可选）。

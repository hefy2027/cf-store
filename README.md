# CF Store

CF Manager 的官方模板源（catalog）。CF Manager 的 Store 页面会从本仓库的 `catalog.json` 拉取可一键部署的 Worker / Pages / Hybrid 模板。

<!-- CATALOG_TABLE_START -->
## 已收录模板

> 共 67 个模板。本表由 `catalog.json` 同步生成（运行 `node scripts/gen-readme-table.mjs` 刷新），请勿手改，保持与 `catalog.json` 一致。

| 名称 | ID | 类型 | 描述 | 标签 |
|------|----|------|------|------|
| [Hello World](https://github.com/hefy2027/cf-store) | `hello-world` | worker | 一个最简单的 Cloudflare Worker，返回 JSON 格式的 Hello 消息，适合新手入门。 | 入门, worker, 示例 |
| [Echo 服务器](https://github.com/hefy2027/cf-store) | `echo-server` | worker | 回显请求信息的 Worker，返回请求方法、Header、路径等，可用于调试 Webhook 和 API 调用。 | 调试, webhook, worker |
| [KV 存储演示](https://github.com/hefy2027/cf-store) | `kv-demo` | worker | 演示 Worker 如何读写 Cloudflare KV 存储。需要 KV 命名空间绑定。 | kv, 存储, worker |
| [D1 数据库演示](https://github.com/hefy2027/cf-store) | `d1-demo` | worker | 演示 Worker + D1 数据库的完整 CRUD 操作。自动创建 items 表，支持增删查。 | d1, 数据库, worker, CRUD |
| [AI 推理演示](https://github.com/hefy2027/cf-store) | `ai-demo` | worker | 演示 Worker + Workers AI 绑定，调用 LLM 模型进行文本生成。支持 Llama、Mistral、DeepSeek 等模型。 | ai, LLM, 推理, worker |
| [Hybrid 双模部署](https://github.com/hefy2027/cf-store) | `hybrid-demo` | hybrid | 同一份代码同时支持 Worker 和 Pages 两种部署方式。部署时可选择仅 Worker、仅 Pages 或同时部署。包含简单 Web API + 静态页面。 | hybrid, 双模, worker, pages |
| [EdgeTunnel (VLESS/Trojan/SS)](https://github.com/cmliu/edgetunnel) | `edgetunnel` | hybrid | 基于 Cloudflare Workers/Pages 的边缘隧道面板，支持 VLESS、Trojan、Shadowsocks 协议，内置管理后台与订阅系统。第三方开源项目（cmliu/edgetunnel）。 | 隧道, 代理, worker, pages, hybrid, 第三方 |
| [Cloudflare Proxy EX](https://github.com/1234567Yang/cf-proxy-ex) | `cf-proxy-ex` | worker | 基于 Cloudflare Workers 的超级代理，支持 OpenAI/ChatGPT、GitHub 加速与 DuckDuckGo 在线代理，内置安全密码保护，支持 Cloudflare 与 Deno 多平台部署。 | 代理, worker, 加速, openai, github |
| [Sublink Worker](https://github.com/7Sageer/sublink-worker) | `sublink-worker` | worker | 部署在 Cloudflare Workers 上的轻量级代理订阅转换与管理工具，支持将多种代理协议分享链接转换为不同客户端可用的订阅，内置 KV 存储。 | 订阅, worker, kv, 代理 |
| [CF Page Publish MCP](https://github.com/FactrueSolin/cf-page-publish-mcp) | `cf-page-publish-mcp` | worker | Cloudflare 页面发布 MCP 工具，可将 HTML 页面发布到 Cloudflare Worker/KV，并提供 MCP 接口与可视化编辑界面，可选 Browser 绑定渲染截图。 | mcp, worker, kv, 工具 |
| [KV UrlShort](https://github.com/Ai-Yolo/CloudflareWorker-KV-UrlShort) | `cloudflareworker-kv-urlshort` | worker | 基于 Cloudflare Workers + KV 的简约短链接生成器，支持密码保护、有效期与访问次数限制，内置 Web 管理界面与 Turnstile 人机验证。 | 短链, worker, kv |
| [smail](https://github.com/akazwz/smail) | `smail` | worker | 基于 React Router v7 + Cloudflare Workers 的临时邮箱服务，使用 D1 存储邮件元数据、R2 存储邮件原始内容，支持 10 种语言与附件，内置 SEO 博客与多语言页面。 | 邮箱, worker, d1, r2, react-router |
| [deploy-mcp](https://github.com/alexpota/deploy-mcp) | `deploy-mcp` | worker | 通用部署跟踪器 MCP 服务，支持实时状态徽章与部署监控（含 Cloudflare Pages 支持），基于 Cloudflare Workers + KV 构建。读取云厂商令牌使用 process.env，部署后需开启 nodejs_compat 兼容标志，并在后台配置 CLOUDFLARE_TOKEN / CLOUDFLARE_ACCOUNT_ID 等环境变量。 | mcp, worker, kv, 监控 |
| [cohere2openai](https://github.com/beanqi/cohere2openai) | `cohere2openai` | worker | 将 Cohere API 转换为 OpenAI API 格式的 Cloudflare Worker，部署简单，仅需配置 API 密钥即可作为 OpenAI 兼容端点使用。 | worker, openai, 代理, api |
| [img-mom](https://github.com/beilunyang/img-mom) | `img-mom` | worker | 基于 Cloudflare Workers 运行时的 Telegram 图床机器人，支持 Telegram、Cloudflare R2、Backblaze B2 等多渠道图床上传，轻量免费。部署后访问 /setup 完成 Webhook 注册（需在 Telegram @BotFather 创建 Bot 并填写 TG_BOT_TOKEN）。 | 图床, worker, telegram, r2 |
| [MoeMail](https://github.com/beilunyang/moemail) | `beilunyang-moemail` | pages | 基于 Next.js + Cloudflare Pages 技术栈构建的可爱临时邮箱服务，支持多语言、多邮件渠道与附件，使用 D1 与 KV 存储。 | 邮箱, pages, nextjs, d1 |
| [MoePush](https://github.com/beilunyang/moepush) | `beilunyang-moepush` | pages | 基于 Next.js + Cloudflare Pages 技术栈构建的可爱消息推送服务，支持钉钉、企业微信、Telegram 等多种推送渠道，使用 D1 存储。 | 推送, pages, nextjs, d1 |
| [Alle](https://github.com/bestruirui/Alle) | `bestruirui-alle` | worker | 邮件聚合与管理平台，整合各邮箱服务商的邮件转发实现跨账户集中管理，基于 Cloudflare Workers + D1 + R2 构建。 | 邮箱, worker, d1, r2 |
| [Redirect Checker](https://github.com/brancogao/redirect-checker) | `brancogao-redirect-checker` | worker | 基于 Cloudflare Workers 的 HTTP 重定向链分析器，支持检测重定向循环、性能测量与多种 User-Agent 预设，提供 RESTful API 与响应式 Web UI。 | worker, 工具, 分析, 重定向 |
| [SSL Certificate Monitor](https://github.com/brancogao/ssl-certificate-monitor) | `brancogao-ssl-certificate-monitor` | worker | 基于 Cloudflare Workers 的 SSL 证书到期监控工具，检查证书有效期与详情并通过 RESTful API 提供服务，使用 KV 与 D1 存储。 | worker, 监控, ssl, d1, kv |
| [Webhook Debugger](https://github.com/brancogao/webhook-debugger) | `brancogao-webhook-debugger` | worker | 自托管 Webhook 调试工具，支持签名验证（Stripe/GitHub/Slack/Shopify）、90 天历史、全文搜索与一键重放，基于 Cloudflare Workers + D1 构建。 | worker, webhook, d1, 调试 |
| [Cloudflare Worker Image](https://github.com/ccbikai/cloudflare-worker-image) | `ccbikai-cloudflare-worker-image` | worker | 使用 Cloudflare Worker（依赖 Photon / Cloudflare Container）处理图片，支持缩放、剪裁、水印、滤镜等功能，需启用 Container 绑定。 | worker, 图片, 处理 |
| [IP-API](https://github.com/ccbikai/ip-api) | `ccbikai-ip-api` | worker | 利用 Cloudflare Workers 快速搭建获取客户端 IP 地址与地理位置信息的接口，支持 IPv4/IPv6 与 /geo 路径。 | worker, ip, 工具 |
| [Nextflare](https://github.com/ccbikai/nextflare) | `ccbikai-nextflare` | pages | 基于 Next.js + Cloudflare Pages 的 SaaS 起步模板，集成 Lemon Squeezy 订阅计费、Auth.js（GitHub OAuth）鉴权与 D1 数据库。 | pages, nextjs, saas, d1 |
| [Sink](https://github.com/ccbikai/sink) | `ccbikai-sink` | pages | 100% 运行在 Cloudflare 上的极简、快速、安全的短链服务，内置分析面板与控制台，基于 Nuxt + Workers AI + KV + R2 构建。 | 短链, pages, ai, kv, r2 |
| [Telegraph-Image](https://github.com/cf-pages/Telegraph-Image) | `cf-pages-telegraph-image` | pages | 免费图片托管方案（Flickr/imgur 替代品），使用 Cloudflare Pages 与 Telegram 频道存储，需配置 TG_Bot_Token 与 TG_Chat_ID 环境变量。 | 图床, pages, telegram, kv |
| [Cloudflare Docker Proxy](https://github.com/ciiiii/cloudflare-docker-proxy) | `ciiiii-cloudflare-docker-proxy` | worker | 运行在 Cloudflare Workers 上的 Docker 镜像代理，中转对 Docker 官方镜像仓库的请求（注意官方已对 Worker IP 限流，不推荐生产使用）。 | worker, docker, 代理 |
| [Cohere2OpenAI CF Worker](https://github.com/ckt1031/cohere2openai-cf-worker) | `ckt1031-cohere2openai-cf-worker` | worker | 将 Cohere API 转换为 OpenAI API 的 Cloudflare Worker（已弃用，Cohere 已发布官方兼容 API，建议迁移）。 | worker, openai, 代理, 弃用 |
| [CF-Workers-docker.io](https://github.com/cmliu/CF-Workers-docker.io) | `cmliu-cf-workers-docker-io` | worker | 基于 Cloudflare Workers 的 Docker 镜像代理工具，中转对 Docker 官方镜像仓库的请求，解决访问限制与加速访问问题，支持 Workers 与 Pages 部署。 | worker, docker, 代理 |
| [gh-proxy](https://github.com/crazypeace/gh-proxy) | `crazypeace-gh-proxy` | worker | 基于 Cloudflare Workers 的 GitHub 资源与脚本加速代理，解决 github 访问不通的问题，支持对 github 脚本的无限嵌套调用。 | worker, 代理, 加速, github |
| [Url-Shorten-Worker](https://github.com/crazypeace/Url-Shorten-Worker) | `crazypeace-url-shorten-worker` | worker | 基于 Cloudflare Worker + KV 的 URL 缩短器，支持秘密路径访问、自定义短链、变身 Pastebin 与图床，需要 KV 命名空间。 | 短链, worker, kv |
| [githubbox](https://github.com/dferber90/githubbox) | `dferber90-githubbox` | worker | 将 GitHub 仓库快速在 CodeSandbox 打开的 Cloudflare Worker：把地址中的 github.com 改为 githubbox.com 即可。 | worker, 工具, github |
| [Cloudflare Temp Email](https://github.com/dreamhunter2333/cloudflare_temp_email) | `dreamhunter2333-cloudflare-temp-email` | pages | 使用 Cloudflare 免费服务搭建的临时邮箱，D1 作为数据库，带前端与后端，支持多国语言、自动回复与附件（IMAP/SMTP），含邮件路由 Worker。 | 邮箱, pages, d1 |
| [CF Workers Status Page](https://github.com/eidam/cf-workers-status-page) | `eidam-cf-workers-status-page` | worker | 基于 Cloudflare Workers + KV + CRON 触发器 的网站状态页，展示每日历史记录，网站状态变化时发送 Slack/Discord 通知。 | worker, 监控, kv, 状态页 |
| [emaction Backend](https://github.com/emaction/emaction.backend) | `emaction-emaction-backend` | worker | emaction 的 GitHub 风格 Reactions 点赞功能后端，基于 Cloudflare Workers + D1 实现，可自托管保存数据。 | worker, d1, 点赞, 后端 |
| [GitPush](https://github.com/fatwang2/gitpush) | `fatwang2-gitpush` | worker | 基于 Cloudflare Workers + Workflows + Workers AI + Email Routing 的 GitHub Release 追踪器，AI 总结更新内容并通过邮件推送通知。 | worker, ai, 监控, 邮件 |
| [Siri Ultra](https://github.com/fatwang2/siri-ultra) | `fatwang2-siri-ultra` | worker | 运行在 Cloudflare Workers 上的 Siri Ultra 语音助手，配合 Apple 快捷指令，支持实时对话、语音、联网搜索，可对接任意 LLM。 | worker, ai, 助手 |
| [Cloudflare Workers Blog](https://github.com/gdtool/cloudflare-workers-blog) | `gdtool-cloudflare-workers-blog` | worker | 运行在 Cloudflare Workers 上的博客程序，使用 KV 作为数据库并缓存 HTML，兼顾静态博客速度与动态博客灵活性。 | worker, 博客, kv |
| [Linklet](https://github.com/harrisonwang/linklet) | `linklet` | pages | 基于 Cloudflare Pages 创建的 URL 缩短器，使用 D1 存储，支持 API 模式，适合更多使用场景。 | pages, 短链, d1 |
| [Url-Shorten-Worker (horsemail)](https://github.com/horsemail/Url-Shorten-Worker) | `horsemail-url-shorten-worker` | worker | Url-Shorten-Worker 的 fork，基于 Cloudflare Worker + KV 的 URL 缩短器，支持秘密路径访问、自定义短链、变身 Pastebin 与图床。 | 短链, worker, kv |
| [Text2img Cloudflare Workers](https://github.com/huarzone/text2img-cloudflare-workers) | `huarzone-text2img-cloudflare-workers` | worker | 基于 Cloudflare AI & Workers 的在线文生图服务，免费部署，调用 Workers AI 文本生成图像模型。 | worker, ai, 文生图 |
| [gh-proxy (hunshcn)](https://github.com/hunshcn/gh-proxy) | `hunshcn-gh-proxy` | worker | GitHub release、archive 与项目文件加速项目，提供 Cloudflare Workers 无服务器版本，支持 clone 与文件访问加速。 | worker, 代理, 加速, github |
| [Telegram Counter](https://github.com/iamshaynez/telegram-counter) | `iamshaynez-telegram-counter` | worker | 使用 Cloudflare Worker + D1 + Workers AI 编写的 Telegram 后端，可随时随地进行打卡等记录。 | worker, d1, ai, telegram |
| [Gins Blog](https://github.com/ichimarugin728/Gins-Blog) | `ichimarugin728-gins-blog` | pages | 高性能、边缘优先的博客平台，基于 Astro + Cloudflare 技术栈，使用 D1、R2、KV、Workers AI（及 Vectorize）构建，内置 MCP 与 OpenClaw 自动部署。 | 博客, pages, d1, r2, ai |
| [CF Image Hosting](https://github.com/ifyour/cf-image-hosting) | `ifyour-cf-image-hosting` | pages | 基于 Cloudflare Pages 的免费无限图床，使用 Telegraph 存储，支持拖拽与粘贴上传，单文件上限 5MB。 | pages, 图床, telegram |
| [DeepLX for Cloudflare](https://github.com/ifyour/deeplx-for-cloudflare) | `ifyour-deeplx-for-cloudflare` | worker | 在 Cloudflare Workers 上部署 DeepLX 翻译 API，兼容 DeepL 接口，提供免费无限量翻译能力。 | worker, 翻译, api |
| [Short (igengdu)](https://github.com/igengdu/short) | `igengdu-short` | pages | 基于 Cloudflare Pages 创建的 URL 缩短器，使用 D1 存储，Fork 自 x-dr/short，支持自定义短链。 | pages, 短链, d1 |
| [丁丁快传 (DingDing)](https://github.com/iiop123/dingding) | `iiop123-dingding` | worker | 基于 Cloudflare Workers 的文件传输工具「丁丁快传」，文件存储在 KV，支持拖拽/多文件上传、定时删除、二维码接收与文件口令传输。 | worker, 文件传输, kv |
| [Workers Image Hosting](https://github.com/iiop123/workers-image-hosting) | `iiop123-workers-image-hosting` | worker | 基于 Cloudflare Workers 数据存储于 KV 的图床，Material 风格，支持拖拽上传、图片预览与 /list.html 查询已上传照片。 | worker, 图床, kv |
| [Sub Pool Worker](https://github.com/illusionlie/subpool-worker) | `illusionlie-subpool-worker` | worker | 基于 Cloudflare Workers 的轻量订阅池服务，统一管理多组订阅来源、按客户端格式分发，含 Web 管理后台（Worker + KV + Assets）。 | worker, 订阅, kv |
| [Edgebin](https://github.com/jiacai2050/edgebin) | `jiacai2050-edgebin` | worker | 类似 httpbin 的 HTTP 测试服务，基于 Cloudflare Workers + Assets 边缘部署，支持请求/响应检视、重定向、Cookie、缓存等。 | worker, 工具, http |
| [CloudFlare Pages UrlShorten](https://github.com/jiaocz/CloudFlare-Pages-UrlShorten) | `jiaocz-cloudflare-pages-urlshorten` | pages | 基于 Cloudflare Pages Functions 的多功能 URL 短链工具，使用 KV 存储，通过 Pages Functions 实现路由与跳转。 | pages, 短链, kv |
| [CF Comment](https://github.com/joyance-professional/cf-comment) | `cf-comment` | worker | 基于 Cloudflare Workers 运行的简单评论系统，支持回复、点赞、举报与管理员后台，提供中英双语切换，使用 D1 存储。 | worker, 评论, d1 |
| [CF Files Sharing](https://github.com/joyance-professional/cf-files-sharing) | `cf-files-sharing` | worker | 运行在 Cloudflare Workers 上的简单文件分享工具，支持密码保护，R2 + D1 双存储（大文件自动使用 R2），Cloudflare 全球高速访问。 | worker, 文件分享, r2, d1 |
| [Cloudflare Worker Blog](https://github.com/kasuganosoras/cloudflare-worker-blog) | `cloudflare-worker-blog` | worker | 基于 Cloudflare Workers + GitHub 实现的动态博客系统，使用边缘计算，无需服务器，文章存放于 GitHub 仓库。部署后在环境变量 GITHUB_BASE 中填写你自己的 `owner/repo`（其中 posts/ 与 list.json 存放文章）即可。 | worker, 博客 |
| [UptimeFlare](https://github.com/lyc8503/UptimeFlare) | `uptimeflare` | pages | 基于 Cloudflare Workers + D1 的无服务器宕机监控与状态页，支持多地区探测、100+ 通知渠道、暗色状态页与自定义域名。 | 监控, 状态页, pages, d1, uptime |
| [Url Shorten Worker](https://github.com/Monopink/url-shorten-worker) | `url-shorten-worker` | worker | 部署在 Cloudflare Workers 上的短链接服务，支持 KV 存储、管理员/访客分级密码、正则重定向与 PWA，无需服务器。 | 短链, worker, kv |
| [ShotOG](https://github.com/nicepkg/shotog) | `shotog` | worker | 基于 Cloudflare Workers + D1 的 Open Graph 图片生成服务，使用 Satori + resvg（WASM）在边缘直接生成精美 OG 图，无需无头浏览器。单次 URL 调用即可生成，支持 API Key 与用量统计。 | og图片, worker, d1 |
| [Serverless Cloud Notepad](https://github.com/s0urcelab/serverless-cloud-notepad) | `serverless-cloud-notepad` | worker | 基于 Cloudflare Workers + KV 的无服务器云端记事本，无需后端与数据库，支持自动保存与国际化，可一键私有部署。 | 记事本, worker, kv |
| [Micro Notepad](https://github.com/thun888/micro-notepad) | `micro-notepad` | worker | 基于 Cloudflare Workers + KV 的迷你笔记本，是 minimalist-web-notepad 的 Worker 实现，无需服务器，绑定一个 KV 即可使用。 | 记事本, worker, kv |
| [Whisper on Cloudflare](https://github.com/thun888/whisper_cloudflare) | `whisper-cloudflare` | worker | 基于 Cloudflare AI (Whisper) 的在线音频转写工具，部署在 Workers 上，可将音频转为文字并生成 SRT 字幕。 | 转录, whisper, worker, ai |
| [ChatGPT Telegram Workers](https://github.com/tbxark/chatgpt-telegram-workers) | `chatgpt-telegram-workers` | worker | 部署在 Cloudflare Workers 上的 Telegram ChatGPT 机器人，单文件无依赖，支持多 AI 服务商与多平台，可自定义模型与预设。 | telegram, 机器人, worker, ai, kv |
| [PixR2](https://github.com/WangQueXL/PixR2) | `pixr2` | worker | 基于 Cloudflare Workers + R2 的多入口图床与图片管理平台，支持网页端与 Telegram Bot 上传、在线预览与分享链接管理。 | 图床, worker, r2, kv |
| [Page API Forwarder](https://github.com/xinjianzhanghao/page-api-forwarder) | `page-api-forwarder` | worker | 部署在 Cloudflare Pages/Workers 上的 API 请求转发脚本，可绕过部分 API 的 IP 限制，支持协议覆盖与简单鉴权头/参数。 | 转发, 代理, worker |
| [Web Analytics (yestool)](https://github.com/yestool/analytics_with_cloudflare) | `analytics-with-cloudflare` | worker | 基于 Cloudflare Workers + Hono + D1 的网站访问统计分析服务，支持 D1 存储访问数据，可私有化部署。 | 分析, 统计, worker, d1 |
| [EdgeEver](https://github.com/tianma-if/edgeever) | `edgeever` | worker | 基于 Cloudflare Workers + D1 + R2 的开源自托管笔记工作区，保留经典三栏体验，原生支持 MCP AI Agent 接入，零服务器零费用。 | 笔记, AI, MCP, worker, d1, r2 |
| [WikiShare](https://github.com/qbmiller/wikiShare) | `wiki-share` | worker | 基于 Cloudflare Workers + D1 + R2 的自托管 Wiki 知识库与文件共享平台，支持页面/文件夹树、分享链接（带密码/有效期/访问次数限制）、回收站定时清理与 Vue SPA 前端。 | wiki, 知识库, 文件共享, worker, d1, r2 |

<!-- CATALOG_TABLE_END -->

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

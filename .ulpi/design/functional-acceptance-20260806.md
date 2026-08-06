# 企业知识库功能验收记录

验收时间：2026-08-06

验收环境：`http://81.70.235.69`，管理员账号 `admin`。

## 已通过的真实操作

| 功能区域 | 已验证操作 | 结果 |
| --- | --- | --- |
| 认证 | 管理员登录、注册页必填校验、修改密码必填和长度校验、找回密码第一步页面 | 通过；邮件验证码发送和激活需要真实 SMTP 环境 |
| 文档 | 新建、草稿保存、自动保存、编辑、查看、浏览量、发布审核、审核通过；删除后关联审核记录与版本记录同步清理 | 通过；删除关联数据已同时通过浏览器与数据库实测 |
| 协作 | 点赞/取消点赞、收藏、评论、评论点赞、分享页公开访问 | 通过 |
| 历史与导出 | 自动保存历史、恢复正文、单篇 PDF、批量 PDF ZIP | 通过 |
| 导入与文件 | Markdown/TXT 导入，导入内容进入编辑器；文件列表与 DOCUMENT 类型筛选 | 通过 |
| 分类 | 新建、编辑、删除及删除确认 | 通过 |
| 团队 | 新建团队、选择团队、添加成员、删除团队 | 通过；19 位雪花 ID 以文本输入，未发生精度丢失 |
| 用户与权限 | 用户搜索和保存；权限新建、编辑、删除 | 通过 |
| 系统设置 | 基础、安全、存储、通知、AI、状态六个分区读取；缓存清理、备份请求 | 通过 |
| 个人资料 | 资料保存、刷新后持久化、恢复原空值 | 通过 |
| 通知中心 | 刷新、全部/未读/已读筛选、空状态和禁用态 | 通过 |
| 统计中心 | 概览、图表、分类分布、热门文档、活跃用户及聚合按钮 | 通过 |
| 草稿与收藏 | 草稿筛选和空状态；收藏的刷新、搜索和空状态；最近访问空状态 | 通过 |
| AI 助手 | GPT-5.5 模型显示、流式提问与回答、测试会话清理 | 通过；使用服务器配置的 OpenAI 兼容中转站验证 |

## 本轮修复并上线

1. SockJS `/ws/notification/info` 被网关按 WebSocket URI 转发，线上返回 `400`。
   - 网关拆分为 WebSocket 升级路由和 SockJS HTTP 路由。
2. 网关统一响应包装破坏了 SockJS 的原始协议 JSON。
   - `/ws/**` 已完整跳过响应包装。
3. CORS 响应头去重过滤器在 WebSocket 升级后修改只读响应头，导致 `UnsupportedOperationException` 并关闭连接。
   - `/ws/**` 已跳过该响应头改写。
4. 删除文档只清理正文、自动保存和标签，遗留审核与版本关联记录。
   - 删除流程已在同一事务中清理 `tb_document_review` 和 `tb_document_version`；新建临时文档、提交审核、删除后，数据库中两类关联记录均为 `0`。
5. 通知软删除后，未读统计仍包含 `deleted = 1` 的记录，导致顶栏徽标残留。
   - 未读统计已限定 `deleted = 0`；删除验收通知后，浏览器刷新确认顶栏未读数为 `0`。
6. 搜索、AI、图谱的依赖服务未部署时，页面会透出网关服务解析异常。
   - 搜索改为页面内的可重试不可用提示；AI 改为禁用输入并提示模型服务和 API Key 前置条件；图谱改为提示 Neo4j 与图谱服务前置条件。三页均已在真实浏览器中复测。
7. 左侧菜单将根路径 `/` 作为所有页面前缀，导致工作台在其他页面错误高亮。
   - 已排除根路径的前缀匹配；浏览器通过 `/search?audit=navfix2` 复测，只有“检索”处于选中状态。

线上复测证据：浏览器 SockJS `/info` 返回 `200`，随后建立一次 `/websocket` 升级请求；网关和基础服务日志均不再出现该连接的 `400`、`UnsupportedOperationException` 或 SockJS 写出异常。

## 未通过或暂不具备验收条件

| 功能 | 原因 | 启用条件 |
| --- | --- | --- |
| 全文检索 | `kb-search` 和 Elasticsearch 未部署 | 拉取并启动 Elasticsearch，随后启动 `kb-search` |
| AI 写作 | AI 服务已部署，但尚未单独实测写作接口 | 配置完成后验证生成、扩写、润色和续写 |
| 知识图谱 | `kb-graph` 和 Neo4j 未部署 | 启动 Neo4j 与 `kb-graph`，配置 `NEO4J_PASSWORD` |
| 邮件激活、找回密码完整闭环 | 未配置真实 SMTP | 配置可用 SMTP 后，用专用测试邮箱验证 |
| 音视频预览和 HLS 转码 | 当前仅有文档型文件，无媒体样本 | 上传音视频文件后验证播放和转码任务 |

以上仍未部署的能力当前均已提供明确的前端不可用状态，不会向用户展示网关底层错误。AI 对话服务已单独部署并通过 GPT-5.5 实测；RAG 检索仍关闭，等待兼容的 embedding 模型。

## 清理记录

已删除验收过程中创建的临时文档、分类、团队、权限和个人资料测试值。验收账号的部门、职位和简介已恢复为空。

## Notification Regression Verification

The notification workflow was re-tested end to end on 2026-08-06 after deployment.

- Submitted an audit document for review from the browser.
- Verified the RabbitMQ review event was consumed by foundation.
- Verified a `kb_notification` record was created for the reviewer.
- Verified the header unread badge changed to `1` and the notification center displayed the review message.
- Verified the notification could be marked read and deleted through the browser UI.

Fixes deployed for this flow:

1. The gateway now routes SockJS HTTP frames separately from WebSocket upgrades and does not wrap `/ws/**` protocol payloads.
2. Foundation now resolves a valid Bearer JWT into `UserContextUtil` for notification REST requests.
3. Docker services use one stable `APP_INSTANCE_ID` so document publishers and foundation listeners share the same RabbitMQ review queue.
4. The review listener queries the active `sys_user_role`, `sys_role`, and `kb_user` tables; default administrator/reviewer role seed data is provided for new deployments.

The temporary audit document and its notification were deleted after verification.

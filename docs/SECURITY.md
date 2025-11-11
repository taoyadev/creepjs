# 安全与隐私指南

本文件定义 CreepJS.org 的威胁模型、数据处理准则与合规义务。

## 1. 威胁模型

| 攻击面 | 说明 | 控制措施 |
|--------|------|----------|
| API 滥用 | 机器人批量生成指纹 | 每 token 1000 req/天 + IP backoff + KV 计数 |
| Token 泄露 | Token 存在 Git/日志/客户端 | 提供一次性 Token，支持 `wrangler secret`，记录轮换流程 |
| 指纹伪造 | 传入恶意组件企图污染统计 | Zod schema + 组件白名单 + 正则验证 + MurmurHash 标准化 |
| 隐私投诉 | 用户未被告知/无法退出 | DNT 检测、隐私弹窗、透明文档、支持删除请求 |
| 供应链攻击 | SDK/NPM 被篡改 | 使用 npm 2FA、签名发布、CDN 完整性哈希 |

## 2. 数据处理原则

- **最小化**：仅收集 Canvas/WebGL/Navigator/Screen/Fonts 的必要字段。
- **无状态**：API 只计算哈希并立即丢弃原始数据，KV 仅保存 Token/速率信息。
- **匿名**：不写入 IP、邮箱、用户名等个人信息。
- **透明**：演示站点展示实时指纹并解释采集项。
- **可控**：尊重浏览器 `Do Not Track`，并提供退出选项。

## 3. 认证与授权

- 所有受保护端点要求 `X-API-Token`，格式 `cfp_` + 32 hex。
- Token 随机生成，存储于 Cloudflare KV，值包含速率窗口、联系人邮箱、备注。
- Token 仅以哈希形式写入日志；禁止在分析工具中记录明文。
- 轮换流程：
  1. 通过 `GET /v1/token` 生成新 Token。
  2. 在 CI/CD、Workers Secrets、客户端中更新。
  3. 在 24 小时后删除旧 Token。

## 4. 限流与滥用防护

- KV 记录 `{ token, date }` 计数；超过 1000 次/天返回 `429 RATE_LIMIT_EXCEEDED`。
- 附加 IP 节流：连续 5 次失败 → 10 分钟冷却。
- Playground 中默认缓存指纹 1 小时，避免重复触发 API。
- 长期异常（>3 倍平均值）通过 Cloudflare Analytics 告警并触发人工复核。

## 5. 日志与监控

- **Workers tail**：实时监控错误；日志采用 JSON (`level`, `event`, `tokenHash`, `duration`).
- **Pages**：启用 Cloudflare Web Analytics 观测性能与地理分布。
- **Sentry (可选)**：捕获前后端异常，配置采样率 10%。
- 日志保留 14 天，自动脱敏任何潜在 PII。

## 6. 隐私/合规

| 框架 | 承诺 |
|------|------|
| GDPR | 明示告知、同意管理、数据删除（support@creepjs.org）、无持久化个人数据 |
| CCPA | Do Not Sell、Opt-out 链接、响应请求 < 30 天 |
| DNT | 发现 `navigator.doNotTrack === '1'` 时停止采集并返回 `DNT_REJECTED` 错误 |
| Cookie 政策 | 仅使用必要 cookie（本地缓存 fingerprint），在 Banner 中披露 |

隐私联系：`privacy@creepjs.org`。

## 7. 事件响应

1. **检测**：来自监控、用户报告或 Bug Bounty。
2. **分级**：S0（大规模泄露）、S1（单租户）、S2（低影响）。
3. **处置**：
   - 立即撤销受影响 Token / 暂停服务
   - 调整限流或热修补安全策略
   - 通知受影响用户与社区
4. **复盘**：48 小时内完成时间线、根因分析与长期修复计划。

联系人：
- 技术负责人：security@creepjs.org
- 备用：+1-415-555-1212 (PagerDuty)

## 8. 安全开发要求

- PR 必须通过 lint/test/openspec 校验。
- 代码评审需检查：输入验证、错误处理、依赖版本。
- 禁止直接使用 `eval`、`Function`，SDK 不引入可执行字符串模板。
- 对外返回的错误信息不得包含堆栈或配置值。
- 每月执行依赖审计：`pnpm audit --prod`，必要时添加 `resolutions`。

## 9. 第三方依赖

- Cloudflare Workers / KV / Pages → 遵循 Cloudflare 安全策略。
- Resend (可选) → 仅用于发送 Token，需配置 API Key 权限。
- Posthog (可选) → 仅匿名化事件，无指纹数据。

## 10. 文档 & 沟通

- 本文件需要在安全相关 PR 中引用，并在重大调整后更新。
- 对外政策需与 [PRD](./PRD.md) 的隐私承诺一致。
- 安全公告统一发布在网站博客 + GitHub Security Advisories。

更多部署层面的检查项见 [DEPLOYMENT.md](./DEPLOYMENT.md#安全检查清单)。

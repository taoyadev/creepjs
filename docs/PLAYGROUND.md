# Demo & Playground 指南

本指南解释 Landing Page Demo 与 API Playground 的体验、架构以及如何在本地复现与排障。

## 1. 组成部分

| 模块 | 说明 |
|------|------|
| Fingerprint Demo | 以动画形式展示当前浏览器的指纹组件和值 |
| API Playground | 在浏览器中编辑请求体并调用 `POST /v1/fingerprint` 与 `GET /v1/token` |
| SDK Preview | 提供 CDN/UMD 版本下载与复制示例 |

## 2. 架构概览

```
Browser ↔ Next.js (apps/web) ↔ Cloudflare Workers API ↔ KV
                 ↘ Static SDK (public/sdk.js)
```

- Demo 页面为客户端组件，使用 `@creepjs/sdk` 收集数据并渲染表格。
- Playground 通过 Next.js Route Handler 代理 API，减少 CORS/Token 暴露；在开发环境则直接请求 `http://localhost:8787`。
- 所有请求会附带 `X-API-Token`，来源于用户输入或 demo token（限流更低）。

## 3. 本地运行

```bash
pnpm dev:api            # 端口 8787，wrangler dev
pnpm dev:web            # 端口 3000，Next.js
```

创建 `.env.local`：
```
NEXT_PUBLIC_DEMO_TOKEN=cfp_demo_token
NEXT_PUBLIC_API_BASE=http://localhost:8787
```

访问：
- http://localhost:3000/demo → 指纹展示
- http://localhost:3000/docs/playground → API Playground

## 4. Playground 工作流

1. 输入/粘贴 Token（默认填充 demo token）。
2. 编辑 JSON 体（可选择自动填充 `collectComponents()` 结果）。
3. 点击 **Run** → 调用 API。
4. 响应在右侧格式化显示，并标注耗时 / 状态码。
5. 可点击 “Copy as cURL” 导出请求。

### 示例请求
```http
POST /v1/fingerprint HTTP/1.1
Host: api.creepjs.org
X-API-Token: cfp_demo_token
Content-Type: application/json

{
  "components": {
    "navigator": {
      "userAgent": "Mozilla/5.0",
      "language": "en-US",
      "platform": "MacIntel"
    },
    "canvas": "data:image/png;base64,..."
  }
}
```

### 示例响应
```json
{
  "data": {
    "fingerprintId": "fpr_3d9a2c1206",
    "confidence": 0.92,
    "hash": "v1:base62",
    "components": {
      "navigator": "hash_abc",
      "canvas": "hash_def"
    }
  },
  "timestamp": 1704816000000
}
```

## 5. UI 交互

- **Component Inspector**：逐项显示 Canvas/WebGL/Navigator/Screen/Fonts；可折叠，提供复制按钮。
- **Diff 模式**：同浏览器多次请求时，对比组件变化，帮助调试用户环境。
- **Token Generator**：Playground 允许通过 `GET /v1/token` 生成一次性 token，需输入邮箱（写入 KV）。
- **Copy Helpers**：支持一键复制 cURL、Fetch、SDK 代码片段。

## 6. 调试

| 症状 | 排查 |
|------|------|
| Playground 请求超时 | 检查 API dev 进程是否运行、Wrangler 日志 | 
| 429 Rate Limit | Demo token 额度耗尽，换个人 token 或等待一天 |
| Canvas/WebGL 空白 | 浏览器禁用；在 DevTools Console 查看 `CreepJS warnings` |
| Token 生成失败 | KV 未绑定或 Resend API Key 缺失，查看 `apps/api/routes/token.ts` 日志 |
| `Mixed Content` | Next.js dev 仍指向 https API，请设置 `NEXT_PUBLIC_API_BASE=http://localhost:8787` |

## 7. 遥测

- Demo 记录页面渲染时间、成功/失败状态到 Posthog（匿名）。
- Playground `Run` 按钮上报请求耗时与错误码，帮助分析限流与 SDK 问题。
- 所有分析事件默认禁用，只有在用户点击 "Allow analytics" 时才启用。

## 8. 部署注意

- Cloudflare Pages **环境变量**：
  - `NEXT_PUBLIC_API_BASE=https://api.creepjs.org`
  - `NEXT_PUBLIC_DEMO_TOKEN=cfp_public_demo`
- Playground 仅在生产环境注入 reCAPTCHA（如果启用）以防滥用。
- 发布 SDK 新版本后同步更新 `public/sdk.js` 和页面中的 CDN 版本号。详见 [SDK.md](./SDK.md#6-构建与发布)。

## 9. 文档互联

- API 参考 → [API.md](./API.md)
- 安全/隐私政策 → [SECURITY.md](./SECURITY.md)
- 部署指令 → [DEPLOYMENT.md](./DEPLOYMENT.md)

维护者：docs@creepjs.org

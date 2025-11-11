# 部署指南

本文档详细说明如何将 CreepJS.org 部署到生产环境。

---

## 概览

### 部署架构

```
creepjs.org (Web)          →  Cloudflare Pages
api.creepjs.org (API)      →  Cloudflare Workers
cdn.creepjs.org (SDK)      →  Cloudflare Pages
```

### 成本估算

| 服务 | 免费额度 | 付费价格 |
|------|----------|----------|
| Cloudflare Pages | 无限 | $0 |
| Cloudflare Workers | 100K 请求/天 | $5/月 (1000万请求) |
| Cloudflare KV | 100K 读/天 | $0.50/GB |
| 域名 | - | ~$15/年 |

---

## 前提条件

### 1. 账号准备

- ✅ **Cloudflare 账号** - [注册](https://dash.cloudflare.com/sign-up)
- ✅ **GitHub 账号** - 用于代码托管
- ✅ **域名** - creepjs.org (需购买)

### 2. 开发工具

```bash
# Node.js (v18+)
node --version

# pnpm
npm install -g pnpm

# Wrangler CLI (Cloudflare Workers CLI)
npm install -g wrangler
```

### 3. 环境变量

创建 `.env.example`:

```bash
# Cloudflare
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token

# KV Namespace IDs
KV_NAMESPACE_ID=your_kv_namespace_id

# (可选) 邮件服务
RESEND_API_KEY=your_resend_api_key
```

---

## 部署步骤

### Step 1: 域名配置

#### 1.1 添加域名到 Cloudflare

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 点击 "Add a Site"
3. 输入域名 `creepjs.org`
4. 选择免费计划 (Free)
5. 复制 Cloudflare 提供的 Nameservers

#### 1.2 修改域名 DNS

在域名注册商处修改 DNS 服务器为 Cloudflare 提供的地址，例如：
```
ada.ns.cloudflare.com
kyle.ns.cloudflare.com
```

等待 DNS 传播（通常 5-30 分钟）。

#### 1.3 配置 SSL

1. 在 Cloudflare Dashboard → SSL/TLS
2. 选择 **Full (strict)**
3. 启用 **Always Use HTTPS**
4. 启用 **Automatic HTTPS Rewrites**

---

### Step 2: 部署 API 服务 (Cloudflare Workers)

#### 2.1 创建 KV Namespace

```bash
# 生产环境
wrangler kv:namespace create "CREEPJS_KV"

# 预览环境（可选）
wrangler kv:namespace create "CREEPJS_KV" --preview
```

记录输出的 `id`，例如：
```
{ binding = "CREEPJS_KV", id = "abc123def456..." }
```

#### 2.2 配置 wrangler.toml

编辑 `apps/api/wrangler.toml`:

```toml
name = "creepjs-api"
main = "src/index.ts"
compatibility_date = "2025-01-09"
node_compat = true

# 账号信息
account_id = "your_account_id"  # 从 Dashboard 获取

# Workers 设置
workers_dev = false  # 禁用 workers.dev 子域名

# 自定义域名
routes = [
  { pattern = "api.creepjs.org/*", zone_name = "creepjs.org" }
]

# KV Namespace
[[kv_namespaces]]
binding = "KV"
id = "abc123def456..."  # 替换为实际 ID

# 环境变量 (可选)
[vars]
ENVIRONMENT = "production"

# 秘密环境变量（使用 wrangler secret put）
# RESEND_API_KEY = "..."
```

#### 2.3 设置秘密环境变量

```bash
cd apps/api

# 设置邮件 API key（如需要）
wrangler secret put RESEND_API_KEY
# 提示输入时粘贴 API key

# 验证
wrangler secret list
```

#### 2.4 部署

```bash
cd apps/api

# 构建
pnpm build

# 部署到生产环境
wrangler deploy

# 输出示例:
# Total Upload: 125.45 KiB / gzip: 42.18 KiB
# Uploaded creepjs-api (2.34 sec)
# Published creepjs-api (0.28 sec)
#   https://api.creepjs.org
```

#### 2.5 验证部署

```bash
# 测试健康检查
curl https://api.creepjs.org

# 预期输出:
# {"status":"ok","version":"1.0.0","timestamp":1704816000000}
```

---

### Step 3: 部署前端网站 (Cloudflare Pages)

#### 3.1 连接 GitHub

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 **Pages**
3. 点击 **Create a project**
4. 选择 **Connect to Git**
5. 授权 GitHub
6. 选择 `creepjs` 仓库

#### 3.2 配置构建设置

**Framework preset**: Next.js

**Build settings**:
```
Build command:    cd apps/web && pnpm build
Build output dir: apps/web/.next
Root directory:   /
Node version:     18
```

**Environment variables**:
```
NEXT_PUBLIC_API_URL=https://api.creepjs.org
NODE_VERSION=18
```

#### 3.3 配置自定义域名

1. 部署完成后，进入 Pages 项目
2. **Custom domains** → **Set up a custom domain**
3. 输入 `creepjs.org`
4. Cloudflare 会自动配置 DNS 记录
5. 重复步骤添加 `www.creepjs.org` (可选)

#### 3.4 触发部署

推送代码到 GitHub main 分支即可自动部署：

```bash
git add .
git commit -m "Initial deployment"
git push origin main
```

Cloudflare Pages 会自动检测并部署，通常 2-5 分钟完成。

#### 3.5 验证部署

访问 https://creepjs.org 检查网站是否正常。

---

### Step 4: 部署 SDK (CDN)

#### 4.1 构建 SDK

```bash
cd packages/sdk
pnpm build

# 输出到 dist/
# - dist/creepjs.js (UMD)
# - dist/creepjs.min.js (压缩版)
# - dist/creepjs.esm.js (ES Module)
```

#### 4.2 选项 A: 通过 Pages 部署

将 SDK 文件复制到 `apps/web/public/sdk/`:

```bash
mkdir -p apps/web/public/sdk
cp packages/sdk/dist/* apps/web/public/sdk/
```

然后通过 Next.js 静态文件服务访问：
```
https://creepjs.org/sdk/creepjs.min.js
```

#### 4.3 选项 B: 独立 CDN (推荐)

创建独立的 Pages 项目用于 CDN：

1. 创建 `cdn/` 目录
2. 将 SDK 文件放入 `cdn/v1/`
3. 创建 Pages 项目指向 `cdn/` 目录
4. 配置域名 `cdn.creepjs.org`

最终 URL:
```
https://cdn.creepjs.org/v1/sdk.js
```

---

### Step 5: DNS 配置总结

完整的 DNS 记录：

| 类型 | 名称 | 目标 | 代理 |
|------|------|------|------|
| A | @ | (Cloudflare Pages IP) | ✅ Proxied |
| CNAME | www | creepjs.org | ✅ Proxied |
| CNAME | api | (Workers 自动) | ✅ Proxied |
| CNAME | cdn | (Pages 自动) | ✅ Proxied |

---

## 环境管理

### 多环境策略

#### 开发环境 (dev)

```bash
# 本地开发
pnpm dev

# API: http://localhost:8787
# Web: http://localhost:3000
```

#### 预览环境 (preview)

- **API**: Workers 分支部署
- **Web**: Pages 预览部署（每个 PR 自动创建）

访问 URL:
```
https://abc123.creepjs-api.workers.dev
https://abc123.creepjs.pages.dev
```

#### 生产环境 (production)

- **API**: `api.creepjs.org`
- **Web**: `creepjs.org`

---

## 持续集成/部署 (CI/CD)

### GitHub Actions 配置

创建 `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  # API 部署
  deploy-api:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Build API
        run: pnpm --filter @creepjs/api build

      - name: Deploy to Cloudflare Workers
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          workingDirectory: apps/api
          command: deploy

  # 前端部署（Pages 自动处理）
  # SDK 构建
  build-sdk:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Build SDK
        run: pnpm --filter @creepjs/sdk build

      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: sdk
          path: packages/sdk/dist
```

### GitHub Secrets 配置

在 GitHub 仓库 Settings → Secrets 添加：

- `CLOUDFLARE_API_TOKEN`: Cloudflare API Token
- `CLOUDFLARE_ACCOUNT_ID`: Account ID

---

## 监控与维护

### 1. Cloudflare Analytics

访问 [Cloudflare Dashboard](https://dash.cloudflare.com) 查看：

- 请求量统计
- 响应时间
- 错误率
- 地理分布

### 2. Workers Analytics

在 Workers 项目页面查看：

- 调用次数
- CPU 时间
- KV 读写次数

### 3. 正常运行时间监控

使用免费服务：

- **UptimeRobot**: https://uptimerobot.com
- **BetterUptime**: https://betteruptime.com

配置：
```
监控 URL: https://api.creepjs.org
检查间隔: 5 分钟
告警方式: 邮件/Slack
```

### 4. 错误追踪 (可选)

集成 Sentry:

```bash
npm install @sentry/cloudflare
```

在 Workers 中配置：

```typescript
import * as Sentry from '@sentry/cloudflare';

Sentry.init({
  dsn: 'your_sentry_dsn',
  environment: 'production',
});
```

---

## 性能优化

### 1. Cloudflare Cache

配置 Cache Rules:

```javascript
// 在 Worker 中设置缓存
export default {
  async fetch(request, env, ctx) {
    const cache = caches.default;
    const cacheKey = new Request(request.url, request);

    // 检查缓存
    let response = await cache.match(cacheKey);

    if (!response) {
      response = await handleRequest(request, env);

      // 缓存响应（GET 请求）
      if (request.method === 'GET') {
        ctx.waitUntil(cache.put(cacheKey, response.clone()));
      }
    }

    return response;
  }
};
```

### 2. Pages 优化

- 启用 **Auto Minify** (HTML/CSS/JS)
- 启用 **Brotli** 压缩
- 配置 **Cache Everything** (静态资源)

### 3. Workers 优化

- 减少 KV 读取次数（使用缓存）
- 优化代码体积（< 1MB）
- 避免阻塞操作

---

## 备份与恢复

### KV 数据备份

定期导出 KV 数据：

```bash
# 列出所有 key
wrangler kv:key list --namespace-id=your_namespace_id > kv_keys.json

# 批量导出
wrangler kv:bulk export --namespace-id=your_namespace_id kv_backup.json
```

### 代码版本控制

- 使用 Git tags 标记发布版本
- 主分支受保护，需 PR 合并
- 定期创建 release

### 回滚策略

**Workers 回滚**:
```bash
# 查看历史部署
wrangler deployments list

# 回滚到特定版本
wrangler rollback --version-id=abc123
```

**Pages 回滚**:
在 Cloudflare Dashboard → Pages → Deployments，选择历史部署并点击 "Rollback"。

---

## 安全检查清单

### 部署前检查

- [ ] 所有环境变量已设置
- [ ] API Token 安全存储（不要提交到 Git）
- [ ] HTTPS 已启用
- [ ] CORS 正确配置
- [ ] 限流已启用
- [ ] 输入验证完整
- [ ] 错误消息不泄露敏感信息
- [ ] KV 数据已加密（如需要）

### 部署后检查

- [ ] 所有端点正常响应
- [ ] 限流正常工作
- [ ] 错误处理正确
- [ ] 监控已启用
- [ ] SSL 证书有效
- [ ] DNS 记录正确
- [ ] 自定义域名正常访问

---

## 故障排查

### 常见问题

#### 1. Workers 部署失败

**错误**: `Error: No account_id found`

**解决**:
```bash
# 登录 Cloudflare
wrangler login

# 验证 account_id
wrangler whoami
```

#### 2. KV 读写错误

**错误**: `KV.get is not a function`

**解决**: 检查 `wrangler.toml` 中的 KV binding 配置。

#### 3. CORS 错误

**错误**: `Access-Control-Allow-Origin header is missing`

**解决**: 在 Worker 中添加 CORS 中间件：
```typescript
app.use('*', cors({
  origin: ['https://creepjs.org'],
  allowMethods: ['GET', 'POST'],
}));
```

#### 4. Pages 构建失败

**错误**: `Build failed: Command failed with exit code 1`

**解决**:
- 检查 Node 版本是否正确
- 检查 Build command 路径
- 查看详细日志

---

## 维护计划

### 每周

- [ ] 检查错误日志
- [ ] 查看性能指标
- [ ] 响应用户反馈

### 每月

- [ ] 更新依赖包
- [ ] 审查安全性
- [ ] 检查账单
- [ ] 备份 KV 数据

### 每季度

- [ ] 性能优化
- [ ] 代码审查
- [ ] 安全审计
- [ ] 架构评估

---

## 扩展资源

### Cloudflare 文档

- [Workers 文档](https://developers.cloudflare.com/workers/)
- [Pages 文档](https://developers.cloudflare.com/pages/)
- [KV 文档](https://developers.cloudflare.com/workers/runtime-apis/kv/)

### 社区资源

- [Cloudflare Discord](https://discord.gg/cloudflaredev)
- [Cloudflare Community](https://community.cloudflare.com/)

---

## 紧急联系方式

**技术支持**:
- Cloudflare Support: https://dash.cloudflare.com/support
- GitHub Issues: https://github.com/yourusername/creepjs/issues

**监控告警**:
- 邮箱: alerts@creepjs.org
- Slack: #creepjs-alerts

---

**文档维护**: 定期更新
**最后更新**: 2025-01-09

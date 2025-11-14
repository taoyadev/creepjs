# 直接部署到 Cloudflare

本文档记录如何绕过 GitHub Actions，直接从本地部署到 Cloudflare。

## 快速开始

### 使用自动化脚本（推荐）

```bash
# 部署全部（Web + API）
./deploy-direct.sh all

# 仅部署 Web
./deploy-direct.sh web

# 仅部署 API
./deploy-direct.sh api
```

脚本会自动从 `.deploy.env` 文件读取凭据并执行完整的构建和部署流程。

## 配置文件

### .deploy.env（本地凭据存储）

项目根目录已有 `.deploy.env` 文件，包含所有必要的部署凭据：

```bash
# Cloudflare 部署凭据
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token_here
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id_here

# GitHub Token（用于推送代码）
GITHUB_TOKEN=your_github_personal_access_token_here
GITHUB_REPO=taoyadev/creepjs

# KV Namespace IDs
KV_TOKENS=your_kv_tokens_namespace_id
KV_RATE_LIMIT=your_kv_rate_limit_namespace_id
KV_IP_CACHE=your_kv_ip_cache_namespace_id

# IPInfo Token (Workers Secret)
IPINFO_TOKEN=your_ipinfo_token_here

# 生产环境 URLs
PRODUCTION_WEB_URL=https://creepjs.org
PRODUCTION_API_URL=https://api.creepjs.org
```

**注意**: 实际的凭据值存储在本地的 `.deploy.env` 文件中（不在 Git 中）。

**⚠️ 安全提示**:
- `.deploy.env` 已添加到 `.gitignore`，不会提交到 Git
- 此文件仅在本地使用，保存所有敏感凭据
- 不要分享或公开此文件内容

## 手动部署（高级用户）

## 完整部署流程

### 1. 构建所有依赖包

```bash
cd /Volumes/SSD/dev/new/ip-dataset/creepjs

# 构建 Core 包
pnpm --filter @creepjs/core build

# 构建 SDK 包
pnpm --filter @creepjs/sdk build

# 构建 Web 应用
pnpm --filter @creepjs/web build
```

### 2. 部署 Web 到 Cloudflare Pages

```bash
cd apps/web

# 使用 wrangler 部署静态文件
CLOUDFLARE_API_TOKEN=kbjmXswH0vV9zMs1uuYSepwH1RAWWJsqgenjAtt8 \
  npx wrangler pages deploy out --project-name=creepjs
```

**输出示例**:
```
✨ Success! Uploaded 181 files (42 already uploaded) (12.74 sec)
🌎 Deploying...
✨ Deployment complete! Take a peek over at https://xxxxx.creepjs-b0x.pages.dev
```

**生产环境**: https://creepjs.org

### 3. 部署 API 到 Cloudflare Workers

```bash
cd apps/api

# 使用 wrangler 部署 Worker
CLOUDFLARE_API_TOKEN=kbjmXswH0vV9zMs1uuYSepwH1RAWWJsqgenjAtt8 \
  pnpm wrangler deploy
```

**输出示例**:
```
Total Upload: 226.96 KiB / gzip: 44.29 KiB
Worker Startup Time: 25 ms
Deployed creepjs-api triggers (0.99 sec)
  https://creepjs-api.lively-sound-ed65.workers.dev
Current Version ID: 048be4cd-3e4d-4eac-bac7-8d4774e35c54
```

**生产环境**: https://api.creepjs.org

## 快速部署脚本

### 仅部署 Web

```bash
#!/bin/bash
cd /Volumes/SSD/dev/new/ip-dataset/creepjs

# 构建依赖
pnpm --filter @creepjs/core build
pnpm --filter @creepjs/sdk build
pnpm --filter @creepjs/web build

# 部署
cd apps/web
CLOUDFLARE_API_TOKEN=kbjmXswH0vV9zMs1uuYSepwH1RAWWJsqgenjAtt8 \
  npx wrangler pages deploy out --project-name=creepjs
```

### 仅部署 API

```bash
#!/bin/bash
cd /Volumes/SSD/dev/new/ip-dataset/creepjs

# 构建依赖
pnpm --filter @creepjs/core build

# 部署
cd apps/api
CLOUDFLARE_API_TOKEN=kbjmXswH0vV9zMs1uuYSepwH1RAWWJsqgenjAtt8 \
  pnpm wrangler deploy
```

### 完整部署（Web + API）

```bash
#!/bin/bash
cd /Volumes/SSD/dev/new/ip-dataset/creepjs

echo "🔨 Building packages..."
pnpm --filter @creepjs/core build
pnpm --filter @creepjs/sdk build
pnpm --filter @creepjs/web build

echo "🌐 Deploying Web to Cloudflare Pages..."
cd apps/web
CLOUDFLARE_API_TOKEN=kbjmXswH0vV9zMs1uuYSepwH1RAWWJsqgenjAtt8 \
  npx wrangler pages deploy out --project-name=creepjs

echo "⚡ Deploying API to Cloudflare Workers..."
cd ../api
CLOUDFLARE_API_TOKEN=kbjmXswH0vV9zMs1uuYSepwH1RAWWJsqgenjAtt8 \
  pnpm wrangler deploy

echo "✅ Deployment complete!"
echo "Web: https://creepjs.org"
echo "API: https://api.creepjs.org"
```

## 验证部署

### 检查 Web 部署

```bash
# 检查主页
curl -I https://creepjs.org/

# 检查特定页面
curl -I https://creepjs.org/fingerprint/timezone
```

### 检查 API 部署

```bash
# 检查健康状态
curl https://api.creepjs.org/

# 预期响应
# {"status":"ok","service":"creepjs-api","version":"1.0.0","timestamp":1763125857120}
```

## 部署配置

### Web (Cloudflare Pages)

- **项目名称**: `creepjs`
- **构建输出**: `apps/web/out`
- **框架**: Next.js 15 (静态导出)
- **自定义域名**: `creepjs.org`

### API (Cloudflare Workers)

- **Worker 名称**: `creepjs-api`
- **入口文件**: `apps/api/src/index.ts`
- **自定义域名**: `api.creepjs.org`
- **KV 绑定**:
  - TOKENS: `ae71fcdee0c84e8eb3f14f2270330c57`
  - RATE_LIMIT: `8ec5c58120de4f26b21a85717dd8a84c`
  - IP_CACHE: `06d882d1a9a946dbaf6204a542d5df58`

## 常见问题

### 1. 权限错误

**错误**: `In a non-interactive environment, it's necessary to set a CLOUDFLARE_API_TOKEN`

**解决**: 确保在命令前添加 `CLOUDFLARE_API_TOKEN=...`

### 2. 构建失败

**错误**: `Cannot find module @creepjs/core`

**解决**: 先构建依赖包
```bash
pnpm --filter @creepjs/core build
pnpm --filter @creepjs/sdk build
```

### 3. 部署后内容未更新

**原因**: Cloudflare CDN 缓存

**解决**: 等待 1-2 分钟，或在 Cloudflare Dashboard 清除缓存

## 部署历史

### 最近部署

| 日期 | 版本 | 变更 | 部署者 |
|------|------|------|--------|
| 2025-11-14 | - | 更新 timezone 链接到 whatismytimezone.net | Claude |
| 2025-11-14 | - | 修复 ESLint 错误，添加 timezone 资源链接 | Claude |
| 2025-11-14 | - | 初始直接部署设置 | Claude |

## 注意事项

1. **API Token 安全**: 不要将 API Token 提交到 Git 仓库
2. **构建顺序**: 必须先构建 core 和 sdk，再构建 web
3. **内容同步**: 如果修改了 `content/` 目录，需要同时更新 `public/content/`
4. **部署确认**: 部署后访问预览 URL 确认更改生效

## 相关文档

- [GitHub Actions 自动部署](GITHUB_ACTIONS_SETUP.md)
- [完整部署指南](DEPLOYMENT.md)
- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)

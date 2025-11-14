# CreepJS 部署配置

## Cloudflare 账户信息

### 主账户 (Info@opportunitygreen.com)

- **账户 ID**: `fe394f7c37b25babc4e351d704a6a97c`
- **API Token**: `kbjmXswH0vV9zMs1uuYSepwH1RAWWJsqgenjAtt8`
- **邮箱**: info@opportunitygreen.com (rader)

### API 部署信息

- **API URL**: https://creepjs-api.lively-sound-ed65.workers.dev
- **Worker 名称**: creepjs-api
- **KV 命名空间**:
  - TOKENS: `ae71fcdee0c84e8eb3f14f2270330c57`
  - RATE_LIMIT: `8ec5c58120de4f26b21a85717dd8a84c`
  - IP_CACHE: `06d882d1a9a946dbaf6204a542d5df58`

### Web 应用部署信息

- **Pages 项目**: creepjs (待创建)
- **构建输出**: apps/web/.next
- **域名**: 待配置

## GitHub 配置

### Repository

- **用户**: taoyadev
- **Token**: (已配置在 GitHub Actions Secrets 中)

### GitHub Actions Secrets

需要在 GitHub 仓库设置中配置以下 secrets：

```
CLOUDFLARE_API_TOKEN=kbjmXswH0vV9zMs1uuYSepwH1RAWWJsqgenjAtt8
CLOUDFLARE_ACCOUNT_ID=fe394f7c37b25babc4e351d704a6a97c
CLOUDFLARE_API_URL=https://creepjs-api.lively-sound-ed65.workers.dev
CLOUDFLARE_WEB_URL=https://creepjs.pages.dev
```

## 本地开发

### 环境变量

```bash
export CLOUDFLARE_API_TOKEN="kbjmXswH0vV9zMs1uuYSepwH1RAWWJsqgenjAtt8"
export CLOUDFLARE_ACCOUNT_ID="fe394f7c37b25babc4e351d704a6a97c"
```

### 部署命令

```bash
# API 部署
cd apps/api
wrangler deploy

# Web 应用部署
cd apps/web
wrangler pages deploy .next --project-name=creepjs --branch=main
```

## 部署状态

### ✅ 已完成

- [x] API 部署到 Cloudflare Workers
- [x] KV 命名空间创建并绑定
- [x] 环境变量配置
- [x] GitHub Actions 工作流程创建
- [x] Cloudflare Pages 项目创建
- [x] Web 应用构建完成
- [x] 安全 token 存储配置

### 📋 需要手动完成

- [ ] Web 应用手动上传到 Cloudflare Pages
- [ ] GitHub Secrets 配置（通过 GitHub Dashboard）
- [ ] 自定义域名配置（可选）

### 🌐 部署信息

- **API**: https://creepjs-api.lively-sound-ed65.workers.dev ✅
- **Web Pages 项目**: creepjs (ID: 63fee134-a73a-4a82-9b93-d9ac7256e279) ✅
- **默认域名**: creepjs-b0x.pages.dev
- **构建文件**: apps/web/.next (61个静态页面已生成)

## 故障排除

### 常见问题

1. **账户 ID 不匹配**
   - 确保使用正确的账户 ID: `fe394f7c37b25babc4e351d704a6a97c`
   - 清除 wrangler 缓存: `rm -rf ~/.wrangler`

2. **API Token 权限**
   - 确保token包含 Workers 和 Pages 权限
   - 验证token: `curl "https://api.cloudflare.com/client/v4/user/tokens/verify" -H "Authorization: Bearer TOKEN"`

3. **KV 命名空间绑定**
   - 确保wrangler.toml中的KV命名空间ID正确
   - 重新部署Worker以更新绑定

## 联系信息

- **技术支持**: info@opportunitygreen.com
- **GitHub**: taoyadev
- **项目**: CreepJS 2.0

---

_最后更新: 2025-11-13_

---

# CreepJS Deployment Guide

This guide covers deploying CreepJS to Cloudflare (Workers + Pages).

## Prerequisites

- GitHub account (for source control and CI/CD)
- Cloudflare account (for hosting)
- Cloudflare API Token (with Workers and KV permissions)
- IPInfo.io API token (free: https://ipinfo.io/signup)
- Configured tokens in `.env.local` (gitignored)

## Quick Start

### 1. Create Cloudflare API Token

**Step 1: Visit Cloudflare Dashboard**

Go to: https://dash.cloudflare.com/profile/api-tokens

**Step 2: Create Token**

1. Click "Create Token"
2. Use template: **"Edit Cloudflare Workers"**
3. Add these permissions:
   - Account > Workers KV Storage > **Edit**
   - Account > Workers Scripts > **Edit**
   - Account > Account Settings > **Read**
4. (Optional) Restrict by IP address for security
5. Click "Continue to summary" → "Create Token"
6. **Copy the token immediately** (won't be shown again)

**Step 3: Verify Token**

```bash
# Replace YOUR_ACCOUNT_ID with your Cloudflare account ID
# Replace YOUR_API_TOKEN with the token you just copied
curl "https://api.cloudflare.com/client/v4/accounts/YOUR_ACCOUNT_ID/tokens/verify" \
  -H "Authorization: Bearer YOUR_API_TOKEN"

# Expected response:
# {"result":{"id":"...","status":"active"},"success":true}
```

**Step 4: Store Token Securely**

**❌ Never commit tokens to git!**

Store in environment:

```bash
# Add to your shell profile (macOS/Linux)
echo 'export CLOUDFLARE_API_TOKEN="YOUR_TOKEN_HERE"' >> ~/.zshrc
source ~/.zshrc

# Or use wrangler login (recommended)
cd apps/api
npx wrangler login  # Opens browser for OAuth login
```

### 2. Local Setup

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your actual credentials
# (This file is gitignored and will NOT be committed)
```

### 3. GitHub Repository Setup

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: CreepJS browser fingerprinting platform"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/taoyadev/creepjs.git

# Push to GitHub
git push -u origin main
```

### 4. Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add the following secrets:

- `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token
- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID

**The workflow will use GITHUB_TOKEN automatically (no need to add it)**

### 5. Setup Cloudflare KV Namespaces

```bash
# Navigate to API directory
cd apps/api

# Login to Cloudflare
npx wrangler login

# Create KV namespaces (production)
npx wrangler kv:namespace create TOKENS
npx wrangler kv:namespace create RATE_LIMIT
npx wrangler kv:namespace create IP_CACHE

# Output will show IDs like:
# { binding = "TOKENS", id = "abc123..." }
# { binding = "RATE_LIMIT", id = "def456..." }
# { binding = "IP_CACHE", id = "ghi789..." }
```

Update `apps/api/wrangler.toml` with the actual KV namespace IDs:

```toml
[[kv_namespaces]]
binding = "TOKENS"
id = "abc123..."  # ← Replace with your actual ID

[[kv_namespaces]]
binding = "RATE_LIMIT"
id = "def456..."  # ← Replace with your actual ID

[[kv_namespaces]]
binding = "IP_CACHE"
id = "ghi789..."  # ← Replace with your actual ID
```

### 6. Configure IPInfo.io API Token

Get a free API token at https://ipinfo.io/signup (50,000 requests/month).

**For local development:**

```bash
cd apps/api

# Create .dev.vars file
echo "IPINFO_TOKEN=your_ipinfo_token_here" > .dev.vars
```

**For production:**

```bash
# Set as Cloudflare secret (stored securely, not in git)
npx wrangler secret put IPINFO_TOKEN
# Enter your IPInfo token when prompted
```

Or update `wrangler.toml` (less secure, visible in git):

```toml
[vars]
IPINFO_TOKEN = "your_ipinfo_token_here"
```

### 7. Deploy Cloudflare Workers (API)

```bash
cd apps/api

# Deploy to Cloudflare Workers
npx wrangler deploy

# Verify deployment
curl https://api.creepjs.org/
curl https://api.creepjs.org/my-ip
```

### 8. Deploy Cloudflare Pages (Frontend)

Two options:

#### Option A: Automatic (via GitHub Actions)

- Push to `main` branch
- GitHub Actions will automatically build and deploy
- Check Actions tab for deployment status

#### Option B: Manual

```bash
# Build the project
pnpm turbo run build

# Deploy to Cloudflare Pages
cd apps/web
npx wrangler pages deploy .next --project-name=creepjs
```

## Environment Variables

### Development (.env.local - gitignored)

```bash
CLOUDFLARE_API_TOKEN=your_token
CLOUDFLARE_ACCOUNT_ID=your_account_id
GITHUB_TOKEN=your_github_token
NEXT_PUBLIC_API_BASE=http://localhost:8787
```

### Production (Cloudflare Pages)

Set these in Cloudflare Dashboard → Pages → Settings → Environment variables:

```bash
NEXT_PUBLIC_API_BASE=https://api.creepjs.org
```

### Production (Cloudflare Workers)

Set these in `apps/api/wrangler.toml`:

```toml
[vars]
ENVIRONMENT = "production"

[[kv_namespaces]]
binding = "CREEPJS_TOKENS"
id = "your_kv_namespace_id"
```

## Deployment Architecture

```
┌─────────────────┐
│   GitHub Repo   │
└────────┬────────┘
         │ push to main
         ▼
┌─────────────────┐
│ GitHub Actions  │
└────────┬────────┘
         │ deploy
         ├──────────────────┬─────────────────┐
         ▼                  ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   CF Pages   │  │  CF Workers  │  │    CF KV     │
│  (Frontend)  │  │    (API)     │  │  (Storage)   │
└──────────────┘  └──────────────┘  └──────────────┘
```

## Verification

### Check API Deployment

```bash
curl https://api.creepjs.org/health
```

### Check Pages Deployment

Visit: `https://creepjs.pages.dev`

## Troubleshooting

### Build Fails

- Check Node.js version (requires 20+)
- Verify pnpm version (9.15.4)
- Run `pnpm install` locally first

### Deployment Fails

- Verify GitHub Secrets are set correctly
- Check Cloudflare API token has correct permissions
- Review GitHub Actions logs

### KV Namespace Issues

```bash
# List all KV namespaces
npx wrangler kv:namespace list

# Create new namespace if needed
npx wrangler kv:namespace create CREEPJS_TOKENS --preview
```

## Security Notes

- ✅ `.env.local` is gitignored (contains secrets)
- ✅ `.env.example` is committed (template only)
- ✅ Production secrets stored in Cloudflare/GitHub
- ❌ NEVER commit API tokens or secrets to git

## Next Steps

- Set up custom domain in Cloudflare Pages
- Configure DNS for `creepjs.org`
- Enable Cloudflare Web Analytics
- Set up monitoring and alerts

## Support

For issues, check:

- GitHub Actions logs
- Cloudflare Workers logs: `npx wrangler tail`
- Cloudflare Pages deployment logs in dashboard

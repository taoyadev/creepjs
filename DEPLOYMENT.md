# CreepJS Deployment Guide

This guide covers deploying CreepJS to Cloudflare (Workers + Pages).

## Prerequisites

- GitHub account (for source control and CI/CD)
- Cloudflare account (for hosting)
- Configured tokens in `.env.local` (gitignored)

## Quick Start

### 1. Local Setup

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your actual credentials
# (This file is gitignored and will NOT be committed)
```

### 2. GitHub Repository Setup

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

### 3. Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add the following secrets:

- `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token
- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID

**The workflow will use GITHUB_TOKEN automatically (no need to add it)**

### 4. Deploy Cloudflare Workers (API)

```bash
# Navigate to API directory
cd apps/api

# Login to Cloudflare
npx wrangler login

# Create KV namespace for production
npx wrangler kv:namespace create CREEPJS_TOKENS
# Note the ID and update wrangler.toml

# Deploy to Cloudflare Workers
npx wrangler deploy
```

### 5. Deploy Cloudflare Pages (Frontend)

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

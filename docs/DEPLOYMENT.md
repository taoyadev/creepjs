# CreepJS Deployment Guide

Complete guide for deploying CreepJS.org to production with automated CI/CD pipelines, infrastructure scripts, and monitoring.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Automated Deployment](#automated-deployment)
- [Manual Deployment](#manual-deployment)
- [Post-Deployment](#post-deployment)
- [Monitoring & Analytics](#monitoring--analytics)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

**For first-time deployment:**

```bash
# 1. Clone and install dependencies
git clone <repository-url>
cd creepjs
pnpm install

# 2. Configure GitHub Secrets (see .github/SECRETS.md)
# - CLOUDFLARE_API_TOKEN
# - CLOUDFLARE_ACCOUNT_ID

# 3. Setup KV namespaces
./scripts/setup-kv.sh production

# 4. Configure secrets (optional)
./scripts/setup-secrets.sh production

# 5. Push to main branch - CI/CD handles the rest!
git push origin main
```

**Automatic deployment via GitHub Actions:**

- API deploys to Cloudflare Workers at `api.creepjs.org`
- Web deploys to Cloudflare Pages at `creepjs.org`
- Health checks run automatically
- Automatic rollback on failure

---

## Architecture Overview

### Deployment Stack

```
┌─────────────────────────────────────────────────────────────┐
│  GitHub Actions CI/CD                                       │
│  ├─ Pre-merge checks (lint, test, typecheck, build)        │
│  ├─ API deployment (Cloudflare Workers)                    │
│  ├─ Web deployment (Cloudflare Pages)                      │
│  └─ Health checks & rollback                               │
└─────────────────────────────────────────────────────────────┘
         │                          │
         ▼                          ▼
┌──────────────────┐      ┌──────────────────┐
│ Cloudflare       │      │ Cloudflare       │
│ Workers          │      │ Pages            │
│                  │      │                  │
│ api.creepjs.org  │      │ creepjs.org      │
│                  │      │                  │
│ ├─ Hono.js API   │      │ ├─ Next.js 15    │
│ ├─ KV Storage    │      │ ├─ SEO/metadata  │
│ └─ Rate Limiting │      │ └─ Analytics     │
└──────────────────┘      └──────────────────┘
```

### Services & URLs

| Service        | URL                     | Technology                                 |
| -------------- | ----------------------- | ------------------------------------------ |
| Web App        | https://creepjs.org     | Next.js 15 (App Router) + Cloudflare Pages |
| API            | https://api.creepjs.org | Hono.js + Cloudflare Workers               |
| Tokens Storage | KV Namespace            | Cloudflare Workers KV                      |
| Rate Limiting  | KV Namespace            | Cloudflare Workers KV                      |
| Analytics      | Built-in                | Cloudflare Web Analytics                   |

### Cost Estimate

| Service            | Free Tier                     | Paid (if needed)        |
| ------------------ | ----------------------------- | ----------------------- |
| Cloudflare Workers | 100K requests/day             | $5/month (10M requests) |
| Cloudflare Pages   | Unlimited                     | $0                      |
| Cloudflare KV      | 100K reads/day, 1K writes/day | $0.50/GB stored         |
| GitHub Actions     | 2,000 minutes/month           | $0.008/minute           |

---

## Prerequisites

### 1. Required Accounts

- ✅ [Cloudflare Account](https://dash.cloudflare.com/sign-up) (Free tier sufficient)
- ✅ [GitHub Account](https://github.com/join) (for CI/CD)
- ✅ Domain name (e.g., `creepjs.org`)

### 2. Development Tools

```bash
# Node.js 20.9.0+
node --version  # Should be >= 20.9.0

# pnpm 9+
npm install -g pnpm@latest
pnpm --version

# Wrangler CLI (Cloudflare Workers)
npm install -g wrangler
wrangler --version

# Git
git --version
```

### 3. Domain Setup

1. Add domain to Cloudflare:
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Add site → Enter your domain
   - Update nameservers at your registrar
   - Wait for DNS propagation (5-30 minutes)

2. Configure SSL/TLS:
   - SSL/TLS → **Full (strict)**
   - Enable **Always Use HTTPS**
   - Enable **Automatic HTTPS Rewrites**

---

## Initial Setup

### Step 1: Clone & Install

```bash
git clone <repository-url>
cd creepjs
pnpm install
```

### Step 2: Environment Configuration

```bash
# Copy example files
cp .env.example .env.local
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.dev.vars.example apps/api/.dev.vars

# Update values in .env.local files
# See individual .env.example files for details
```

**Required environment variables:**

- `NEXT_PUBLIC_API_URL` - API base URL
- `NEXT_PUBLIC_SITE_URL` - Site URL for SEO
- `IPINFO_TOKEN` - IPInfo.io API token (for /api/my-ip route)

**Optional variables:**

- `NEXT_PUBLIC_CF_ANALYTICS_TOKEN` - Cloudflare Web Analytics token
- `NEXT_PUBLIC_DEBUG_ANALYTICS` - Enable analytics debugging

### Step 3: GitHub Secrets Configuration

See detailed instructions in `.github/SECRETS.md`

**Required secrets:**

```bash
# In GitHub repository: Settings → Secrets → Actions

CLOUDFLARE_API_TOKEN=<your_cloudflare_api_token>
CLOUDFLARE_ACCOUNT_ID=<your_cloudflare_account_id>
```

**How to obtain:**

1. **CLOUDFLARE_API_TOKEN**:
   - Dashboard → My Profile → API Tokens
   - Create Token → Edit Cloudflare Workers template
   - Permissions: Workers Scripts (Edit), Pages (Edit), KV Storage (Edit)

2. **CLOUDFLARE_ACCOUNT_ID**:
   - Dashboard → Select your domain
   - Copy Account ID from right sidebar

### Step 4: KV Namespace Setup

Use the automation script:

```bash
# Authenticate with Cloudflare
wrangler login

# Create production KV namespaces
./scripts/setup-kv.sh production

# Output will show:
# ✓ Created: creepjs_tokens_production (ID: abc123...)
# ✓ Created: creepjs_ratelimit_production (ID: def456...)
# ✓ Updated wrangler.toml with namespace IDs
```

The script automatically:

- Creates `TOKENS` and `RATE_LIMIT` KV namespaces
- Updates `apps/api/wrangler.toml` with namespace IDs
- Backs up existing configuration
- Offers interactive testing

**For staging/preview environments:**

```bash
./scripts/setup-kv.sh staging
./scripts/setup-kv.sh preview
```

### Step 5: Configure Workers Secrets (Optional)

```bash
# For future token signing (currently optional)
./scripts/setup-secrets.sh production

# Follow prompts to set:
# - CREEPJS_TOKEN_PRIVATE_KEY (optional - for enhanced token security)
```

---

## Automated Deployment

### GitHub Actions Workflows

Three automated workflows are configured:

#### 1. CI - Pre-merge Checks (`.github/workflows/ci.yml`)

**Triggers:** Pull requests, pushes to main/develop

**Jobs:**

- **Lint** - ESLint + Prettier checks
- **Type Check** - TypeScript validation
- **Test** - Unit tests for all packages
- **Build** - Build verification
- **OpenSpec Validate** - Spec validation
- **Security Audit** - Dependency vulnerability scan

**Status:** Required to pass before merge

#### 2. Deploy API (`.github/workflows/deploy-api.yml`)

**Triggers:** Push to main branch

**Steps:**

1. Install dependencies
2. Build API package
3. Deploy to Cloudflare Workers
4. Run health checks:
   - API root endpoint
   - Fingerprint generation endpoint
5. **Automatic rollback** if health checks fail

**Deployment URL:** `https://api.creepjs.org`

#### 3. Deploy Web (`.github/workflows/deploy-web.yml`)

**Triggers:** Push to main branch

**Steps:**

1. Install dependencies
2. Build Next.js app
3. Deploy to Cloudflare Pages
4. Run health checks:
   - Homepage
   - Demo page
   - Sitemap.xml
5. **Lighthouse CI** on PR previews

**Deployment URL:** `https://creepjs.org`

### Deployment Process

```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Make changes and commit
git add .
git commit -m "feat: add new feature"

# 3. Push and create PR
git push origin feature/my-feature
# Create PR on GitHub

# 4. CI checks run automatically
# - Lint, typecheck, test, build must pass
# - PR preview deployment created

# 5. Merge PR to main
# - Production deployment triggered automatically
# - Health checks run
# - Rollback if any check fails
```

### PR Preview Deployments

**Automatic preview URLs:**

- Web: `https://<branch-name>.creepjs.pages.dev`
- API: Workers preview deployment

**Features:**

- Isolated environment per PR
- Lighthouse performance report
- Automatic cleanup when PR is closed

---

## Manual Deployment

### API (Cloudflare Workers)

```bash
cd apps/api

# Build
pnpm build

# Deploy to production
wrangler deploy

# Deploy to staging
wrangler deploy --env staging

# View deployment
wrangler deployments list

# Rollback if needed
wrangler rollback
```

### Web (Cloudflare Pages)

Cloudflare Pages handles deployment automatically via GitHub integration. For manual deployment:

```bash
cd apps/web

# Build
pnpm build

# Deploy via Wrangler (alternative)
wrangler pages deploy .next --project-name=creepjs-web
```

---

## Post-Deployment

### Health Check Script

Verify deployment with the automated health check script:

```bash
# Check production
./scripts/health-check.sh https://api.creepjs.org

# Check with API token
./scripts/health-check.sh https://api.creepjs.org cfp_your_token_here

# Output example:
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ✅ Health Check PASSED!
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#
# Total Tests: 7
# ✓ Passed: 7
# ⚠  Warnings: 0
# ✗ Failed: 0
```

**Tests performed:**

- API root endpoint
- CORS headers
- Token generation
- Fingerprint generation (if token provided)
- Authentication requirements
- Rate limiting
- Error handling

### Domain Configuration

Verify DNS records in Cloudflare Dashboard:

| Type    | Name | Target                    | Proxy      |
| ------- | ---- | ------------------------- | ---------- |
| A/CNAME | @    | (Pages auto-configured)   | ✅ Proxied |
| CNAME   | www  | creepjs.org               | ✅ Proxied |
| CNAME   | api  | (Workers auto-configured) | ✅ Proxied |

### SEO Verification

Check SEO implementation:

```bash
# Verify sitemap
curl https://creepjs.org/sitemap.xml

# Verify robots.txt
curl https://creepjs.org/robots.txt

# Verify Open Graph images
curl -I https://creepjs.org/opengraph-image.png

# Verify structured data (view source)
curl https://creepjs.org | grep 'application/ld+json'
```

### Analytics Setup

1. Create Cloudflare Web Analytics site:
   - Dashboard → Web Analytics → Add a site
   - Copy the site token

2. Add to environment variables:

   ```bash
   # In Cloudflare Pages Settings → Environment Variables
   NEXT_PUBLIC_CF_ANALYTICS_TOKEN=<your_token>
   ```

3. Redeploy to activate analytics

4. View analytics:
   - Dashboard → Web Analytics → View site

---

## Monitoring & Analytics

### Cloudflare Analytics

**Metrics available:**

- Page views and unique visitors
- Geographic distribution
- Bandwidth usage
- Cache hit rate
- Response times

**Access:** Dashboard → Analytics → Web Analytics

### Workers Analytics

**Metrics available:**

- Request count
- CPU time
- KV operations
- Error rate
- Subrequest count

**Access:** Dashboard → Workers → Select worker → Metrics

### Custom Events

The analytics library (`src/lib/analytics.ts`) tracks:

- Fingerprint generation
- API token requests
- Button clicks
- Page views
- Errors

**View in Cloudflare:** Web Analytics → Events tab

### Uptime Monitoring (Recommended)

Set up external monitoring:

**UptimeRobot** (free):

```
Monitor: https://api.creepjs.org
Interval: 5 minutes
Alert: Email/Slack/Webhook
```

**Better Uptime** (free tier):

```
Monitor: https://api.creepjs.org
Interval: 3 minutes
Alert: Email/Slack/Discord/PagerDuty
```

---

## Troubleshooting

### Deployment Fails

**Issue:** `Error: A request to the Cloudflare API failed`

**Solutions:**

1. Verify `CLOUDFLARE_API_TOKEN` in GitHub Secrets
2. Check token permissions (Workers Scripts - Edit required)
3. Ensure token hasn't expired
4. Run `wrangler whoami` locally to test authentication

### Health Check Fails

**Issue:** Health check returns 404 or 500

**Solutions:**

1. Check Workers logs: `wrangler tail`
2. Verify KV namespaces are bound in `wrangler.toml`
3. Test locally: `wrangler dev` then `curl http://localhost:8787`
4. Check recent deployments: `wrangler deployments list`

### KV Namespace Errors

**Issue:** `KV.get is not a function`

**Solutions:**

1. Verify `[[kv_namespaces]]` in `apps/api/wrangler.toml`
2. Ensure namespace IDs are correct (not placeholder values)
3. Re-run setup: `./scripts/setup-kv.sh production`

### Build Fails

**Issue:** `Type errors` or `Build failed`

**Solutions:**

1. Run locally: `pnpm build`
2. Check TypeScript errors: `pnpm typecheck`
3. Verify all dependencies: `pnpm install`
4. Clear cache: `rm -rf node_modules .next && pnpm install`

### CORS Errors

**Issue:** `Access-Control-Allow-Origin header missing`

**Solutions:**

1. Check CORS middleware in `apps/api/src/middleware/cors.ts`
2. Verify `CORS_ORIGIN` in `wrangler.toml` vars section
3. Test preflight: `curl -X OPTIONS -H "Origin: https://creepjs.org" https://api.creepjs.org/v1/fingerprint`

### Rollback Procedure

**API (Workers):**

```bash
# List deployments
wrangler deployments list

# Rollback to previous
wrangler rollback

# Or specific deployment
wrangler rollback --message "Rollback to stable version"
```

**Web (Pages):**

1. Dashboard → Pages → creepjs-web → Deployments
2. Find stable deployment
3. Click "..." → "Rollback to this deployment"

---

## Maintenance

### Weekly Checks

- [ ] Review error logs in Cloudflare Dashboard
- [ ] Check API response times
- [ ] Monitor KV storage usage
- [ ] Review GitHub Actions success rate

### Monthly Tasks

- [ ] Update dependencies: `pnpm update`
- [ ] Run security audit: `pnpm audit`
- [ ] Review and rotate API tokens
- [ ] Backup KV data: `wrangler kv:bulk get`
- [ ] Review analytics and optimize

### Updating Dependencies

```bash
# Check outdated packages
pnpm outdated

# Update all (interactive)
pnpm update

# Update specific package
pnpm update <package-name>

# After updates, test thoroughly
pnpm build
pnpm test
```

---

## Additional Resources

### Documentation

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Next.js 15 Docs](https://nextjs.org/docs)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)

### Support

- **GitHub Issues**: For bugs and feature requests
- **Cloudflare Community**: https://community.cloudflare.com
- **Cloudflare Discord**: https://discord.gg/cloudflaredev

---

**Document Version:** 1.0.0
**Last Updated:** 2025-01-10
**Maintained By:** CreepJS Team

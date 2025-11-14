# GitHub Actions Setup Guide

This guide walks you through setting up automated deployments to Cloudflare Pages using GitHub Actions.

## Overview

The repository includes four automated workflows:

1. **`ci.yml`** - Continuous Integration
   - Linting, type checking, testing
   - Runs on all PRs and pushes

2. **`deploy-web.yml`** - Web App Deployment (Cloudflare Pages)
   - Production deployment (on push to `main`)
   - PR preview deployments
   - Lighthouse performance checks

3. **`deploy-api.yml`** - API Deployment (Cloudflare Workers)
   - Deploy API to Cloudflare Workers
   - Health checks with automatic rollback
   - PR preview deployments

4. **`deploy-cloudflare.yml`** - Simplified combined deployment

## Prerequisites

1. GitHub repository with admin access
2. Cloudflare account with:
   - Cloudflare Pages enabled
   - Cloudflare Workers enabled
   - KV Storage enabled
3. Cloudflare API token with permissions

**Your Cloudflare Account ID**: `fe394f7c37b25babc4e351d704a6a97c`
**Your Cloudflare API Token**: `kbjmXswH0vV9zMs1uuYSepwH1RAWWJsqgenjAtt8`

### Verify Token (Optional)

```bash
curl "https://api.cloudflare.com/client/v4/accounts/fe394f7c37b25babc4e351d704a6a97c/tokens/verify" \
  -H "Authorization: Bearer kbjmXswH0vV9zMs1uuYSepwH1RAWWJsqgenjAtt8"
```

Expected response:

```json
{
  "success": true,
  "errors": [],
  "messages": [],
  "result": {
    "id": "...",
    "status": "active"
  }
}
```

## Step 1: Configure GitHub Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**

Click **New repository secret** and add each of the following:

### Required Secrets

| Secret Name             | Value                                      | Description                                 |
| ----------------------- | ------------------------------------------ | ------------------------------------------- |
| `CLOUDFLARE_API_TOKEN`  | `kbjmXswH0vV9zMs1uuYSepwH1RAWWJsqgenjAtt8` | Cloudflare API token (Pages + Workers + KV) |
| `CLOUDFLARE_ACCOUNT_ID` | `fe394f7c37b25babc4e351d704a6a97c`         | Your Cloudflare account ID                  |

### Optional Secrets (for enhanced features)

| Secret Name          | Example Value             | Description                          | When to Add                   |
| -------------------- | ------------------------- | ------------------------------------ | ----------------------------- |
| `TEST_API_TOKEN`     | `cfp_xxxxxxxxxxxxx`       | Test token for API health checks     | After first API deployment    |
| `CLOUDFLARE_API_URL` | `https://api.creepjs.org` | API base URL for Next.js frontend    | When custom domain configured |
| `CLOUDFLARE_WEB_URL` | `https://creepjs.org`     | Production web URL for health checks | When custom domain configured |

**⚠️ Security Note**: Never commit API tokens to your repository. Always use GitHub Secrets.

### How to Add Secrets

For each secret:

1. Click **New repository secret**
2. Enter **Name** (e.g., `CLOUDFLARE_API_TOKEN`)
3. Paste **Secret** value (e.g., `kbjmXswH0vV9zMs1uuYSepwH1RAWWJsqgenjAtt8`)
4. Click **Add secret**
5. Repeat for all required secrets

**Note:** `GITHUB_TOKEN` is automatically provided by GitHub Actions - do not add it manually.

## Step 2: Setup Cloudflare Workers KV Namespaces

The API requires 3 KV namespaces for storage. These are already configured in `apps/api/wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "TOKENS"
id = "ae71fcdee0c84e8eb3f14f2270330c57"

[[kv_namespaces]]
binding = "RATE_LIMIT"
id = "8ec5c58120de4f26b21a85717dd8a84c"

[[kv_namespaces]]
binding = "IP_CACHE"
id = "06d882d1a9a946dbaf6204a542d5df58"
```

### Verify KV Namespaces Exist

```bash
cd apps/api
npx wrangler kv:namespace list
```

### If KV Namespaces Don't Exist

Create them:

```bash
cd apps/api

# Create TOKENS namespace
npx wrangler kv:namespace create TOKENS
# Copy the ID and update wrangler.toml

# Create RATE_LIMIT namespace
npx wrangler kv:namespace create RATE_LIMIT
# Copy the ID and update wrangler.toml

# Create IP_CACHE namespace
npx wrangler kv:namespace create IP_CACHE
# Copy the ID and update wrangler.toml
```

Then update `apps/api/wrangler.toml` with the returned namespace IDs.

## Step 3: Create Cloudflare Pages Project

### Option A: Via Cloudflare Dashboard (Recommended)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages** → **Create application** → **Pages**
3. Click **Connect to Git** → Select your GitHub repository
4. Configure build settings:
   - **Project name**: `creepjs-web` (must match workflow file)
   - **Production branch**: `main`
   - **Build command**: Leave empty (GitHub Actions handles this)
   - **Build output directory**: `apps/web/out`
5. Click **Save and Deploy**
6. **Cancel** the first build (GitHub Actions will handle deployments)

### Option B: Via Wrangler CLI

```bash
cd apps/web
npx wrangler pages project create creepjs-web --production-branch main
```

### Important: Disable Automatic Builds

To prevent duplicate deployments:

1. Go to **Workers & Pages** → `creepjs-web` → **Settings** → **Builds & deployments**
2. Turn off **Automatic build on push**
3. This ensures only GitHub Actions triggers deployments

## Step 4: Configure Cloudflare Workers (API)

The API deployment is already configured in `apps/api/wrangler.toml`. Verify the settings:

```toml
name = "creepjs-api"
main = "src/index.ts"
compatibility_date = "2024-12-30"
account_id = "fe394f7c37b25babc4e351d704a6a97c"
```

### Set Cloudflare Workers Secrets (Required)

**Security Fix:** The `IPINFO_TOKEN` was previously hardcoded in `wrangler.toml`. This has been removed for security.

Set secrets via Wrangler CLI:

```bash
cd apps/api

# Set IPINFO_TOKEN
npx wrangler secret put IPINFO_TOKEN
# When prompted, enter: 1562dc669bda56

# Verify secret is set
npx wrangler secret list
```

**Important:** These secrets must be set before deploying the API, otherwise the API will fail to start.

### Custom Domain (Optional)

To set up a custom domain for the API:

1. Go to **Workers & Pages** → `creepjs-api` → **Settings** → **Triggers**
2. Click **Add Custom Domain**
3. Enter: `api.creepjs.org`
4. Cloudflare will automatically configure DNS records

## Step 5: Verify Workflow Configuration

The workflows are already configured correctly. They will:

### CI Workflow (`ci.yml`)

- **Trigger**: Every PR and push to `main`/`develop`
- **Actions**: Lint, typecheck, test all packages, build verification, security audit

### Web Deployment Workflow (`deploy-web.yml`)

- **Trigger**: Push to `main` (paths: `apps/web/**`, `packages/**`), PR, or manual
- **Production deployment** (push to `main` only):
  1. Run linting and tests
  2. Build Next.js app (static export)
  3. Deploy to Cloudflare Pages
  4. Health checks (homepage, demo, sitemap)
- **PR preview deployment**:
  1. Build and deploy preview
  2. Run Lighthouse performance tests
  3. Comment on PR with preview URL and metrics

### API Deployment Workflow (`deploy-api.yml`)

- **Trigger**: Push to `main` (paths: `apps/api/**`, `packages/**`), PR, or manual
- **Production deployment** (push to `main` only):
  1. Lint, typecheck, test API
  2. Build API + dependencies
  3. Deploy to Cloudflare Workers
  4. Health checks (API endpoints)
  5. Automatic rollback on failure
- **PR preview deployment**:
  1. Build and deploy preview
  2. Comment on PR with preview URL

### Manual Deployment

- Go to **Actions** → Select workflow → **Run workflow**

## Step 6: Test the Workflow

### Option 1: Push to Main

```bash
# Make a small change
echo "# Test" >> README.md
git add README.md
git commit -m "test: trigger GitHub Actions deployment"
git push origin main
```

### Option 2: Create a Pull Request

```bash
# Create a feature branch
git checkout -b test/github-actions
echo "# Test PR" >> README.md
git add README.md
git commit -m "test: trigger PR preview deployment"
git push origin test/github-actions

# Go to GitHub and create a PR from this branch
```

### Option 3: Manual Trigger

1. Go to **Actions** tab in GitHub
2. Select **Deploy Web to Cloudflare Pages**
3. Click **Run workflow** → Select `main` branch → **Run workflow**

## Step 7: Monitor Deployment

1. Go to **Actions** tab in GitHub
2. Click on the running workflow
3. Watch the deployment progress in real-time

**Expected workflow steps**:

```
✓ Lint & Test Web App (5-8 minutes)
  ├── Checkout code
  ├── Setup Node.js + pnpm
  ├── Install dependencies
  ├── Lint web code
  ├── Type check
  └── Run unit tests

✓ Build Next.js Application (8-12 minutes)
  ├── Setup environment
  ├── Install dependencies
  ├── Build @creepjs/core
  ├── Build @creepjs/sdk
  ├── Build Next.js app
  └── Upload build artifacts

✓ Deploy to Cloudflare Pages (3-5 minutes)
  ├── Download build artifacts
  ├── Deploy to Cloudflare
  ├── Wait for deployment
  ├── Health check - Homepage
  ├── Health check - Demo page
  └── Report deployment success
```

## Step 8: Verify Deployment

Once the workflow completes:

1. **Check GitHub Actions**:
   - Look for green checkmarks ✓
   - Review deployment logs

2. **Check Cloudflare Pages Dashboard**:
   - Go to **Workers & Pages** → `creepjs-web`
   - Verify the latest deployment

3. **Test the deployed site**:

   ```bash
   # Test production deployment
   curl https://creepjs.org/

   # Test specific pages
   curl https://creepjs.org/demo
   curl https://creepjs.org/docs
   curl https://creepjs.org/playground
   ```

## Troubleshooting

### Web Deployment Issues

#### Error: "No project with name 'creepjs-web' found"

**Solution**: Ensure the Cloudflare Pages project exists and name matches.

In `.github/workflows/deploy-web.yml` line 171:

```yaml
projectName: creepjs-web # Must match your Cloudflare Pages project name
```

Create project: See Step 3 above.

#### Error: "Build failed - directory not found"

**Solution**: The workflow expects static files in `apps/web/out`. Verify Next.js config:

In `apps/web/next.config.mjs`:

```javascript
const nextConfig = {
  output: 'export', // Must be set for static export
  // ...
};
```

#### Deployment succeeds but site shows 404

**Possible causes**:

1. **Wrong output directory**: Should be `apps/web/out`, not `apps/web/.next`
2. **Missing `_routes.json`**: Cloudflare Pages needs routing configuration for SPAs
3. **Build artifacts incomplete**: Check the build logs

### API Deployment Issues

#### Error: "KV namespace not bound"

**Solution**: Verify KV namespaces exist and IDs match `wrangler.toml`:

```bash
cd apps/api
npx wrangler kv:namespace list
```

Compare IDs with `apps/api/wrangler.toml`. If they don't match, update `wrangler.toml` or create missing namespaces (see Step 2).

#### Error: "Cannot find module @creepjs/core"

**Solution**: Workspace dependency issue. The workflow builds packages in order:

```bash
pnpm --filter @creepjs/core build
pnpm --filter @creepjs/sdk build
pnpm --filter @creepjs/api build
```

Verify `apps/api/package.json` has:

```json
{
  "dependencies": {
    "@creepjs/core": "workspace:*"
  }
}
```

#### Error: "Health check failed" (API)

**Solution**:

1. Wait 30-60 seconds for global propagation
2. Check Cloudflare Workers dashboard for deployment status
3. Test API manually:
   ```bash
   curl https://api.creepjs.org/
   ```
4. If `TEST_API_TOKEN` is not set, comment out health check in workflow

#### API deployment succeeds but returns 500 errors

**Possible causes**:

1. **Missing KV bindings**: Check `wrangler.toml` has all 3 KV namespaces
2. **Environment variables missing**: Check `wrangler.toml` `[vars]` section
3. **Code errors**: Check Workers logs:
   ```bash
   cd apps/api
   npx wrangler tail
   ```

### General Issues

#### Error: "Invalid API Token"

**Solution**: Verify your `CLOUDFLARE_API_TOKEN` secret:

```bash
# Test token validity
curl "https://api.cloudflare.com/client/v4/accounts/fe394f7c37b25babc4e351d704a6a97c/tokens/verify" \
  -H "Authorization: Bearer kbjmXswH0vV9zMs1uuYSepwH1RAWWJsqgenjAtt8"
```

Expected response:

```json
{
  "success": true,
  "errors": [],
  "messages": [],
  "result": {
    "id": "...",
    "status": "active"
  }
}
```

If token is invalid, regenerate in Cloudflare Dashboard and update GitHub Secret.

#### Error: "Authentication error" in GitHub Actions

**Solution**:

- Verify `CLOUDFLARE_API_TOKEN` secret is correctly set
- Check token has required permissions:
  - Cloudflare Pages: Edit
  - Cloudflare Workers: Edit
  - Account Settings: Read

#### Workflow doesn't trigger on push

**Solution**:

- Check `.github/workflows/*.yml` `paths` filters
- Verify you're pushing to the correct branch (`main`)
- Check workflow is enabled in GitHub Actions settings

#### Multiple deployments happening simultaneously

**Solution**: The repository has multiple deployment workflows. To avoid duplication:

1. **Recommended**: Use separate workflows:
   - `deploy-web.yml` for web deployments
   - `deploy-api.yml` for API deployments

2. **Alternative**: Disable `deploy-cloudflare.yml`:
   - Delete or rename `.github/workflows/deploy-cloudflare.yml`

This prevents duplicate deployments and gives better control over each service.

## Advanced Configuration

### Custom Domain

1. Go to **Cloudflare Pages** → `creepjs-web` → **Custom domains**
2. Add your domain: `creepjs.org`
3. Update DNS records as instructed
4. Update workflow environment URL:
   ```yaml
   environment:
     name: production
     url: https://creepjs.org
   ```

### Environment Variables

Add environment variables in Cloudflare Pages dashboard:

1. Go to **Workers & Pages** → `creepjs-web` → **Settings** → **Environment variables**
2. Add variables for production/preview environments
3. Example variables:
   - `NEXT_PUBLIC_API_BASE`: `https://api.creepjs.org`
   - `NEXT_PUBLIC_ENV`: `production`

### Branch Previews

Cloudflare Pages automatically creates previews for all branches:

- **URL pattern**: `https://[branch-name].creepjs-web.pages.dev`
- **Example**: `https://feature-xyz.creepjs-web.pages.dev`

The workflow automatically comments on PRs with the preview URL.

## Performance Monitoring

### Lighthouse CI

The workflow runs Lighthouse audits on PR previews:

- Performance target: > 90
- Accessibility target: > 95
- Best Practices target: > 90
- SEO target: > 90

Results are posted as PR comments.

### Cloudflare Analytics

View real-time analytics in Cloudflare dashboard:

- **Workers & Pages** → `creepjs-web` → **Analytics**
- Metrics: Page views, unique visitors, bandwidth, Core Web Vitals

## Next Steps

1. ✅ Set up GitHub Secrets (completed above)
2. ✅ Fix deployment directory (already fixed in workflows)
3. 🔄 Push to `main` to trigger deployment
4. 🔄 Monitor deployment in GitHub Actions
5. 🔄 Verify site is live at `https://creepjs.org`

## Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Cloudflare Pages GitHub Action](https://github.com/cloudflare/pages-action)
- [Next.js Static Exports](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)

## Support

If you encounter issues:

1. Check GitHub Actions logs for detailed error messages
2. Review Cloudflare Pages deployment logs
3. Verify all secrets are correctly set
4. Ensure Cloudflare Pages project name matches workflow configuration

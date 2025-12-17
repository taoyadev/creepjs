# Quick Setup: GitHub Secrets

Follow these steps to add GitHub Secrets for automated Cloudflare deployment.

## 1. Navigate to GitHub Secrets

Open: `https://github.com/taoyadev/creepjs/settings/secrets/actions`

Or manually:

1. Go to https://github.com/taoyadev/creepjs
2. Click **Settings** (top menu)
3. Sidebar: **Secrets and variables** → **Actions**

## 2. Add Required Secrets (2 secrets)

### Secret 1: CLOUDFLARE_API_TOKEN

1. Click **New repository secret**
2. **Name:** `CLOUDFLARE_API_TOKEN`
3. **Secret:**

```
kbjmXswH0vV9zMs1uuYSepwH1RAWWJsqgenjAtt8
```

4. Click **Add secret**

---

### Secret 2: CLOUDFLARE_ACCOUNT_ID

1. Click **New repository secret**
2. **Name:** `CLOUDFLARE_ACCOUNT_ID`
3. **Secret:**

```
fe394f7c37b25babc4e351d704a6a97c
```

4. Click **Add secret**

---

## 3. Verify Secrets Added

After adding both secrets, you should see:

```
Repository secrets (2)
✓ CLOUDFLARE_API_TOKEN
✓ CLOUDFLARE_ACCOUNT_ID
```

## 4. Test Deployment

### Option A: Manual Trigger (Recommended for first test)

1. Go to: https://github.com/taoyadev/creepjs/actions
2. Click **Deploy Web to Cloudflare Pages**
3. Click **Run workflow** dropdown
4. Select branch: `main`
5. Click green **Run workflow** button
6. Watch the workflow execute (takes 15-20 minutes)

### Option B: Push to Main

```bash
cd /Volumes/SSD/dev/new/ip-dataset/creepjs

# Make sure you're on main branch
git checkout main

# Trigger deployment by pushing
git push origin main
```

This will automatically trigger both:

- Web deployment (deploy-web.yml)
- API deployment (deploy-api.yml)

## 5. Set Cloudflare Workers Secrets (Important!)

The API requires sensitive tokens that should NOT be in the code. Set these via Wrangler CLI:

```bash
cd apps/api

# Set IPINFO_TOKEN (required for IP geolocation)
npx wrangler secret put IPINFO_TOKEN
# When prompted, enter: 1562dc669bda56

# Verify secret is set
npx wrangler secret list
```

**Why?** The `IPINFO_TOKEN` was previously hardcoded in `wrangler.toml` (security issue). We've removed it and now it must be set as a secret.

## 6. Monitor Deployment

### GitHub Actions

- View logs: https://github.com/taoyadev/creepjs/actions
- Check for green checkmarks ✓

### Cloudflare Dashboard

- Pages: https://dash.cloudflare.com → Workers & Pages → Pages
- Workers: https://dash.cloudflare.com → Workers & Pages → Overview

## 7. Next Steps (Optional)

### Add Optional Secrets Later

After first deployment, you can add:

#### TEST_API_TOKEN (for API health checks)

```bash
# Generate test token after API is deployed:
curl "https://api.creepjs.org/v1/token?email=test@creepjs.org"

# Add the returned token as TEST_API_TOKEN secret
```

#### Custom Domain URLs

- `CLOUDFLARE_API_URL` = `https://api.creepjs.org` (if using custom domain)
- `CLOUDFLARE_WEB_URL` = `https://creepjs.org` (if using custom domain)

## Troubleshooting

### If deployment fails:

1. **Check GitHub Actions logs** for detailed error messages
2. **Verify secrets** are correctly set (no extra spaces)
3. **Check Cloudflare KV namespaces** exist (see main setup guide)
4. **Review Cloudflare Pages project** exists and is named `creepjs-web`

See detailed troubleshooting in `GITHUB_ACTIONS_SETUP.md`

## Summary

**Required Actions:**

- ✅ Add 2 GitHub Secrets (CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID)
- ✅ Set 1 Cloudflare Workers Secret (IPINFO_TOKEN via Wrangler CLI)
- ✅ Verify Cloudflare Pages project `creepjs-web` exists
- ✅ Verify Cloudflare Workers KV namespaces exist (3 namespaces)
- ✅ Test deployment via GitHub Actions

**Time Estimate:** 5-10 minutes setup + 15-20 minutes first deployment

**Expected Result:**

- Web app deployed to Cloudflare Pages
- API deployed to Cloudflare Workers
- All health checks passing
- Green checkmarks in GitHub Actions

# GitHub Actions Secrets Configuration

This document describes all secrets required for CI/CD workflows in the CreepJS project.

## Required Secrets

### Cloudflare Credentials

#### `CLOUDFLARE_API_TOKEN`

**Purpose**: Authenticate Wrangler CLI and Cloudflare Pages deployments

**How to obtain**:

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **My Profile** → **API Tokens**
3. Click **Create Token**
4. Use template **Edit Cloudflare Workers** or create custom token with:
   - **Permissions**:
     - Account: Cloudflare Pages - Edit
     - Account: Workers Scripts - Edit
     - Account: Workers KV Storage - Edit
   - **Account Resources**: Include your account
   - **Zone Resources**: Include `creepjs.org` domain
5. Copy the generated token
6. Add to GitHub repository secrets: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

**Value format**: `<your-cloudflare-api-token>`

---

#### `CLOUDFLARE_ACCOUNT_ID`

**Purpose**: Identify your Cloudflare account for deployments

**How to obtain**:

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your domain (`creepjs.org`)
3. Scroll down to **Account ID** in the right sidebar
4. Click to copy
5. Add to GitHub repository secrets

**Value format**: `<32-character-account-id>`

---

### Optional: Test API Token

#### `TEST_API_TOKEN`

**Purpose**: Test the fingerprint API endpoint during health checks

**How to obtain**:

1. Generate a test token using the CreepJS token generation endpoint:
   ```bash
   curl -X POST https://api.creepjs.org/v1/token \
     -H "Content-Type: application/json" \
     -d '{"email":"ci-test@creepjs.org"}'
   ```
2. Copy the returned token
3. Add to GitHub repository secrets

**Value format**: `cfp_<alphanumeric-token>`

**Note**: This is optional. If not set, health checks will skip the fingerprint endpoint test.

---

## Environment-Specific Secrets (Optional)

### Staging Environment

If you want to use a staging environment with separate resources:

#### `CLOUDFLARE_API_TOKEN_STAGING`

- Same format as production token
- Should have permissions for staging Workers and Pages

#### `CLOUDFLARE_ACCOUNT_ID_STAGING`

- Can be same as production if using same account
- Different if using separate staging account

---

## Setting Up Secrets in GitHub

### Repository Secrets

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Enter secret name (e.g., `CLOUDFLARE_API_TOKEN`)
5. Paste the secret value
6. Click **Add secret**

### Environment Secrets (Recommended for Production)

For better security, use environment secrets for production:

1. Go to **Settings** → **Environments**
2. Click **New environment** or select existing `production` environment
3. Add environment secrets:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
   - `TEST_API_TOKEN` (optional)
4. Configure protection rules:
   - ✅ Required reviewers (optional)
   - ✅ Wait timer (optional)
   - ✅ Deployment branches: `main` only

---

## Verifying Secrets

After adding secrets, verify they work:

1. **Manual trigger test**:
   - Go to **Actions** tab
   - Select **Deploy API to Cloudflare Workers** workflow
   - Click **Run workflow** → **Run workflow**
   - Monitor the run to ensure authentication succeeds

2. **Check workflow logs**:
   - Secrets should show as `***` in logs (never plaintext)
   - Successful authentication will show `✅` in deployment step

3. **Test deployment**:

   ```bash
   # Test API health endpoint
   curl https://api.creepjs.org/

   # Test web homepage
   curl https://creepjs.org/
   ```

---

## Security Best Practices

### ✅ Do's

- ✅ Use environment secrets for production deployments
- ✅ Rotate API tokens every 90 days
- ✅ Limit token permissions to minimum required
- ✅ Use separate tokens for staging and production
- ✅ Enable 2FA on Cloudflare account
- ✅ Review token activity in Cloudflare dashboard regularly

### ❌ Don'ts

- ❌ Never commit secrets to code repository
- ❌ Never share secrets in pull request comments
- ❌ Never use production secrets in local development
- ❌ Never grant unnecessary permissions to API tokens
- ❌ Never use the same token across multiple projects

---

## Troubleshooting

### "Unauthorized" errors in deployment

**Solution**:

1. Check token is correctly copied (no extra spaces)
2. Verify token hasn't expired
3. Ensure token has correct permissions (Workers Scripts - Edit)
4. Regenerate token if needed

### "Account ID not found" errors

**Solution**:

1. Verify account ID is 32 characters
2. Check you're using the correct Cloudflare account
3. Ensure account has Workers enabled

### Health check fails after deployment

**Solution**:

1. Wait 30-60 seconds for DNS propagation
2. Check Wrangler deployment logs for errors
3. Verify routes are correctly configured in `wrangler.toml`
4. Test endpoint manually: `curl https://api.creepjs.org/`

---

## Secret Rotation Schedule

Recommended rotation schedule:

| Secret                  | Rotation Frequency             | Next Rotation          |
| ----------------------- | ------------------------------ | ---------------------- |
| `CLOUDFLARE_API_TOKEN`  | Every 90 days                  | Track in your calendar |
| `CLOUDFLARE_ACCOUNT_ID` | Never (unless account changes) | N/A                    |
| `TEST_API_TOKEN`        | Every 30 days                  | Track in your calendar |

---

## Additional Resources

- [Cloudflare API Tokens Documentation](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/)
- [GitHub Actions Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Wrangler Authentication](https://developers.cloudflare.com/workers/wrangler/ci-cd/)

---

## Quick Reference

### Minimum Required Secrets

```
CLOUDFLARE_API_TOKEN=<your-token>
CLOUDFLARE_ACCOUNT_ID=<your-account-id>
```

### Full Setup (with optional secrets)

```
# Required
CLOUDFLARE_API_TOKEN=<your-token>
CLOUDFLARE_ACCOUNT_ID=<your-account-id>

# Optional
TEST_API_TOKEN=cfp_<test-token>
CLOUDFLARE_API_TOKEN_STAGING=<staging-token>
CLOUDFLARE_ACCOUNT_ID_STAGING=<staging-account-id>
```

---

**Last Updated**: 2025-01-10
**Maintained By**: CreepJS Maintainers

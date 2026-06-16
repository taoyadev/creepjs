# Secrets & Rotation Runbook

This file is the repository source of truth for deployment secrets, public
runtime variables, and rotation ownership. Use it with
[DEPLOYMENT.md](/Volumes/SSD/dev/ip-dataset/creepjs/docs/DEPLOYMENT.md) and do
not store secrets in tracked files.

## Secret inventory

| Name                             | Surface                   | Used by                            | How to set                                                          | Rotation owner | Notes                                                                              |
| -------------------------------- | ------------------------- | ---------------------------------- | ------------------------------------------------------------------- | -------------- | ---------------------------------------------------------------------------------- |
| `CLOUDFLARE_API_TOKEN`           | GitHub secret             | `deploy-api.yml`, `deploy-web.yml` | GitHub Actions secret                                               | Operator       | Production deploy token. Rotate immediately if exposed.                            |
| `CLOUDFLARE_ACCOUNT_ID`          | GitHub secret / local env | Wrangler deploy jobs               | GitHub Actions secret or shell env                                  | Operator       | Keep it out of committed config even though it is not a credential.                |
| `IPBOT_API_KEY`                  | Worker secret             | `apps/api` `/v1/ip/*`, `/my-ip`    | `pnpm --filter @creepjs/api exec wrangler secret put IPBOT_API_KEY` | Operator       | Required for all live IP intelligence lookups.                                     |
| `TEST_API_TOKEN`                 | GitHub secret             | API deploy health check            | GitHub Actions secret                                               | Operator       | Low-privilege token used only in CI smoke checks. Rotate every 30 days or on leak. |
| `NEXT_PUBLIC_CF_ANALYTICS_TOKEN` | Public env var            | `apps/web` analytics beacon        | Cloudflare Pages / build env                                        | Operator       | Safe to expose publicly; included for completeness.                                |
| `NEXT_PUBLIC_API_URL`            | Public env var            | `apps/web` API base URL            | Cloudflare Pages / build env                                        | Operator       | Must point at the correct API host per environment.                                |
| `NEXT_PUBLIC_SITE_URL`           | Public env var            | `apps/web` canonical and OG URLs   | Cloudflare Pages / build env                                        | Operator       | Must match the deployed site host.                                                 |

## Deprecated

| Name           | Status  | Reason                                                                                                                         |
| -------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `IPINFO_TOKEN` | Removed | `/my-ip` now reuses the existing IPbot integration instead of a second provider. Do not reintroduce it without a fresh review. |

## Cloudflare token rotation

The previously leaked Cloudflare deploy token must be treated as permanently
compromised even if the git history was rewritten.

1. Open Cloudflare Dashboard → `My Profile` → `API Tokens`.
2. Revoke or roll the exposed token.
3. Create a replacement token with the minimum Pages, Workers, and KV permissions required for this project.
4. Update GitHub Actions secret `CLOUDFLARE_API_TOKEN`.
5. Update any operator-only local secret store that still carries the old token.
6. Trigger one API deploy and one web deploy to verify the replacement token.

Never paste token values into issues, PRs, commit messages, or docs.

## Post-rotation verification

After the Cloudflare dashboard rotation is complete, use this checklist to
confirm the replacement token is live and the old one is no longer accepted:

1. Re-run the CI secret scan locally to confirm no committed secret material was
   introduced during the rotation work:

   ```bash
   bash scripts/secret-scan.sh
   ```

2. Run one API deploy and one web deploy from GitHub Actions or the local
   deployment path used by this repo.
3. Verify the deploy logs show successful authentication and no token-related
   401/403 errors.
4. Check the production endpoints still respond normally:

   ```bash
   curl https://api.creepjs.org/
   curl https://creepjs.org/
   ```

5. If a rollback or health-check workflow is available, run it once more after
   the deploy to confirm the replacement token is the only one in use.

## Worker secret management

Set Worker secrets from `apps/api` with Wrangler:

```bash
pnpm --filter @creepjs/api exec wrangler secret put IPBOT_API_KEY
```

After updating Worker secrets, redeploy the API and verify:

```bash
curl https://api.creepjs.org/
curl https://api.creepjs.org/my-ip
```

## CI enforcement

Blocking secret detection lives in `scripts/secret-scan.sh` and runs in CI.
Any committed value that looks like a real `cfp_`, `ipb_`, or Cloudflare deploy
token must fail the workflow.

## Rotation log

| Date       | Secret                 | Action                                                                                                                                                                                                 |
| ---------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-06-16 | `CLOUDFLARE_API_TOKEN` | **Rotated.** The leaked legacy token (`kbjm…tt8`) was revoked in the Cloudflare dashboard and is now confirmed **invalid** (`/user/tokens/verify` → `1000 Invalid API Token`). A replacement **account‑scoped** token (`cfat_…`) was issued and verified active (account API → `success: true`). The GitHub Actions secret `CLOUDFLARE_API_TOKEN` was updated to the new value the same day; `CLOUDFLARE_ACCOUNT_ID` unchanged. The operator-local copy of the dead token was scrubbed. |

> Residual (non-blocking): the orphaned pre-cleanup commit `e78c0a8` still contains
> the **revoked** token and remains reachable on GitHub **by SHA** via the fork
> network (fork `LiamDGray/creepjs`). This is moot for security because the token is
> dead, but to fully purge the cached object: ask the fork owner to delete their fork
> and open a GitHub Support request to garbage-collect the unreachable object. The
> local clone's reflog/loose object was already purged
> (`git reflog expire --expire=now --all && git gc --prune=now`).

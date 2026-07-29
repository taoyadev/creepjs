# Update API Security Hardening

## Why

A privacy/security review of the deployed Worker surface found five live
holes that leak cost, credentials strength, or privacy — independent of the
batch-lookup work:

1. API tokens were deterministic 32-bit content hashes (`murmur(email,
timestamp)`): guessable, and birthday collisions silently overwrite
   another user's token record.
2. `/my-ip` performed an unmetered paid IPbot lookup per unique visitor while
   Cloudflare's free `request.cf` geolocation went unused, and had no rate
   limit at all.
3. Structured logs recorded raw looked-up IPs (`ipbot.ratelimit`,
   `myip.lookup_failed`), contradicting the docs/SECURITY.md data-handling
   posture.
4. Upstream 429/5xx failures were never negative-cached, so a hot IP could
   trigger repeated upstream retry storms.
5. CORS used one global `*` policy, leaving browser-driven token minting
   (`/v1/token`) mintable from any third-party page; the CI preview job
   deployed a Worker with zero bindings/secrets.

## What Changes

- **Token generation**: CSPRNG base62 tokens (~142-bit) via
  `crypto.getRandomValues`; existing tokens keep working (auth is a literal
  KV lookup). Auth rejects tokens > 64 chars before the KV read.
- **`/my-ip` hybrid**: geolocation always from `request.cf` (free); the paid
  IPbot call only enriches the optional `risk` block, gated by a per-visitor
  daily cap (`myip:ip:<hash>`, default 10) and the shared `pubip:global`
  daily budget. On cap exhaustion the endpoint degrades to geo-only.
- **Log privacy**: new `utils/privacy.ts` (`hashIpForLog` = SHA-256/12);
  `ipbot.ratelimit` logs `ip_hash`, `myip.lookup_failed` drops the IP.
  (The two `routes/ip.ts` log sites are converted in the batch-lookup
  rewrite, which rewrites that file.)
- **Negative cache**: final upstream 429/≥500 failures cached 60s under
  `ipbot:err:<ip>`; lookups short-circuit with the mapped error.
- **CORS split**: data endpoints stay `*` by design; `/v1/token` is locked
  to `CORS_ORIGIN` (prod fallback `https://creepjs.org`).
- **IPv6 validation fix** (bug fix): `isValidIp` now rejects `':::'`,
  `'1:2'`, `':1:2'`, `'1:2:'` via proper `::` group accounting.
- **CI**: the broken `preview` job (deploys `--env preview` with no
  bindings/secrets) is removed.

## Impact

- Affected specs: `api-security` (new capability delta)
- Affected code: `apps/api/src/routes/{token,myip}.ts`,
  `apps/api/src/middleware/{auth,cors}.ts`, `apps/api/src/services/ipbot.ts`,
  `apps/api/src/utils/{privacy,counters}.ts` (new), `apps/api/src/types.ts`,
  `apps/api/wrangler.toml`, `.github/workflows/deploy-api.yml`, tests.
- No breaking client changes: `/my-ip` response shape unchanged (`risk` was
  already optional); token format prefix unchanged (`cfp_`).

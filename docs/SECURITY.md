# Security & Privacy

## Core Principles

CreepJS.org is built on privacy-first principles, ensuring transparency and user control.

### 1. Transparency

- **Clear Disclosure**: Explicitly inform users about fingerprint data collection
- **Open Source**: Core engine code is open source and auditable
- **No Hidden Collection**: Only collect declared fingerprint data
- **Real-time Display**: Show collection process and results to users

### 2. Data Minimization

- **Necessary Only**: Only collect data needed for fingerprinting
- **No Sensitive Data**: Never collect geolocation, camera, microphone, or other sensitive permissions
- **Stateless API**: Don't persistently store raw fingerprint data
- **Short Retention**: If storage is needed, maximum 7 days retention

### 3. User Control

- **Respect DNT**: Honor Do Not Track settings
- **Opt-out Options**: Provide easy opt-out mechanisms
- **Data Deletion**: Provide data deletion API
- **User Consent**: Require explicit consent before collection

### 4. Security

- **HTTPS Only**: All API communications use HTTPS
- **Token Authentication**: Use secure API tokens
- **Rate Limiting**: Prevent API abuse
- **No Malicious Use**: Prohibit use for fraud, spam, or harassment

## GDPR Compliance

### Legal Basis

Browser fingerprinting may fall under GDPR requirements. We recommend:

1. **Legitimate Interest**: If for fraud prevention/security
2. **Consent**: If for marketing/analytics, obtain explicit consent
3. **Contractual Necessity**: If required for service delivery

### User Rights

Provide the following rights to users:

- **Right to Access**: Users can request their fingerprint data
- **Right to Deletion**: Provide deletion mechanisms
- **Right to Object**: Allow users to opt-out
- **Data Portability**: Provide data export functionality

### Implementation Recommendations

```javascript
// Check user consent before collection
if (await getUserConsent()) {
  const fp = await getFingerprint({ token: 'xxx' });
} else {
  console.log('User declined fingerprint collection');
}

// Respect DNT settings
if (navigator.doNotTrack === '1') {
  // Skip collection
}
```

## Data Security

### API Security

- **Token authentication**: `/v1/fingerprint`, `/v1/ip/:ip` and
  `/v1/ip/batch` need an `X-API-Token` that exists in KV `TOKENS`; a header
  over 64 characters gets 401 before the KV read. Health, `/v1/token`,
  `/v1/ip/public/:ip`, `/my-ip`, `/v1/stats/uniqueness` and `/v1/events` take
  no token and are limited per visitor or by origin instead (see
  [CORS posture](#cors-posture))
- **CSPRNG tokens**: `/v1/token` mints `cfp_` plus 24 base62 characters
  (~142 bits) from `crypto.getRandomValues`. Tokens do not expire; see the
  [token revocation runbook](#token-revocation-runbook)
- **Daily allowance**: 1000 units a day (`RATE_LIMIT_PER_DAY`) per inbox that
  owns the token, shared by all of that inbox's tokens and counted in the
  `QuotaCounter` Durable Object; batch requests reserve one unit per unique
  valid IP before any provider call
- **Body caps**: `/v1/fingerprint` 128 KiB, `/v1/ip/batch` 8 KiB and
  `/v1/events` 1 KiB, rejected with 413 before any token or quota work
- **HTTPS Only**: Encrypted transmission
- **Request IDs + structured logs**: every response carries `X-Request-Id`;
  what each log line contains is in the [logging matrix](#logging-matrix)
- **Metered `/my-ip`**: geolocation comes from `request.cf` at zero upstream
  cost; the paid risk lookup is capped per visitor (default 10/day, hashed
  counter key) and by the shared global daily budget, degrading to geo-only
- **Shared upstream budget for token lookups**: uncached `/v1/ip/:ip` and
  `/v1/ip/batch` lookups share one daily cap across all tokens
  (`TOKEN_IP_DAILY_GLOBAL`, default 10,000), so no set of tokens can exhaust
  the upstream provider quota that the public endpoints also depend on
- **Negative caching**: final upstream 429/5xx failures are cached for 60s so
  hot IPs cannot trigger upstream retry storms

### Data Storage

- **No Long-term Storage**: Don't persistently store raw fingerprint data
- **Hash Only**: Only store hashed fingerprint IDs
- **Encrypted Transmission**: All data transmitted over HTTPS
- **Access Control**: Strict access controls on servers

## Logging Matrix

The API writes one JSON object per line through `apps/api/src/utils/logging.ts`
or `console.*`, except `myip.lookup_failed`, which is a plain string. This is
every line the code writes. Paths are relative to `apps/api/src/`.

| `msg`                      | Written by                                                       | Fields                                                                                                                                                                                                 | Identifying content                                                                             |
| -------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| `api.request`              | `middleware/request-logger.ts`, every request                    | `request_id`, `method`, `path`, `status`, `latency_ms`, `rate_limit_limit`, `rate_limit_remaining`, `rate_limit_reset`, `retry_after`                                                                  | None. A path segment that is an IP is logged as `:ip`; no query string, headers or body         |
| `api.error`                | `middleware/error.ts`, unhandled exceptions (`console.error`)    | `request_id`, `path`, `method`, `error`                                                                                                                                                                | Same path redaction; `error` is the exception message                                           |
| `fingerprint.accepted`     | `routes/fingerprint.ts`                                          | `request_id`, `quota_used`, `fingerprint_id`, `reported_id_matches`, `coverage_ratio`, `coverage_successful`, `coverage_failed`, `coverage_skipped`                                                    | The fingerprint ID, a stable pseudonymous browser identifier. No token, email, IP or components |
| `fingerprint.stats_failed` | `routes/fingerprint.ts` via `runAfterResponse` (`console.error`) | `request_id`, `error`                                                                                                                                                                                  | None                                                                                            |
| `ip.public_lookup`         | `routes/ip.ts`                                                   | `request_id`, `ip_hash`, `cached`, `high_risk`, `public_remaining`, `global_count`, `ipbot_remaining`                                                                                                  | `ip_hash` of the queried IP. The visitor's own IP is not logged                                 |
| `ip.token_lookup`          | `routes/ip.ts`                                                   | `request_id`, `ip_hash`, `cached`, `high_risk`, `ipbot_remaining`, `ipbot_tier`                                                                                                                        | `ip_hash` of the queried IP                                                                     |
| `ip.batch_lookup`          | `routes/ip.ts`                                                   | `request_id`, `status`, `requested` or `submitted`, `unique`, `valid`, `succeeded`, `invalid`, `failed`, `skipped`, `cached`, `high_risk`, `quota_cost`, `reserved`, `aborted` (counts and flags only) | None                                                                                            |
| `ipbot.ratelimit`          | `services/ipbot.ts`, each upstream 429 and each fetched result   | `event` (`throttled` or `fetched`), `ip_hash`, `limit`, `remaining`, `reset`, `tier`, `retryAfter`                                                                                                     | `ip_hash` of the queried IP                                                                     |
| `myip.lookup_failed`       | `routes/myip.ts` (`console.warn`, plain text)                    | `status=<n>`                                                                                                                                                                                           | None                                                                                            |
| `events.write_failed`      | `routes/events.ts` (`console.error`)                             | `request_id`, `error`                                                                                                                                                                                  | None                                                                                            |

The code never logs API tokens, email addresses, raw IPs, user agents,
request bodies or fingerprint components. `apps/api/tests/ip.test.ts`,
`request-logging.test.ts` and `ipbot.test.ts` assert this for the IP routes,
the request log and `ipbot.ratelimit`.

`ip_hash` is the first 12 hex characters of an unsalted SHA-256 of the
address (`hashIpForLog` in `utils/privacy.ts`). It keeps addresses out of the
log text and lets an operator grep for a known IP, but it is not
anonymisation: anyone holding the logs can recover an IPv4 address by hashing
all 2^32 candidates. Salting it needs a production secret and has not been
done. The per-visitor counter keys (`pubip:ip:`, `myip:ip:`, `stats:ip:`,
`token-mint:ip:`) use the same hash of the visitor's IP, or of its /64 for
IPv6.

**Where the lines go.** `apps/api/wrangler.toml` turns on no Workers Logs
(`[observability]`), Tail Workers or Logpush, so unless logging is enabled
outside this repo the lines are only seen live, through `wrangler tail` or the
dashboard's real-time logs. Those live views also carry Cloudflare's own
per-request event (URL, method, request headers and the `cf` object), which
the code does not control: the URL of a `/v1/ip/:ip` request contains the
queried IP and `cf-connecting-ip` contains the caller's. Treat tail output as
holding raw IPs.

## CORS Posture

`apps/api/src/middleware/cors.ts` picks the allowed origin by route. CORS only
decides which pages a browser lets read a response; it does not limit curl,
servers or scripts, so every route has its own limit as well.

| Routes                       | `Access-Control-Allow-Origin` | What limits use                                                                                                                 |
| ---------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `/`, `/v1/health`            | `*`                           | Static status, nothing to protect                                                                                               |
| `/v1/fingerprint`            | `*`                           | Token, per-inbox daily allowance, 128 KiB body cap                                                                              |
| `/v1/ip/:ip`, `/v1/ip/batch` | `*`                           | Token, per-inbox daily allowance, shared daily cap on uncached lookups (`TOKEN_IP_DAILY_GLOBAL`)                                |
| `/v1/ip/public/:ip`          | `*`                           | 30 lookups a day per visitor (`PUBLIC_IP_DAILY_PER_IP`), 2000 uncached lookups a day in total (`PUBLIC_IP_DAILY_GLOBAL`)        |
| `/my-ip`                     | `*`                           | Geolocation is free from `request.cf`; the paid risk lookup is capped at 10 a day per visitor and by the same 2000-a-day budget |
| `/v1/stats/uniqueness`       | `*`                           | 120 calls a day per visitor (`STATS_DAILY_PER_IP`)                                                                              |
| `/v1/token`                  | site origin                   | 10 mints a day per IP, 3 per inbox, 100 across everyone (`TOKEN_MINT_DAILY_GLOBAL`)                                             |
| `/v1/events`                 | site origin                   | The route also answers 403 to any other or missing `Origin`; 1 KiB body; allowlisted schema                                     |

Per-visitor limits count IPv6 callers per /64.

**Site origin** is `CORS_ORIGIN` when it is set to anything other than empty or
`*`; otherwise `https://creepjs.org` when `ENVIRONMENT` is `production`, and
`*` elsewhere (local development and tests). Production sets
`CORS_ORIGIN = "https://creepjs.org"` in `wrangler.toml`.

**Shared settings**: methods `GET`, `POST`, `OPTIONS`; request headers
`Content-Type` and `X-API-Token`; exposed headers `Retry-After`,
`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` and
`X-Request-Id`; preflight cached for 86400 s. No
`Access-Control-Allow-Credentials` is sent; the API uses no cookies.

**Why the `/v1/token` lock holds in browsers.** The route reads its body only
when `Content-Type` is JSON, and any other type fails validation with 400. A
cross-origin JSON `POST` needs a preflight, a foreign origin gets no
`Access-Control-Allow-Origin` back, and the browser never sends the request.
So a third-party page cannot mint tokens through its visitors' browsers. The
mint caps are what bound non-browser clients.

**Why the data endpoints are `*`.** SDK users call them from their own sites.
Their boundary is the token and the per-inbox or per-visitor counters, not the
calling origin.

## Token Revocation Runbook

What the code does with tokens:

- A token is the key of a KV entry in `TOKENS`, with no prefix; the value is
  `{ email, createdAt, usageCount }` (`apps/api/src/routes/token.ts`).
  `usageCount` is no longer updated.
- Authentication is a read of that key (`apps/api/src/middleware/auth.ts`).
  No expiry is set, so a token works until its key is deleted. There is no
  revocation list, admin endpoint or blocklist.
- Tokens are random values, not signed, so there is no signing key to rotate.
- The daily allowance is counted per inbox, not per token: the email is
  lower-cased, a `+tag` is dropped and Gmail dots are removed. Deleting one
  token does not reset that count, and the inbox's other tokens keep working.

### Revoke one token

Run from `apps/api` with credentials for the production Cloudflare account.
`--binding TOKENS` resolves to the production namespace in `wrangler.toml`.
Wrangler 3, which `apps/api` pins, works on the remote namespace by default;
Wrangler 4 also needs `--remote`.

```bash
pnpm exec wrangler kv key get --binding TOKENS "cfp_..."   # confirm the owner
pnpm exec wrangler kv key delete --binding TOKENS "cfp_..."
```

### Revoke every token of one inbox

Nothing indexes tokens by email, so list the keys and read each value:

```bash
pnpm exec wrangler kv key list --binding TOKENS | jq -r '.[].name' |
  while read -r token; do
    owner=$(pnpm exec wrangler kv key get --binding TOKENS "$token" | jq -r .email)
    printf '%s %s\n' "$token" "$owner"
  done
```

The email is stored as submitted, so match the variants the quota treats as
one inbox (case, `+tag`, Gmail dots) by eye, then delete each matching key as
above. The output holds live tokens; keep it out of tickets and chat.

### After revoking

- KV is eventually consistent. A location that read the token recently can
  keep accepting it for up to 60 seconds, the default KV read cache; auth sets
  no `cacheTtl`.
- The owner can mint a replacement with `POST /v1/token`, within 3 per inbox
  and 10 per IP a day. Nothing stops a revoked inbox or IP from minting again;
  that would need code.
- The inbox's allowance counter is unchanged and resets when its 24-hour
  window ends.

## Web Security Headers

Static Pages headers are defined in `apps/web/public/_headers`.

Current repo-side policy includes:

- `Content-Security-Policy`
- `Strict-Transport-Security`
- `X-Content-Type-Options`
- `Referrer-Policy`
- `Permissions-Policy`

These headers are shipped with the static export and should be verified in the
deployed response with `curl -I` during release review.

## Secret Management

### Rotation Runbook

Use [docs/SECRETS.md](/Volumes/SSD/dev/ip-dataset/creepjs/docs/SECRETS.md) as
the source of truth for secret inventory and rotation ownership.

Cloudflare deploy tokens must be rotated immediately after any exposure. A git
history rewrite is not remediation by itself because leaked tokens remain valid
until they are revoked.

### Repository Controls

- **No committed credentials**: store secrets only in GitHub Actions secrets or
  Worker secrets
- **Blocking secret scan**: CI runs `scripts/secret-scan.sh` and must fail on
  suspicious committed token material
- **Least privilege**: Cloudflare deploy tokens should be scoped only to Pages,
  Workers, and KV permissions required for this project

## IP Intelligence Data

- `/my-ip` reuses the existing IPbot integration instead of a separate
  `IPINFO_TOKEN` secret
- The route returns a minimal transient payload for the caller and falls back to
  a stable response shape if upstream enrichment is unavailable
- No additional long-term storage of caller IP metadata is introduced beyond
  the existing Worker-side KV cache used by the IPbot service

## Uniqueness Baseline Data

- `/v1/stats/uniqueness` uses aggregate counters only
- The API stores coarse hashed buckets for a small set of high-value signals
  (`canvas`, `webgl`, `timezone`, `fonts`, `screen`) rather than raw component values
- Buckets below the configured k-anonymity threshold are suppressed from API responses
- Write amplification is intentionally bounded to one total counter plus at most
  five component counters per fingerprint submission

## Data Traceability Matrix

This matrix maps each stored or transmitted project data item to the code path
that handles it so a reviewer can verify that docs match the implementation.

| Data item                                  | Where it exists                                                | Code path                                                                                                                                                         | Retention / guardrail                                                                                             |
| ------------------------------------------ | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| API token email, `createdAt`, `usageCount` | Cloudflare KV `TOKENS`                                         | `apps/api/src/routes/token.ts`, `apps/api/src/middleware/auth.ts`                                                                                                 | Operational token record only (`usageCount` is no longer updated); no browser fingerprint payload stored with it  |
| Per-token and public rate-limit counters   | Durable Object `QuotaCounter`                                  | `apps/api/src/utils/quota.ts`, `apps/api/src/middleware/ratelimit.ts`, `apps/api/src/routes/ip.ts`, `apps/api/src/routes/myip.ts`, `apps/api/src/routes/token.ts` | Time-window counters keyed by hashed inbox or hashed visitor IP (IPv6 by /64); self-delete when the window ends   |
| IP intelligence cache                      | Cloudflare KV `IP_CACHE`                                       | `apps/api/src/services/ipbot.ts`, `apps/api/src/routes/myip.ts`                                                                                                   | Raw looked-up IP in the key (`ipbot:<ip>`); 24h, 1h if high risk; failures `ipbot:err:<ip>` for 60s               |
| Uniqueness baseline buckets                | Durable Object `StatsCounter` (seeded once from KV `FP_STATS`) | `apps/api/src/services/uniqueness.ts`, `apps/api/src/routes/fingerprint.ts`, `apps/api/src/routes/stats.ts`                                                       | Aggregate hashed coarse buckets only; k-anonymity suppression below threshold                                     |
| Page views                                 | Cloudflare Web Analytics beacon                                | `apps/web/src/components/Analytics.tsx`                                                                                                                           | Cookie-less page counts; no product events sent through it                                                        |
| Product analytics events                   | Workers Analytics Engine dataset `creepjs_events`              | `apps/web/src/lib/analytics.ts`, `apps/api/src/routes/events.ts`, `packages/core/src/analytics-events.ts`                                                         | Event name, pathname and allowlisted labels only; no IP, UA, token or fingerprint ID; DNT/GPC respected; 3 months |
| Homepage/checker local fingerprint history | Browser `localStorage`                                         | `apps/web/src/components/UniquenessAnalysis.tsx`, `apps/web/src/components/FingerprintHistory.tsx`                                                                | Browser-local only; never posted back by these components                                                         |
| SDK cache                                  | Browser `localStorage`                                         | `packages/sdk/src/index.ts`                                                                                                                                       | Cached API response only; cleared by TTL or `clearCache()`                                                        |
| Structured Worker logs                     | `wrangler tail` / dashboard real-time logs                     | `apps/api/src/utils/logging.ts`, `apps/api/src/middleware/request-logger.ts`, `apps/api/src/routes/*.ts`, `apps/api/src/services/ipbot.ts`                        | `ip_hash`, fingerprint IDs and counts; no raw IPs, tokens or emails ([logging matrix](#logging-matrix))           |

Reviewer note:

- If a future change adds a new storage location or third-party sink, update
  this matrix, `apps/web/src/app/privacy/page.tsx`, and
  `apps/web/src/app/terms/page.tsx` in the same PR.

## Privacy Best Practices

### 1. Minimal Collection

```javascript
// ✅ Recommended: Only collect core data
const components = {
  canvas: collectCanvas(),
  webgl: collectWebGL(),
  navigator: {
    userAgent: navigator.userAgent,
    language: navigator.language,
  },
};

// ❌ Avoid: Collecting excessive data
const components = {
  // Don't collect geolocation, IP, email, etc.
};
```

### 2. User Notice

Clearly inform users:

- What data is being collected
- Why it's being collected
- How it will be used
- Who has access to it
- How long it's retained

### 3. Respect Privacy Settings

```javascript
// Check privacy settings
const respectPrivacy = () => {
  // Do Not Track
  if (navigator.doNotTrack === '1') return false;

  // Global Privacy Control
  if (navigator.globalPrivacyControl) return false;

  // Private browsing mode detection
  if (isPrivateMode()) return false;

  return true;
};
```

## Responsible Use

### Acceptable Use

✅ **Allowed**:

- Fraud detection and prevention
- Account security (detect multiple accounts)
- Bot detection
- User experience personalization
- Security research and education

### Prohibited Use

❌ **Not Allowed**:

- User tracking without consent
- Privacy invasion
- Discrimination
- Spam or harassment
- Bypass user privacy settings
- Sale of fingerprint data

## Incident Response

If a security incident occurs:

1. **Immediate Action**: Isolate affected systems
2. **User Notification**: Notify affected users within 72 hours
3. **Investigation**: Conduct thorough investigation
4. **Remediation**: Fix vulnerabilities
5. **Transparency**: Publish incident reports

## Compliance Checklist

- [ ] Provide clear privacy policy
- [ ] Obtain user consent (if required)
- [ ] Respect DNT settings
- [ ] Implement data deletion mechanisms
- [ ] Use HTTPS for all communications
- [ ] Implement rate limiting
- [ ] Don't store unnecessary data
- [ ] Provide opt-out options
- [ ] Regular security audits
- [ ] Incident response plan

## Contact

For security issues:

- **Email**: hello@creepjs.org
- **Bug Bounty**: (Coming soon)

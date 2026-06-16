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

- **Token Authentication**: All requests require valid API tokens
- **Rate Limiting**: 1000 requests/day/token to prevent abuse
- **IP Blocking**: Automatically block suspicious IPs
- **HTTPS Only**: Encrypted transmission
- **Request IDs + Structured Logs**: every API response includes `X-Request-Id`
  and emits structured request/error logs
- **Production CORS default**: if `CORS_ORIGIN` is not explicitly set in
  production, the API falls back to `https://creepjs.org` instead of `*`

### Data Storage

- **No Long-term Storage**: Don't persistently store raw fingerprint data
- **Hash Only**: Only store hashed fingerprint IDs
- **Encrypted Transmission**: All data transmitted over HTTPS
- **Access Control**: Strict access controls on servers

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

| Data item                                  | Where it exists                 | Code path                                                                                                   | Retention / guardrail                                                                    |
| ------------------------------------------ | ------------------------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| API token email, `createdAt`, `usageCount` | Cloudflare KV `TOKENS`          | `apps/api/src/routes/token.ts`, `apps/api/src/middleware/auth.ts`, `apps/api/src/routes/fingerprint.ts`     | Operational token record only; no browser fingerprint payload stored with it             |
| Per-token and public rate-limit counters   | Cloudflare KV `RATE_LIMIT`      | `apps/api/src/middleware/ratelimit.ts`, `apps/api/src/routes/ip.ts`, `apps/api/src/routes/token.ts`         | Time-window counters only                                                                |
| IP intelligence cache                      | Cloudflare KV `IP_CACHE`        | `apps/api/src/services/ipbot.ts`, `apps/api/src/routes/myip.ts`                                             | Transient cache; no credential values exposed                                            |
| Uniqueness baseline buckets                | Cloudflare KV `FP_STATS`        | `apps/api/src/services/uniqueness.ts`, `apps/api/src/routes/fingerprint.ts`, `apps/api/src/routes/stats.ts` | Aggregate hashed coarse buckets only; k-anonymity suppression below threshold            |
| Analytics event payloads                   | Cloudflare Web Analytics beacon | `apps/web/src/components/Analytics.tsx`, `apps/web/src/lib/analytics.ts`                                    | No email, fingerprint ID, raw fingerprint payload, or IP lookup body sent; DNT respected |
| Homepage/checker local fingerprint history | Browser `localStorage`          | `apps/web/src/components/UniquenessAnalysis.tsx`, `apps/web/src/components/FingerprintHistory.tsx`          | Browser-local only; never posted back by these components                                |
| SDK cache                                  | Browser `localStorage`          | `packages/sdk/src/index.ts`                                                                                 | Cached API response only; cleared by TTL or `clearCache()`                               |

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

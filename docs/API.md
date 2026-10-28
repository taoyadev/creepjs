# API Reference

## Basic Information

### Base URL

```
Production: https://api.creepjs.org
Development: http://localhost:8787
```

**Optional Fields (Advanced Collectors)**:

- Graphics: `canvas`, `webgl`, `svg`, `domRect`, `textMetrics`
- Locale: `languages`, `timezone`, `dateTimeLocale`, `relativeTimeFormat`, `displayNames`
- Hardware/Env: `screenFrame`, `screenResolution`, `colorDepth`, `audio`, `webrtc`, `serviceWorker`, `media`
- Platform/Storage: `localStorage`, `sessionStorage`, `indexedDB`, `openDatabase`, `cookiesEnabled`, `plugins`, `applePay`, `privateClickMeasurement`
- Accessibility: `reducedMotion`, `reducedTransparency`, `forcedColors`, `HDR`, `contrast`, `invertedColors`
- Integrity: `resistance`, `lies`, `consoleErrors`, `contentWindow`

### Authentication

All authenticated endpoints require an API Token in the request header:

```http
X-API-Token: cfp_your_token_here
```

### Response Format

All responses are in JSON format with a standard structure:

```typescript
// Success Response
{
  "data": { ... },
  "timestamp": 1704816000000
}

// Error Response
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { ... }  // Optional
}
```

### HTTP Status Codes

| Status Code | Description                             |
| ----------- | --------------------------------------- |
| 200         | Success                                 |
| 400         | Bad Request (Invalid parameters)        |
| 401         | Unauthorized (Invalid or missing token) |
| 413         | Payload Too Large                       |
| 429         | Too Many Requests (Rate limit exceeded) |
| 500         | Internal Server Error                   |
| 502         | IP intelligence provider failure        |
| 503         | IP intelligence temporarily unavailable |

## Endpoint Details

### 1. Generate Fingerprint

Generate a unique browser fingerprint ID.

**Endpoint**: `POST /v1/fingerprint`

**Authentication**: Required

**Rate Limit**: 1000 requests/day, shared by every token issued to the same
email address (requesting more tokens does not raise the allowance)

#### Request

**Headers**:

```http
Content-Type: application/json
X-API-Token: cfp_your_token_here
```

**Body** (produced by `@creepjs/core.collectFingerprint()`; at most 128 KiB,
larger bodies get `413` before authentication):

```jsonc
{
  "fingerprintId": "fpr_123",
  "data": {
    "canvas": { "hash": "hash", "dataURL": "data:,..." },
    "screen": {
      "width": 1920,
      "height": 1080,
      "screenFrame": { "top": 0, "right": 0, "bottom": 40, "left": 0 }
    },
    "plugins": [
      { "name": "PDF Viewer", "description": "", "mimeTypes": [{ "type": "application/pdf", "suffixes": "pdf" }] }
    ],
    "serviceWorker": { "supported": true, "controller": false, "ready": false, "hash": "...", "features": { ... } }
  },
  "timestamp": 1700000000000,
  "confidence": 0.92,
  "collectors": {
    "canvas": { "status": "success", "duration": 4.12 },
    "audioBaseLatency": { "status": "error", "duration": 1.05, "error": "AudioContext not supported" }
  },
  "timings": {
    "canvas": 4.12,
    "audioBaseLatency": 1.05,
    "total": 57.81
  }
}
```

> 💡 The request body mirrors the `FingerprintResult` returned by the SDK/core package to guarantee end-to-end parity.

#### Response

**Success (200)**:

```json
{
  "fingerprintId": "3mK9vN2Lx8pQ",
  "data": {
    "canvas": { "hash": "hash" },
    "screenFrame": { "top": 0, "right": 0, "bottom": 32, "left": 0 },
    "plugins": [],
    "lies": {
      "hash": "...",
      "liesCount": 0,
      "trustScore": 100,
      "lies": {},
      "inconsistencies": []
    }
  },
  "confidence": 0.95,
  "timestamp": 1704816000000,
  "collectors": {
    "canvas": { "status": "success", "duration": 4.12 },
    "domBlockers": {
      "status": "success",
      "duration": 0.21,
      "value": { "detected": [] }
    },
    "audioBaseLatency": {
      "status": "error",
      "duration": 1.05,
      "error": "AudioContext not supported"
    }
  },
  "timings": {
    "canvas": 4.12,
    "domBlockers": 0.21,
    "audioBaseLatency": 1.05,
    "total": 57.81
  }
}
```

**Response Field Descriptions**:

| Field           | Type   | Description                                                               |
| --------------- | ------ | ------------------------------------------------------------------------- |
| `fingerprintId` | string | Unique fingerprint ID (12-16 characters)                                  |
| `data`          | object | Full `FingerprintData` map (40+ optional collectors)                      |
| `confidence`    | number | Coverage ratio (0-1), representing the share of collectors that succeeded |
| `timestamp`     | number | Server timestamp (milliseconds)                                           |
| `collectors`    | object | Each collector's `status/duration/value/error` for UI transparency        |
| `timings`       | object | Collector execution times (ms), includes `total`                          |

**Error Response Examples**:

```json
// 400 Bad Request
{
  "error": "Invalid request body",
  "details": [
    {
      "path": ["data", "canvas", "hash"],
      "message": "Invalid input: expected string, received undefined"
    }
  ]
}

// 401 Unauthorized
{
  "error": "Invalid API token",
  "code": "INVALID_TOKEN"
}

// 429 Too Many Requests
{
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "resetAt": "2025-01-10T00:00:00Z"
}
```

#### Example Code

**cURL**:

```bash
curl -X POST https://api.creepjs.org/v1/fingerprint \
  -H "Content-Type: application/json" \
  -H "X-API-Token: cfp_your_token_here" \
  -d '{
    "components": {
      "canvas": "data:image/png;base64,...",
      "navigator": {
        "userAgent": "Mozilla/5.0...",
        "language": "en-US",
        "platform": "MacIntel"
      }
    }
  }'
```

**JavaScript (Fetch)**:

```javascript
const response = await fetch('https://api.creepjs.org/v1/fingerprint', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Token': 'cfp_your_token_here',
  },
  body: JSON.stringify({
    components: {
      canvas: canvasDataUrl,
      webgl: webglInfo,
      navigator: navigatorInfo,
    },
  }),
});

const data = await response.json();
console.log(data.fingerprintId); // "3mK9vN2Lx8pQ"
```

**Python (requests)**:

```python
import requests

response = requests.post(
    'https://api.creepjs.org/v1/fingerprint',
    headers={
        'Content-Type': 'application/json',
        'X-API-Token': 'cfp_your_token_here',
    },
    json={
        'components': {
            'navigator': {
                'userAgent': 'Mozilla/5.0...',
                'language': 'en-US',
                'platform': 'MacIntel',
            }
        }
    }
)

data = response.json()
print(data['fingerprintId'])  # 3mK9vN2Lx8pQ
```

---

### 2. Get API Token

Generate a new API Token for authentication.

**Endpoint**: `POST /v1/token`

**Authentication**: Not required

**CORS**: browser requests are accepted only from the site origin
(`CORS_ORIGIN`); server-side calls are unaffected.

**Limits** (all daily):

- 10 requests per client IP (IPv6 counted per /64).
- 3 tokens per email address. Sub-addressing (`you+tag@`) and Gmail dots
  resolve to the same address, so they share that limit.
- A cap on tokens issued across all requesters (`TOKEN_MINT_DAILY_GLOBAL`,
  default 100).

Addresses are not verified. Every token of one address shares that address's
daily request allowance (see [Rate Limiting](#rate-limiting)), so extra tokens
add no capacity. Tokens do not expire.

#### Request

```http
POST /v1/token
Content-Type: application/json

{ "email": "hello@creepjs.org" }
```

#### Response

**Success (200)**:

```json
{
  "token": "cfp_3hY8Qm2LxR7bNc4Vt9KpW1sZ",
  "email": "hello@creepjs.org",
  "createdAt": 1767225600000
}
```

| Field       | Type   | Description                                 |
| ----------- | ------ | ------------------------------------------- |
| `token`     | string | API token: `cfp_` plus 24 base62 characters |
| `email`     | string | The address the token is registered to      |
| `createdAt` | number | Issue time, in milliseconds since the epoch |

**Errors**:

| Status | When                                                            |
| ------ | --------------------------------------------------------------- |
| `400`  | `email` is missing or not a valid address                       |
| `429`  | This IP or this address has reached its daily limit             |
| `503`  | The daily issuance cap is reached; existing tokens keep working |

`429` and `503` bodies are `{ "error": "<message>" }`.

#### Example Code

**cURL**:

```bash
curl -X POST https://api.creepjs.org/v1/token \
  -H "Content-Type: application/json" \
  -d '{"email":"hello@creepjs.org"}'
```

**JavaScript** (server-side; browsers can call it only from the site origin):

```javascript
const response = await fetch('https://api.creepjs.org/v1/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'hello@creepjs.org' }),
});
const { token } = await response.json();
```

---

### 3. Batch IP Lookup

Resolve up to 50 IP literals in one authenticated, serial request.

**Endpoint**: `POST /v1/ip/batch`

**Authentication**: Required

**Body limit**: 8 KiB

**Quota**: One lookup unit per unique syntactically valid IP, including cache
hits. An invalid-only accepted batch costs one abuse-prevention unit. The
complete cost is reserved before any lookup; if it does not fit, the API
returns `429` and contacts no upstream provider.

#### Request

```http
POST /v1/ip/batch
Content-Type: application/json
X-API-Token: cfp_your_token_here
```

```json
{
  "ips": ["8.8.8.8", "2001:4860:4860::8888", "not-an-ip"]
}
```

Each entry is trimmed and must contain 1–45 characters. Duplicate normalized
values are resolved once, with first-seen order preserved. Bounded malformed
IP strings return item-level validation rows; malformed envelopes, empty
entries, oversized entries, more than 50 entries, and bodies over 8 KiB are
rejected before quota reservation.

#### Complete response

```json
{
  "count": 3,
  "submittedCount": 3,
  "uniqueCount": 3,
  "validCount": 2,
  "successCount": 2,
  "invalidCount": 1,
  "failedCount": 1,
  "skippedCount": 0,
  "cachedCount": 0,
  "highRiskCount": 0,
  "quotaCost": 2,
  "aborted": false,
  "results": [
    {
      "ip": "8.8.8.8",
      "ok": true,
      "outcome": "success",
      "cached": false,
      "highRisk": false,
      "data": {}
    },
    {
      "ip": "2001:4860:4860::8888",
      "ok": true,
      "outcome": "success",
      "cached": false,
      "highRisk": false,
      "data": {}
    },
    {
      "ip": "not-an-ip",
      "ok": false,
      "outcome": "invalid",
      "status": 400,
      "error": "Invalid IP address"
    }
  ]
}
```

#### Dependency failure behavior

Lookups run serially with at most one retry. Provider throttling,
configuration/authentication failure, network failure, or provider `5xx`
aborts later valid lookups.

- If at least one lookup succeeded, the API returns `200` with
  `aborted: true`, a safe `abortedReason`, optional `retryAfter`, the failed
  row, and explicit `skipped` rows.
- If the first attempted lookup fails, the API returns request-level `429`,
  `502`, or `503` and makes no later provider calls.
- Provider response bodies are never relayed. `Retry-After` is propagated when
  available.

#### Shared daily capacity

Token-authenticated lookups (`GET /v1/ip/:ip` and this batch endpoint) share
one daily cap on uncached upstream lookups across all tokens
(`TOKEN_IP_DAILY_GLOBAL`, default 10,000). Cache hits do not count against it.

- `GET /v1/ip/:ip` returns `503` with `{ "error": ... }` once the cap is
  reached, and the request does not count toward the caller's daily quota.
- In a batch, rows after the cap is reached are returned as `skipped` with
  `abortedReason: "capacity"`, and their lookup units are refunded. If no row
  was looked up, the response is a request-level `503`.

Daily quota is reserved atomically per token-owning inbox (a Durable Object)
and reported in the `X-RateLimit-*` headers. The `usageCount` field in token
records is no longer updated: rewriting the token record on every request
exceeded KV's per-key write rate under load.

Submitted IPs and API tokens are never written to application logs. The `/ip`
workspace keeps tokens in memory only. A user-initiated CSV may contain result
IP rows, but never contains the token.

---

### 4. Health Check

Check API service status.

**Endpoint**: `GET /`

**Authentication**: Not required

**Rate Limit**: None

#### Response

```json
{
  "status": "ok",
  "version": "1.0.0",
  "timestamp": 1704816000000
}
```

---

### 5. Product Analytics Events

Records one product event from the CreepJS site (tool runs, docs views and a
few tracked clicks). Used by `creepjs.org` itself; it is not part of the
public SDK.

**Endpoint**: `POST /v1/events`

**Authentication**: Not required. Only the site origin (`CORS_ORIGIN`,
`https://creepjs.org` in production) is accepted; any other or missing
`Origin` gets `403`.

**Body**: at most 1 KiB, sent as `text/plain` (what `navigator.sendBeacon`
uses, so there is no CORS preflight) or `application/json`:

```json
{
  "name": "tool_run",
  "path": "/ip",
  "props": {
    "tool": "ip_lookup",
    "surface": "ip",
    "outcome": "success",
    "status": "200"
  }
}
```

- `name` must be one of the events defined in
  `packages/core/src/analytics-events.ts`.
- `path` is reduced to its pathname; query strings and fragments are never
  stored.
- `props` outside the event's allowlist are dropped. A known prop with an
  invalid value rejects the event.

#### Responses

| Status | Meaning                                                   |
| ------ | --------------------------------------------------------- |
| 204    | Event accepted (also when the analytics binding is off)   |
| 400    | Invalid JSON, unknown event, or invalid prop/path         |
| 403    | `Origin` missing or not the site origin                   |
| 413    | Body larger than 1 KiB                                    |
| 415    | `Content-Type` other than `text/plain`/`application/json` |

Accepted events are stored in Workers Analytics Engine (dataset
`creepjs_events`) without IP address, user agent, token or fingerprint ID.
See `docs/API_OBSERVABILITY.md` for the column layout and queries.

---

## Rate Limiting

### Free Tier

| Endpoint               | Limit       | Window             |
| ---------------------- | ----------- | ------------------ |
| `POST /v1/fingerprint` | 1000 units  | 24 hours           |
| `GET /v1/ip/:ip`       | 1 unit/call | shared token quota |
| `POST /v1/ip/batch`    | 1–50 units  | shared token quota |
| `POST /v1/token`       | 10 requests | 24 hours (per IP)  |

### Response Headers

All rate-limited endpoints return the following headers:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 857
X-RateLimit-Reset: 1704902400
```

| Header                  | Description                    |
| ----------------------- | ------------------------------ |
| `X-RateLimit-Limit`     | Total quota                    |
| `X-RateLimit-Remaining` | Remaining quota                |
| `X-RateLimit-Reset`     | Reset timestamp (Unix seconds) |

---

## Error Codes

| Error Code            | HTTP Status | Description                 |
| --------------------- | ----------- | --------------------------- |
| `INVALID_REQUEST`     | 400         | Invalid request body format |
| `INVALID_EMAIL`       | 400         | Invalid email format        |
| `MISSING_TOKEN`       | 401         | Missing API Token           |
| `INVALID_TOKEN`       | 401         | Token is invalid or expired |
| `RATE_LIMIT_EXCEEDED` | 429         | Rate limit quota exceeded   |
| `INTERNAL_ERROR`      | 500         | Internal server error       |

---

## SDK Usage (Recommended)

Instead of calling the API directly, we recommend using the official SDK:

### Installation

**Script tag** (recommended):

```html
<script src="https://creepjs.org/sdk.js"></script>
```

The default browser bundle is intentionally slim. It lazy-loads the full
collector bundle from `sdk.full.js` unless you override `fullBundleUrl`.

**npm** (coming soon — not yet published):

```bash
npm install @creepjs/sdk
```

### Basic Usage

**Script tag (works today)** — the bundle exposes a global `CreepJS` namespace:

```html
<script src="https://creepjs.org/sdk.js"></script>
<script>
  const client = new CreepJS.CreepJS({
    token: 'cfp_your_token_here',
    fullBundleUrl: 'https://creepjs.org/sdk.full.js',
  });

  client.getFingerprint().then((fp) => {
    console.log(fp.fingerprintId);
  });
</script>
```

**ES Modules (after npm publish)**:

```javascript
import { getFingerprint } from '@creepjs/sdk';

const fp = await getFingerprint({
  token: 'cfp_your_token_here',
});

console.log(fp.fingerprintId); // "3mK9vN2Lx8pQ"
console.log(fp.confidence); // 0.95
console.log(fp.cached); // false
```

### Advanced Configuration

```javascript
import { CreepJS } from '@creepjs/sdk';

const client = new CreepJS({
  token: 'cfp_your_token_here',
  endpoint: 'https://api.creepjs.org/v1/fingerprint', // Custom endpoint
  cache: true, // Enable caching (default)
  cacheTtl: 3600, // Cache TTL in seconds
  timeoutMs: 10000,
});

const fp = await client.getFingerprint();
const ip = await client.getIpIntelligence('8.8.8.8');
```

### SDK Configuration Options

| Option          | Type    | Default                                  | Description                                |
| --------------- | ------- | ---------------------------------------- | ------------------------------------------ |
| `token`         | string  | -                                        | API Token (required)                       |
| `endpoint`      | string  | `https://api.creepjs.org/v1/fingerprint` | Fingerprint API endpoint                   |
| `cache`         | boolean | `true`                                   | Enable LocalStorage caching                |
| `cacheTtl`      | number  | `86400`                                  | Cache TTL in seconds (max 7 days; 0 = off) |
| `timeoutMs`     | number  | `10000`                                  | Request timeout in milliseconds            |
| `fullBundleUrl` | string  | sibling `sdk.full.js`                    | Override URL for the full collector bundle |

---

## Best Practices

### 1. Cache Fingerprint Results

```javascript
// ✅ Recommended: Use SDK's built-in caching
const fp = await getFingerprint({
  token: 'cfp_xxx',
  cache: true, // Enabled by default
  cacheTtl: 3600, // 1 hour
});

// ❌ Not recommended: Request on every page load
window.addEventListener('load', async () => {
  await getFingerprint({ token: 'cfp_xxx', cache: false });
});
```

### 2. Error Handling

```javascript
try {
  const fp = await getFingerprint({ token: 'cfp_xxx' });
} catch (error) {
  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    console.error('Too many requests, please try again later');
  } else if (error.code === 'INVALID_TOKEN') {
    console.error('Invalid token, please check configuration');
  } else {
    console.error('Unknown error:', error.message);
  }
}
```

### 3. Collect Only Necessary Data

```javascript
// ✅ Recommended: Collect only core fingerprint data
const components = {
  canvas: collectCanvasFingerprint(),
  webgl: collectWebGLFingerprint(),
  navigator: {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
  },
};

// ❌ Not recommended: Collect excessive privacy-sensitive information
const components = {
  // Avoid collecting geolocation, camera, etc.
};
```

### 4. Respect User Privacy

```javascript
// Check DNT (Do Not Track)
if (navigator.doNotTrack === '1') {
  console.log('User prefers not to be tracked');
  // Skip fingerprint collection
}
```

---

## Performance Benchmarks

| Metric                      | Target  |
| --------------------------- | ------- |
| API Response Time (p50)     | < 50ms  |
| API Response Time (p95)     | < 100ms |
| API Response Time (p99)     | < 200ms |
| SDK Bundle Size (gzipped)   | < 15KB  |
| SDK Initialization Time     | < 10ms  |
| Fingerprint Collection Time | < 100ms |

---

## Frequently Asked Questions (FAQ)

### Q: Will the fingerprint ID change?

**A**: The ID may change in the following scenarios:

- User switches browsers
- User switches devices
- User clears browser data
- Browser updates cause rendering changes
- User installs/uninstalls fonts

Under normal circumstances, the fingerprint ID remains stable for the same device and browser.

### Q: How to improve fingerprint uniqueness?

**A**: Collect more dimensions of data:

```javascript
const components = {
  canvas: collectCanvasFingerprint(),
  webgl: collectWebGLFingerprint(),
  navigator: collectNavigatorInfo(),
  screen: collectScreenInfo(),
  fonts: collectInstalledFonts(), // Add font detection
};
```

### Q: Is this GDPR compliant?

**A**: We provide privacy-friendly options:

1. Clearly inform users about fingerprint collection
2. Provide opt-out options (respect DNT)
3. Don't persistently store raw fingerprint data
4. Provide data deletion mechanisms

For specific compliance requirements, please consult legal counsel.

### Q: What if the free quota is insufficient?

**A**: The MVP free quota is 1000 requests/day. For higher quotas, please contact us for upgrade plans (future feature).

### Q: Does it support server-side calls?

**A**: Yes, but please note:

- Servers cannot collect browser fingerprint data (Canvas/WebGL, etc.)
- Client must collect data first, then pass to server
- Server can call API for fingerprint generation

---

## Changelog

### v1.0.0 (2025-01-09)

- 🎉 Initial release
- ✅ Basic fingerprint generation support
- ✅ Token authentication
- ✅ Rate limiting protection
- ✅ JavaScript SDK

---

## Support & Feedback

- **Documentation**: https://creepjs.org/docs
- **GitHub**: https://github.com/taoyadev/creepjs/issues
- **Email**: hello@creepjs.org

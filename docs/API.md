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
| 429         | Too Many Requests (Rate limit exceeded) |
| 500         | Internal Server Error                   |

## Endpoint Details

### 1. Generate Fingerprint

Generate a unique browser fingerprint ID.

**Endpoint**: `POST /v1/fingerprint`

**Authentication**: Required

**Rate Limit**: 1000 requests/day/token

#### Request

**Headers**:

```http
Content-Type: application/json
X-API-Token: cfp_your_token_here
```

**Body** (produced by `@creepjs/core.collectFingerprint()`):

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
  "code": "INVALID_REQUEST",
  "details": [
    {
      "path": ["components", "canvas"],
      "message": "Expected string, received undefined"
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

**Endpoint**: `GET /v1/token`

**Authentication**: Not required

**Rate Limit**: 10 requests/day/IP

#### Request

**Query Parameters**:

| Parameter | Type   | Required | Description         |
| --------- | ------ | -------- | ------------------- |
| `email`   | string | Yes      | Valid email address |

**Example**:

```http
GET /v1/token?email=hello@creepjs.org
```

#### Response

**Success (200)**:

```json
{
  "token": "cfp_a1b2c3d4e5f6g7h8",
  "quota": "1000/day",
  "expiresAt": null
}
```

**Response Field Descriptions**:

| Field       | Type           | Description                                          |
| ----------- | -------------- | ---------------------------------------------------- |
| `token`     | string         | API Token (starts with `cfp_`)                       |
| `quota`     | string         | Daily quota limit                                    |
| `expiresAt` | string \| null | Expiration time (ISO 8601), null means never expires |

**Error Response Examples**:

```json
// 400 Bad Request
{
  "error": "Valid email required",
  "code": "INVALID_EMAIL"
}

// 429 Too Many Requests
{
  "error": "Too many token requests from this IP",
  "code": "RATE_LIMIT_EXCEEDED",
  "resetAt": "2025-01-10T00:00:00Z"
}
```

#### Example Code

**cURL**:

```bash
curl -X GET "https://api.creepjs.org/v1/token?email=hello@creepjs.org"
```

**JavaScript**:

```javascript
const email = 'hello@creepjs.org';
const response = await fetch(
  `https://api.creepjs.org/v1/token?email=${encodeURIComponent(email)}`
);
const data = await response.json();
console.log(data.token); // "cfp_a1b2c3d4e5f6g7h8"
```

---

### 3. Health Check

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

## Rate Limiting

### Free Tier

| Endpoint               | Limit         | Window            |
| ---------------------- | ------------- | ----------------- |
| `POST /v1/fingerprint` | 1000 requests | 24 hours          |
| `GET /v1/token`        | 10 requests   | 24 hours (per IP) |

### Response Headers

All rate-limited endpoints return the following headers:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 857
X-RateLimit-Reset: 1704902400000
```

| Header                  | Description                    |
| ----------------------- | ------------------------------ |
| `X-RateLimit-Limit`     | Total quota                    |
| `X-RateLimit-Remaining` | Remaining quota                |
| `X-RateLimit-Reset`     | Reset timestamp (milliseconds) |

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

**NPM**:

```bash
npm install @creepjs/sdk
```

**CDN** (UMD):

```html
<script src="https://cdn.creepjs.org/v1/sdk.js"></script>
```

### Basic Usage

```javascript
// ES Modules
import { getFingerprint } from '@creepjs/sdk';

const fp = await getFingerprint({
  token: 'cfp_your_token_here',
});

console.log(fp.fingerprintId); // "3mK9vN2Lx8pQ"
console.log(fp.confidence); // 0.95
console.log(fp.cached); // false
```

**UMD (Browser)**:

```html
<script src="https://cdn.creepjs.org/v1/sdk.js"></script>
<script>
  CreepJS.getFingerprint({
    token: 'cfp_your_token_here',
  }).then((fp) => {
    console.log(fp.fingerprintId);
  });
</script>
```

### Advanced Configuration

```javascript
import { CreepJS } from '@creepjs/sdk';

const client = new CreepJS({
  token: 'cfp_your_token_here',
  endpoint: 'https://api.creepjs.org', // Custom endpoint
  cache: true, // Enable caching (default)
  cacheTtl: 3600, // Cache TTL (seconds)
});

const fp = await client.getFingerprint();
```

### SDK Configuration Options

| Option     | Type    | Default                   | Description                 |
| ---------- | ------- | ------------------------- | --------------------------- |
| `token`    | string  | -                         | API Token (required)        |
| `endpoint` | string  | `https://api.creepjs.org` | API endpoint                |
| `cache`    | boolean | `true`                    | Enable LocalStorage caching |
| `cacheTtl` | number  | `3600`                    | Cache TTL (seconds)         |

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

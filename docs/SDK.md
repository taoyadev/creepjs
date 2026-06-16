# SDK Guide

## Installation

### NPM

```bash
npm install @creepjs/sdk
```

### Yarn

```bash
yarn add @creepjs/sdk
```

### pnpm

```bash
pnpm add @creepjs/sdk
```

### CDN (UMD)

```html
<script src="https://cdn.creepjs.org/v1/sdk.js"></script>
```

The default browser bundle is intentionally slim. It lazy-loads the full
collector bundle on first fingerprint request from the sibling path
`sdk.full.js` unless you override `fullBundleUrl`.

## Quick Start

### ES Modules

```javascript
import { getFingerprint } from '@creepjs/sdk';

const result = await getFingerprint({
  token: 'cfp_your_token_here',
});

console.log(result.fingerprintId); // "3mK9vN2Lx8pQ"
console.log(result.confidence); // 0.95
console.log(result.cached); // false
```

### CommonJS

```javascript
const { getFingerprint } = require('@creepjs/sdk');

getFingerprint({
  token: 'cfp_your_token_here',
}).then((result) => {
  console.log(result.fingerprintId);
});
```

### UMD (Browser)

```html
<script src="https://cdn.creepjs.org/v1/sdk.js"></script>
<script>
  const client = new CreepJS.CreepJS({
    token: 'cfp_your_token_here',
    fullBundleUrl: 'https://cdn.creepjs.org/v1/sdk.full.js',
  });

  client.getFingerprint().then((result) => {
    console.log('Fingerprint:', result.fingerprintId);
  });
</script>
```

## API Reference

### `getFingerprint(options)`

Generate browser fingerprint.

**Parameters**:

| Parameter       | Type    | Required | Default                   | Description                                |
| --------------- | ------- | -------- | ------------------------- | ------------------------------------------ |
| `token`         | string  | Yes      | -                         | API Token                                  |
| `endpoint`      | string  | No       | `https://api.creepjs.org` | API endpoint                               |
| `cache`         | boolean | No       | `true`                    | Enable caching                             |
| `cacheTtl`      | number  | No       | `86400000`                | Cache TTL (milliseconds)                   |
| `timeoutMs`     | number  | No       | `10000`                   | Request timeout in milliseconds            |
| `fullBundleUrl` | string  | No       | sibling `sdk.full.js`     | Override URL for the full collector bundle |

**Returns**: `Promise<FingerprintResult>`

```typescript
interface FingerprintResult {
  fingerprintId: string; // Unique fingerprint ID
  data: FingerprintData; // 40+ optional collectors
  confidence: number; // Successful collector ratio (0-1)
  collectors?: Record<string, CollectorSummary>;
  timings?: CollectorTimings; // Per-collector durations + total
  timestamp: number; // Timestamp (ms)
  cached?: boolean; // From cache?
}
```

> Refer to `@creepjs/core` for the exhaustive `FingerprintData` and collector telemetry types.

**Example**:

```javascript
const result = await getFingerprint({
  token: 'cfp_xxx',
  cache: true,
  cacheTtl: 7200, // 2 hours
});
```

### `CreepJS` Class

Advanced usage with class instantiation.

```javascript
import { CreepJS } from '@creepjs/sdk';

const client = new CreepJS({
  token: 'cfp_your_token_here',
  endpoint: 'https://api.creepjs.org/v1/fingerprint',
  cache: true,
  cacheTtl: 3600,
  timeoutMs: 10000,
});

// Get fingerprint
const fp = await client.getFingerprint();

// Query IP intelligence
const ip = await client.getIpIntelligence('8.8.8.8');

// Clear cache
client.clearCache();
```

## Configuration

### Cache Settings

```javascript
// Enable caching (default)
const fp = await getFingerprint({
  token: 'cfp_xxx',
  cache: true, // Use localStorage
  cacheTtl: 3600, // 1 hour
});

// Disable caching
const fp = await getFingerprint({
  token: 'cfp_xxx',
  cache: false, // Always fetch fresh
});
```

### Custom Endpoint

```javascript
// Use custom API endpoint
const fp = await getFingerprint({
  token: 'cfp_xxx',
  endpoint: 'https://your-custom-api.com',
});
```

## Error Handling

```javascript
try {
  const fp = await getFingerprint({ token: 'cfp_xxx' });
} catch (error) {
  if (error.code === 'api_error') {
    console.error('API request failed:', error.status);
  } else if (error.code === 'request_timeout') {
    console.error('Request timed out');
  } else if (error.code === 'core_load_failed') {
    console.error('Could not load the full collector bundle');
  } else if (error.code === 'invalid_response') {
    console.error('The API returned an invalid response');
  } else {
    console.error('Unknown error:', error.message);
  }
}
```

### Error Codes

| Code               | Description                                              |
| ------------------ | -------------------------------------------------------- |
| `api_error`        | API returned a non-2xx response                          |
| `request_timeout`  | Request exceeded `timeoutMs`                             |
| `core_load_failed` | The slim bundle could not load the full collector bundle |
| `invalid_response` | The API returned an invalid payload                      |

## Advanced Usage

### TypeScript

```typescript
import { getFingerprint, FingerprintResult } from '@creepjs/sdk';

async function identifyUser(): Promise<string> {
  const result: FingerprintResult = await getFingerprint({
    token: process.env.CREEPJS_TOKEN!,
  });

  return result.fingerprintId;
}
```

### React

```tsx
import { useEffect, useState } from 'react';
import { getFingerprint } from '@creepjs/sdk';

function App() {
  const [fingerprintId, setFingerprintId] = useState<string>('');

  useEffect(() => {
    getFingerprint({ token: 'cfp_xxx' })
      .then((result) => setFingerprintId(result.fingerprintId))
      .catch(console.error);
  }, []);

  return <div>Fingerprint: {fingerprintId}</div>;
}
```

### Vue

```vue
<script setup>
import { ref, onMounted } from 'vue';
import { getFingerprint } from '@creepjs/sdk';

const fingerprintId = ref('');

onMounted(async () => {
  const result = await getFingerprint({ token: 'cfp_xxx' });
  fingerprintId.value = result.fingerprintId;
});
</script>

<template>
  <div>Fingerprint: {{ fingerprintId }}</div>
</template>
```

### Engine Performance Controls

Need tighter control over how the collectors run? Call `collectFingerprint` directly with concurrency/idle overrides before sending the payload:

```ts
import { collectFingerprint } from '@creepjs/core';

const fingerprint = await collectFingerprint({
  concurrency: 4, // parallel workers (auto-tuned by default)
  idleDelay: 8, // ms to yield between tasks
});
```

You can still forward the result to the SDK/API afterwards—the payload stays identical. See [`docs/PERFORMANCE.md`](./PERFORMANCE.md) for deeper profiling tips.

## Best Practices

### 1. Cache Results

```javascript
// ✅ Good: Use caching
const fp = await getFingerprint({
  token: 'cfp_xxx',
  cache: true,
  cacheTtl: 3600,
});

// ❌ Bad: No caching
const fp = await getFingerprint({
  token: 'cfp_xxx',
  cache: false,
});
```

### 2. Error Handling

```javascript
// ✅ Good: Proper error handling
try {
  const fp = await getFingerprint({ token: 'cfp_xxx' });
  sendToBackend(fp.fingerprintId);
} catch (error) {
  logError(error);
  showUserMessage('Failed to identify browser');
}
```

### 3. Respect Privacy

```javascript
// Check Do Not Track
if (navigator.doNotTrack === '1') {
  console.log('User opted out of tracking');
  // Skip fingerprinting
} else {
  const fp = await getFingerprint({ token: 'cfp_xxx' });
}
```

## Browser Support

| Browser | Version |
| ------- | ------- |
| Chrome  | 80+     |
| Firefox | 75+     |
| Safari  | 13+     |
| Edge    | 80+     |
| Opera   | 67+     |

## Changelog

### v1.0.0

- Initial release
- Basic fingerprint generation
- LocalStorage caching
- TypeScript support

## Support

- **Documentation**: https://creepjs.org/docs
- **GitHub**: https://github.com/taoyadev/creepjs
- **Email**: hello@creepjs.org

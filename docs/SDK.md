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

## Quick Start

### ES Modules

```javascript
import { getFingerprint } from '@creepjs/sdk';

const result = await getFingerprint({
  token: 'cfp_your_token_here',
});

console.log(result.fingerprintId); // "3mK9vN2Lx8pQ"
console.log(result.confidence);     // 0.95
console.log(result.cached);         // false
```

### CommonJS

```javascript
const { getFingerprint } = require('@creepjs/sdk');

getFingerprint({
  token: 'cfp_your_token_here',
}).then(result => {
  console.log(result.fingerprintId);
});
```

### UMD (Browser)

```html
<script src="https://cdn.creepjs.org/v1/sdk.js"></script>
<script>
  CreepJS.getFingerprint({
    token: 'cfp_your_token_here',
  }).then(result => {
    console.log('Fingerprint:', result.fingerprintId);
  });
</script>
```

## API Reference

### `getFingerprint(options)`

Generate browser fingerprint.

**Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `token` | string | Yes | - | API Token |
| `endpoint` | string | No | `https://api.creepjs.org` | API endpoint |
| `cache` | boolean | No | `true` | Enable caching |
| `cacheTtl` | number | No | `3600` | Cache TTL (seconds) |

**Returns**: `Promise<FingerprintResult>`

```typescript
interface FingerprintResult {
  fingerprintId: string;    // Unique fingerprint ID
  confidence: number;        // Confidence (0-1)
  uniqueness: number;        // Uniqueness score (0-1)
  timestamp: number;         // Timestamp (ms)
  cached: boolean;           // From cache?
}
```

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
  endpoint: 'https://api.creepjs.org',
  cache: true,
  cacheTtl: 3600,
});

// Get fingerprint
const fp = await client.getFingerprint();

// Clear cache
client.clearCache();
```

## Configuration

### Cache Settings

```javascript
// Enable caching (default)
const fp = await getFingerprint({
  token: 'cfp_xxx',
  cache: true,      // Use localStorage
  cacheTtl: 3600,   // 1 hour
});

// Disable caching
const fp = await getFingerprint({
  token: 'cfp_xxx',
  cache: false,  // Always fetch fresh
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
  if (error.code === 'INVALID_TOKEN') {
    console.error('Invalid API token');
  } else if (error.code === 'RATE_LIMIT_EXCEEDED') {
    console.error('Rate limit exceeded');
  } else if (error.code === 'NETWORK_ERROR') {
    console.error('Network error, please try again');
  } else {
    console.error('Unknown error:', error.message);
  }
}
```

### Error Codes

| Code | Description |
|------|-------------|
| `INVALID_TOKEN` | Invalid API token |
| `RATE_LIMIT_EXCEEDED` | Rate limit exceeded |
| `NETWORK_ERROR` | Network connection failed |
| `INVALID_RESPONSE` | Invalid API response |
| `BROWSER_NOT_SUPPORTED` | Browser not supported |

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
      .then(result => setFingerprintId(result.fingerprintId))
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
|---------|---------|
| Chrome | 80+ |
| Firefox | 75+ |
| Safari | 13+ |
| Edge | 80+ |
| Opera | 67+ |

## Changelog

### v1.0.0
- Initial release
- Basic fingerprint generation
- LocalStorage caching
- TypeScript support

## Support

- **Documentation**: https://creepjs.org/docs
- **GitHub**: https://github.com/taoyadev/creepjs
- **Email**: support@creepjs.org

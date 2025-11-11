# Vendor Fingerprinting

Detects browser vendor via `navigator.vendor`, identifying browser manufacturer.

## API

```javascript
const vendor = navigator.vendor;
// "Google Inc." (Chrome), "Apple Computer, Inc." (Safari), "" (Firefox)
```

## Values

- **Chrome/Edge**: `"Google Inc."`
- **Safari**: `"Apple Computer, Inc."`
- **Firefox**: `""` (empty string)
- **Opera**: `"Opera Software ASA"`

**Entropy**: 1-1.5 bits (only 4-5 common values)

## Use

Combined with User Agent for browser detection and feature compatibility.

**Privacy**: Low risk alone, but part of larger fingerprint.

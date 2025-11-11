# OS CPU Fingerprinting

Detects OS and CPU info via `navigator.oscpu` (Firefox-only, deprecated).

## API

```javascript
const oscpu = navigator.oscpu; 
// Firefox: "Windows NT 10.0; Win64; x64"
// Other browsers: undefined
```

## Status

**Firefox-only**: Other browsers don't implement
**Deprecated**: Firefox plans to remove for privacy

**Entropy**: 2-3 bits (in Firefox only)

## Information Revealed

- Windows version (10, 11)
- Architecture (x64, ARM)
- Linux distribution hints

## Privacy

Firefox-specific identifier. Reveals OS version precisely.

**Mitigation**: Use User Agent Switcher or Tor

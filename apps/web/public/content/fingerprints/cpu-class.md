# CPU Class Fingerprinting

Detects CPU class via deprecated `navigator.cpuClass` (IE-only, obsolete).

## API

```javascript
const cpuClass = navigator.cpuClass; // IE only, returns undefined in modern browsers
```

## Status

**Deprecated**: Internet Explorer only
**Modern browsers**: Return `undefined`

**Entropy**: 0 bits (not implemented)

## Historical Values

- `"x86"` - 32-bit Intel/AMD
- `"x64"` - 64-bit Intel/AMD  
- `"ARM"` - ARM processors

**Legacy**: Used for browser detection in IE era (pre-2015)

## Modern Alternative

Use `navigator.platform` or User Agent parsing instead.

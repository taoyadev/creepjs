# WebSQL/OpenDatabase Fingerprinting

Detects deprecated WebSQL database support via `openDatabase()` API.

## API

```javascript
const hasWebSQL = 'openDatabase' in window;
```

## Status

**Deprecated**: Removed from web standards in 2010
**Support**:
- Chrome/Safari: Still supported (legacy)
- Firefox: Never supported
- Edge: Removed in Chromium version

**Entropy**: 0.5 bits (roughly 50/50 split)

## Browser Detection

- `true` → Chrome/Safari/old Edge
- `false` → Firefox/modern Edge/other

## Privacy

Minimal risk (deprecated). Mainly useful for browser identification.

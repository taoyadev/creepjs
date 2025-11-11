# IndexedDB Fingerprinting

Detects IndexedDB support and quota, revealing storage capabilities and privacy mode.

## API

```javascript
const hasIndexedDB = 'indexedDB' in window;
const quota = await navigator.storage?.estimate();
// { quota: 100GB, usage: 50MB } or undefined in private mode
```

## Detection

**Presence**: 99%+ modern browsers support
**Quota**: Varies (1GB-unlimited based on device storage)

**Entropy**: 0.5-1 bit (quota size), 2+ bits if combined with usage patterns

## Privacy Mode Detection

- **Incognito**: IndexedDB disabled or limited quota (e.g., 0MB)
- **Private**: Some browsers allow with auto-cleanup

## Privacy Risk

- Storage quota reveals device storage capacity
- Usage patterns can track user across sessions
- Private mode detectable → defeats purpose

**Mitigation**: Brave/Tor disable or limit heavily in private mode

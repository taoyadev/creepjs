# Plugins Fingerprinting

Detects installed browser plugins via `navigator.plugins` (deprecated in modern browsers).

## Legacy API

```javascript
const plugins = Array.from(navigator.plugins).map(p => p.name);
// ["Chrome PDF Plugin", "Widevine CDM", ...]
```

## Modern Status

**Chrome 87+**: Returns only PDF, Flash (if enabled)
**Firefox 91+**: Reduced to common plugins
**Safari**: Minimal list

**Why deprecated**: Major fingerprinting vector (10+ bits entropy historically)

## Privacy Win

Removing plugins API significantly reduces fingerprinting surface. Modern web uses other detection methods (feature detection, WebAssembly).

**Legacy risk**: Outdated browsers still expose full plugin list.

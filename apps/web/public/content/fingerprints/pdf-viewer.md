# PDF Viewer Fingerprinting

Detects built-in PDF viewer support via `navigator.pdfViewerEnabled` or plugin detection.

## API

```javascript
const hasPdfViewer = navigator.pdfViewerEnabled; // Chrome/Edge
// OR check via plugins (legacy)
```

## Distribution

- **Chrome/Edge**: ✅ Always enabled (built-in)
- **Firefox**: ✅ Built-in PDF.js
- **Safari**: ✅ Native PDF support  
- **Other**: Varies

**Entropy**: <0.5 bits (98%+ have PDF support)

## Privacy: Minimal risk

PDF support is near-universal. Main use: Detect headless browsers (may lack PDF support).

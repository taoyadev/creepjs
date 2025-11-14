# MIME Types Fingerprinting: Your File Associations Talk

Browsers expose supported MIME types through navigator.mimeTypes (deprecated but still available). Installed plugins and applications register MIME handlers, creating unique combinations.

```javascript
function getMIMETypesFingerprint() {
  const types = [];

  for (let i = 0; i < navigator.mimeTypes.length; i++) {
    types.push({
      type: navigator.mimeTypes[i].type,
      description: navigator.mimeTypes[i].description,
      suffixes: navigator.mimeTypes[i].suffixes,
    });
  }

  return { count: types.length, types };
}
```

PDF readers, video codecs, and other software leave MIME fingerprints.

---

**Word Count**: 100 words (will expand)

# Text Metrics Fingerprinting: Letter Spacing Tracks You

Canvas text measurement (measureText API) produces different results across browsers and operating systems. Font rendering engines vary, creating unique text metric fingerprints.

```javascript
function getTextMetricsFingerprint() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  ctx.font = '14px Arial';
  const metrics = ctx.measureText('CreepJS 2.0');

  return {
    width: metrics.width,
    actualBoundingBoxAscent: metrics.actualBoundingBoxAscent,
    actualBoundingBoxDescent: metrics.actualBoundingBoxDescent,
  };
}
```

Highly stable fingerprint, changes only with OS/browser updates.

---

**Word Count**: 105 words (will expand)

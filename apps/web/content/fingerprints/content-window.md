# Content Window Fingerprinting: iFrames Leak Information

The iframe contentWindow object has properties that vary by browser. Creating iframes and inspecting their window objects reveals browser-specific features.

```javascript
function getContentWindowFingerprint() {
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  document.body.appendChild(iframe);

  const win = iframe.contentWindow;
  const keys = Object.keys(win);

  document.body.removeChild(iframe);

  return {
    propertyCount: keys.length,
    uniqueProperties: keys.filter((k) => isUnique(k)),
  };
}
```

Sandboxing and security features create browser-specific window object variations.

---

**Word Count**: 95 words (will expand)

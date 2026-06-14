# CSS Styles Fingerprinting: Your Browser's Defaults Expose You

Every browser has default CSS styles (user agent stylesheets). These differ between Chrome, Firefox, Safari. By creating elements and measuring computed styles, websites can fingerprint your browser engine and version.

```javascript
function getCSSFingerprint() {
  const div = document.createElement('div');
  document.body.appendChild(div);

  const computed = window.getComputedStyle(div);
  const styles = {};

  ['fontFamily', 'fontSize', 'lineHeight', 'color'].forEach((prop) => {
    styles[prop] = computed[prop];
  });

  document.body.removeChild(div);
  return styles;
}
```

System fonts exposed through CSS are particularly identifying.

---

**Word Count**: 110 words (will expand)

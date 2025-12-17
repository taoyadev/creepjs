# HTML Element Fingerprinting: Your DOM Is Unique

HTMLElement.prototype properties vary by browser. Websites can enumerate all methods and properties available, creating fingerprints based on browser features.

```javascript
function getHTMLElementFingerprint() {
  const keys = Object.getOwnPropertyNames(HTMLElement.prototype);
  return {
    count: keys.length,
    hash: hashKeys(keys),
    unique: keys.filter((k) => isUniqueToThisBrowser(k)),
  };
}
```

Browser vendors add proprietary features, making this highly identifying.

---

**Word Count**: 80 words (will expand)

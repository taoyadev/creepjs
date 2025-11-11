# LocalStorage Fingerprinting

Detects localStorage availability and quota, identifying privacy modes and storage limits.

## API

```javascript
try {
  localStorage.setItem('test', '1');
  const works = localStorage.getItem('test') === '1';
  localStorage.removeItem('test');
} catch (e) {
  // Disabled, quota exceeded, or private mode
}
```

## Distribution

- **Enabled**: 98% (normal browsing)
- **Disabled**: 2% (privacy mode, security policy, or quota full)

**Entropy**: <0.3 bits (too common)

## Privacy Mode Detection

- **Safari Private**: localStorage works but auto-clears
- **Firefox Private**: 10MB quota (vs unlimited normal)
- **Chrome Incognito**: Works normally (shared across incognito tabs)

## Tracking Risk

- Can store unique IDs persistently
- Cross-domain tracking possible (with cooperation)
- Not cleared by "Clear Cookies" in all browsers

**Recommendation**: Use Tor or disable JavaScript for true privacy

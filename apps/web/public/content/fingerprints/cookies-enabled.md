# Cookies Enabled Fingerprinting

Detects cookie support via `navigator.cookieEnabled`, identifying privacy-conscious users or incognito mode.

## API

```javascript
const cookiesEnabled = navigator.cookieEnabled; // true/false
```

## Distribution

- **true**: 98%+ (normal browsing)
- **false**: <2% (privacy mode, disabled manually, or unsupported)

**Entropy**: <0.2 bits (too common)

## Privacy Signal

`false` indicates:
- Privacy-conscious user
- Incognito/private mode (some browsers)
- Corporate policy
- Accessibility tool

**Paradox**: Disabling cookies makes you more unique!

**Recommendation**: Keep cookies enabled for anonymity, use other privacy tools.

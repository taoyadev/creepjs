# Private Click Measurement Fingerprinting

Detects Apple's Private Click Measurement (PCM) API support, indicating Safari/WebKit browser.

## API

```javascript
const supportsPCM = 'attributionSourceId' in HTMLAnchorElement.prototype;
```

## Support

**Safari 14.1+**: iOS/macOS only
**Chrome/Firefox**: Not supported

**Distribution**: 15-20% (Safari market share)

**Entropy**: 0.5 bits, but **strong Safari/Apple indicator**

## Purpose

PCM is Apple's privacy-preserving ad attribution system (alternative to cookies).

## Privacy

Reveals Safari browser → Likely Apple ecosystem user.

Low privacy risk (widely supported on popular platform).

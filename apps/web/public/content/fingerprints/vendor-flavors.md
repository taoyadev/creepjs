# Vendor Flavors Fingerprinting

Detects browser engine variations via rendering quirks and vendor-specific properties.

## Detection Techniques

```javascript
const vendorFlavors = {
  isChromium: 'chrome' in window,
  isBlink: 'CSS' in window && 'supports' in CSS,
  isWebKit: 'webkitRequestAnimationFrame' in window,
  isGecko: 'mozInnerScreenX' in window,
};
```

## Browser Families

- **Chromium**: Chrome, Edge, Brave, Opera, Vivaldi
- **WebKit**: Safari (macOS/iOS only true WebKit)
- **Gecko**: Firefox
- **Presto**: Opera (legacy, pre-2013)

**Entropy**: 1.5 bits (3-4 main families)

## Privacy

Vendor detection enables targeted exploits and compatibility checks.

Low privacy risk alone, but combines with other signals.

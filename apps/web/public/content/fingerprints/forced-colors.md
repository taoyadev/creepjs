# Forced Colors Fingerprinting

Detects Windows High Contrast mode via `prefers-forced-colors` media query.

## API

```javascript
const forcedColors = matchMedia('(forced-colors: active)').matches;
```

## Support

**Windows only**: High Contrast theme in Accessibility settings
**Other OS**: Returns false

**Distribution**: 1-2% (Windows accessibility users)

**Entropy**: 0.3 bits, but **strong Windows indicator**

## Privacy

Reveals:
- Windows OS
- Visual impairment
- Accessibility needs

**Ethical**: Medical information, should not be used for fingerprinting

**Mitigation**: Don't enable unless necessary for accessibility

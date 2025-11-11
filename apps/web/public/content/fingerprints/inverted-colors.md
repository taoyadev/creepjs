# Inverted Colors Fingerprinting

Detects color inversion via `prefers-color-scheme: inverted` or system APIs.

## API

```javascript
// No standard API, but can detect via:
const filters = getComputedStyle(document.documentElement).filter;
const isInverted = filters.includes('invert');
```

## Support

**Limited**: Not standardized, platform-specific
**Mainly**: iOS "Invert Colors" accessibility feature

**Distribution**: <0.5% (rare accessibility setting)

**Entropy**: <0.2 bits

## Privacy

Reveals vision impairment or color blindness.

**Ethical**: Don't use for fingerprinting (medical info)

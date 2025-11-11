# Color Gamut Fingerprinting

Detects display color space via CSS media query `@media (color-gamut)`, revealing premium display hardware.

## How It Works

```javascript
const colorGamuts = ['srgb', 'p3', 'rec2020'].filter(gamut =>
  matchMedia(`(color-gamut: ${gamut})`).matches
);
// ["srgb", "p3"] on MacBook Pro
```

## Distribution

| Gamut | % | Devices |
|-------|---|---------|
| sRGB only | 92% | Standard displays |
| P3 | 7% | Apple devices, high-end monitors |
| Rec. 2020 | <1% | Pro displays (rare) |

**Entropy**: 0.3-0.5 bits alone, 2+ bits with 30-bit color depth

## Privacy

**P3 support** strongly indicates:
- MacBook Pro / iMac
- High-end Android phones
- Professional monitors ($1000+)
- Creative professionals

Enables socioeconomic profiling.

**Mitigation**: Tor/Brave report sRGB only.

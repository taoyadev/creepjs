# Monochrome Fingerprinting

Detects grayscale display via `prefers-color-scheme: monochrome` or bits-per-pixel check.

## API

```javascript
const monochromeLevel = matchMedia('(monochrome)').matches;
const bits = matchMedia('(monochrome: 8)').matches ? 8 : 0;
```

## Devices

- **E-ink displays**: Kindle, e-readers (monochrome)
- **Grayscale mode**: iOS/Android accessibility
- **Old displays**: Very rare

**Distribution**: <0.1% (extremely rare)

**Entropy**: <0.1 bits, but **strong device indicator**

## Privacy

Reveals:
- E-reader (unique device class)
- Accessibility need (color blindness)
- Privacy mode (some use for battery/focus)

**Mitigation**: Rare enough that detection itself is suspicious

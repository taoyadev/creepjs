# Contrast Preference Fingerprinting

Detects contrast preference via `prefers-contrast` media query.

## API

```javascript
const contrast = matchMedia('(prefers-contrast: more)').matches ? 'more' :
                 matchMedia('(prefers-contrast: less)').matches ? 'less' :
                 matchMedia('(prefers-contrast: custom)').matches ? 'custom' :
                 'no-preference';
```

## Distribution

- **No preference**: 98%
- **More**: 1.5% (vision impairment)
- **Less**: 0.3% (light sensitivity)
- **Custom**: 0.2% (advanced)

**Entropy**: 0.2-0.4 bits

## Privacy

Reveals medical/accessibility information.

**Ethical**: Should be used for accessibility, not fingerprinting

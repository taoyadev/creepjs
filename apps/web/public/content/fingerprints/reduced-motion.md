# Reduced Motion Fingerprinting

Detects animation preference via `prefers-reduced-motion` media query, revealing accessibility needs.

## API

```javascript
const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
```

## Distribution

- **No preference**: 97%
- **Reduce**: 3% (accessibility setting enabled)

**Entropy**: <0.3 bits

## Privacy Concern

**Accessibility fingerprinting**: Reveals medical condition (motion sickness, vestibular disorder, epilepsy)

**Discrimination risk**: Can be used to identify disabled users

## Mitigation

**Ethical use**: Respect setting, don't use for fingerprinting
**Browser**: Tor standardizes to default (no reduce)

**Recommendation**: Enable only if genuinely needed (e.g., motion sickness)

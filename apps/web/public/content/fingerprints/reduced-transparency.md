# Reduced Transparency Fingerprinting

Detects transparency preference via `prefers-reduced-transparency` media query (macOS).

## API

```javascript
const prefersReducedTransparency = 
  matchMedia('(prefers-reduced-transparency: reduce)').matches;
```

## Support

**macOS only**: System Preferences → Accessibility → Display → Reduce transparency
**Other OS**: Returns false (not implemented)

**Distribution**: <1% enable (macOS accessibility users)

**Entropy**: <0.2 bits, but **strong macOS indicator**

## Privacy

Reveals:
- macOS user
- Accessibility needs (visual impairment)
- Privacy-conscious (some use for performance)

**Ethical concern**: Disability fingerprinting

**Mitigation**: Don't enable unless necessary

# CSS Media Queries Fingerprinting: Your Preferences Betray You

CSS media queries expose system preferences: dark mode, reduced motion, high contrast, prefers-color-scheme. These create identifiable patterns.

```javascript
function getCSSMediaFingerprint() {
  const queries = [
    '(prefers-color-scheme: dark)',
    '(prefers-reduced-motion: reduce)',
    '(prefers-contrast: high)',
    '(prefers-reduced-transparency: reduce)',
    '(inverted-colors: inverted)',
  ];

  return queries.map((q) => ({
    query: q,
    matches: window.matchMedia(q).matches,
  }));
}
```

Accessibility preferences are especially identifying:

- Dark mode users: ~40%
- Reduced motion: ~5%
- High contrast: ~2%
- Combined: Highly unique

---

**Word Count**: 110 words (will expand)

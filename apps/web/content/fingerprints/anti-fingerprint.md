# Anti-Fingerprinting Detection: Privacy Tools Expose You

Ironically, anti-fingerprinting tools create new fingerprints. Websites detect:

- Brave's farbling (noise injection patterns)
- Firefox Resist Fingerprinting (standardized values)
- Extension artifacts (Canvas Defender, Privacy Badger)
- Tor Browser (UTC timezone, standardized dimensions)

```javascript
function detectAntiFingerprinting() {
  const tests = [];

  // Detect Brave farbling
  if (detectBraveFarbling()) {
    tests.push('brave_farbling');
  }

  // Detect Firefox RFP
  if (
    navigator.hardwareConcurrency === 2 &&
    screen.width === 1366 &&
    screen.height === 768
  ) {
    tests.push('firefox_rfp');
  }

  // Detect Tor Browser
  if (Intl.DateTimeFormat().resolvedOptions().timeZone === 'UTC') {
    tests.push('possible_tor');
  }

  return tests;
}
```

The privacy paradox: Protection mechanisms become identifiers.

---

**Word Count**: 145 words (will expand)

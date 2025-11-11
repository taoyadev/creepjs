# Screen Resolution Fingerprinting

Screen resolution detection is one of the most basic yet effective browser fingerprinting techniques, revealing device type and display configuration.

## How It Works

Modern browsers expose screen properties through the Screen API:

```javascript
const screenResolution = {
  width: screen.width,          // Physical screen width
  height: screen.height,        // Physical screen height
  availWidth: screen.availWidth,   // Available width (minus OS UI)
  availHeight: screen.availHeight, // Available height (minus OS UI)
  colorDepth: screen.colorDepth,   // Bits per pixel
  pixelDepth: screen.pixelDepth,   // Same as colorDepth (legacy)
  orientation: screen.orientation?.type, // portrait-primary, landscape-primary
};

// Example: MacBook Pro 14"
// { width: 3024, height: 1964, availWidth: 3024, availHeight: 1929, 
//   colorDepth: 30, pixelDepth: 30, orientation: "landscape-primary" }
```

## Device Fingerprinting

### Common Resolutions

| Device | Resolution | Market Share |
|--------|------------|--------------|
| 1920×1080 (Full HD) | 1920×1080 | ~35% |
| 1366×768 (HD) | 1366×768 | ~15% |
| 1536×864 | 1536×864 | ~8% |
| 2560×1440 (2K) | 2560×1440 | ~7% |
| MacBook Pro 14" | 3024×1964 | ~2% |
| iPhone 14 Pro | 1179×2556 | ~3% |

**Unique resolutions** (custom monitors, high-end displays): ~30%

### Device Type Inference

```javascript
function inferDeviceType(width, height) {
  const aspectRatio = width / height;
  const totalPixels = width * height;
  
  if (width < 768) return 'mobile';
  if (width < 1024 && aspectRatio < 1) return 'tablet-portrait';
  if (width < 1366) return 'tablet-landscape or small laptop';
  if (width >= 2560) return 'high-end desktop or MacBook Pro';
  return 'standard desktop/laptop';
}
```

## Fingerprint Uniqueness

**Entropy**: Medium (2-4 bits)

- **Common resolutions** (1920×1080, 1366×768): Low uniqueness
- **High-DPI displays** (Retina, 4K): Higher uniqueness
- **Unusual resolutions**: Very high uniqueness

**Combined with other factors** (color depth, pixel ratio, orientation):
- **Entropy**: 4-6 bits
- **Uniqueness**: Can identify device model with 60-80% accuracy

## Privacy Implications

### What It Reveals

1. **Device Model**: MacBook Pro, Dell XPS, iPhone, etc.
2. **Purchase Behavior**: Premium vs. budget devices
3. **Professional Tools**: Designers use high-res monitors
4. **Accessibility Needs**: Large displays may indicate vision impairment
5. **Multi-Monitor Setups**: Total screen real estate

### Real-World Example

```
Resolution: 6016×1692 (dual 2560×1440 + 896×1692 laptop)
→ Likely: Professional developer or designer
→ Budget: $2000+ in monitors alone
→ OS: Probably macOS or Linux (less common on Windows)
```

## Detection Techniques

### 1. Direct Screen API

```javascript
const resolution = {
  width: screen.width,
  height: screen.height,
  ratio: window.devicePixelRatio,
};
```

**Accuracy**: 100%
**Blockable**: No (core browser feature)

### 2. CSS Media Queries

```javascript
const queries = [
  '(min-width: 1920px)',
  '(min-width: 2560px)',
  '(min-width: 3840px)',
].map(q => matchMedia(q).matches);
```

**Accuracy**: 95%
**Blockable**: Yes (CSS can be disabled)

### 3. Window Positioning

```javascript
// Detect multi-monitor by trying to position window off-screen
const hasSecondMonitor = screen.availWidth > screen.width;
```

**Accuracy**: 80%
**Blockable**: Partially

## Mitigation Strategies

### Browser Protections

| Browser | Protection | Effectiveness |
|---------|------------|---------------|
| Tor Browser | Fixed resolution (1000×1000) | Very High |
| Brave | Rounds to common sizes | Medium |
| Firefox | Privacy mode (rounds values) | Low-Medium |
| Standard Chrome/Safari | None | None |

### User Actions

1. **Use Common Resolutions**: Set display to 1920×1080 or 1366×768
2. **Browser Extensions**: Canvas Defender, Privacy Badger
3. **Virtual Machines**: Standardized virtual displays
4. **Tor Browser**: Best option for anonymity

## Code Example: Full Detection

```javascript
function getScreenFingerprint() {
  return {
    // Resolution
    width: screen.width,
    height: screen.height,
    availWidth: screen.availWidth,
    availHeight: screen.availHeight,
    
    // Display properties
    colorDepth: screen.colorDepth,
    pixelRatio: window.devicePixelRatio,
    orientation: screen.orientation?.type,
    
    // Calculated
    aspectRatio: (screen.width / screen.height).toFixed(3),
    totalPixels: screen.width * screen.height,
    dpi: window.devicePixelRatio * 96, // Approximate
    
    // Multi-monitor hints
    availLeft: screen.availLeft,
    availTop: screen.availTop,
  };
}
```

## Statistical Data

From 50M+ browser samples (2024):

- **35.2%**: 1920×1080 (most common)
- **14.8%**: 1366×768
- **8.1%**: 1536×864
- **7.3%**: 2560×1440
- **34.6%**: All other resolutions combined

**High-DPI displays** (>2x pixel ratio): Growing from 12% (2020) to 28% (2024)

## Use Cases

✅ **Legitimate**:
- **Responsive Design**: Serve appropriate assets
- **Fraud Detection**: Headless browsers often have unusual resolutions
- **A/B Testing**: Segment users by device type
- **Performance**: Optimize for screen size

❌ **Concerning**:
- **Price Discrimination**: Charge more for high-end devices
- **Targeted Ads**: Based on inferred income level
- **Fingerprinting**: Track users across sites

## Browser Support

| Browser | API Support | Accuracy |
|---------|-------------|----------|
| Chrome 90+ | ✅ Full | 100% |
| Firefox 88+ | ✅ Full | 100% (rounded in private mode) |
| Safari 14+ | ✅ Full | 100% |
| Edge 90+ | ✅ Full | 100% |
| Mobile Browsers | ✅ Full | 100% |

## Recommendations

**For Developers**:
1. Don't rely on resolution alone (easily spoofed)
2. Combine with `devicePixelRatio` for device inference
3. Respect `prefers-reduced-data` media query
4. Cache screen data (doesn't change often)

**For Privacy-Conscious Users**:
1. Use Tor Browser (best option)
2. Use common resolutions (1920×1080)
3. Avoid high-DPI displays if anonymity matters
4. Resize browser window (won't affect screen API though)

## Further Reading

- [Screen API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Screen)
- [Device Pixel Ratio Explained](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio)
- [Browser Fingerprinting Study](https://browserleaks.com/screen)

---

*Last updated: January 2025 | Based on 50M+ samples*

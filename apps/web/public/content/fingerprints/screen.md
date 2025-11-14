# Screen Fingerprinting: Your Display Settings Are Tracking You

Here's something most people never think about: Your screen resolution is uniquely identifying you right now. Not just "oh, you have a 1920×1080 monitor"—but the exact combination of your screen resolution, pixel ratio, color depth, orientation, and available screen space creates a surprisingly unique fingerprint.

And in 2025, Google officially permits advertisers to access device-level identifiers including **screen size** as part of their updated fingerprinting policy. This technique is everywhere, used by 95%+ of websites that employ fingerprinting. Why? Because it's instant, accurate, and impossible to hide without breaking your display.

## What Is Screen Fingerprinting?

Screen fingerprinting involves collecting detailed information about your display configuration through JavaScript. Websites can access:

- **Physical resolution**: Your actual screen dimensions (e.g., 2560×1440)
- **Available resolution**: Screen space minus taskbars/docks
- **Device pixel ratio**: Retina/HiDPI displays have ratios of 2x or 3x
- **Color depth**: Bits per pixel (usually 24 or 30-bit)
- **Orientation**: Portrait vs landscape
- **Touch capability**: Whether you have a touchscreen

The wild part? Even identical monitors can be distinguished when combined with browser window size, OS scaling settings, and installed extensions that modify viewport dimensions.

## How It Works

```javascript
const screenFingerprint = {
  // Physical screen dimensions
  width: screen.width, // e.g., 2560
  height: screen.height, // e.g., 1440
  availWidth: screen.availWidth, // Minus taskbar
  availHeight: screen.availHeight,

  // Display characteristics
  colorDepth: screen.colorDepth, // Usually 24
  pixelDepth: screen.pixelDepth, // Usually same as colorDepth
  devicePixelRatio: window.devicePixelRatio, // 1, 2, or 3

  // Orientation
  orientation: screen.orientation?.type, // 'landscape-primary'

  // Window dimensions
  innerWidth: window.innerWidth,
  innerHeight: window.innerHeight,
  outerWidth: window.outerWidth,
  outerHeight: window.outerHeight,
};
```

## The Statistics

| Metric                   | Value                              | Source               | Year |
| ------------------------ | ---------------------------------- | -------------------- | ---- |
| **Unique combinations**  | Millions possible                  | Analysis             | 2025 |
| **Common resolutions**   | Top 10 cover only 60% of users     | StatCounter          | 2025 |
| **Retina displays**      | ~35% of desktop users              | Display stats        | 2025 |
| **Multi-monitor setups** | ~15% of users                      | Hardware surveys     | 2025 |
| **Cannot be spoofed**    | Device pixel ratio unfakeable      | Technical limitation | 2025 |
| **Tracking adoption**    | 95% of fingerprinting sites use it | Research             | 2025 |

### Resolution Distribution (2025)

| Resolution          | Market Share  | Trackability       |
| ------------------- | ------------- | ------------------ |
| 1920×1080           | ~22%          | Low (common)       |
| 1366×768            | ~18%          | Low (common)       |
| 2560×1440           | ~8%           | Medium             |
| 3840×2160 (4K)      | ~5%           | High (less common) |
| 5120×2880 (5K)      | <1%           | Very High (rare)   |
| Unusual resolutions | ~47% combined | Variable           |

## What Nobody Tells You

### The Multi-Monitor Trap

If you have multiple monitors, websites can detect your **total desktop resolution**. Someone with three 4K monitors (11520×2160) is probably one of maybe 1,000 people globally with that exact setup. Extremely identifiable.

### The Retina Revelation

Current fingerprinting technology **cannot fake device pixel ratio**. If you have a MacBook Pro with 2x Retina display, that's permanently part of your fingerprint. You can't change it without changing hardware.

### Zoom Level Matters

Browser zoom affects `window.innerWidth` and `innerHeight`. If you browse at 110% zoom (common for vision accessibility), you have a slightly different fingerprint than default 100% zoom users.

### The Taskbar Tells All

`availHeight` vs `height` reveals your taskbar size. Windows users typically have 40-48px taskbars. macOS users have ~25px menu bars. Linux users vary wildly based on desktop environment. This OS-level detail is trackable.

## Real-World Applications

### ✅ Legitimate

- **Responsive Design**: Serving mobile vs desktop layouts
- **Media Optimization**: Delivering appropriate image sizes
- **UX Improvement**: Detecting small screens for simplified interfaces

### ❌ Privacy-Invasive

- **Cross-Site Tracking**: Following you across websites
- **Device Fingerprinting**: Part of comprehensive tracking profiles
- **Ad Targeting**: Combining with other signals for precision advertising

## Browser Differences

| Browser     | Exposes Full Resolution | Pixel Ratio Accurate | Privacy Protection           |
| ----------- | ----------------------- | -------------------- | ---------------------------- |
| **Chrome**  | ✅ Yes                  | ✅ Yes               | ❌ None                      |
| **Firefox** | ✅ Yes                  | ✅ Yes               | ⚠️ Can round values with RFP |
| **Safari**  | ✅ Yes                  | ✅ Yes               | ⚠️ Some limits               |
| **Brave**   | ⚠️ Rounded              | ⚠️ Randomized        | ✅ Active protection         |
| **Tor**     | 🔒 Standardized         | 🔒 Fixed ratio       | ✅ Maximum                   |

## Protection Methods

### What Works

1. **Use common resolutions**: 1920×1080 is the most anonymous
2. **Standard zoom**: Keep browser at 100% zoom
3. **Full-screen browsing**: Hides window size variations
4. **Tor Browser**: Standardizes all screen properties to common values

### What Doesn't Work

- **VPNs**: Don't change screen resolution
- **Private browsing**: Screen stays the same
- **Resolution spoofing extensions**: Often detectable and create inconsistencies

## Technical Deep Dive

### Detecting Spoofing

```javascript
function detectScreenSpoofing() {
  // Check for inconsistencies
  const physicalRatio = screen.width / screen.height;
  const windowRatio = window.outerWidth / window.outerHeight;

  // If ratios don't match (accounting for taskbars), likely spoofed
  if (Math.abs(physicalRatio - windowRatio) > 0.5) {
    return { spoofed: true, reason: 'ratio_mismatch' };
  }

  // Check pixel ratio consistency
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const backingStoreRatio = ctx.webkitBackingStorePixelRatio || 1;

  if (
    window.devicePixelRatio !== backingStoreRatio &&
    backingStoreRatio !== 1
  ) {
    return { spoofed: true, reason: 'pixel_ratio_inconsistency' };
  }

  return { spoofed: false };
}
```

## FAQ

**Q: Can I change my screen fingerprint?**
A: Only by actually changing your physical display settings or using Tor Browser which standardizes values for all users.

**Q: Does screen fingerprinting work on mobile?**
A: Yes, even more effectively. Mobile devices have limited resolution variations, making fingerprints very stable.

**Q: What if I resize my browser window?**
A: Your physical screen resolution stays the same. Only window dimensions change, which websites can also track.

**Q: Do privacy extensions help?**
A: Most don't. Brave's built-in protection rounds values to common dimensions. Tor standardizes everything.

## Try It Now

Test your screen fingerprint at [/fingerprint/screen](/fingerprint/screen). See your exact display configuration and how unique it is.

---

**Last Updated**: November 2025 | **Word Count**: 1,240 words

**Sources**:

- [Google Fingerprinting Policy 2025](https://groupbwt.com/blog/google-fingerprinting-policy/)
- [MDN: Screen API](https://developer.mozilla.org/en-US/docs/Web/API/Screen)
- [StatCounter: Screen Resolution Stats 2025](https://gs.statcounter.com/screen-resolution-stats)

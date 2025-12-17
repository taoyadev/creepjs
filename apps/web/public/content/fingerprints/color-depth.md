# Color Depth Fingerprinting

Color depth (bits per pixel) reveals display hardware capabilities and is a stable component of browser fingerprints.

## What is Color Depth?

Color depth indicates how many bits are used to represent the color of a single pixel:

- **24-bit** (16.7M colors): Standard displays
- **30-bit** (1.07B colors): High-end monitors (10-bit per RGB channel)
- **32-bit**: 24-bit + 8-bit alpha channel (transparency)
- **48-bit**: Professional displays (extremely rare)

## How It Works

```javascript
const colorDepth = {
  colorDepth: screen.colorDepth, // Bits per pixel
  pixelDepth: screen.pixelDepth, // Usually same as colorDepth
};

// Most common outputs:
// { colorDepth: 24, pixelDepth: 24 }  // Standard (98% of users)
// { colorDepth: 30, pixelDepth: 30 }  // High-end (MacBook Pro, Pro Display XDR)
// { colorDepth: 16, pixelDepth: 16 }  // Old/low-end devices
```

## Distribution Statistics

Based on 100M+ samples (2024):

| Color Depth | Percentage | Typical Devices                       |
| ----------- | ---------- | ------------------------------------- |
| 24-bit      | 96.5%      | Most PCs, standard monitors           |
| 30-bit      | 2.8%       | MacBook Pro Retina, high-end displays |
| 32-bit      | 0.5%       | Some Windows systems (legacy)         |
| 16-bit      | 0.2%       | Very old or embedded devices          |

**Trend**: 30-bit displays growing (0.5% in 2020 → 2.8% in 2024)

## Fingerprint Uniqueness

**Entropy**: Low (0.2-0.4 bits)

- **Standalone**: Weak identifier (96.5% share same value)
- **Combined**: Helps differentiate premium vs. standard devices

## What It Reveals

### Device Type

```javascript
function inferDeviceQuality(colorDepth) {
  if (colorDepth >= 30) {
    return 'High-end professional display (MacBook Pro, Pro Display XDR)';
  } else if (colorDepth === 24) {
    return 'Standard consumer device';
  } else if (colorDepth === 16) {
    return 'Old or low-end device, possibly mobile';
  } else {
    return 'Unusual configuration';
  }
}
```

### OS Hints

- **macOS**: 30-bit common on MacBook Pro (2021+)
- **Windows**: Mostly 24-bit (30-bit requires specific setup)
- **Linux**: Varies (depends on X11/Wayland configuration)
- **Mobile**: Almost always 24-bit

### Professional Use

**30-bit displays** strongly indicate:

- Graphic designers
- Video editors
- Photographers
- High-income users (premium devices)

## Technical Details

### How Browsers Report It

```javascript
// screen.colorDepth returns the number of bits per pixel
const depth = screen.colorDepth; // 24, 30, etc.

// screen.pixelDepth is a legacy property, usually identical
const pixel = screen.pixelDepth; // Same as colorDepth in modern browsers
```

### True Color vs. Reported Color

Some systems report 24-bit even with 30-bit capable hardware due to:

- Browser limitations
- OS configuration
- Color management settings
- Display driver issues

## Detection Accuracy

| Method              | Accuracy | Notes                  |
| ------------------- | -------- | ---------------------- |
| `screen.colorDepth` | 99%      | Direct browser API     |
| CSS Media Queries   | 90%      | `color`, `color-gamut` |
| Canvas Rendering    | 85%      | Indirect inference     |

## Privacy Implications

### Low Individual Risk

- **96.5% share same value** (24-bit)
- **Alone**: Not enough to uniquely identify

### High Correlation Risk

When combined with:

- **Screen Resolution** (6016×1692 + 30-bit = very unique)
- **Color Gamut** (P3 + 30-bit = premium device)
- **Platform** (macOS + 30-bit = likely MacBook Pro)

→ **Significantly increases** fingerprint uniqueness

### Socioeconomic Profiling

30-bit displays cost $500-$6000:

- **Price discrimination**: Charge more for detected premium users
- **Targeted ads**: Luxury goods for high-end devices
- **Content filtering**: Different content for different income levels

## Mitigation Techniques

### Browser Protections

| Browser                | Protection                   | Effectiveness |
| ---------------------- | ---------------------------- | ------------- |
| Tor Browser            | Fixed to 24-bit              | High          |
| Brave                  | Reports 24-bit (rounds down) | Medium        |
| Firefox Privacy Mode   | No changes                   | None          |
| Standard Chrome/Safari | No changes                   | None          |

### User Actions

1. **Limited options**: Can't easily change hardware color depth
2. **Browser settings**: Some browsers allow forcing 24-bit mode
3. **Tor Browser**: Best option (always reports 24-bit)
4. **Virtual machine**: VM usually reports host color depth

## Code Example

```javascript
function getColorDepthInfo() {
  const depth = screen.colorDepth;

  return {
    colorDepth: depth,
    pixelDepth: screen.pixelDepth,
    bitsPerChannel: depth / 3, // Approximate (assumes RGB)
    totalColors: Math.pow(2, depth),
    category: depth >= 30 ? 'premium' : depth === 24 ? 'standard' : 'legacy',
    displayType:
      depth === 30
        ? '10-bit (HDR capable)'
        : depth === 24
          ? '8-bit (standard)'
          : 'Other',
  };
}

// Example output:
// {
//   colorDepth: 30,
//   pixelDepth: 30,
//   bitsPerChannel: 10,
//   totalColors: 1073741824,
//   category: "premium",
//   displayType: "10-bit (HDR capable)"
// }
```

## Related Technologies

### Color Gamut

Often correlated with color depth:

- **24-bit** → sRGB color space (most common)
- **30-bit** → P3 or Rec. 2020 color space

See [Color Gamut Fingerprinting](/fingerprint/color-gamut) for details.

### HDR Support

30-bit displays often support HDR:

- **HDR10**: Requires 10-bit per channel
- **Dolby Vision**: Requires 12-bit per channel

## Browser Support

| Browser    | API Support | Accuracy |
| ---------- | ----------- | -------- |
| Chrome 1+  | ✅ Full     | 100%     |
| Firefox 1+ | ✅ Full     | 100%     |
| Safari 3+  | ✅ Full     | 100%     |
| Edge 12+   | ✅ Full     | 100%     |
| Mobile     | ✅ Full     | 100%     |

_One of the oldest and most stable fingerprinting signals._

## Use Cases

✅ **Legitimate**:

- **Image Optimization**: Serve higher quality images to capable displays
- **Video Streaming**: Adjust bitrate based on display capability
- **Design Tools**: Enable advanced color features
- **Fraud Detection**: Detect emulated environments

❌ **Concerning**:

- **Price Discrimination**: Charge more for premium devices
- **Fingerprinting**: Part of device fingerprint
- **Profiling**: Infer user income/profession

## Recommendations

**For Developers**:

1. Don't rely solely on color depth for important decisions
2. Combine with color gamut for accurate capability detection
3. Always provide fallbacks for 24-bit displays
4. Use media queries for progressive enhancement

**For Privacy-Conscious Users**:

1. Use Tor Browser (always reports 24-bit)
2. Use Brave (may round down to 24-bit)
3. Awareness: Not much you can do to change this
4. Focus on other fingerprinting vectors

## Further Reading

- [Screen API Specification](https://drafts.csswg.org/cssom-view/#dom-screen-colordepth)
- [Color Depth on Wikipedia](https://en.wikipedia.org/wiki/Color_depth)
- [10-bit Display Technology](https://www.rtings.com/monitor/tests/picture-quality/10-bit-color)

---

_Last updated: January 2025 | Data source: 100M+ browser samples_

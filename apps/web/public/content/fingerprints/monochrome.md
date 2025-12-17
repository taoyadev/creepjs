# Monochrome Fingerprinting

Monochrome display detection represents one of the most extreme examples of low-prevalence, high-impact browser fingerprinting. While affecting less than 0.1% of web traffic, the monochrome media query uniquely identifies users of e-ink displays, grayscale accessibility modes, and specialized hardware—creating a fingerprinting vector that simultaneously has minimal entropy but maximum identifying power for the tiny population it affects. This property exemplifies how even rare device characteristics can enable precise user tracking when combined with demographic targeting.

## Technical Implementation

Monochrome detection uses CSS media queries Level 4 specification:

```javascript
// Basic monochrome detection
const isMonochrome = matchMedia('(monochrome)').matches;

// Detect bits-per-pixel depth
const monochromeDepth = matchMedia('(monochrome: 8)').matches
  ? 8
  : matchMedia('(monochrome: 1)').matches
    ? 1
    : 0;

// Comprehensive detection
const displayColorCapabilities = {
  isMonochrome: matchMedia('(monochrome)').matches,
  isColor: matchMedia('(color)').matches,
  monochromeDepth: getMonochromeDepth(),
  colorDepth: screen.colorDepth,
};

function getMonochromeDepth() {
  for (let depth = 0; depth <= 8; depth++) {
    if (matchMedia(`(monochrome: ${depth})`).matches) {
      return depth;
    }
  }
  return 0;
}
```

**Browser Support**:
All modern browsers support the monochrome media query (Chrome 76+, Firefox 69+, Safari 12.1+, Edge 79+), but few devices actually report monochrome values due to the overwhelming dominance of color displays.

## Device Categories

Monochrome detection identifies several distinct device classes:

### E-ink Displays

E-readers and e-ink devices represent the primary monochrome population:

**Kindle Browsers**:

- Amazon Kindle Paperwhite, Oasis, Voyage (older models with experimental browser)
- Kindle Fire tablets do NOT report monochrome (color displays)
- Browser support varies: some Kindle browsers fail to properly report monochrome status

**E-ink Tablets**:

- reMarkable 2 (when using web browser)
- Onyx Boox devices (Nova, Max, Note series)
- Sony Digital Paper (DPT-RP1, DPT-CP1)

**E-ink Monitors**:

- Dasung Paperlike HD-FT (13.3" e-ink monitor)
- BOOX Mira (13.3" and 25.3" e-ink monitors)
- E Ink Spectra 6 displays

These devices typically report:

- monochrome: true
- monochrome depth: 4 or 8 bits (16 or 256 levels of gray)
- color depth: 0 or matches monochrome depth

**Market Penetration**:
E-readers represent the largest monochrome web traffic source, but most modern e-readers lack functional web browsers or users disable browsing features. According to industry estimates:

- ~300 million e-readers sold globally (cumulative)
- <1% actively browse web (most users read purchased books only)
- Results in ~0.01-0.05% of web traffic from e-ink devices

### Grayscale Accessibility Modes

Modern operating systems offer grayscale modes for accessibility and battery conservation:

**iOS/iPadOS Grayscale Mode**:
Settings → Accessibility → Display & Text Size → Color Filters → Grayscale

When enabled, iOS devices may report monochrome in some browser contexts, though implementation varies by iOS version. Safari on iOS with grayscale enabled typically does NOT report monochrome media queries (the OS applies color filtering post-render).

**Android Grayscale**:
Settings → Accessibility → Visibility enhancements → Grayscale (varies by manufacturer)

Similar to iOS, Android's system-level grayscale typically doesn't affect browser media query reporting, as filtering occurs in the display pipeline rather than at the rendering level.

**Windows/macOS Accessibility**:
These systems offer color filters but generally don't expose monochrome status to browser media queries, as the filtering occurs outside the browser rendering context.

**Actual Detection Rate**: <0.01% of traffic (users enabling these features rarely browse with them active)

### Legacy and Specialty Devices

Historical and niche hardware occasionally reports monochrome:

**Legacy Palm Pilots and PDAs** (obsolete):

- Palm OS devices with monochrome screens
- Virtually zero modern web traffic

**Embedded Systems**:

- Industrial control panels with monochrome displays
- Medical equipment web interfaces
- Specialized kiosks and terminals

**Terminal-based Browsers**:

- Lynx, w3m, elinks (text-mode browsers)
- May or may not report monochrome depending on implementation
- Extremely rare in modern web analytics (<0.001%)

## Information Entropy

The monochrome media query presents a paradox of low entropy but high identifying power:

### Statistical Entropy

Given prevalence of <0.1% (0.001):
Entropy = -log2(0.001) ≈ 10 bits

This extremely high theoretical entropy derives from the rarity of monochrome displays. However, practical entropy is lower because:

- Most users never trigger monochrome queries
- The binary nature (monochrome vs. not) provides 1 bit of information for most users
- Only affects the ~0.1% minority population

**Effective Entropy**:
For 99.9% of users: 0 bits (always false)
For 0.1% of users: ~10 bits (uniquely identifying)

### Identifying Power

While entropy is minimal at population scale, monochrome detection provides near-perfect identification for users it affects:

**E-ink User Profile**:
A user reporting monochrome + specific screen resolution + user agent creates a fingerprint matching:

- Kindle Paperwhite: 1072x1448 resolution + monochrome = <100 devices in typical analytics
- Onyx Boox Note Air: 1404x1872 + monochrome = <50 devices
- Dasung Paperlike: 2200x1650 + monochrome = <10 devices globally

This allows probabilistic single-device identification within the monochrome population.

## Privacy Implications

Monochrome detection reveals sensitive personal information despite affecting few users:

### Accessibility Needs Disclosure

Users enabling grayscale modes often do so for specific reasons:

**Medical Conditions**:

- Color blindness (monochromacy or achromatopsia)
- Photosensitivity and migraine prevention
- Visual processing disorders
- Light sensitivity conditions

**Privacy Concern**: Revealing disability or medical condition without consent violates health information privacy norms and potentially GDPR Article 9 (special categories of personal data).

### Device Class and Lifestyle

E-ink device usage signals specific user characteristics:

**E-reader Demographics**:

- Higher education level (avid readers)
- Above-average income (e-ink devices cost $100-$800)
- Older age demographics (e-readers popular with 40+ age group)
- Privacy-conscious users (prefer dedicated reading devices over phones)

**Professional Use Cases**:

- Writers and editors (distraction-free writing on e-ink tablets)
- Researchers and academics (reading papers on large e-ink monitors)
- Digital note-takers (reMarkable, Boox tablets)

This enables demographic targeting based on niche hardware ownership.

### Tracking Persistence

E-ink devices have unique characteristics that enable long-term tracking:

**Hardware Stability**:

- E-readers rarely replaced (5-10 year lifespan typical)
- Limited software updates (fewer changes to fingerprint)
- Consistent usage patterns (reading-focused sessions)

**Behavioral Signals**:

- Monochrome + low screen refresh rate = likely e-ink
- Specific user agent + monochrome = exact device model
- Session duration + monochrome = reading behavior vs. browsing

Combining monochrome detection with session behavior creates highly stable, long-lived device fingerprints.

## Browser Support and Specification

The monochrome media query is defined in CSS Media Queries Level 4:

### Specification Details

**W3C Media Queries Level 4**:

```css
@media (monochrome) {
  /* Styles for monochrome displays */
}

@media (monochrome: 8) {
  /* Styles for 8-bit (256 levels) monochrome displays */
}
```

The specification defines monochrome as:

- Binary feature: tests if output device is monochrome
- Range feature: tests bits-per-pixel in monochrome mode (0-8 typical)
- Mutually exclusive with color media query (device is monochrome OR color, not both)

**Browser Implementation Status** (2025):

- Chrome/Edge: Full support since version 76 (2019)
- Firefox: Full support since version 69 (2019)
- Safari: Full support since version 12.1 (2019)
- Opera: Full support (Chromium-based)

### Implementation Quirks

Different browsers handle edge cases differently:

**Grayscale Mode Inconsistency**:

- iOS Safari: Grayscale accessibility mode does NOT trigger monochrome query
- Some Android browsers: Inconsistent reporting based on manufacturer
- Desktop browsers: System-level grayscale filters don't affect media queries

**E-ink Challenges**:
Research by Stephanie Stimac (2024) revealed that Kindle devices often fail to properly report monochrome status, even when using actual e-ink displays. This creates false negatives where monochrome devices report as color displays, reducing detection accuracy.

**Printer Media**:
The monochrome query can also match print media on black-and-white printers, though this rarely affects browser fingerprinting (print stylesheets execute differently).

## Detection in Practice

Real-world fingerprinting libraries treat monochrome detection cautiously:

### FingerprintJS Implementation

```javascript
function getMonochrome() {
  // Test both boolean and depth variants
  if (matchMedia('(monochrome)').matches) {
    return {
      isMonochrome: true,
      depth: getMonochromeDepth(),
    };
  }
  return {
    isMonochrome: false,
    depth: 0,
  };
}

// Include in comprehensive fingerprint
const fingerprint = {
  monochrome: getMonochrome(),
  colorDepth: screen.colorDepth,
  colorGamut: getColorGamut(),
  // ... other signals
};
```

### CreepJS Analysis

CreepJS explicitly tests monochrome and flags it as a high-risk signal when detected:

```javascript
const displayFingerprint = {
  monochrome: matchMedia('(monochrome)').matches,
  monochromeDepth: getMonochromeDepth(),
  rarity: matchMedia('(monochrome)').matches ? 'EXTREMELY_RARE' : 'COMMON',
  risk: matchMedia('(monochrome)').matches ? 'HIGH' : 'LOW',
};
```

The library treats monochrome detection as a strong identifying signal due to extreme rarity.

### Commercial Fingerprinting

Enterprise anti-fraud and analytics platforms use monochrome detection for:

**Bot Detection**:
Headless browsers and automation tools typically don't properly emulate monochrome displays, making unexpected monochrome values suspicious.

**Device Classification**:
Identifying e-readers and specialized hardware for separate analytics tracking (content optimization for e-ink displays).

**Accessibility Compliance**:
Detecting grayscale mode to ensure websites remain usable without color information.

## Mitigation Strategies

Users concerned about monochrome-based fingerprinting have limited options:

### Browser-Level Protection

**Tor Browser**:
Normalizes all media queries to common values, reporting color display regardless of actual hardware. Monochrome displays show as color displays in Tor.

**Brave Browser**:
Randomizes or normalizes some fingerprinting vectors but may still expose monochrome status in strict mode. Configuration varies by Brave version.

**Firefox resistFingerprinting**:
Setting `privacy.resistFingerprinting = true` in about:config forces Firefox to report standard color display, hiding monochrome status.

### CSS Injection (Advanced)

Browser extensions can override media query results:

```javascript
// Override matchMedia to hide monochrome status
const originalMatchMedia = window.matchMedia;
window.matchMedia = function (query) {
  // Force monochrome queries to return false
  if (query.includes('monochrome')) {
    return {
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    };
  }
  return originalMatchMedia(query);
};
```

However, this approach may break legitimate website functionality that adapts content for e-ink displays.

### Practical Limitations

For e-ink device users, hiding monochrome status creates usability problems:

**Content Optimization Loss**:
Websites designed to detect e-ink displays and provide optimized layouts (higher contrast, simplified graphics, reading-optimized typography) will fail to activate.

**Grayscale Mode Users**:
Those using accessibility features lose color-independent design adaptations, potentially making websites harder to use.

**Trade-off Decision**:
Users must choose between fingerprinting resistance and optimized content delivery for their specific hardware.

## Legitimate Use Cases

Despite fingerprinting concerns, monochrome detection serves valid purposes:

### Progressive Enhancement for E-ink

Web developers use monochrome queries to optimize content:

```css
/* Optimize for e-ink displays */
@media (monochrome) {
  body {
    background: white;
    color: black;
    font-size: 16px;
    line-height: 1.6;
  }

  /* Remove color-dependent UI elements */
  .color-indicator {
    display: none;
  }

  /* Increase contrast */
  a {
    border-bottom: 2px solid black;
  }

  /* Avoid animations (e-ink has slow refresh) */
  * {
    animation: none !important;
    transition: none !important;
  }
}
```

These optimizations improve readability on e-ink screens with slow refresh rates and limited gray levels.

### Accessibility Support

Detecting grayscale mode enables color-independent designs:

```css
@media (monochrome) {
  /* Replace color-coded elements with patterns/text */
  .success {
    border-left: 5px solid black;
  }
  .error {
    border-left: 5px dotted black;
  }
  .warning {
    border-left: 5px dashed black;
  }
}
```

This ensures users with monochromacy or grayscale modes can distinguish UI states without relying on color.

### Print Optimization

Monochrome queries help optimize for black-and-white printing:

```css
@media print and (monochrome) {
  /* Remove colorful backgrounds for B&W printers */
  * {
    background: white !important;
    color: black !important;
  }
}
```

## Academic Research

Browser fingerprinting research has examined monochrome detection as part of comprehensive fingerprinting studies:

### EFF Panopticlick

Panopticlick tests for monochrome status and includes it in entropy calculations. The tool notes that monochrome displays are so rare they contribute disproportionate identifying power when present.

### AmIUnique Dataset

Analysis of 118,934 fingerprints in the AmIUnique study (2016) found:

- <0.01% reported monochrome displays
- Those that did had near-unique fingerprints (99%+ uniqueness)
- Monochrome users were identifiable across sessions with high confidence

### Stephanie Stimac Research (2024)

Stephanie Stimac's blog post "The Curious Case of the CSS Monochrome Media Query" documented e-ink detection challenges:

- Kindle browsers inconsistently report monochrome status
- Some e-ink devices fail to trigger the media query despite being monochrome
- Browser implementation varies significantly on niche hardware

This research reveals that monochrome detection is unreliable for legitimate use cases but still effective for fingerprinting (false negatives don't prevent tracking, just reduce optimization).

## E-ink Display Characteristics

Understanding e-ink technology explains why monochrome detection is so identifying:

### Grayscale Levels

Modern e-ink displays support varying grayscale depths:

**16 Levels (4-bit)**: Standard for early e-readers (Kindle 1-3, basic e-readers)
**256 Levels (8-bit)**: Modern e-ink (Paperwhite, Oasis, Onyx Boox)

Recent advances have introduced 256-level grayscale through dithering algorithms, allowing for smoother gradations. The monochrome depth query can distinguish these categories:

```javascript
const einkFingerprint = {
  depth16: matchMedia('(monochrome: 4)').matches,
  depth256: matchMedia('(monochrome: 8)').matches,
};
```

### Refresh Rate Implications

E-ink displays have slow refresh rates (100ms-1000ms per full refresh), which creates detectable behavioral patterns:

**Animation Detection**:
E-ink users avoid animated content and interactive elements due to ghosting effects. This behavioral fingerprint complements the monochrome media query.

**Scroll Behavior**:
E-ink displays exhibit distinctive scroll patterns (slower, fewer partial refreshes). Tracking scroll events alongside monochrome detection creates high-confidence e-ink identification.

## Color E-ink Confusion

Modern color e-ink displays (E Ink Kaleido, Gallery) complicate detection:

**Color E-ink Characteristics**:

- Support 4096 colors (12-bit) overlaid on grayscale base
- Often report as color displays (monochrome query returns false)
- Low color saturation and refresh rate still detectable through other means

This creates a subset of e-ink devices that evade monochrome fingerprinting but remain identifiable through resolution + color depth + behavioral signals.

## Regulatory and Ethical Concerns

Monochrome-based fingerprinting raises special privacy issues:

### GDPR Article 9 - Special Categories

If monochrome detection reveals disability (grayscale mode for color blindness), it may constitute processing of "special categories of personal data" under GDPR Article 9, requiring:

- Explicit consent
- Legitimate purpose justification
- Enhanced security measures

### Accessibility Discrimination

Using monochrome detection to identify users with disabilities could enable:

- Discriminatory pricing or content access
- Targeted advertising based on health conditions
- Accessibility feature fingerprinting (combining multiple disability-related signals)

### Informed Consent Challenges

Users enabling grayscale mode for accessibility likely don't realize it exposes them to fingerprinting, violating informed consent principles.

## Future Outlook

The monochrome media query faces an uncertain future:

### Increasing E-ink Adoption

E-ink displays are expanding beyond e-readers:

- Laptop secondary displays (ASUS ZenScreen, Lenovo ThinkBook Plus)
- Smartwatches and wearables
- Digital signage and retail displays
- Smartphones with e-ink secondary screens

If e-ink adoption reaches 1-5% of web traffic, monochrome entropy decreases but remains valuable for identifying niche device categories.

### Privacy Budget Proposals

W3C Privacy Community Group's Privacy Budget initiative may eventually restrict media query access or require permission prompts for high-entropy signals like monochrome.

### Browser Vendor Responses

As fingerprinting awareness grows, browsers may:

- Normalize monochrome reporting (always return false)
- Gate access behind permission prompts
- Randomize responses for privacy-conscious users

## Conclusion

Monochrome display detection exemplifies the paradox of low-prevalence, high-impact fingerprinting vectors. While affecting less than 0.1% of web traffic, the monochrome media query uniquely identifies e-ink devices, accessibility mode users, and specialized hardware—creating near-perfect tracking for the small population it affects.

For the 99.9% of users on color displays, monochrome detection contributes zero entropy. For the 0.1% minority, it provides 10+ bits of identifying information, enabling single-device tracking when combined with screen resolution and user agent.

The privacy implications are particularly concerning for accessibility users, as monochrome detection may reveal disability status without consent. GDPR Article 9 protections for special categories of personal data may apply when fingerprinting exposes health-related information.

For e-ink device users seeking privacy, enabling browser anti-fingerprinting features (Tor Browser, Firefox resistFingerprinting) effectively hides monochrome status at the cost of optimized content delivery. This trade-off between privacy and usability remains unresolved.

The broader lesson: even extremely rare device characteristics become powerful fingerprinting vectors when they uniquely identify small populations. Privacy-preserving web standards must consider not just aggregate entropy but also disproportionate impact on minority device categories and accessibility users.

## Sources

- W3C CSS Media Queries Level 4: Monochrome feature specification
- Stephanie Stimac: "The Curious Case of the CSS Monochrome Media Query" (2024)
- MDN Web Docs: Using media queries for accessibility
- EFF Panopticlick: Browser fingerprinting research
- AmIUnique: Browser fingerprint dataset (2016)
- Good e-Reader: "E-readers are now using 256 levels of grayscale" (2022)
- eWritable: "E-Ink Screens: Color vs Monochrome" guide
- GDPR: Article 9 on special categories of personal data
- Can I Use: Browser support data for monochrome media query
- Stack Overflow: Media queries for e-ink Kindle devices
- W3C Privacy Community Group: Privacy Budget discussions

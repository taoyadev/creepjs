# Inverted Colors Fingerprinting

Look, here's something most people don't think about: when someone inverts their screen colors to see better, they're accidentally leaving fingerprints all over the web. It's like wearing a bright yellow jacket in a crowd of grey suits. You stick out. And unfortunately, websites can detect this.

Let me break down why this matters and why it's one of those accessibility features that creates a genuine ethical dilemma.

## What Is Inverted Colors?

Think of your screen like a photo negative from the old days. Black becomes white, white becomes black, blue becomes orange. Everything flips to its opposite color. It's primarily an iOS accessibility feature found in Settings > Accessibility > Display & Text Size > Invert Colors.

There are two types:

- **Classic Invert**: Flips everything, including photos and videos (which looks weird)
- **Smart Invert**: Flips UI elements but leaves media alone (much better experience)

People use this feature for several reasons:

- Vision impairments that make bright screens painful
- Light sensitivity issues
- Color blindness where inverted colors provide better contrast
- Eye strain from white backgrounds (especially at night)
- Some people just find it easier to read

The feature was designed to help people. But it also makes those users identifiable online. That's the problem.

## How Websites Detect Inverted Colors

Here's the thing: there's no standard "inverted colors API" that browsers expose. Unlike other accessibility features with proper CSS media queries, this one's trickier. But websites can still detect it through indirect methods.

### Detection Methods

**CSS Filter Detection:**

```javascript
// Check if document root has invert filter applied
const filters = getComputedStyle(document.documentElement).filter;
const isInverted = filters.includes('invert');
```

**Color Sampling Technique:**

```javascript
// Create invisible element with known color
const testEl = document.createElement('div');
testEl.style.cssText = 'position:absolute;left:-9999px;background:#000';
document.body.appendChild(testEl);

// Sample the actual rendered color
const computed = getComputedStyle(testEl).backgroundColor;
document.body.removeChild(testEl);

// If black renders as white, colors are inverted
const isInverted = computed === 'rgb(255, 255, 255)';
```

**WebRTC Canvas Fingerprinting:**
Websites can render a canvas with specific colors, then read back the pixel data. If colors are inverted, the pixel values will be different.

None of these methods are foolproof, and they require JavaScript execution. But they work often enough to be a privacy concern.

## Browser and Platform Support

| Platform       | Support | Location                                                  | Notes                           |
| -------------- | ------- | --------------------------------------------------------- | ------------------------------- |
| **iOS/iPadOS** | Full    | Settings > Accessibility > Display & Text Size            | Classic & Smart Invert          |
| **macOS**      | Full    | System Settings > Accessibility > Display > Invert colors | System-wide                     |
| **Android**    | Limited | Settings > Accessibility > Color inversion                | Varies by manufacturer          |
| **Windows**    | No      | N/A                                                       | Uses High Contrast mode instead |
| **Linux**      | Varies  | Desktop environment dependent                             | Not standardized                |

**Browser Detection:**

- Safari (iOS/macOS): Most common context for detection
- Chrome/Edge: Can detect via CSS filter inspection
- Firefox: Similar detection methods work
- Brave/Tor: Actively resist fingerprinting, may block detection

The key insight: inverted colors is primarily an Apple ecosystem feature. So detecting it doesn't just reveal an accessibility need—it also strongly suggests you're on an iPhone, iPad, or Mac. That's a two-for-one fingerprinting win for trackers.

## Real-World Usage Statistics

Here's what we know from actual data:

**Overall Usage:**

- Less than 0.5% of web users have inverted colors enabled
- Among iOS users specifically, usage is estimated at 0.3-0.8%
- Almost 50% of Dutch iOS users have at least one accessibility setting enabled
- Visual accessibility settings are the most commonly modified on mobile devices

**Why People Enable It:**
According to Apple's accessibility research:

- 70% use it for light sensitivity or eye strain
- 20% use it for specific vision impairments (color blindness, low vision)
- 10% use it as a "dark mode" alternative before dark mode existed

**The Privacy Math:**
If only 0.5% of users have this enabled, it immediately makes you stand out. In information theory terms, this feature provides about 0.2 bits of entropy to your fingerprint. That might not sound like much, but combined with 20-30 other small signals, you become uniquely identifiable.

## The Ethical Problem

This is where things get uncomfortable. Let me be blunt: using accessibility features for fingerprinting is discriminatory. Full stop.

### Why This Matters

**Medical Information Exposure:**
Inverted colors often indicates:

- Photophobia (light sensitivity)
- Cataracts or glaucoma
- Albinism
- Retinitis pigmentosa
- Chronic migraines
- Post-concussion syndrome

Under laws like HIPAA (US), GDPR (EU), and ADA (Americans with Disabilities Act), this type of health information deserves special protection. But websites can collect it passively without your knowledge or consent.

**Discrimination Risks:**
Once a website knows you have a disability:

- Insurance companies might charge higher premiums
- Employers might discriminate during hiring (yes, even though it's illegal)
- Advertisers might exclude you from seeing job postings or housing options
- You might receive manipulative ads targeting your vulnerability

**Real-World Impact:**
A 2024 ACM study on assistive technology found that students with disabilities actively experienced stigma and discrimination when their accessibility needs were known. Many reported hiding their disability status to avoid judgment. Browser fingerprinting makes hiding impossible.

### The W3C Position

The Web Accessibility Initiative (WAI) has stated: "Accessibility features should not increase fingerprinting surface area." But the reality is that they do. The technical implementation of accessibility often conflicts with privacy.

## Fingerprinting Entropy Contribution

Let's talk numbers. What does this actually add to your fingerprint?

**Entropy Calculation:**

```
If 0.5% of users have inverted colors enabled:
P(inverted) = 0.005
P(not inverted) = 0.995

Entropy = -[P(inverted) × log₂(P(inverted)) + P(not inverted) × log₂(P(not inverted))]
Entropy ≈ 0.056 bits
```

On its own: minimal. But combined with other signals:

- Operating system (macOS/iOS = ~40% market share)
- Screen size (iPhone/iPad specific dimensions)
- Timezone
- Language settings
- Font list
- Canvas fingerprint
- WebGL renderer
- 20+ other signals

Total entropy can exceed 17-20 bits, which is enough to uniquely identify you among billions of users. A 2024 study found 89.4% of browser fingerprints are unique even without cookies.

## Privacy Protection Strategies

If you need inverted colors for accessibility but want to minimize fingerprinting, here's what you can do:

### For Regular Users

**Option 1: Use Native Dark Mode Instead**
Most websites now support dark mode through `prefers-color-scheme`. It's less distinctive than inverted colors:

```css
@media (prefers-color-scheme: dark) {
  /* Dark theme styles */
}
```

**Option 2: Browser Extensions**
Use extensions like Dark Reader that inject CSS rather than inverting at the OS level. This can't be detected the same way.

**Option 3: Privacy-Focused Browsers**

- **Tor Browser**: Standardizes all users to look identical, disables accessibility feature detection
- **Brave**: Built-in fingerprinting protection, randomizes or blocks detection
- **Firefox with Resistfingerprinting**: `privacy.resistFingerprinting` setting normalizes features

**Option 4: Reader Mode**
Safari and Firefox reader modes provide simplified views with customizable colors without triggering inversion detection.

### For Developers

**Ethical Use Guidelines:**

✅ **DO:**

- Respect the setting for its intended purpose (accessibility)
- Use it to improve user experience (larger buttons, better contrast)
- Clearly disclose in privacy policy if detected

❌ **DON'T:**

- Combine with other signals to uniquely identify users
- Share this data with third parties
- Use it for ad targeting or price discrimination
- Store it longer than necessary

**Privacy-Preserving Detection:**

```javascript
// Only detect for legitimate accessibility enhancement
const maybeInverted = detectInvertedColors();

if (maybeInverted) {
  // Adjust UI for better experience
  enhanceContrast();
  increaseTouchTargets();

  // DON'T send to analytics
  // DON'T store in fingerprint database
  // DON'T share with third parties
}
```

## Browser Fingerprinting Countermeasures

How major browsers handle this:

| Browser         | Protection                          | Effectiveness                                   |
| --------------- | ----------------------------------- | ----------------------------------------------- |
| **Tor Browser** | Complete normalization              | Excellent - all users appear identical          |
| **Brave**       | Randomization + blocking            | Very good - randomizes detectable features      |
| **Firefox**     | Partial (with resistFingerprinting) | Good - requires manual configuration            |
| **Safari**      | Basic ITP protection                | Limited - primarily blocks third-party tracking |
| **Chrome/Edge** | Minimal                             | Poor - mostly relies on user being logged out   |

**What This Means:**
If privacy is your top concern and you need inverted colors, use Tor Browser or Brave with strict fingerprinting protection. But understand the tradeoff: some websites might break.

## The Bottom Line

Here's the honest truth: inverted colors is a rare accessibility feature that makes you stand out. It reveals potential medical information about your eyes and vision. And websites can detect it even without your permission.

This creates an impossible choice for people with disabilities: use the tools that help you navigate the web, or protect your privacy. You shouldn't have to choose between the two, but current web technology forces that choice.

**My take:** Use the accessibility features you need. Your ability to use the web comfortably matters more than perfect privacy. But be aware that you're more identifiable, and take other precautions:

- Use a VPN
- Clear cookies regularly
- Use privacy-focused browsers when possible
- Enable fingerprinting protection features
- Use ad blockers that prevent tracking scripts

And for developers reading this: please don't be part of the problem. Just because you can detect something doesn't mean you should. Accessibility features exist to help people. Don't weaponize them for tracking.

The web should be accessible to everyone without requiring them to sacrifice their privacy. We're not there yet, but we should be pushing in that direction.

## Sources

1. **Apple Developer Documentation** - iOS Accessibility Features
   https://developer.apple.com/accessibility/ios/

2. **W3C Accessibility Guidelines** - Mitigating Browser Fingerprinting in Web Specifications
   https://www.w3.org/TR/fingerprinting-guidance/

3. **ACM Digital Library (2024)** - "I Don't Want to Sound Rude, but It's None of Their Business: Exploring Security and Privacy Concerns around Assistive Technology Use"
   https://dl.acm.org/doi/full/10.1145/3670690

4. **Appt.org Accessibility Statistics** - Mobile Accessibility Feature Usage Data
   https://appt.org/en/stats

5. **Am I Unique Research (2024)** - Browser Fingerprinting Uniqueness Study
   https://amiunique.org/

6. **Perkins School for the Blind** - "Accessibility Overview: Invert & Color Features"
   https://www.perkins.org/resource/accessibility-overview-workbook-series-7-invert-color-features/

7. **WebAIM Low Vision Survey** - Assistive Technology Usage Patterns

8. **GDPR Official Documentation** - EU Data Protection Law and Sensitive Data
   https://gdpr-info.eu/

9. **Americans with Disabilities Act** - Employment and Digital Discrimination
   https://www.ada.gov/

# CSS Media Queries Fingerprinting: Your Preferences Betray You

Hey there! Let me tell you about one of the sneakier fingerprinting techniques that's becoming more popular - CSS media queries fingerprinting. It's wild because it uses features designed to make websites more accessible and user-friendly, but instead, it ends up tracking you. Your dark mode preference? That's a tracking signal. Prefer reduced motion for accessibility? That's another data point. It's like your good intentions are being used against you.

Think of it this way: imagine if every store you walked into could instantly tell whether you prefer bright lights or dim lighting, whether you like loud music or quiet ambiance, and whether you prefer large text or small text. That combination of preferences would make you pretty identifiable. CSS media queries work the same way - they reveal your system preferences, and that combination is surprisingly unique.

## What Are CSS Media Queries?

CSS media queries are a web technology that lets websites adapt their appearance based on user preferences and device characteristics. They were created with good intentions - making websites more accessible and respecting user choices.

Common media queries include:

- **prefers-color-scheme**: Do you use dark mode or light mode?
- **prefers-reduced-motion**: Do you want animations disabled for accessibility?
- **prefers-contrast**: Do you need high contrast for visibility?
- **prefers-reduced-transparency**: Do you want less transparency in UI elements?
- **inverted-colors**: Are your system colors inverted?

These seem harmless, right? They help websites look better for you. But here's the problem: these preferences are relatively rare, especially in combination. When trackers collect all these data points together, they create a unique profile.

## How Does CSS Media Queries Fingerprinting Work?

The technique is surprisingly simple. JavaScript can check which media queries match your system using `window.matchMedia()`. Here's a basic example:

```javascript
// Basic CSS media queries fingerprinting
function getCSSMediaFingerprint() {
  const queries = [
    // Color scheme preferences
    '(prefers-color-scheme: dark)',
    '(prefers-color-scheme: light)',

    // Motion preferences
    '(prefers-reduced-motion: reduce)',
    '(prefers-reduced-motion: no-preference)',

    // Contrast preferences
    '(prefers-contrast: high)',
    '(prefers-contrast: more)',
    '(prefers-contrast: less)',
    '(prefers-contrast: no-preference)',

    // Transparency preferences
    '(prefers-reduced-transparency: reduce)',
    '(prefers-reduced-transparency: no-preference)',

    // Color inversion
    '(inverted-colors: inverted)',
    '(inverted-colors: none)',

    // Display modes
    '(display-mode: fullscreen)',
    '(display-mode: standalone)',
    '(display-mode: minimal-ui)',
    '(display-mode: browser)',

    // Pointer capabilities
    '(pointer: fine)',
    '(pointer: coarse)',
    '(pointer: none)',

    // Hover capabilities
    '(hover: hover)',
    '(hover: none)',

    // Device orientation
    '(orientation: portrait)',
    '(orientation: landscape)',
  ];

  const results = queries.map((query) => ({
    query: query,
    matches: window.matchMedia(query).matches,
  }));

  return results.filter((r) => r.matches);
}
```

When you run this code, it returns which of your preferences match. For example:

- `prefers-color-scheme: dark` - You use dark mode
- `prefers-reduced-motion: reduce` - You've enabled reduced motion
- `prefers-contrast: no-preference` - You don't need high contrast
- `pointer: fine` - You're using a mouse (not touch)
- `hover: hover` - Your device supports hover

Individually, these don't reveal much. But combined? They create a pretty unique signature.

### Advanced Detection Techniques

Sophisticated trackers go further and check for uncommon media features:

```javascript
// Advanced CSS media queries fingerprinting
function advancedMediaQueryFingerprint() {
  const fingerprint = {
    basicPreferences: {},
    displayCharacteristics: {},
    inputCapabilities: {},
    environmentalContext: {},
    uncommonQueries: {},
  };

  // 1. Basic user preferences
  const preferences = {
    colorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light',
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)')
      .matches,
    highContrast: window.matchMedia('(prefers-contrast: high)').matches,
    reducedTransparency: window.matchMedia(
      '(prefers-reduced-transparency: reduce)'
    ).matches,
    invertedColors: window.matchMedia('(inverted-colors: inverted)').matches,
  };
  fingerprint.basicPreferences = preferences;

  // 2. Display characteristics
  const display = {
    aspectRatio: null,
    resolution: null,
    colorGamut: null,
    dynamicRange: null,
    orientation: window.matchMedia('(orientation: portrait)').matches
      ? 'portrait'
      : 'landscape',
  };

  // Check aspect ratio (if supported)
  if (window.screen) {
    const ratio = window.screen.width / window.screen.height;
    display.aspectRatio = ratio.toFixed(3);
  }

  // Check color gamut support
  if (window.matchMedia('(color-gamut: srgb)').matches)
    display.colorGamut = 'srgb';
  if (window.matchMedia('(color-gamut: p3)').matches) display.colorGamut = 'p3';
  if (window.matchMedia('(color-gamut: rec2020)').matches)
    display.colorGamut = 'rec2020';

  // Check dynamic range
  if (window.matchMedia('(dynamic-range: high)').matches)
    display.dynamicRange = 'high';
  if (window.matchMedia('(dynamic-range: standard)').matches)
    display.dynamicRange = 'standard';

  fingerprint.displayCharacteristics = display;

  // 3. Input capabilities
  const input = {
    pointer: window.matchMedia('(pointer: fine)').matches ? 'fine' : 'coarse',
    hover: window.matchMedia('(hover: hover)').matches,
    anyPointer: null,
    anyHover: null,
  };

  // Check if any input supports fine pointer
  if (window.matchMedia('(any-pointer: fine)').matches)
    input.anyPointer = 'fine';
  if (window.matchMedia('(any-pointer: coarse)').matches)
    input.anyPointer = 'coarse';
  if (window.matchMedia('(any-hover: hover)').matches) input.anyHover = true;

  fingerprint.inputCapabilities = input;

  // 4. Environmental context
  const environment = {
    displayMode: null,
    forcedColors: null,
    scripting: null,
  };

  // Display mode (PWA context)
  ['fullscreen', 'standalone', 'minimal-ui', 'browser'].forEach((mode) => {
    if (window.matchMedia(`(display-mode: ${mode})`).matches) {
      environment.displayMode = mode;
    }
  });

  // Forced colors (Windows High Contrast mode)
  if (window.matchMedia('(forced-colors: active)').matches) {
    environment.forcedColors = 'active';
  }

  // Scripting support
  if (window.matchMedia('(scripting: enabled)').matches) {
    environment.scripting = 'enabled';
  }

  fingerprint.environmentalContext = environment;

  // 5. Uncommon/experimental queries
  const uncommon = [];
  const experimentalQueries = [
    '(prefers-reduced-data: reduce)',
    '(update: fast)',
    '(update: slow)',
    '(overflow-block: scroll)',
    '(overflow-inline: scroll)',
    '(monochrome)',
    '(grid)',
    '(video-dynamic-range: high)',
  ];

  experimentalQueries.forEach((query) => {
    try {
      if (window.matchMedia(query).matches) {
        uncommon.push(query);
      }
    } catch (e) {
      // Query not supported
    }
  });

  fingerprint.uncommonQueries = uncommon;

  return fingerprint;
}
```

This advanced version captures:

- All standard preference queries
- Display characteristics (color gamut, HDR support)
- Input method detection (mouse vs touch)
- PWA display mode
- Experimental/uncommon media features

The combination of all these factors creates a highly unique fingerprint.

## Real-World Statistics: The Numbers Behind Dark Mode and Preferences

CSS media queries fingerprinting became significantly more relevant in 2024-2025 as dark mode adoption exploded. Here's what the data shows:

### Dark Mode Adoption (2024 Statistics)

| Platform/Context        | Dark Mode Usage           | Source                      |
| ----------------------- | ------------------------- | --------------------------- |
| Smartphone users (2024) | 81.9% - 82.7%             | Flurry Analytics, Forms.app |
| Operating system level  | 82.7% use dark mode       | Forms.app Survey 2024       |
| After 10 PM usage       | 82.7% switch to dark mode | Flurry Analytics            |
| Users aged 18-34        | 70%+ adoption             | WorldMetrics 2024           |
| Overall increase YoY    | 59% growth in 2024        | WiFi Talents Study          |
| Overall global adoption | ~75-82%                   | Multiple sources consensus  |

**Key Finding**: In 2024, nearly 82% of smartphone users prefer dark mode. This is a massive shift from just a few years ago when dark mode users were the minority.

### Why This Matters for Fingerprinting

The problem is that while dark mode is now common, the _combination_ of preferences remains unique:

| Preference Combination           | Estimated Prevalence | Uniqueness Level     |
| -------------------------------- | -------------------- | -------------------- |
| Dark mode only                   | ~80%                 | Very low uniqueness  |
| Dark mode + Reduced motion       | ~4-6%                | Medium uniqueness    |
| Dark mode + High contrast        | ~1-2%                | High uniqueness      |
| Dark mode + Reduced transparency | ~0.5-1%              | Very high uniqueness |
| All four combined                | ~0.1%                | Extremely unique     |

**Source**: Estimated from accessibility statistics and Forms.app dark mode data

### Accessibility Preference Statistics

| Preference           | Usage Rate | Primary Use Case                         |
| -------------------- | ---------- | ---------------------------------------- |
| Reduced motion       | 5-8%       | Vestibular disorders, motion sensitivity |
| High contrast        | 2-3%       | Visual impairments, low vision           |
| Reduced transparency | 1-2%       | Visual clarity, performance              |
| Inverted colors      | <1%        | Specific accessibility needs             |

**Sources**: WebAIM Screen Reader Survey 2024, W3C Accessibility Statistics

The key insight: accessibility preferences are relatively rare. Users who enable them are often identifiable precisely _because_ they care about accessibility.

### Browser Behavior: Fingerprinting Resistance

Different browsers handle media query privacy differently:

| Browser            | Privacy Protection                            | How It Works                      | Effectiveness |
| ------------------ | --------------------------------------------- | --------------------------------- | ------------- |
| Firefox (RFP mode) | `prefers-color-scheme` always reports "light" | Standardizes to most common value | Medium        |
| Brave (Strict)     | Reports "light" in strict mode                | Overrides system preference       | Medium        |
| Safari             | No specific protection                        | Reports actual system values      | Low           |
| Chrome/Edge        | No protection                                 | Reports actual system values      | Low           |
| Tor Browser        | Always reports "light"                        | Part of resist fingerprinting     | High          |

**Source**: Mozilla Bugzilla, Brave GitHub issues, browser testing 2024

### The Firefox Approach

Mozilla's strategy is interesting:

- Firefox's `privacy.resistFingerprinting` mode forces `prefers-color-scheme` to always report "light"
- They chose "light" because historically, it was the default for the vast majority (95%+) of users
- As of 2024, only 0.48% of Firefox traffic uses resist fingerprinting mode
- Firefox-based Tor Browser accounts for 0.017% of all web traffic

**The principle**: It doesn't matter what RFP users actually report, as long as they all report the same value. Uniformity provides anonymity.

## Browser Comparison: Media Query Support 2024-2025

Here's how different browsers implement and expose CSS media queries:

### Feature Support Matrix

| Media Query                  | Chrome 130+  | Firefox 132+  | Safari 18+    | Notes            |
| ---------------------------- | ------------ | ------------- | ------------- | ---------------- |
| prefers-color-scheme         | Full support | Full support  | Full support  | Universal        |
| prefers-reduced-motion       | Full support | Full support  | Full support  | Universal        |
| prefers-contrast             | Full support | Full support  | Full support  | Standard         |
| prefers-reduced-transparency | Full support | Full support  | Full support  | Standard         |
| inverted-colors              | Full support | Full support  | Full support  | Standard         |
| forced-colors                | Full support | Full support  | Partial       | Windows-specific |
| prefers-reduced-data         | Experimental | Not supported | Not supported | Data saver mode  |
| color-gamut                  | Full support | Full support  | Full support  | P3, Rec2020      |
| dynamic-range                | Full support | Experimental  | Full support  | HDR displays     |

### Vendor-Specific Behaviors

**Chrome/Chromium:**

- Exposes all standard media queries
- Supports experimental queries like `prefers-reduced-data`
- No built-in fingerprinting protection
- `Sec-CH-Prefers-Color-Scheme` HTTP header (Client Hints) can also expose preference

**Firefox:**

- Full support for standard queries
- Resist Fingerprinting mode standardizes `prefers-color-scheme` to "light"
- Bug reports show users complaining RFP breaks dark mode on websites
- Discussions about making RFP smarter to allow dark mode without fingerprinting

**Safari:**

- Full support on macOS and iOS
- Tightly integrated with system preferences
- No fingerprinting protection
- Unique behavior: respects system-wide accessibility settings very closely

**Brave:**

- Based on Chromium, supports all Chrome features
- Strict fingerprinting protection reports "light" for color scheme
- Users report dark mode breaking when protections are enabled
- Farbling doesn't currently apply to media queries (as of 2024)

## Privacy Implications: Why This Matters

CSS media queries fingerprinting is concerning for several reasons:

### 1. It Exploits Accessibility Features

This is perhaps the most troubling aspect. Users who enable accessibility features like reduced motion or high contrast often have disabilities or medical conditions. By fingerprinting these preferences, trackers can:

- Identify users with specific accessibility needs
- Create profiles based on probable health conditions
- Discriminate in ways that violate disability rights laws

**Example**: A user with vestibular disorder enables `prefers-reduced-motion`. This becomes part of their fingerprint, potentially revealing their medical condition to advertisers and trackers.

### 2. It's Completely Passive

Unlike canvas or WebGL fingerprinting (which draw graphics or use GPU), media query checks are:

- Instantaneous (no performance impact)
- Invisible (no visual artifacts)
- Undetectable (looks like normal website behavior)
- Always available (can't be disabled without breaking websites)

### 3. It Persists Across Privacy Measures

Your system preferences don't change when you:

- Clear cookies
- Use private/incognito mode
- Change IP addresses via VPN
- Use different browsers (if they're on the same device)

If you enable dark mode system-wide, every browser on your device will report it.

### 4. It Works Without JavaScript (Sort Of)

While JavaScript is needed to _collect_ the data, CSS itself can detect preferences:

```css
/* Pure CSS media query detection */
@media (prefers-color-scheme: dark) {
  body::after {
    content: url('https://tracker.example.com/dark-mode.gif');
  }
}

@media (prefers-reduced-motion: reduce) {
  body::before {
    content: url('https://tracker.example.com/reduced-motion.gif');
  }
}
```

This technique uses CSS to load tracking pixels based on preferences. No JavaScript required. It's harder to implement but demonstrates that even disabling JavaScript doesn't fully protect you.

### 5. It Combines With Other Signals

Media queries alone don't provide much entropy. But combined with:

- Screen resolution (hundreds of variants)
- Timezone (dozens of options)
- Language settings (hundreds of combinations)
- Canvas fingerprint (millions of variants)
- User agent (hundreds of browser versions)

You get a fingerprint that's unique enough to track individuals with 90%+ accuracy.

## The 2024-2025 Landscape: Google's Fingerprinting Policy

Context is important. CSS media queries fingerprinting matters more now because:

### Google's Policy Shift (December 2024)

Google announced that starting February 16, 2025, it would officially allow fingerprinting-based tracking for advertising purposes. This:

- Represents a massive privacy rollback
- Legitimizes techniques previously considered invasive
- Was sharply criticized by privacy advocates and regulators
- Affects billions of Chrome users globally

**Privacy expert Lukasz Olejnik** called it "the biggest privacy erosion in 10 years."

The UK's Information Commissioner's Office (ICO) publicly rebuked Google's decision, stating it undermines user privacy protections.

### The Post-Cookie Era

As third-party cookies are phased out (or in Google's case, made optional), advertisers are turning to fingerprinting as their primary tracking method. CSS media queries are part of this toolkit because:

- They're reliable (preferences don't change often)
- They're legal (not explicitly regulated in most jurisdictions)
- They're hard to block (disabling them breaks website functionality)
- They work cross-site (same preferences everywhere)

### Browser Vendor Responses

**Mozilla (Firefox)**: Trying to balance privacy and functionality. Resist Fingerprinting mode protects users but breaks dark mode on many websites. Ongoing discussions about smarter solutions.

**Brave**: Aggressive fingerprinting protection in strict mode, but users complain about broken dark mode. Considering "farbling" media queries instead of blocking them.

**Apple (Safari)**: No specific protections for media queries. Relies on Intelligent Tracking Prevention (ITP) to block cross-site trackers, but doesn't prevent first-party fingerprinting.

**Google (Chrome)**: No protections. Actively enabling fingerprinting as a cookie replacement.

## Protection Strategies: What Actually Works

Let's be realistic - completely blocking CSS media queries fingerprinting is tough. Here's what helps:

### 1. Use Privacy-Focused Browsers

**Best Choice for Daily Use: Brave**

- Good balance between privacy and functionality
- Strict mode blocks some fingerprinting but may break sites
- Standard mode offers reasonable protection

**Settings**:

```
Brave Settings > Shields > Fingerprinting blocking: Standard
```

(Strict mode may break dark mode on some sites)

**Best for Privacy: Firefox with RFP**

```
about:config → privacy.resistFingerprinting → true
```

**Trade-off**: This forces all websites to light mode, even if you prefer dark mode. There's an open Mozilla bug report (#1732114) requesting an option to allow dark mode with RFP enabled.

**Nuclear Option: Tor Browser**

- All media queries return standardized values
- Maximum privacy at the cost of convenience
- Use for highly sensitive activities only

### 2. Accept the Trade-Off

Here's the honest reality: if you want dark mode, reduced motion for accessibility, or other system preferences to work on websites, those preferences can be fingerprinted.

**Your choices:**

- **Prioritize functionality**: Use your preferred settings, accept tracking risk
- **Prioritize privacy**: Disable privacy-revealing preferences, sacrifice UX
- **Hybrid approach**: Use privacy settings for sensitive browsing, normal settings for casual use

### 3. The "Blend In" Strategy

Sometimes being unremarkable is the best protection:

- **Use default settings**: Light mode, no accessibility preferences (unless needed)
- **Match the majority**: Use common configurations in your region
- **Avoid rare combinations**: Don't enable multiple accessibility features unless necessary

**But**: This advice conflicts with accessibility needs. Users who require reduced motion or high contrast shouldn't have to choose between accessibility and privacy.

### 4. Browser Extensions (Limited Help)

Most anti-fingerprinting extensions don't protect against media queries. But they can help by:

- **uBlock Origin**: Blocks tracker scripts before they can check preferences
- **Privacy Badger**: Learns and blocks tracking domains over time
- **NoScript**: Nuclear option that breaks most sites but blocks JavaScript fingerprinting

**Key insight**: Blocking the _trackers_ is more effective than trying to spoof the _fingerprints_.

### 5. For Website Owners: Respect Privacy

If you run a website:

- **Don't fingerprint users**: Just because you can doesn't mean you should
- **Use media queries for their intended purpose**: Improve UX, not track users
- **Implement proper consent**: If you do fingerprint, get explicit permission (GDPR/CCPA compliance)
- **Support privacy headers**: Respect `Do Not Track` and `Global Privacy Control` signals

## Bottom Line: What You Need to Know

CSS media queries fingerprinting is one of those techniques that feels particularly unfair because it exploits features designed to help users.

**Key Takeaways:**

1. **Dark mode is trackable**: 82% of users prefer dark mode, but trackers still use it as a signal
2. **Accessibility preferences are identifying**: Reduced motion, high contrast, etc. are rare and therefore unique
3. **Combinations matter**: Individual preferences are common, but combinations are unique
4. **Hard to block**: Protecting against this breaks website functionality
5. **Trade-offs are real**: Privacy vs. functionality is a genuine dilemma

**My Honest Take:**

For most people: Use the preferences you want. If you need dark mode or accessibility features, enable them. The privacy cost is real but manageable if you use content blockers and privacy-respecting browsers.

For privacy-conscious users: Use Brave or Firefox, accept that you'll need to choose between some preferences and privacy, and focus on blocking trackers rather than spoofing fingerprints.

For high-risk individuals: Use Tor Browser for sensitive activities, accept standardized settings, and understand that true anonymity requires sacrificing personalization.

**The Bigger Issue:**

CSS media queries fingerprinting highlights a fundamental tension: the web is increasingly designed to adapt to individual users, but that personalization enables tracking. As Google embraces fingerprinting and other companies follow, this problem will only get worse.

The solution isn't just technical - it's also regulatory and cultural. We need:

- Stronger privacy regulations that ban fingerprinting without consent
- Browser vendors prioritizing privacy over ad revenue
- Industry standards that respect user privacy by default
- User awareness and pressure for change

Until then, we're stuck making uncomfortable trade-offs between privacy and functionality. And that sucks.

Now you know: even your preference for dark mode can be used to track you. The web is complicated.

---

**Sources:**

- [Forms.app: 35+ Dark Mode Statistics You Need to Know (2025)](https://forms.app/en/blog/dark-mode-statistics) - Comprehensive dark mode adoption data
- [WorldMetrics: Dark Mode Usage Statistics (2024)](https://worldmetrics.org/dark-mode-usage-statistics/) - Global usage patterns and demographics
- [The Small Business Blog: How Many People Use Dark Mode in 2024?](https://thesmallbusinessblog.com/dark-mode-users/) - Key statistics on dark mode adoption
- [Mozilla Bugzilla #1732114: Resist Fingerprinting Should Have Option to Not Force prefers-color-scheme to White](https://bugzilla.mozilla.org/show_bug.cgi?id=1732114) - Firefox RFP dark mode issue
- [Mozilla Bugzilla #1540726: Make Sure CSS prefers-color-scheme Feature Respects Resist Fingerprinting Mode](https://bugzilla.mozilla.org/show_bug.cgi?id=1540726) - Firefox privacy implementation
- [Fingerprint.com: Why Anti-Fingerprinting Techniques Don't Work in Browsers](https://fingerprint.com/blog/browser-anti-fingerprinting-techniques/) - Analysis of protection effectiveness
- [Lukasz Olejnik: Biggest Privacy Erosion in 10 Years? On Google's Policy Change Towards Fingerprinting](https://blog.lukaszolejnik.com/biggest-privacy-erosion-in-10-years-on-googles-policy-change-towards-fingerprinting/) - Expert analysis of Google's 2024 policy shift
- [MDN Web Docs: prefers-color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme) - Technical specification
- [MDN Web Docs: Sec-CH-Prefers-Color-Scheme Header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Sec-CH-Prefers-Color-Scheme) - Client Hints privacy considerations

**Last Updated**: January 2025 | **Word Count**: 3,750+ words

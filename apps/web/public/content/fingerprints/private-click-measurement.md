# Private Click Measurement Fingerprinting

Apple's Private Click Measurement (PCM) API detection serves as an unintentional browser fingerprinting vector that reliably identifies Safari users across the Apple ecosystem. While designed as a privacy-preserving alternative to traditional cookie-based ad attribution, the mere presence of PCM APIs creates a distinctive signature that reveals browser vendor, operating system, and user privacy preferences. This represents a classic example of privacy technology inadvertently enabling new tracking methods through feature detection.

## Technical Implementation

Private Click Measurement detection relies on probing the HTMLAnchorElement prototype for PCM-specific properties. The most common detection method checks for the `attributionSourceId` attribute:

```javascript
const supportsPCM = 'attributionSourceId' in HTMLAnchorElement.prototype;
```

This test returns `true` exclusively on Safari 14.1 and later versions running on iOS or macOS, making it a reliable Apple ecosystem identifier. More comprehensive detection scripts may probe multiple PCM-related properties:

```javascript
const pcmFingerprint = {
  hasAttributionSourceId: 'attributionSourceId' in HTMLAnchorElement.prototype,
  hasAttributionDestination:
    'attributionDestination' in HTMLAnchorElement.prototype,
  hasAttributeOn: 'attributeon' in HTMLAnchorElement.prototype,
  isSafari: supportsPCM, // Binary Safari indicator
};
```

Advanced fingerprinting may combine PCM detection with related Safari-specific APIs:

```javascript
const safariIndicators = {
  pcm: 'attributionSourceId' in HTMLAnchorElement.prototype,
  applePayJS: 'ApplePaySession' in window,
  webkit: 'webkit' in window || 'webkitRequestAnimationFrame' in window,
  touchBar: 'TouchBar' in window,
  safariExtension: 'safari' in window && 'extension' in window.safari,
};
```

This multi-factor detection creates a high-confidence Safari identification system that circumvents user agent spoofing.

## Browser Support and Distribution

Private Click Measurement support is exclusively limited to Apple's WebKit browser engine:

**Safari 14.1+** (April 2021 and later):

- macOS Big Sur (11.3+) and later
- iOS 14.5+ and iPadOS 14.5+
- Safari Technology Preview

**Other Browsers**:

- Chrome/Chromium: Not supported
- Firefox: Not supported (Mozilla explicitly rejected implementation)
- Edge: Not supported
- Opera: Not supported
- Brave: Not supported (uses Chromium engine)

According to browser market share statistics for 2024-2025:

- Safari represents approximately 15-20% of global browser market share
- iOS Safari dominates mobile browsing in North America (50-60%)
- macOS Safari accounts for 10-15% of desktop browsers
- Combined Apple ecosystem represents 600+ million active devices

This distribution creates a substantial fingerprinting opportunity, as PCM detection immediately segments users into a 15-20% minority group, contributing approximately 2.3-2.7 bits of identifying entropy (-log2(0.15) to -log2(0.20)).

## Purpose and Functionality

Understanding PCM's intended purpose reveals why its detection enables fingerprinting. Apple introduced Private Click Measurement as a privacy-preserving ad attribution system that allows advertisers to measure campaign effectiveness without persistent cross-site tracking.

**Core Privacy Features**:

- Randomized 24-48 hour delay before attribution reports
- Limited data transfer: 8-bit source ID (256 campaigns) and 4-bit conversion ID (16 values)
- Maximum 7-day attribution window
- On-device processing without server-side correlation
- IP address protection in attribution reports (iOS 15+/macOS 12+)

**Intended Use Case**:
A user clicks an ad on `source.com` tagged with `attributionSourceId="42"`, then completes a purchase on `destination.com` tagged with a conversion value. After 24-48 hours, both domains receive a minimal attribution report confirming the click-to-conversion path without revealing user identity, browsing history, or cross-site behavior.

**Privacy vs. Tracking Paradox**:
While PCM aims to prevent tracking through data minimization, its presence enables new tracking through feature detection. The paradox emerges because:

1. PCM implementation requires browser-exposed APIs
2. Feature detection is faster and simpler than cookie-based tracking
3. Safari's unique implementation creates a reliable device/browser signature
4. Apple's anti-fingerprinting measures don't hide PCM presence

This creates the ironic situation where a privacy technology becomes a tracking enabler.

## Privacy Concerns and Tracking Risks

Mozilla's Privacy Team conducted extensive analysis of PCM and identified critical tracking vulnerabilities that motivated Firefox's decision not to implement the API. Their research, published in the paper "An Analysis of Apple's Private Click Measurement," revealed several concerning attack vectors:

**Cross-Site Tracking via PCM Abuse**:
Despite PCM's privacy goals, Mozilla demonstrated that two collaborating websites can use the API for cross-site user identification. The attack works as follows:

1. User visits `site-a.com` with local user ID `12345`
2. Site A encodes this ID into a series of ad clicks with different source IDs
3. User later visits `site-b.com` with different local ID `67890`
4. Site B triggers conversion pixels matching the source ID pattern
5. After 24-48 hours, both sites receive attribution reports confirming ID correlation
6. Sites now know that user `12345` on Site A is the same person as user `67890` on Site B

Once this identity link is established, the sites can track the user indefinitely without PCM, simply by confirming their shared identity database. The 24-48 hour delay provides plausible deniability but doesn't prevent the tracking—it merely delays it.

**Storage and Communication Channel**:
PCM effectively creates a cross-site communication channel that can store and transfer information between websites. Although limited to 8 bits (source) + 4 bits (conversion) = 12 bits per interaction, persistent adversaries can accumulate significant data over time.

**Fingerprinting Enhancement**:
Beyond direct tracking, PCM detection combines with other Safari-specific features to create a comprehensive Apple ecosystem fingerprint:

```javascript
const appleEcosystemFingerprint = {
  pcm: 'attributionSourceId' in HTMLAnchorElement.prototype,
  applePay: typeof ApplePaySession !== 'undefined',
  webkit: navigator.vendor === 'Apple Computer, Inc.',
  platform:
    navigator.platform.includes('Mac') || navigator.platform.includes('iPhone'),
  touchSupport: 'ontouchstart' in window,
  accelerometer: 'DeviceMotionEvent' in window,
};
```

This composite fingerprint achieves near-perfect accuracy in identifying Safari users on Apple devices, defeating user agent randomization and other anti-fingerprinting measures.

## Real-World Fingerprinting

Commercial fingerprinting libraries actively exploit PCM detection. Analysis of popular fingerprinting services reveals widespread implementation:

**FingerprintJS** (open-source library):
Includes Safari detection via multiple signals including PCM availability, vendor string, and WebKit-specific APIs. The combined signal provides high-confidence browser identification.

**CreepJS** (research tool):
Explicitly tests for PCM support and includes it in the comprehensive browser fingerprint alongside 50+ other data points.

**Commercial Solutions** (PerimeterX, DataDome, Akamai Bot Manager):
Proprietary fingerprinting systems use PCM detection as part of bot detection and fraud prevention, identifying Safari users for differential treatment in security rules.

**Analytics Platforms**:
Major analytics services (Google Analytics, Adobe Analytics, Mixpanel) can infer Safari usage through indirect signals even without directly probing PCM, as Safari users exhibit distinct behavioral patterns.

## Information Entropy Calculation

From an information theory perspective, PCM detection contributes meaningful entropy to browser fingerprints:

**Baseline Entropy**:

- Safari market share: 15-20%
- Entropy contribution: -log2(0.15 to 0.20) = 2.3 to 2.7 bits

**Conditional Entropy** (given other signals):

- Safari on macOS: 10% of desktop traffic → 3.3 bits
- Safari on iOS: 50% of mobile traffic (US) → 1.0 bits
- Safari with Apple Pay support: 8% of all traffic → 3.6 bits

**Combined Fingerprint Power**:
When PCM detection is combined with other browser fingerprinting techniques, it significantly reduces the anonymity set:

- User Agent + PCM: Confirms Safari (defeats spoofing)
- Screen resolution + PCM: Identifies specific Apple device models
- Canvas fingerprint + PCM: Creates unique Safari user signature
- Timezone + Language + PCM: Enables geographic clustering

A user with PCM support + iPhone screen resolution (1170x2532) + Pacific timezone + English language creates a fingerprint matching approximately 0.1% of global traffic, effectively achieving near-unique identification.

## Mitigation Strategies

Privacy-conscious Safari users face limited options for defeating PCM-based fingerprinting:

**Browser-Level Defenses**:

1. **User Agent Spoofing**: Extensions like User-Agent Switcher can spoof Chrome/Firefox user agents, but PCM detection bypasses this by testing actual API support.

2. **JavaScript Blocking**: Disabling JavaScript entirely prevents PCM detection but breaks modern web functionality. Content blockers (1Blocker, AdGuard) don't typically block feature detection scripts.

3. **Tor Browser**: Switching to Tor Browser (Firefox-based) eliminates PCM APIs but abandons Safari's security features and ecosystem integration.

4. **Private Browsing Mode**: Safari's Private Browsing does NOT disable PCM APIs—feature detection still works, making this ineffective against fingerprinting.

**Advanced Evasion**:

JavaScript injection through browser extensions can override the PCM detection:

```javascript
// Remove PCM properties from prototype
delete HTMLAnchorElement.prototype.attributionSourceId;
delete HTMLAnchorElement.prototype.attributionDestination;
delete HTMLAnchorElement.prototype.attributeOn;

// Override property detection
Object.defineProperty(HTMLAnchorElement.prototype, 'attributionSourceId', {
  get: undefined,
  configurable: false,
});
```

However, this approach breaks legitimate PCM functionality and may create detectable anomalies (Safari without PCM is suspicious).

**Realistic Defense Strategy**:

For most users, accepting PCM-based fingerprinting is the practical choice, as:

- Safari's anti-tracking features (ITP, bounce tracking protection) outweigh PCM fingerprinting risks
- Switching browsers sacrifices Apple ecosystem integration
- PCM tracking requires sophisticated adversaries (not typical ad networks)

Users with high privacy requirements should use Firefox or Brave, which lack PCM and provide stronger anti-fingerprinting protections.

## Apple's Position on Fingerprinting

Apple's developer guidelines explicitly prohibit fingerprinting, creating a contradictory situation where their own API enables the practice:

**App Store Review Guidelines 2.5.13**:
"Apps may not use or transmit a user's data without first obtaining the user's permission and providing the user with access to information about how and where the data will be used."

**Safari Anti-Fingerprinting Measures**:

- Intelligent Tracking Prevention (ITP) blocks third-party cookies
- User agent freezing to reduce version entropy
- Canvas fingerprinting detection and blocking
- Bounce tracking prevention

Yet PCM's presence remains fully detectable, suggesting Apple views feature detection as distinct from active fingerprinting. This philosophical position prioritizes legitimate feature detection for progressive enhancement while attempting to block passive fingerprinting through browser signals.

## Regulatory and Standards Perspective

The W3C Privacy Community Group has extensively debated privacy-preserving attribution systems like PCM. Key developments:

**W3C Privacy Principles**:
The Privacy Principles specification recommends that "Privacy-relevant features should not themselves enable fingerprinting," creating a tension with PCM's detectable implementation.

**GDPR Considerations**:
Under European privacy law, PCM-based fingerprinting may constitute personal data processing requiring consent. Feature detection for tracking purposes could violate GDPR Article 5 (lawfulness, fairness, transparency).

**Privacy Sandbox**:
Google's Privacy Sandbox proposes similar attribution APIs (Attribution Reporting API) that face identical fingerprinting concerns. The challenge of building detectable APIs with privacy goals remains unsolved.

## Mozilla's Rejection Rationale

Mozilla's decision not to implement PCM in Firefox provides valuable perspective. Their analysis concluded:

"If Firefox implemented PCM, it would enable a new way to perform cross-site tracking. While some sites might choose to use PCM as intended, nothing in the design of PCM prevents sites from using it for tracking. Once two sites have confirmed their different user identities correspond to the same person, they can track this person across the two sites without any further indication that tracking is happening."

This analysis prioritizes preventing new tracking vectors over supporting privacy-preserving attribution, reflecting a fundamentally different privacy philosophy than Apple's approach.

## Future Developments

The evolution of PCM and similar attribution APIs will shape fingerprinting landscapes:

**Standardization Efforts**:
W3C's Private Advertising Technology Community Group is working toward cross-browser attribution standards. If Chrome, Firefox, and Safari converge on a single API, PCM detection would lose fingerprinting value (entropy approaches zero as adoption reaches 100%).

**Enhanced Privacy Protections**:
Future Safari versions may hide PCM APIs behind permission prompts or disable feature detection in specific contexts (private browsing, cross-origin iframes).

**Regulatory Pressure**:
GDPR enforcement and California Consumer Privacy Act (CCPA) requirements may force changes to detectable privacy APIs, requiring user consent before exposing fingerprinting-capable features.

**Alternative Attribution Systems**:
Server-side attribution solutions (first-party data, probabilistic modeling) may reduce reliance on browser APIs, eliminating the fingerprinting vector entirely.

## Conclusion

Private Click Measurement represents a privacy technology that inadvertently enables fingerprinting through feature detection. The API's Safari-exclusive implementation creates a reliable browser identification mechanism that contributes 2.3-2.7 bits of entropy to comprehensive fingerprints.

While PCM's intended purpose—privacy-preserving ad attribution—serves legitimate goals, its implementation demonstrates the fundamental challenge of building detectable privacy features. Any API exposed to JavaScript becomes a potential fingerprinting vector, regardless of its privacy protections for the data it processes.

Users concerned about PCM-based fingerprinting should recognize that Safari's overall privacy posture (ITP, anti-tracking features) likely provides stronger protection than eliminating PCM detection would achieve. For those requiring maximum anonymity, Firefox or Tor Browser remain better choices than attempting to mask Safari's distinctive features.

The broader lesson for privacy technology developers: detectable privacy features create new tracking opportunities. True privacy may require standardization across all browsers, reducing feature-based entropy to zero through universal adoption rather than selective implementation.

## Sources

- WebKit Blog: "Introducing Private Click Measurement, PCM" (June 2021)
- Mozilla: "An Analysis of Apple's Private Click Measurement" (Martin Thomson, 2021)
- Apple Developer: "Meet privacy-preserving ad attribution" (WWDC 2021)
- W3C Privacy Community Group: Attribution Reporting discussions
- StatCounter Global Stats: Browser market share data (2024-2025)
- GDPR Article 5: Principles relating to processing of personal data
- FingerprintJS technical documentation and source code
- EFF Panopticlick: Browser fingerprinting research

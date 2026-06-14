# OS CPU Fingerprinting

The `navigator.oscpu` property represents a Firefox-specific browser API that exposes detailed operating system and CPU architecture information, creating a distinctive fingerprinting vector unique to Mozilla's browser engine. Unlike cross-browser properties like user agent or vendor, oscpu's Firefox exclusivity makes it simultaneously a powerful browser identifier and a revealing hardware signature. This deprecated property exemplifies the tension between providing useful debugging information and preserving user privacy in an era of ubiquitous browser fingerprinting.

## Technical Implementation

The oscpu property is accessed through the standard navigator object:

```javascript
const oscpu = navigator.oscpu;
```

**Firefox Returns** (representative examples):

- `"Windows NT 10.0; Win64; x64"` - Windows 10/11 64-bit
- `"Windows NT 6.3; Win64; x64"` - Windows 8.1 64-bit
- `"Linux x86_64"` - 64-bit Linux
- `"Linux i686"` - 32-bit Linux
- `"Intel Mac OS X 10.15"` - macOS Catalina
- `"Intel Mac OS X 13.0"` - macOS Ventura

**Non-Firefox Browsers Return**:

- Chrome/Chromium: `undefined`
- Safari: `undefined`
- Edge: `undefined`
- Opera: `undefined`
- Brave: `undefined`

This binary distinction (Firefox vs. everything else) creates an immediate browser identification mechanism before even parsing the returned string.

## Information Revealed

When oscpu returns a non-undefined value, it discloses multiple layers of system information:

### Operating System Identification

The oscpu string reveals precise OS family and version:

**Windows Detection**:

- NT 10.0 = Windows 10 or Windows 11
- NT 6.3 = Windows 8.1
- NT 6.2 = Windows 8
- NT 6.1 = Windows 7
- NT 6.0 = Windows Vista

Note that Windows 11 reports the same NT version (10.0) as Windows 10, requiring additional signals to distinguish between them.

**Linux Detection**:

- Reveals Linux kernel architecture (x86_64, i686, armv7l, aarch64)
- Does NOT reveal specific distribution (Ubuntu, Fedora, Debian)
- Provides bitness (32-bit vs 64-bit)

**macOS Detection**:

- Reports macOS version number (10.15, 11.0, 12.0, 13.0)
- Includes "Intel" prefix (even on Apple Silicon Macs due to Rosetta)
- Reveals major OS updates immediately after installation

### Architecture Information

The oscpu string exposes CPU architecture details:

**x86/x64 Classification**:

- "Win64; x64" or "x86_64" = 64-bit Intel/AMD
- "Win32" or "i686" = 32-bit Intel/AMD
- Distinguishes ARM from x86 on Linux (armv7l, aarch64)

**Bitness Detection**:
The 32-bit vs 64-bit distinction reveals:

- Device age (most post-2015 systems are 64-bit)
- RAM capacity (32-bit limited to 4GB)
- Software ecosystem (legacy vs modern)

This information cannot be easily obtained from user agent alone in privacy-hardened configurations, making oscpu a valuable fingerprinting complement.

## Firefox-Only Implementation

The oscpu property's Firefox exclusivity creates several unique fingerprinting implications:

### Browser Identification

The simplest oscpu-based browser detection:

```javascript
function isFirefox() {
  return typeof navigator.oscpu !== 'undefined';
}

// This test achieves near-perfect Firefox identification
// (Barring sophisticated JavaScript injection spoofing)
```

This binary test contributes entropy based on Firefox market share:

**Global Browser Market Share** (2024-2025):

- Chrome/Chromium: ~65%
- Safari: ~20%
- Edge: ~5%
- Firefox: ~3%
- Others: ~7%

Entropy from Firefox detection: -log2(0.03) ≈ 5.1 bits

This makes oscpu one of the highest-entropy single properties available, as it immediately narrows the user population to approximately 3% of global traffic.

### Spoofing Detection

The oscpu property helps detect user agent spoofing attempts:

```javascript
function detectFirefoxSpoofing() {
  const userAgent = navigator.userAgent;
  const oscpu = navigator.oscpu;

  // Firefox user agent but no oscpu = spoofed
  if (/Firefox/.test(userAgent) && typeof oscpu === 'undefined') {
    return 'NON_FIREFOX_PRETENDING_TO_BE_FIREFOX';
  }

  // Non-Firefox user agent but has oscpu = genuine Firefox with spoofed UA
  if (!/Firefox/.test(userAgent) && typeof oscpu !== 'undefined') {
    return 'FIREFOX_PRETENDING_TO_BE_OTHER_BROWSER';
  }

  // oscpu OS conflicts with user agent OS
  if (oscpu && oscpu.includes('Windows') && /Macintosh/.test(userAgent)) {
    return 'OS_MISMATCH_DETECTED';
  }

  return 'CONSISTENT';
}
```

This cross-validation technique exposes simple user agent spoofing, forcing more sophisticated attackers to inject JavaScript to override oscpu as well.

## Privacy Implications

The oscpu property creates several privacy concerns that led to deprecation discussions:

### Operating System Version Fingerprinting

Unlike user agent strings (which Firefox freezes for privacy), oscpu dynamically reports actual OS version:

**Version Tracking Over Time**:
A user upgrading from Windows 10 to Windows 11 would see oscpu change from "Windows NT 10.0" to... also "Windows NT 10.0" (same NT version). However, macOS users upgrading from 12.0 to 13.0 are immediately identifiable through oscpu changes.

This enables:

- Tracking users across OS upgrades
- Identifying early adopters of new OS versions
- Detecting corporate environments with standardized OS builds

### Enterprise Environment Detection

Corporate IT departments often standardize on specific OS builds, creating distinctive oscpu patterns:

**Corporate Fingerprints**:

- "Windows NT 10.0; Win64; x64" + specific Firefox ESR version = likely enterprise deployment
- Older NT versions (6.1, 6.3) on modern hardware = legacy enterprise environment
- Uniform OS version across multiple sessions = centrally managed systems

This allows B2B advertisers to identify and target enterprise users with higher-value products and services.

### Geographic and Socioeconomic Profiling

OS version adoption varies by region and income:

**Regional Patterns**:

- Latest macOS versions (13.0+) concentrated in North America, Western Europe
- Older Windows versions (NT 6.x) more common in developing regions
- Linux users (any oscpu containing "Linux") skew technical/developer demographics

**Device Age Inference**:

- 32-bit architectures (i686, Win32) indicate older hardware
- Latest macOS versions require recent hardware ($1000+ devices)
- Windows NT 6.x versions suggest devices 5+ years old

This enables socioeconomic targeting and pricing discrimination based on inferred purchasing power.

## Deprecation Status and Browser Position

The oscpu property faces an uncertain future as Firefox balances compatibility with privacy:

### Official Deprecation

Mozilla documentation marks navigator.oscpu as deprecated with warnings:

**MDN Web Docs Status**: "Deprecated: This feature is no longer recommended. Though some browsers might still support it, it may have already been removed from the relevant web standards."

**Firefox Bug Tracker**: Discussions dating back to 2016 propose removing oscpu to reduce fingerprinting surface, but compatibility concerns prevent immediate removal.

### Firefox Privacy Resistance

Firefox's `privacy.resistFingerprinting` preference modifies oscpu behavior:

**Standard Configuration**:

```javascript
navigator.oscpu; // Returns actual OS and architecture
```

**With privacy.resistFingerprinting Enabled**:

```javascript
navigator.oscpu; // Returns spoofed/normalized value
```

Specifically, enabling `privacy.resistFingerprinting` (about:config setting) causes Firefox to report:

- Spoofed OS version (normalized to common value)
- Randomized or frozen architecture
- Consistent with spoofed user agent

However, this preference is disabled by default, meaning the vast majority of Firefox users expose real oscpu values.

### Tor Browser Handling

Tor Browser (Firefox-based) handles oscpu carefully:

```javascript
// Tor Browser oscpu behavior
navigator.oscpu; // Returns generic "Windows NT 10.0; Win64; x64" regardless of actual OS
```

All Tor Browser users report identical oscpu values, eliminating this fingerprinting vector. The normalized value matches the spoofed Windows 10 user agent Tor presents, maintaining consistency to avoid spoofing detection.

## Cross-Browser Comparison

The oscpu property exists in a landscape of related but distinct OS-detection APIs:

| Property                | Firefox                 | Chrome                | Safari       | Entropy  |
| ----------------------- | ----------------------- | --------------------- | ------------ | -------- |
| navigator.oscpu         | Detailed OS+CPU         | undefined             | undefined    | 5+ bits  |
| navigator.platform      | Generic (e.g., "Win32") | Generic               | Generic      | 2-3 bits |
| navigator.userAgent     | Full details            | Full details          | Full details | 5-8 bits |
| navigator.userAgentData | undefined               | Detailed (permission) | undefined    | Variable |

The oscpu property is unique in:

- Firefox exclusivity (highest browser-specific entropy)
- Detailed OS version without parsing required
- No permission requirements (unlike userAgentData)
- Immunity to standard user agent spoofing

This makes it particularly valuable for fingerprinting when combined with other signals.

## Information Entropy Analysis

The total entropy contribution of oscpu combines Firefox identification with within-Firefox OS diversity:

### Firefox Detection Entropy

Browser identification alone: -log2(0.03) ≈ 5.1 bits

### Within-Firefox OS Distribution

**Firefox User Base OS Breakdown** (estimated):

- Windows: ~60% of Firefox users
  - NT 10.0: ~90% of Windows Firefox users
  - NT 6.3 and older: ~10%
- macOS: ~25% of Firefox users
  - Various versions (10.15 through 14.0): distributed
- Linux: ~15% of Firefox users
  - x86_64: ~90%, other architectures: ~10%

**OS-Level Entropy** (within Firefox):
H ≈ 1.5-2.0 bits (from OS family + version + architecture combinations)

**Combined Total Entropy**:
Browser detection (5.1 bits) + OS details (1.5-2.0 bits) ≈ 6.5-7.0 bits

This makes oscpu one of the highest-entropy single browser properties, rivaling canvas fingerprinting (5-7 bits) and WebGL vendor/renderer (6-8 bits).

## Real-World Fingerprinting Usage

Commercial and research fingerprinting libraries actively exploit oscpu:

### FingerprintJS Implementation

The FingerprintJS open-source library includes oscpu detection:

```javascript
function getOsCpu() {
  return navigator.oscpu;
}

// Combined with other signals in hash generation
const fingerprint = hashCombine([
  getOsCpu(),
  navigator.userAgent,
  screen.resolution,
  // ... 50+ other signals
]);
```

### CreepJS Analysis

CreepJS explicitly tests oscpu and flags Firefox-specific fingerprints:

```javascript
const oscpuData = {
  value: navigator.oscpu,
  isFirefox: typeof navigator.oscpu !== 'undefined',
  osVersion: parseOSVersion(navigator.oscpu),
  architecture: parseArchitecture(navigator.oscpu),
};
```

### Commercial Anti-Fraud Systems

Enterprise bot detection platforms (DataDome, PerimeterX, Akamai) use oscpu as part of multi-signal analysis:

- Firefox detection for browser-specific rules
- OS version verification against user agent claims
- Anomaly detection (oscpu vs platform vs user agent mismatches)
- Behavioral profiling (Firefox users exhibit distinct browsing patterns)

## Comparison with navigator.cpuClass

The oscpu property serves similar purposes as the obsolete navigator.cpuClass (IE-only), but with key differences:

| Feature          | oscpu (Firefox)       | cpuClass (IE, obsolete) |
| ---------------- | --------------------- | ----------------------- |
| Browser support  | Firefox only          | IE only (deprecated)    |
| Current status   | Active but deprecated | Completely removed      |
| Information      | OS version + CPU      | CPU architecture only   |
| Entropy          | 6.5-7.0 bits          | 1-3 bits (historical)   |
| Privacy controls | resistFingerprinting  | None                    |

Both properties share the pattern of browser-exclusive APIs that become powerful fingerprinting vectors through their exclusivity rather than just their information content.

## Mitigation Strategies

Users seeking to reduce oscpu-based fingerprinting have several options:

### Enable Firefox Privacy Protections

The most effective Firefox-native approach:

1. Navigate to `about:config`
2. Set `privacy.resistFingerprinting` to `true`
3. This spoofs oscpu to generic values matching spoofed user agent

**Trade-offs**:

- Breaks some websites expecting real OS detection
- May impact font rendering and UI scaling
- Disables certain performance optimizations

### Switch Browsers

The most straightforward mitigation:

- Use Chrome/Chromium (no oscpu property)
- Use Safari (no oscpu property)
- Use Tor Browser (oscpu normalized to common value)

**Trade-off**: Sacrifice Firefox-specific features and privacy protections

### JavaScript Injection (Advanced)

Browser extensions can override oscpu:

```javascript
Object.defineProperty(Navigator.prototype, 'oscpu', {
  get: () => undefined,
});
```

This removes the property entirely, making Firefox appear as Chrome/Safari. However, this creates a detectable anomaly—Firefox without oscpu is suspicious.

**Alternative Approach**:

```javascript
Object.defineProperty(Navigator.prototype, 'oscpu', {
  get: () => 'Windows NT 10.0; Win64; x64', // Spoof to common value
});
```

This normalizes Firefox users to a common oscpu value, reducing uniqueness.

## Web Standards and Standardization

The oscpu property's Firefox-only status reflects lack of web standards consensus:

### WHATWG Position

The WHATWG HTML Living Standard does NOT include navigator.oscpu, marking it as a non-standard Gecko-only extension.

### W3C Privacy Community Group

The Privacy CG recommends against exposing detailed OS information without permission controls, citing fingerprinting risks. The oscpu property violates these principles by:

- Providing passive (no permission) access to OS details
- Exposing high-entropy information
- Enabling persistent tracking through hardware-based signals

### Cross-Browser Standardization Failure

No browser vendor outside Mozilla has shown interest in implementing oscpu, for several reasons:

1. **Privacy concerns**: Exposing detailed OS version aids fingerprinting
2. **Redundancy**: User agent already contains OS information
3. **Maintenance burden**: Keeping OS detection logic updated
4. **Standards rejection**: W3C/WHATWG have not standardized it

This lack of adoption suggests oscpu will eventually be removed rather than standardized.

## Regulatory Perspective

Modern privacy regulations likely classify oscpu-based fingerprinting as personal data processing:

### GDPR Compliance

**Article 4(1) - Personal Data**: Browser fingerprints using oscpu constitute "information relating to an identified or identifiable natural person."

**Article 5 - Lawfulness**: Collecting oscpu without consent may violate lawfulness and transparency requirements.

**Recital 30**: Explicitly mentions online identifiers like "device fingerprints" as personal data.

### ePrivacy Directive

The ePrivacy Directive requires consent for storing or accessing information on user devices. While oscpu is read-only (not storing data), its use for fingerprinting may require consent under evolving legal interpretations.

### CCPA

California Consumer Privacy Act classifies browser fingerprints as "unique identifiers" subject to:

- Disclosure in privacy policies
- Opt-out rights for sale to third parties
- Deletion rights (though fingerprints are often regenerated)

## Academic Research

Browser fingerprinting research has extensively studied Firefox-specific signals including oscpu:

### AmIUnique Study (2016)

Analysis of 118,934 browser fingerprints found:

- Firefox users had distinct fingerprints due to Gecko-specific properties
- oscpu contributed 5-7 bits of entropy when present
- 89.4% of overall fingerprints were unique (across all browsers)

### Cross-Browser Tracking Research (2017)

Academic paper "Cross-Browser Fingerprinting via OS and Hardware Level Features" identified oscpu as a high-value cross-session tracking signal:

- Stable across Firefox updates
- Resistant to cache/cookie clearing
- Enables linking Firefox sessions to Chrome/Safari sessions (same hardware)

### Panopticlick Updates (2020-2025)

EFF's Panopticlick tool tests for oscpu and warns Firefox users:

- "Your browser exposes OS details through navigator.oscpu"
- Recommends enabling privacy.resistFingerprinting
- Measures 83.6% unique fingerprints overall

## Future Outlook

The oscpu property faces likely removal as Firefox prioritizes privacy:

### Mozilla's Privacy Roadmap

Firefox development roadmap indicates:

- Increased adoption of privacy-preserving defaults
- Gradual removal of fingerprintable APIs
- Alignment with web standards (oscpu is non-standard)

### Potential Removal Timeline

**2025-2026**: Deprecation warnings in Firefox developer console
**2027-2028**: Default behavior changes (oscpu returns generic value)
**2029+**: Complete removal, returns undefined like other browsers

### Web Compatibility Concerns

The main barrier to removal is website compatibility:

- ~0.5% of websites probe oscpu (per HTTP Archive data)
- Most uses are for analytics/telemetry (not critical functionality)
- Breaking changes unlikely to affect major sites

This relatively low usage makes removal feasible without significant web breakage.

## Lessons for Privacy-Conscious Development

The oscpu property exemplifies several principles for reducing fingerprinting:

1. **Avoid Browser-Exclusive APIs**: Firefox-only properties create instant identification
2. **Prefer Coarse-Grained Data**: OS family is less identifying than OS version
3. **Implement Permission Controls**: High-entropy signals should require user consent
4. **Default to Privacy**: Sensitive features should be opt-in, not opt-out
5. **Consider Cumulative Entropy**: Oscpu's 6-7 bits combine with other signals to create unique fingerprints

Modern API design (User-Agent Client Hints, Privacy Budget proposals) reflects these lessons learned from oscpu and similar deprecated properties.

## Conclusion

The navigator.oscpu property represents a powerful but problematic fingerprinting vector unique to Firefox. Its 6.5-7.0 bits of entropy make it one of the highest-value single browser properties, combining Firefox identification with detailed OS and architecture information.

For users concerned about privacy, enabling Firefox's privacy.resistFingerprinting provides effective protection at the cost of some website compatibility. For maximum anonymity, Tor Browser completely eliminates oscpu as a fingerprinting vector through normalization.

For web developers, relying on oscpu for feature detection is discouraged in favor of capability testing and standardized APIs. The property's deprecated status and Firefox-only support make it unsuitable for cross-browser development.

The broader lesson: browser-exclusive APIs that expose high-entropy hardware details represent privacy anti-patterns that modern web standards actively discourage. As Firefox evolves toward stronger default privacy protections, oscpu will likely join cpuClass and other deprecated properties in the historical archive of fingerprinting techniques.

## Sources

- Mozilla Developer Network: navigator.oscpu documentation (deprecated)
- WHATWG HTML Living Standard: Navigator interface specification
- W3C Privacy Community Group: Fingerprinting guidance
- EFF Panopticlick: Browser fingerprinting research (2020-2025)
- AmIUnique: Browser fingerprint analysis (2016)
- Academic paper: "Cross-Browser Fingerprinting via OS and Hardware Level Features" (2017)
- Firefox Bug Tracker: oscpu removal discussions (Bugzilla #1333651)
- GDPR: Article 4(1) personal data definition and Recital 30
- StatCounter Global Stats: Firefox market share data (2024-2025)
- HTTP Archive: oscpu usage statistics across top websites

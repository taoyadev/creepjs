# HDR Support Fingerprinting

High Dynamic Range (HDR) display detection represents a sophisticated browser fingerprinting vector that reveals premium hardware ownership, professional use cases, and socioeconomic status. This technique uses CSS media queries to detect whether a user's display supports high dynamic range content, creating a powerful binary classifier that segments users into distinct hardware categories. As HDR adoption accelerates across consumer devices, this fingerprinting method has evolved from an exotic edge case into a mainstream tracking mechanism with significant privacy implications.

## Technical Implementation

The HDR detection mechanism leverages the CSS Media Queries Level 5 specification, specifically the `dynamic-range` media feature. Modern browsers expose this capability through the `matchMedia()` API:

```javascript
const supportsHDR = matchMedia('(dynamic-range: high)').matches;
```

This query returns a boolean value indicating whether the display can render content with high dynamic range, defined as peak brightness exceeding 200 nits, deep blacks below 0.1 nits, and a contrast ratio exceeding 2000:1. The specification defines three discrete values: standard (SDR displays), high (HDR10, Dolby Vision), and the rarely-used constrained (limited HDR).

Advanced fingerprinting scripts may probe multiple related queries simultaneously:

```javascript
const hdrCapabilities = {
  dynamicRange: matchMedia('(dynamic-range: high)').matches,
  videoDynamicRange: matchMedia('(video-dynamic-range: high)').matches,
  colorGamut: matchMedia('(color-gamut: p3)').matches,
  colorDepth: screen.colorDepth,
};
```

This composite fingerprint combines HDR support with color gamut (P3 vs sRGB) and color depth (8-bit vs 10-bit), creating a multi-dimensional hardware signature. The combination of HDR + P3 color gamut + 10-bit color depth uniquely identifies premium display ownership with high confidence.

## Browser Support

As of 2025, the dynamic-range media query has achieved comprehensive cross-browser support. Safari pioneered implementation in 2019, followed by Chrome/Edge in 2020, and Firefox in 2021. According to Can I Use data, over 94% of global browser traffic now supports this feature, making it a reliable fingerprinting vector across virtually all modern browsing environments.

The related `video-dynamic-range` query has more limited adoption, with Firefox providing full support, Chrome/Edge offering experimental flags, and Safari lacking implementation. This asymmetry creates additional fingerprinting opportunities through feature detection gaps.

## Market Adoption Statistics

The HDR display market has experienced explosive growth, with significant implications for fingerprinting prevalence. According to multiple industry analyses:

- The global HDR display market reached $21.4 billion in 2024, with projections of $171.2 billion by 2033 (23.7% CAGR)
- Approximately 52% of new televisions and monitors sold in 2024 supported HDR
- Consumer preference surveys indicate 38% actively seek HDR-capable devices for streaming and gaming
- By 2020, HDR had already become standard on most mid-range and high-end televisions

These statistics suggest that HDR detection currently segments approximately 5-8% of desktop/laptop users but significantly higher percentages of mobile and TV-based browser traffic. The distribution varies dramatically by region, with North American and East Asian markets showing 10-15% adoption while other regions remain below 5%.

## Device Categories

HDR support creates distinct device fingerprints across several premium categories:

**Professional Workstations**:

- Apple MacBook Pro 14"/16" (2021 and later models with Liquid Retina XDR)
- Pro Display XDR ($4,999 reference monitor)
- High-end Windows laptops with OLED panels (Dell XPS, HP Spectre)
- Professional color-grading monitors (ASUS ProArt, BenQ SW series)

**Consumer Devices**:

- Flagship smartphones (iPhone 12 Pro and later, Samsung Galaxy S21+)
- Premium tablets (iPad Pro 12.9" with mini-LED)
- High-end gaming monitors (ASUS ROG Swift PG32UQX, Acer Predator X27)
- OLED laptops (Samsung Galaxy Book, Lenovo Yoga series)

**Enterprise Hardware**:

- Creative professional displays (LG UltraFine series)
- Medical imaging monitors (Barco, EIZO RadiForce)
- Broadcast production monitors (Sony BVM-HX series)

The clear pattern reveals that HDR detection predominantly identifies devices priced above $2,000, creating a strong socioeconomic signal. No budget laptops, entry-level smartphones, or standard office equipment report HDR support, making this a reliable wealth indicator.

## Information Entropy

From a technical fingerprinting perspective, HDR support contributes 0.4-0.6 bits of entropy to the overall browser fingerprint. This value derives from the 5-8% adoption rate among desktop browsers, calculated as -log2(0.05 to 0.08) ≈ 4.3 to 3.6 bits for the minority group.

However, the effective entropy depends heavily on context:

- **Desktop browsers**: 0.5 bits (5-8% adoption)
- **Mobile browsers**: 0.8 bits (15-20% adoption on flagships)
- **Tablet browsers**: 1.2 bits (concentrated on premium iPad Pro models)

When combined with other hardware fingerprints (screen resolution, color depth, pixel density), HDR detection significantly narrows the anonymity set. A user with HDR + 3024x1964 resolution + 10-bit color + P3 gamut creates a signature matching only specific MacBook Pro models, reducing entropy effectively to nearly zero within that device class.

## Privacy Implications

HDR fingerprinting enables several concerning tracking and profiling capabilities:

**Socioeconomic Profiling**: HDR support reliably identifies users who have spent $2,000+ on their primary device, enabling income-based ad targeting, pricing discrimination, and financial profiling. Luxury brands, premium services, and high-value advertisers can target HDR users with higher price points, knowing they've demonstrated purchasing power.

**Professional Identification**: Creative professionals (photographers, videographers, graphic designers) disproportionately use HDR displays for color accuracy. Detecting HDR support allows trackers to identify professional users for B2B advertising, recruitment, and industry-specific targeting.

**Device Lifecycle Tracking**: HDR displays only became mainstream in 2021, meaning detection reliably identifies recently-purchased premium devices. This temporal signal enables tracking of upgrade cycles, brand loyalty, and device replacement patterns across long timescales.

**Cross-Device Correlation**: Users with HDR laptops often own HDR smartphones and tablets, creating device clusters for household tracking. A user detected with HDR support on mobile likely also has HDR capability on desktop, enabling probabilistic linking of sessions across devices.

**Geographic Inference**: HDR adoption varies significantly by region (10-15% in US/Japan vs <3% in developing markets), enabling geographic profiling based on hardware distribution patterns.

## Evasion Strategies

Privacy-conscious users face limited options for defeating HDR fingerprinting:

**Browser-Level Mitigation**:

- Tor Browser reports standard dynamic range on all connections, normalizing HDR users to the majority
- Brave Browser's fingerprinting protection randomizes or blocks dynamic-range queries in strict mode
- Firefox's resistFingerprinting preference (about:config) forces standard range reporting

**Extension-Based Blocking**:

- CanvasBlocker can intercept matchMedia() calls and force standard range
- Privacy Badger and uBlock Origin do not currently block dynamic-range queries
- Custom JavaScript injection can override matchMedia() to always return false for HDR

**Display-Level Workarounds**:

- macOS/Windows HDR toggle (disables system-wide HDR)
- Browser zoom/scaling (does not affect media query results)
- Color profile changes (do not prevent HDR detection)

The fundamental challenge is that HDR support is a hardware truth that cannot be easily spoofed without breaking legitimate HDR content delivery. Users with HDR displays who force standard-range reporting will receive SDR content on HDR-capable screens, defeating the purpose of premium hardware.

## Research Context

Academic research on HDR fingerprinting remains limited compared to canvas or WebGL fingerprinting, but several studies have examined display capability detection:

- The 2016 AmIUnique study found 89.4% of browser fingerprints were unique, with screen properties contributing 2-3 bits of entropy
- FingerprintJS research (2020) identified hardware-accelerated media queries as emerging fingerprinting vectors requiring attention
- Princeton WebTAP study (2021) found display properties contributed to 94% of unique fingerprints when combined with other attributes

The Electronic Frontier Foundation's Panopticlick tool (updated 2025) now includes dynamic-range detection as a standard fingerprinting test, reflecting its growing importance in real-world tracking.

## Defense Recommendations

For users seeking to minimize HDR fingerprinting exposure:

1. **Use Tor Browser** for sensitive activities (forced standard range)
2. **Enable Brave fingerprinting protection** in strict mode
3. **Consider Firefox resistFingerprinting** (about:config → privacy.resistFingerprinting → true)
4. **Disable system HDR** when not actively consuming HDR content
5. **Use dedicated privacy browsers** for high-risk activities separate from entertainment browsing

For web developers respecting user privacy:

1. **Avoid storing HDR capability** in persistent user profiles
2. **Deliver content adaptively** without logging capabilities
3. **Combine with Privacy Budget proposals** to limit fingerprintable surface
4. **Support differential privacy approaches** that add noise to capability detection

The fundamental tension remains between delivering optimal user experiences (HDR content to capable displays) and preventing invasive tracking. As HDR adoption approaches 50% market penetration by 2027-2028, its fingerprinting value will diminish naturally, but until then it remains a powerful tracking signal.

## Detection in Practice

Real-world fingerprinting scripts use HDR detection as part of comprehensive device profiling:

```javascript
const deviceProfile = {
  hdr: matchMedia('(dynamic-range: high)').matches,
  p3: matchMedia('(color-gamut: p3)').matches,
  resolution: `${screen.width}x${screen.height}`,
  pixelRatio: window.devicePixelRatio,
  colorDepth: screen.colorDepth,
};
// Hash combines to create unique device signature
```

Popular fingerprinting libraries like FingerprintJS, CreepJS, and commercial solutions (PerimeterX, DataDome) all include dynamic-range queries in their detection suites. The query executes in under 1ms with zero user visibility, making it an ideal passive fingerprinting vector.

## Future Outlook

HDR fingerprinting faces an uncertain future as adoption rates change and privacy standards evolve:

- **Increasing adoption** (50%+ by 2028) will reduce entropy contribution
- **W3C Privacy CG** is evaluating restrictions on hardware capability queries
- **Browser vendors** may standardize forced responses in private browsing modes
- **Regulatory pressure** (GDPR, CCPA) may classify hardware profiling as sensitive tracking

Until then, HDR detection remains a low-effort, high-signal fingerprinting technique that reveals premium hardware ownership, professional use cases, and socioeconomic status with a single media query. The privacy-utility tradeoff continues to favor trackers over users.

## Sources

- W3C CSS Media Queries Level 5 Specification
- Chrome Platform Status: HDR CSS Media Queries
- Market research: Global Insights HDR Display Market Report 2024-2033
- AmIUnique browser fingerprinting study (2016)
- EFF Panopticlick fingerprinting research (2025 update)
- Can I Use browser compatibility data
- FingerprintJS technical documentation

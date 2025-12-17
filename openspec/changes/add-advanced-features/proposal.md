# Change Proposal: add-advanced-features

## Summary

Implement advanced intelligence features that differentiate CreepJS from competitors: fingerprint history tracking, lie detection (inconsistency analysis), risk scoring with ML, WebAssembly performance optimization, artistic fingerprint visualization, and privacy mode detection (Tor, VPNs). These features enable enterprise use cases like fraud prevention while maintaining educational value.

## Motivation

- Competitors (Fingerprint.com, FingerprintJS Pro) offer fraud detection and tracking—we lack these capabilities
- Current fingerprinting is CPU-intensive (Canvas, Audio)—WASM can provide 50%+ speedup
- No historical tracking—can't detect account takeovers or session hijacking
- Privacy mode users (Tor, Brave) need to be identified for legitimate security purposes
- Artistic visualization would increase virality and user engagement

## Scope

### 1. Fingerprint History Tracking (Cloudflare Durable Objects)

- **Persistent storage** per visitor ID (Durable Objects)
- **Timeline view** showing fingerprint changes over time
- **Anomaly detection**: Alert when fingerprint changes dramatically (possible account takeover)
- **Session continuity**: Track if same device across multiple visits
- **Privacy controls**: User can opt out, delete history

### 2. Lie Detection Engine

- **Inconsistency checks** (20+ rules):
  - userAgent vs Canvas GPU mismatch
  - Screen resolution vs reported dimensions
  - Timezone vs language/locale conflicts
  - WebGL vendor vs CPU architecture
- **Anti-fingerprinting tool detection**:
  - Canvas Blocker (random noise patterns)
  - Brave fingerprinting protection (blocked APIs)
  - Firefox Resist Fingerprinting (fake values)
- **Confidence score** (0-100): How trustworthy is the fingerprint?

### 3. Risk Scoring Engine

- **Statistical model**: Compare fingerprint to known fraud patterns
- **Cloudflare Workers AI** integration (optional ML model):
  - Train on labeled dataset (fraud vs legitimate)
  - Real-time inference (<50ms)
  - Fallback to rule-based scoring if AI unavailable
- **Risk factors**:
  - Unique fingerprint (1-in-10000+) = higher risk
  - Lie detection failures = higher risk
  - Known VPN/proxy = configurable risk
  - Browser automation detected = high risk
- **Output**: Risk score (0-100) + explanation

### 4. WebAssembly Acceleration

- **Rust-based collectors** for heavy operations:
  - Canvas image hashing (replace JS MurmurHash)
  - Audio signal processing
  - Font detection via text measurement
- **Build pipeline**: wasm-pack + Rollup integration
- **Fallback**: Gracefully degrade to JS if WASM unsupported
- **Target**: 50% faster fingerprint generation

### 5. Canvas Fingerprint Visualization ("Fingerprint DNA")

- **Algorithm**: Convert fingerprint components to unique SVG art
  - Canvas hash → Color gradient
  - WebGL parameters → Shape patterns
  - Font list → Texture density
  - Timezone → Hue rotation
- **Output**: Beautiful, shareable SVG (1200x630px)
- **Animation** (optional): Smooth transitions between fingerprints

### 6. Privacy Mode Detection

- **Tor Browser identification**:
  - Check for Tor-specific navigator properties
  - Detect timezone spoofing (always UTC)
  - Identify known Tor exit node IPs (optional, via API)
- **VPN/Proxy detection**:
  - IP reputation check (integrate with my-ip-data API)
  - DNS leak detection
  - WebRTC IP exposure test
- **Privacy browser detection**:
  - Brave shields (API blocking patterns)
  - Safari Private mode (storage quota differences)
  - Firefox Resist Fingerprinting mode

## Out of Scope

- Real-time fraud blocking—educational platform, not security product (yet)
- User accounts for storing history—use anonymous Durable Object IDs
- Training ML models from scratch—use pre-trained Workers AI models
- Mobile app fingerprinting—web only for now

## Risks & Mitigations

- **Durable Objects cost**: Monitor usage; DO free tier provides 1M requests/month—should suffice for MVP
- **WASM bundle size**: Keep WASM <100KB; use code splitting
- **Workers AI quota**: Free tier limited; implement fallback to rule-based scoring
- **Privacy concerns**: Clearly label these as "advanced" features; allow opt-out
- **Lie detection false positives**: Tune thresholds conservatively; provide explanations

## Success Criteria

- Fingerprint history stores >1000 visitor timelines in Durable Objects
- Lie detection identifies Canvas Blocker with 95%+ accuracy
- Risk scoring model achieves >80% precision on test dataset
- WASM-accelerated fingerprinting is 50%+ faster than pure JS
- Fingerprint DNA visualization generates unique SVG for every user
- Tor Browser detected with 99%+ accuracy
- `openspec validate add-advanced-features --strict` passes without errors

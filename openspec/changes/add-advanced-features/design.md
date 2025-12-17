# Design: add-advanced-features

## Context

CreepJS.org needs differentiation from competitors through advanced intelligence features while maintaining educational focus and privacy commitments.

## Goals / Non-Goals

### Goals

1. Enable fraud detection use cases for enterprise users
2. Achieve 50%+ performance improvement via WASM
3. Increase virality through artistic visualization
4. Detect privacy tools for legitimate security purposes

### Non-Goals

- Real-time fraud blocking service
- User accounts for history storage
- Training ML models from scratch
- Mobile fingerprinting

## Key Decisions

### 1. Durable Objects vs D1 for History

**Decision**: Use Cloudflare Durable Objects for fingerprint history.

**Rationale**:

- Strong consistency per visitor ID
- Simpler than managing sessions across multiple D1 queries
- Low latency for timeline retrieval
- Free tier: 1M requests/month (sufficient for MVP)

**Architecture**:

```
Each visitor ID → Unique Durable Object
  - Stores timeline: [{ fingerprint, timestamp }, ...]
  - Detects anomalies on write
  - Auto-expires after 90 days
```

### 2. Lie Detection: Rule-Based vs ML

**Decision**: Use rule-based inconsistency detection, not ML.

**Rationale**:

- Rules are interpretable (users see why they failed)
- No training data needed
- Faster execution (<1ms vs 50ms for ML inference)
- ML adds complexity without clear benefit for this use case

**Ruleset** (20+ checks):

```typescript
const rules = [
  { check: userAgentVsCanvasGPU, weight: 10 },
  { check: screenResolutionVsWindow, weight: 5 },
  { check: timezoneVsLocale, weight: 7 },
  { check: webGLVsCPU, weight: 8 },
  // ... 16 more rules
];

confidence = 100 - Σ(failedRules.weight);
```

### 3. Risk Scoring: Statistical vs ML

**Decision**: Hybrid approach—rule-based with optional Workers AI.

**Rationale**:

- Rule-based is good enough for MVP (80%+ accuracy)
- Workers AI is experimental—use as enhancement, not dependency
- Fallback ensures reliability

**Risk factors**:

```
riskScore = (
  uniquenessScore * 0.4 +
  lieDetectionScore * 0.3 +
  vpnProxyScore * 0.2 +
  automationScore * 0.1
) * 100
```

### 4. WASM: Full Rewrite vs Selective Optimization

**Decision**: Port only Canvas/Audio collectors to WASM.

**Rationale**:

- Canvas and Audio are 80% of fingerprint generation time
- Other collectors (Navigator, Screen) are already fast
- Smaller WASM bundle (<100KB)
- Easier maintenance

### 5. Fingerprint DNA Algorithm

**Decision**: Deterministic SVG generation from hash components.

**Rationale**:

- Same fingerprint always produces same art
- No randomness—users can verify consistency
- SVG is resolution-independent and shareable

**Mapping**:

```
Canvas hash (32-bit) → HSL color gradient
WebGL params → Shape count and types (circles, triangles)
Font count → Pattern density
Timezone offset → Rotation angle
```

## Risks / Trade-offs

### Risk: Durable Objects Cost at Scale

**Mitigation**: Monitor usage; implement rate limiting on history writes

### Risk: WASM Browser Compatibility

**Mitigation**: Feature detection + fallback to JS; no functional difference

### Risk: Privacy Tool Detection Perceived as Adversarial

**Mitigation**: Frame as "educational" feature; explain why Tor/VPNs are detected

### Trade-off: Lie Detection False Positives

**Benefit**: Catches spoofed fingerprints
**Cost**: May flag legitimate edge cases
**Decision**: Conservative thresholds (95% confidence = likely legitimate)

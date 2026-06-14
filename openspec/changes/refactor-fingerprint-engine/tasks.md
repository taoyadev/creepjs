# Tasks: refactor-fingerprint-engine

## 1. Source Pipeline Foundation

- [ ] 1.1 Implement `Source`/`Component` types and scheduler utilities (requestIdle fallback, mapWithBreaks)
- [ ] 1.2 Refactor `collectFingerprint()` to use registry + lazy result cache
- [ ] 1.3 Add per-source timing/error capture and exported telemetry types
- [ ] 1.4 Write unit tests for the scheduler and hash helpers

## 2. Port Existing Collectors

- [ ] 2.1 Move legacy collectors (canvas, webgl, navigator, screen, fonts, timezone, audio, media, clientRects, voices, svg, math, css, textMetrics, htmlElement, consoleErrors, domRect, mimeTypes, resistance, contentWindow, cssMedia, webrtc, serviceWorker, lies) into new source wrappers
- [ ] 2.2 Ensure type definitions match new `Source` responses
- [ ] 2.3 Update confidence calculation to rely on component metadata
- [ ] 2.4 Add regression tests covering success + simulated error cases

## 3. Add New Collectors

- [ ] 3.1 Implement accessibility & privacy collectors: `domBlockers`, `fontPreferences`, `colorGamut`, `contrast`, `forcedColors`, `monochrome`, `reducedMotion`, `reducedTransparency`, `hdr`
- [ ] 3.2 Implement commerce/privacy collectors: `audioBaseLatency`, `applePay`
- [ ] 3.3 Document data structures for each new collector and add unit tests
- [ ] 3.4 Expose feature flags to disable experimental collectors if needed

## 4. SDK + API Updates

- [ ] 4.1 Update `@creepjs/sdk` to surface per-source telemetry (optional) and ensure caching works with new shape
- [ ] 4.2 Adjust API validation schema to accept new collectors and ignore unknown keys gracefully
- [ ] 4.3 Extend API response to include confidence + collector summaries for demo consumption
- [ ] 4.4 Add tests for SDK transport + API schema compatibility

## 5. Web App & Documentation

- [ ] 5.1 Update demo components (ConfidenceDashboard, PrivacyLeakageAssessment, UniquenessAnalysis, FingerprintPlayground) to render new collectors and show per-source status
- [ ] 5.2 Add new sections to Docs explaining the collector taxonomy + accessibility signals
- [ ] 5.3 Provide release notes + migration guidance for SDK/API consumers
- [ ] 5.4 Add visual regressions/tests if necessary

## 6. Validation

- [ ] 6.1 Run lint, typecheck, unit/integration tests across packages
- [ ] 6.2 Execute `openspec validate refactor-fingerprint-engine --strict`

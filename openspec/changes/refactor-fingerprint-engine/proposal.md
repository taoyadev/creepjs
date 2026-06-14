# Change Proposal: refactor-fingerprint-engine

## Summary

Rebuild the fingerprint engine inside `@creepjs/core` so it follows a modern entropy-source pipeline similar to FingerprintJS, adds concurrency-aware scheduling, and expands the set of first-class collectors. The refactor introduces a pluggable `Source` abstraction with per-source timing/error reporting, adds 10 new accessibility and privacy-related collectors, and wires the richer data through the SDK, API, and demo UI.

## Motivation

- Current `collectFingerprint()` executes 24 collectors synchronously on the main thread, causing long blocking times on slower devices.
- Collectors are tightly coupled functions with no shared lifecycle control, making it painful to add/remove modules or report issues per collector.
- Our coverage (≈24 signals) lags behind FingerprintJS (41 signals). Missing accessibility / privacy sources reduce entropy and educational value.
- UI components need granular success/failure data to explain confidence scores; today we can only approximate counts.

## Scope

1. Introduce a `Source` abstraction that supports async and two-phase collectors (load/get). Provide utilities for scheduling, timing, and structured errors.
2. Refactor existing collectors (Canvas, WebGL, Navigator, etc.) to the new `sources` registry and ensure tree-shakeable exports.
3. Implement 10 new collectors inspired by FingerprintJS: `domBlockers`, `fontPreferences`, `colorGamut`, `contrast`, `forcedColors`, `monochrome`, `reducedMotion`, `reducedTransparency`, `hdr`, `audioBaseLatency`, plus `applePay` readiness (11 total additions).
4. Update the SDK, API, and demo UI to consume the richer per-source metadata (value/error/duration) and expose new data in the Dashboard/Privacy panels.
5. Document the new engine contract and add unit tests per collector plus integration tests for the pipeline.

## Impact

- **Performance**: Expected 35–50% reduction in main-thread blocking because async collectors run in parallel and synchronous batches release control between items.
- **Developer Experience**: Adding/removing collectors becomes declarative via the registry; per-source telemetry aids debugging.
- **Product Value**: New collectors boost entropy and allow docs/demo to teach additional privacy concepts (contrast mode, Brave shields, audio latency, Apple Pay availability, etc.).
- **Risk**: Large refactor touches core, SDK, API, and UI; mitigated by staged implementation, comprehensive tests, and gradual rollout flag.

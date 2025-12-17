# Design: refactor-fingerprint-engine

## Goals

1. Provide a composable entropy-source pipeline similar to FingerprintJS to improve maintainability and performance.
2. Expand our collector catalog with accessibility/privacy-focused signals.
3. Maintain backwards compatibility for SDK/API consumers (same top-level FingerprintResult shape) while enriching internal metadata.

## Architecture Overview

- Introduce `Source<T>` type returning either direct value or a lazy getter.
- `loadSources()` accepts a map of sources + options, returns `getComponents()` that resolves to `Record<SourceName, Component<T>>` where `Component` contains `{ value | error, duration }`.
- Scheduler uses `requestIdleCallback` when available or falls back to `setTimeout` (configurable `delayFallback`). Between synchronous sources we yield to the event loop via `mapWithBreaks` (borrowed from FingerprintJS) to avoid long tasks.
- `collectFingerprint()` loads the registry once per page load, then `getFingerprint()` resolves components, calculates fingerprintId via existing hash (MurmurHash + Base62), and derives confidence from percentage of successful components.
- Telemetry: expose `CollectorSummary` containing `status`, `duration`, `evidence` for UI + API.

## New Collectors

| Name                                                                                    | Data                                               | Purpose                              |
| --------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------ |
| `domBlockers`                                                                           | Lists known ad/privacy blocker detections          | highlights anti-fingerprinting setup |
| `fontPreferences`                                                                       | Preferred serif/sans/monospace fonts via CSS tests | adds entropy beyond installed fonts  |
| `colorGamut`                                                                            | `srgb`, `p3`, `rec2020`                            | indicates display class              |
| `contrast`, `forcedColors`, `monochrome`, `reducedMotion`, `reducedTransparency`, `hdr` | Accessibility + HDR info from media queries        | teaches privacy/resistance concepts  |
| `audioBaseLatency`                                                                      | `AudioContext.baseLatency` metrics                 | approximates audio hardware          |
| `applePay`                                                                              | capability detection using `ApplePaySession`       | used in privacy/risk scoring         |

## Compatibility Strategy

- `FingerprintResult.data` still contains optional properties; new collectors append additional keys. Existing consumers using narrow typings continue to work due to index signatures.
- SDK caches only `{ fingerprintId, timestamp, confidence }`, so additional telemetry is opt-in via new method `getFingerprintDetailed()` used by demo.
- API validation schema updated to accept new collector payloads but treat them optional, ensuring old SDK versions continue to POST minimal payloads.

## Testing Strategy

- Unit tests for scheduler, hash, and each collector (mocking browser APIs via jsdom + manual stubs).
- Integration test for pipeline to ensure asynchronous collectors resolve and confidence math is correct when some fail.
- Web UI playwright smoke to ensure new data surfaces; existing tests extended to cover new cards.

## Rollout Plan

1. Land core pipeline + existing collectors behind feature flag `NEXT_PUBLIC_SOURCE_PIPELINE`. Demo uses new engine when flag enabled.
2. Add new collectors and UI components; keep flag default off until confidence built.
3. Once validated by tests/manual QA, flip flag on for production.
4. Document migration steps for SDK/API consumers.

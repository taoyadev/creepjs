# Performance & Tuning Guide

The fingerprinting engine runs **40+ collectors** across graphics, locale, storage, and hardware domains. This guide summarizes how to keep the main thread responsive while still capturing rich entropy.

## Runtime Controls

`collectFingerprint` accepts optional tuning knobs:

```ts
import { collectFingerprint } from '@creepjs/core';

const result = await collectFingerprint({
  concurrency: 3, // number of parallel collector workers (default: adaptive <= 4)
  idleDelay: 8, // milliseconds to yield to the event loop between tasks
});
```

- **concurrency**: The engine uses `mapWithIdleBreaks` under the hood. Higher concurrency reduces total runtime but increases instantaneous CPU pressure. On laptops, 2-4 workers is a sweet spot.
- **idleDelay**: After each collector completes, the engine awaits `requestIdleCallback`/`setTimeout` for the specified delay. Larger delays keep the UI smoother but lengthen total runtime.

## Profiling Collectors

You can inspect collector timings by reading `fingerprint.timings` (in ms). Example logging snippet:

```ts
const fp = await collectFingerprint();
Object.entries(fp.timings ?? {})
  .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
  .slice(0, 10)
  .forEach(([name, duration]) => {
    console.log(`${name}: ${duration?.toFixed(2)} ms`);
  });
```

This highlights the heaviest collectors on your target hardware so you can adjust concurrency or selectively disable sources.

## Browser-Specific Guidance

- **Safari 17+ Private Browsing** zeroes out screen frame/resolution values. The collectors automatically skip reporting unreliable data, but timings may still include retries.
- **Chrome on Android** throttles background tabs. Consider smaller concurrency (1-2) to avoid long tasks when the page is backgrounded.
- **Locked-down enterprise builds** may block Service Worker, WebRTC, or Apple Pay APIs. Collectors already catch and report these errors; make sure your UI tolerates `status: 'error'` gracefully.

## CI / Automated Profiling

For regression detection, run a controlled benchmark (e.g., Playwright + Lighthouse) and track `fp.timings.total` across releases. Flag builds where total runtime regresses >10%.

## Troubleshooting Tips

| Symptom                                | Suggested Fix                                                                                                   |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Main thread jank during fingerprinting | Lower `concurrency`, raise `idleDelay`, or defer heavy collectors until after first paint                       |
| Certain collectors always error        | Confirm the API is supported in the target browser; hide the status or provide guidance to the user             |
| Network payload too large              | Only transmit collectors you need (subset `fp.data`) before hitting the API                                     |
| Debugging individual collectors        | Inspect `collectors[name].value/error` and match with docs content under `apps/web/public/content/fingerprints` |

By combining adaptive concurrency, idle yielding, and telemetry, you can maintain a responsive UX while harvesting high-entropy fingerprints.

## Why

The operator's 2026-10-30 request asks for a homepage whose first screen is
about the visitor's browser fingerprint, starts detection as soon as the page
opens, and presents the result better. Today the fingerprint card waits for a
click, gives the own-IP card equal weight, and leaves a large empty area until
the visitor acts.

## What Changes

- Start the existing full local scan automatically on the homepage once the
  page is interactive, using the same idle scheduling as the checker.
- Make the scan the dominant first-screen region: the diagnostic ID, a
  deterministic ID glyph, real collector progress, and eight observed browser
  signals with explicit missing values. The own-IP summary becomes secondary
  context beside it.
- Keep the previous result visible while a rerun is in progress or fails.
- Disclose the automatic Google STUN contact next to the scan and in the
  privacy policy. The homepage still saves no history and sends no
  population-comparison request.
- Keep the action-driven teaser on the fingerprinting guide unchanged by
  sharing one lazily loaded scan hook between both surfaces.

## Impact

- Affected specs: `web-task-experience`.
- Affected code: `apps/web/src/app/page.tsx`, `apps/web/src/components/home/*`,
  the checker idle scheduler, the privacy page, and the browser acceptance
  harness.
- Public URLs, API contracts, analytics event shape, fingerprint ID
  projection, and saved-history format are unchanged. No data migration.
- Homepage `tool_run` events with `surface: home` now count automatic scans
  as well as reruns, so their volume is not comparable with the earlier
  click-only period.
- Scope authority: the operator's 2026-10-30 homepage request. Production
  publication remains a separate, explicitly approved operation.

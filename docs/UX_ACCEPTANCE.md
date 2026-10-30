# Task-first web experience

## Acceptance record — 2026-10-29

This section records completed isolated preview acceptance before production
publication, at 2026-10-29T04:22:35Z. Current deployment status is maintained
separately in the workspace production-state files.

| Check                         | Result                                                                                                            |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `pnpm build`                  | Passed on OpenClaw; all 65 public page URLs preserved                                                             |
| `pnpm typecheck`              | Passed on OpenClaw after building locked dependencies                                                             |
| `pnpm lint`                   | Passed                                                                                                            |
| `NODE_ENV=test pnpm test`     | 322 passed: core 61, SDK 11, API 127, web 123                                                                     |
| `pnpm format:check`           | Passed                                                                                                            |
| `bash scripts/secret-scan.sh` | Passed; matching content would be withheld from tool output                                                       |
| Strict OpenSpec validation    | 15 passed, 0 failed                                                                                               |
| Final browser acceptance      | 18 scenarios passed, 0 failed                                                                                     |
| Full route rendering          | All 65 pages at 1440 × 900 and 390 × 844; no root horizontal overflow                                             |
| Automated accessibility       | 36 route/viewport/theme combinations, 0 axe A/AA violations                                                       |
| Visual review                 | Desktop home, mobile signal result, mobile IP result, mobile playground, and dark reduced-motion output inspected |

Build receipt:
`~/.codex/state/openclaw-test/creepjs/20261029T041906Z-receipt.json`.
Browser artifacts:
`openclaw:~/artifacts/creepjs/ux-final-20261029-0420/`.
Collected report and screenshots:
`~/.codex/tmp/creepjs-ux-final-20261029/`.

The browser gate exercised actual collectors in isolated Chromium contexts and
mocked API responses. It did not issue a real token or spend paid IP-provider
quota. The 36 automated accessibility audits cover twelve representative routes
at desktop light, mobile light, and mobile dark, including all collector cards
and the expanded coverage panel. This is automated evidence, not a claim of
complete WCAG certification or a real-device screen-reader audit.

The initial browser run found low secondary-text contrast on tinted surfaces,
low contrast in existing status colors, and data regions without keyboard
focus. Those were corrected and the complete browser gate rerun successfully.
The global contrast regression check now covers muted and tinted report
surfaces in both themes.

The first fixed-wire executor attempts failed before test startup with
`mm_send_fd: sendmsg(2): Message too long`. The successful checks used the
existing `openclaw` non-multiplexed connection to the same execution host. No
started test was retried on a different host. A direct Mac typecheck exposed
pre-existing stale core declarations and a mismatched Vitest installation
(`AudioFingerprint.sum`, the analytics subpath, and `oxc` config); local
dependencies were not installed or changed. The authoritative successful checks
used the frozen lockfile and rebuilt generated outputs on OpenClaw.

Real iOS Safari, VoiceOver, field performance, provider classification accuracy,
and production deployment are not established by this preview run.

Scope authorized by the 2026-10-29 request: improve the existing 65 page URLs
against seven UX, interaction, recovery, accessibility, and privacy criteria.
The static-export architecture, API endpoints, storage IDs, and public paths are
preserved. No populated data migration or URL migration is needed.

## Page coverage

| Pages           | Task and resulting change                                                                                                                                                                                                                                                      |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Home            | The local browser scan starts on load and leads the first screen: diagnostic ID, ID glyph, real collector progress, and eight observed signals. The own-IP summary is secondary context beside it.                                                                             |
| Checker         | Automatic scan in the first task region; summary, collector tabs, local history, and export. Refresh retains the last report. Population comparison requires an explicit action. The pending scan reserves a full viewport so the report does not shift the sections below it. |
| IP              | A labelled address input with IPv4/IPv6 examples, protected own-IP detection, local validation, cancellation, qualified verdict, missing fields, evidence, and quota/freshness information.                                                                                    |
| Signal index    | Search, category selection, investigation presets, result count, and no-match recovery. All signal links are present in static HTML.                                                                                                                                           |
| 55 signal pages | Real collection state, readable fields, copyable image-safe JSON, same-tab comparison, and collector-specific reviewed method/limits. WebRTC and full consistency scans require an action.                                                                                     |
| API playground  | Memory-only masked token, explicit collection/submission, side-by-side response, HTTP status/timing, empty response handling, and input-preserving recovery.                                                                                                                   |
| Docs            | Native section links, copyable working hosted-SDK examples, current API boundaries, output interpretation, and error-specific recovery.                                                                                                                                        |
| Browser guide   | A working scan and setting-comparison tasks replace generic FAQ and unsupported accuracy claims. Existing article fragments remain usable.                                                                                                                                     |
| Proxy guide     | Address presets, explicit unknown classification, a qualified result, and direct continuation to the same address in the full report.                                                                                                                                          |
| Privacy / terms | Compact header, section navigation, correct heading levels, and concrete data choices. Responsible-use clauses remain intact.                                                                                                                                                  |

## State contract

- Idle / empty input: identify the expected input and output; show examples or
  the automatic loading state. Do not populate results with invented values.
- Loading: announce the actual operation; bound network requests; preserve
  inputs and the last checker report. Progress comes from collector events,
  never simulated steps.
- Success: name the target and report returned values, interpretation, limits,
  and useful copy/compare/next actions.
- Invalid: mark and describe the field; reject malformed IP literals locally
  without consuming a provider lookup.
- Empty / no result: distinguish an empty exposed list from an unsupported API,
  invalid provider response, or address-only intelligence result.
- Partial: keep observed fields and explicitly mark the missing fields. False
  and zero are real values; unknown is not false, safe, or low risk.
- Error: retain usable inputs/report, explain the recovery, and never replay a
  POST automatically. Stopping a sent request cannot undo server processing.

## Privacy and trust boundaries

The homepage and the checker start the full scan on load and disclose its
Google STUN traffic beside the scan; the homepage saves no scan history. The
guide teaser stays action-driven. Individual network-sensitive signal pages
disclose and require that action. Other signal collectors run locally.
Signal comparisons stay in tab memory. Copying/exporting JSON omits image
payloads. Checker history uses the existing sanitized local history format.

The optional population comparison is now off until requested. Its disclosed
Canvas hash, WebGL renderer, timezone, font count, and screen tuple go to the
existing comparison API only after that action. The playground keeps tokens in
memory, masks them by default, and requires a separate choice to include a token
in visible/copied examples. Token issuance returns a token in the UI; it does
not send email. IP share URLs explicitly disclose the queried address.

## Validation

Use the existing OpenClaw lane. Do not run project browser runtimes on the
control Mac. No real token is minted or paid IP lookup made in browser QA.

```sh
openclaw-ops test --dir "$PWD" --project creepjs --no-install --json -- \
  bash -lc 'set -euo pipefail; pnpm install --frozen-lockfile; pnpm build; pnpm typecheck; pnpm lint; NODE_ENV=test pnpm test'
openclaw-ops e2e --project creepjs --cmd 'node scripts/task-first-browser-qa.cjs'
```

The bounded E2E harness owns and closes its loopback export server and isolated
browser contexts. It checks all 65 routes at desktop and mobile widths, static
HTML and pre-JavaScript truth, core first-viewport controls, search/no-match,
signal comparison/unavailability, IP success/invalid/partial/empty/quota/error,
detection and cancellation races, batch invalid rows, playground responses and
token retention, explicit baseline consent, keyboard navigation, and automated
WCAG checks when the existing axe tooling is available. Artifacts and a machine
readable summary are written to the wrapper-provided artifact directory.

Browser fixtures verify interaction contracts, not provider classification
accuracy or production deployment. Real-device Safari/VoiceOver and field
performance need separate evidence; a desktop browser emulating mobile does not
prove those environments. Production publication is outside this code change.

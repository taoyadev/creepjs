## 1. Governance

- [x] 1.1 Review and approve the E7 scope from the operator's locked Phase 4
      decision.
- [x] 1.2 Run
      `openspec validate add-checker-network-trust-report --strict`.

## 2. Data and Model

- [x] 2.1 Add a typed `useOwnIp` hook over the existing `/my-ip` endpoint.
- [x] 2.2 Add a tested, conservative trust view model combining browser and
      optional IP dimensions.

## 3. Experience

- [x] 3.1 Render `NetworkTrustReport` under `#trust` with browser-only
      degradation and an `/ip?q=` continuation.
- [x] 3.2 Add Trust to the sticky checker navigation.
- [x] 3.3 Extend user-initiated JSON and CSV exports with an optional own-IP
      summary.

## 4. Validation

- [x] 4.1 Pass strict OpenSpec validation and ordered web
      build/lint/typecheck/tests on OpenClaw.
- [x] 4.2 Assert the checker export still contains one H1 and the Trust anchor
      is represented in the client bundle/source.
- [x] 4.3 Verify full, geo-only, and blocked `/my-ip` states on a Cloudflare
      Pages preview.
      Verified on Pages preview 39bf0ee8 (2026-10-27); evidence in PR #8.

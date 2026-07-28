## 1. Governance

- [x] 1.1 Review and approve the E7 scope from the operator's locked Phase 4
  decision.
- [x] 1.2 Run
  `openspec validate add-checker-network-trust-report --strict`.

## 2. Data and Model

- [ ] 2.1 Add a typed `useOwnIp` hook over the existing `/my-ip` endpoint.
- [ ] 2.2 Add a tested, conservative trust view model combining browser and
  optional IP dimensions.

## 3. Experience

- [ ] 3.1 Render `NetworkTrustReport` under `#trust` with browser-only
  degradation and an `/ip?q=` continuation.
- [ ] 3.2 Add Trust to the sticky checker navigation.
- [ ] 3.3 Extend user-initiated JSON and CSV exports with an optional own-IP
  summary.

## 4. Validation

- [ ] 4.1 Pass strict OpenSpec validation and ordered web
  build/lint/typecheck/tests on OpenClaw.
- [ ] 4.2 Assert the checker export still contains one H1 and the Trust anchor
  is represented in the client bundle/source.
- [ ] 4.3 Verify full, geo-only, and blocked `/my-ip` states on a Cloudflare
  Pages preview.

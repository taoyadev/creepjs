## 1. Governance

- [x] 1.1 Review and approve this proposal, design, and delta specification
  (operator-approved via locked decision D1 in the 2026-07 optimization plan).
- [x] 1.2 Run `openspec validate add-batch-ip-lookup --strict` in an environment
  with the OpenSpec CLI.

## 2. API Contract and Safety

- [ ] 2.1 Add the bounded batch request schema and an 8 KiB body limit.
- [ ] 2.2 Correct shared IPv6 literal validation and cover valid/invalid edge
  cases without adding a dependency.
- [ ] 2.3 Generalize token rate limiting to reserve weighted lookup units before
  handler execution while preserving one-unit behavior for existing routes.
- [ ] 2.4 Implement serial unique-address lookup, per-item validation errors,
  dependency-failure aborts, safe skipped rows, and summary metadata.
- [ ] 2.5 Keep raw submitted IPs and tokens out of application logs; keep token
  usage explicitly approximate rather than billing-grade.

## 3. API Tests and Documentation

- [ ] 3.1 Cover auth, envelope bounds, body/item limits, normalization,
  deduplication, mixed validity, cache hits, and response ordering.
- [ ] 3.2 Cover weighted quota reservation, insufficient quota with zero fetches,
  provider `429`/auth/`5xx` abort behavior, and `Retry-After` propagation.
- [ ] 3.3 Document request/response examples, lookup-unit quota, cache TTLs,
  partial results, retry behavior, and privacy limitations.

## 4. Web Workflow

- [ ] 4.1 Add a shared accessible textarea primitive and tested input/CSV utility.
- [ ] 4.2 Add a route-local `/ip` batch workspace with in-memory token handling,
  input count/validation, independent loading/error state, and result summary.
- [ ] 4.3 Render an accessible, mobile-scrollable result table and export partial
  or complete results as formula-safe CSV.
- [ ] 4.4 Add a non-sensitive token-acquisition link without persisting or
  tracking the token or raw submitted IPs.

## 5. Validation and Rollout

- [ ] 5.1 Run targeted API/web tests, typecheck, lint, and production builds on
  OpenClaw.
- [ ] 5.2 Verify desktop/mobile, light/dark, keyboard, success, mixed-error,
  over-limit, invalid-token, upstream-abort, and CSV flows in a managed preview.
- [ ] 5.3 Deploy API before web, run production smoke checks, then update the
  launch tracker only with captured evidence.

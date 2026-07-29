## Why

Proxy and scraping operators currently have to inspect addresses one at a time.
A bounded batch workflow gives them a concrete reason to request an API token,
but it must not turn one token request into an unmetered multiplier over the
paid IP-intelligence upstream.

## What Changes

- Add a token-authenticated `POST /v1/ip/batch` endpoint for 1–50 IP literals.
- Normalize and deduplicate input while preserving first-seen order, then
  process unique valid addresses serially.
- Reserve daily quota in IP lookup units before contacting the upstream;
  cached lookups consume the same product quota, and an invalid-only batch
  consumes one abuse-prevention unit.
- Return per-address validation failures, stop on dependency-wide failures, and
  expose explicit partial/aborted response metadata.
- Add a task-first batch workspace to `/ip` with accessible results and a
  client-side CSV export protected against spreadsheet formula injection.
- Document the endpoint, quota semantics, cache behavior, privacy boundary, and
  retry behavior; add focused API and browser-facing utility tests.

## Impact

- Affected specs: `ip-batch-lookup` (new capability)
- Affected API: `apps/api/src/routes/ip.ts`, request validation, rate limiting,
  shared IP validation, and API tests
- Affected web: `/ip`, a route-local batch component, shared textarea primitive,
  CSV/input utilities, and tests
- Affected docs: API reference, privacy/security notes, and launch tracker
- No new runtime dependencies, database schema, account system, billing ledger,
  or public per-IP pages

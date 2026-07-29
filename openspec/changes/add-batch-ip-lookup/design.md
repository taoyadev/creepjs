## Context

The existing token limiter counts HTTP requests, while a batch can fan one
request out to as many as 50 paid upstream lookups. The current KV counters are
read-modify-write values without compare-and-swap, so they are suitable for
best-effort free-tier protection and telemetry, not exact billing. IPbot calls
also retry on `429`, which makes continuing through a dependency-wide failure
unsafe for a long batch.

The frontend already has a focused `/ip` operator surface. The API playground
is a large fingerprint-oriented page, so coupling batch state into it would
hide the feature and increase cross-flow state complexity.

## Goals / Non-Goals

- Goals:
  - provide a bounded, documented batch contract for up to 50 IP literals
  - prevent a batch from bypassing the token's daily service quota
  - preserve useful partial results without repeatedly hitting a failed upstream
  - keep API tokens out of exports and keep submitted address pools out of
    URLs, browser persistence, analytics properties, and application logs
  - make partial results exportable and usable on desktop, mobile, and keyboard
- Non-goals:
  - an exact billing ledger or atomic quota guarantee
  - parallel upstream fan-out, background jobs, saved batches, or token dashboards
  - automatic per-IP landing pages or storage of submitted address pools

## Decisions

### Request boundary

The route accepts JSON `{ "ips": string[] }` with 1–50 entries. The request body
is capped at 8 KiB. Each entry is trimmed, must be non-empty, and is capped at
45 characters (the maximum textual length of a public IPv6 literal without a
zone identifier). Malformed but bounded IP strings become per-item errors;
oversized, empty, missing, or wrong-typed envelope values reject the request.

The server deduplicates normalized strings while preserving first-seen order.
Response rows therefore correspond to the unique submitted values, and summary
fields report both submitted and unique counts.

### Quota units

The public token quota is expressed in lookup units, not HTTP requests:

- a normal single-IP or fingerprint API operation costs one unit
- a batch costs the number of unique syntactically valid IPs
- a batch with no valid IPs costs one abuse-prevention unit
- cache hits consume units because quota represents use of the service, not
  only paid upstream calls

The batch cost is reserved before any lookup. If `current + cost` exceeds the
daily limit, the whole batch returns `429` and performs zero upstream calls.
`X-RateLimit-*` headers describe lookup units. Token `usageCount` remains
approximate telemetry and MUST NOT be presented as a billing ledger; exact
accounting would require an atomic Durable Object or database design.

### Execution and failure model

Unique valid IPs are processed serially. Local validation failures are recorded
per item and do not block other entries. The first dependency-wide failure
(`429`, provider authentication/configuration failure, network failure, or
provider `5xx`) aborts remaining lookups:

- if an earlier lookup succeeded, the endpoint returns `200` with
  `aborted: true`, a safe `abortedReason`, optional `retryAfter`, and explicit
  skipped rows for unprocessed addresses
- if no lookup succeeded, the endpoint returns the mapped request-level error
  (`429`, `502`, or `503`) and does not contact later addresses
- provider `429` propagates `Retry-After` when available

Unexpected provider response bodies are not relayed verbatim to clients.

### Privacy and observability

The response contains submitted IPs because they are the requested objects.
Server logs contain counts, status, cache/high-risk totals, quota cost, and
request ID, but not raw submitted IPs or API tokens. IPbot cache behavior stays
risk-aware (1 hour high-risk, 24 hours otherwise) and is disclosed in docs.

### Frontend and CSV

The existing single-IP hero remains primary. A full-width batch workspace is
added on the same `/ip` page so the results table has adequate room. The token
is held only in component memory. The input accepts comma or whitespace
separators without splitting IPv6 colons, shows the unique count, and blocks
more than 50 values before submission.

CSV uses a fixed flat column set and RFC 4180 escaping. Any text cell beginning
with `=`, `+`, `-`, or `@` is prefixed before serialization to prevent formula
execution in spreadsheet programs. A user-initiated export contains the IP
column needed to associate each result row; it never contains the API token.

## Risks / Trade-offs

- KV quota reservation can lose updates under concurrent requests. The limit is
  explicitly best-effort; strict paid-tier accounting is deferred to an atomic
  store.
- Serial execution can be slow for a cold 50-IP batch. The UI communicates this
  and exposes progress/loading state; parallel fan-out is intentionally avoided.
- Aborting on dependency-wide errors can leave a partial batch. Explicit skipped
  rows and CSV status columns make the outcome auditable.

## Migration Plan

This is an additive endpoint and UI. Deploy the API first, verify the contract,
then deploy the web client. Rollback removes the UI entry point and route; no
persistent user data migration is required.

## Open Questions

- None for the free-tier release. Atomic paid accounting remains a separately
  approved future capability.

## Context

The site needs to count tool runs (checker scans, IP lookups, playground API
requests) without cookies, without personal data, and without putting new
writes on the Durable Object or KV paths that PR #5 just cleared. Workers
Analytics Engine (AE) accepts fire-and-forget writes from a Worker and is
queried with SQL. AE is enabled on the account.

## Goals / Non-Goals

- Goals: count events by name, page path and a few fixed, low-cardinality
  props; keep the allowlist in one place; store nothing that identifies a
  person or a device.
- Non-Goals: unique-visitor counts, sessions, funnels across visits, page
  views (Cloudflare Web Analytics keeps those).

## Decisions

- **Endpoint on the API Worker, not a Pages Function.** The API already has
  CORS, structured logging and a deploy pipeline. `api.creepjs.org` is
  already in the site's CSP `connect-src`.
- **`text/plain` body.** `navigator.sendBeacon` with a `text/plain` Blob is a
  CORS-safelisted request, so the browser sends no preflight. The API also
  accepts `application/json` for curl and tests. Other types get 415.
- **Origin check reuses `CORS_ORIGIN`.** The same resolver that locks
  `/v1/token` (falling back to `https://creepjs.org` in production) decides
  which `Origin` may post events. A missing `Origin` is rejected: browsers
  always send it on a POST. The check stops other sites' pages from posting
  through their visitors' browsers. It does not stop a script that forges the
  header; see Risks.
- **Unknown props are dropped, bad values are rejected.** Keys outside the
  event's allowlist are stripped before storage, so a newer web build can add
  a prop before the API learns it. A known prop with a value that breaks its
  rule (enum, slug pattern, status pattern) returns 400, because that is a
  broken or hostile client.
- **Fixed column mapping.** Every prop has one blob column across all events
  (`blob3` is always `tool`, and so on), so queries do not depend on the event.
  Absent props are written as `''`.
- **One `tool_run` event.** A single run used to fire up to three events
  (`playground_used`, `button_clicked`, `api_call`). One event with
  `tool`/`surface`/`outcome` makes "tool runs per week" a single `WHERE`.
- **DNT and GPC.** The previous Cloudflare beacon was skipped under Do Not
  Track. The new sender is skipped under DNT or Global Privacy Control, so
  the documented posture holds. Tool-run counts are therefore a lower bound.

## Risks / Trade-offs

- A forged `Origin` from a non-browser client can write data points. Writes
  cost AE data points but touch no quota or storage that other endpoints
  rely on. If abuse appears, add a Cloudflare WAF rate-limiting rule on
  `/v1/events` rather than a Durable Object counter.
- AE samples at high volume. Queries use `SUM(_sample_interval)`, not
  `COUNT()`.
- AE keeps data for three months (Cloudflare docs). Longer trends need a
  periodic export.

## Unique visitors (described, not built)

If the north star must count unique visitors rather than runs, the Worker
could derive `visitor = SHA-256(daily_salt || ip || user_agent)` at write
time, where `daily_salt` is random, held only in memory or a short-lived
secret, and rotated every UTC day. That gives a count within a day that
cannot be joined across days or reversed to an IP. It must never use the
fingerprint ID: that would turn the analytics dataset into a cross-visit
device tracker, which the privacy page rules out.

## Migration Plan

Deploy the API first (the binding is created on first write), then the web.
Rollback: a Worker without the binding answers `/v1/events` with 204 and
writes nothing, so a web build that sends events keeps working.

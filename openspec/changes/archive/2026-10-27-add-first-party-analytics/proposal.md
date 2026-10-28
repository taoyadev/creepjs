# Add First-Party Analytics Events

## Why

`trackEvent()` in `apps/web/src/lib/analytics.ts` only sends when
`window.__cfBeacon` is a function. Cloudflare Web Analytics sets
`__cfBeacon` to a config object, so no custom event has ever left the
browser and the north-star metric, weekly tool runs, cannot be measured.
Cloudflare Web Analytics has no custom-event API to switch to.

## What Changes

- **API**: new public `POST /v1/events` on the API Worker. It needs no token
  and does no KV, `QuotaCounter` or `StatsCounter` work. Abuse is limited by
  the site-origin check (reusing `CORS_ORIGIN`), a 1 KiB body cap and a
  strict schema. Each valid event is written as one data point to a Workers
  Analytics Engine dataset (`EVENTS` binding, `creepjs_events` dataset).
- **Shared allowlist**: event names, their props and the value rules live in
  one module, `@creepjs/core/analytics-events`. The API builds its Zod schema
  from it and the web derives its `AnalyticsEvent` types from it, so the two
  cannot drift.
- **Event vocabulary**: a single `tool_run` event (`tool`, `surface`,
  `outcome`, `status`) replaces the overlapping `fingerprint_generated`,
  `api_call`, `api_error`, `playground_test` and `playground_used` calls that
  fired for one run. Unused names and free-text props (`errorMessage`,
  `linkUrl`, `confidence`) are removed.
- **Web**: `trackEvent` sends with `navigator.sendBeacon` (a `text/plain`
  Blob, so there is no CORS preflight) and falls back to a `keepalive` fetch.
  It sends nothing when Do Not Track or Global Privacy Control is on, and
  development and test builds only log events. The dead
  `__cfBeacon` branches and the page-view helper are removed. Cloudflare Web
  Analytics still counts page views through its own script.
- **Privacy page, SECURITY.md, API.md, API_OBSERVABILITY.md, DEPLOYMENT.md**:
  updated to describe what is sent and stored, and how to query tool runs.

## Impact

- Affected specs: `product-analytics` (new capability)
- Affected code: `packages/core/src/analytics-events.ts` (new),
  `apps/api/src/routes/events.ts` (new), `apps/api/src/middleware/cors.ts`,
  `apps/api/src/types.ts`, `apps/api/src/index.ts`, `apps/api/wrangler.toml`,
  `apps/web/src/lib/analytics.ts` and its callers,
  `apps/web/src/app/privacy/page.tsx`
- Deployment: the first deploy with the `[[analytics_engine_datasets]]` block
  creates the `creepjs_events` dataset on first write. No migration.
- No breaking client change. `/v1/events` is new, and the removed web helpers
  had no callers outside `apps/web`.

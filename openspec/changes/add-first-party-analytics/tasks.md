# Implementation Tasks

## 1. Governance

- [x] 1.1 Validate with `openspec validate add-first-party-analytics --strict`

## 2. Shared allowlist

- [x] 2.1 `packages/core/src/analytics-events.ts` with event names, props,
      value rules and the blob column order; exported as
      `@creepjs/core/analytics-events`

## 3. API

- [x] 3.1 `POST /v1/events` route: origin check, 1 KiB cap, content-type
      check, Zod schema built from the shared allowlist, path normalisation
- [x] 3.2 `EVENTS` Analytics Engine binding in `wrangler.toml`
      (`dataset = "creepjs_events"`) and in the `Env` bindings type
- [x] 3.3 CORS: lock `/v1/events` to the site origin like `/v1/token`
- [x] 3.4 Tests: text/plain and JSON accepted, data point shape and no
      IP/UA/ID, 400/403/413/415, dropped props, missing binding, no
      KV/QUOTA/STATS access, every shared event name accepted

## 4. Web

- [x] 4.1 `trackEvent` sends with `sendBeacon` and falls back to a keepalive
      fetch; DNT/GPC opt-out; dead `__cfBeacon` branches removed
- [x] 4.2 Callers moved to the `tool_run` vocabulary
- [x] 4.3 Tests: beacon URL and Blob type, fetch fallback, `__cfBeacon`
      never read, DNT/GPC, disallowed props stripped
- [x] 4.4 Privacy page describes exactly what is sent and stored

## 5. Docs

- [x] 5.1 `docs/API.md` endpoint reference
- [x] 5.2 `docs/API_OBSERVABILITY.md` SQL for tool runs per week and per tool
- [x] 5.3 `docs/DEPLOYMENT.md` binding note; `docs/SECURITY.md` data matrix row

## 6. Verification

- [x] 6.1 New tests fail against the pre-change source
- [x] 6.2 format, typecheck, lint, test, build, SDK size, secret scan pass

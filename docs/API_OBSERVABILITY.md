# API Observability

This runbook describes the current structured API logging surface and how to
inspect it with `wrangler tail`.

## What is logged

### Global request log

Every request emits a structured JSON line with:

- `msg: "api.request"`
- `request_id`
- `method`
- `path`, with any segment that is an IP address logged as `:ip`
  (`/v1/ip/:ip`, `/v1/ip/public/:ip`)
- `status`
- `latency_ms`
- rate-limit headers when present
- `retry_after` when present

### Error log

Unhandled API exceptions emit:

- `msg: "api.error"`
- `request_id`
- `path` (IP segments logged as `:ip`, as above)
- `method`
- `error`

### Route-specific logs

`POST /v1/fingerprint`

- `msg: "fingerprint.accepted"`
- `request_id`
- `quota_used`
- `fingerprint_id`
- `reported_id_matches`
- `coverage_ratio`
- `coverage_successful`
- `coverage_failed`
- `coverage_skipped`

`GET /v1/ip/public/:ip`

- `msg: "ip.public_lookup"`
- `request_id`
- `ip_hash` (truncated SHA-256 of the queried IP)
- `cached`
- `high_risk`
- `public_remaining`
- `global_count`
- `ipbot_remaining`

`GET /v1/ip/:ip`

- `msg: "ip.token_lookup"`
- `request_id`
- `ip_hash`
- `cached`
- `high_risk`
- `ipbot_remaining`
- `ipbot_tier`

The existing IPbot service also emits `msg: "ipbot.ratelimit"` lines with
upstream quota metadata. `docs/SECURITY.md` has the full logging matrix,
including `ip.batch_lookup` and the error lines.

## Tailing logs

```bash
cd apps/api
pnpm exec wrangler tail
```

Filter examples:

```bash
pnpm exec wrangler tail --format pretty
pnpm exec wrangler tail --search "fingerprint.accepted"
pnpm exec wrangler tail --search "ipbot.ratelimit"
```

## Answering common ops questions

### p95 latency of `/v1/fingerprint`

1. Tail or export `api.request` logs.
2. Filter `path === "/v1/fingerprint"`.
3. Compute p95 over `latency_ms`.

### IPbot quota remaining

Read the newest `ip.public_lookup`, `ip.token_lookup`, or `ipbot.ratelimit`
event and inspect:

- `ipbot_remaining`
- `ipbot_tier`
- `remaining` on `ipbot.ratelimit`

## Product analytics (Workers Analytics Engine)

The site sends product events to `POST /v1/events` (see `docs/API.md`). Each
valid event becomes one data point in the `creepjs_events` dataset (`EVENTS`
binding). Analytics Engine keeps data for three months.

The event names and props are defined once, in
`packages/core/src/analytics-events.ts`. Columns are fixed across events:

| Column    | Content                                                                    |
| --------- | -------------------------------------------------------------------------- |
| `index1`  | event name                                                                 |
| `blob1`   | event name                                                                 |
| `blob2`   | page path (no query string or fragment)                                    |
| `blob3`   | `tool`: `fingerprint_scan`, `ip_lookup`, `api_request`                     |
| `blob4`   | `surface`: where it happened (`checker`, `home`, `ip`, `playground`, …)    |
| `blob5`   | `outcome`: `success` or `error`                                            |
| `blob6`   | `status`: HTTP status of the tool's API call, `0` when no response arrived |
| `blob7`   | `section`                                                                  |
| `blob8`   | `label`                                                                    |
| `double1` | always `1`                                                                 |

An absent prop is stored as `''`. Append new props as new columns; never
reorder them.

Analytics Engine may sample at high volume, so count with
`SUM(_sample_interval)`, not `COUNT()`. Events are not sent under Do Not Track
or Global Privacy Control, so every count is a lower bound.

### Run a query

Use an API token with the **Account Analytics: Read** permission:

```bash
curl "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/analytics_engine/sql" \
  --header "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  --data "SELECT ... FORMAT JSON"
```

### Tool runs per week (north-star metric)

```sql
SELECT
  toStartOfWeek(timestamp) AS week,
  SUM(_sample_interval) AS tool_runs
FROM creepjs_events
WHERE index1 = 'tool_run'
  AND timestamp > NOW() - INTERVAL '84' DAY
GROUP BY week
ORDER BY week
```

### Tool runs per week, by tool and outcome

```sql
SELECT
  toStartOfWeek(timestamp) AS week,
  blob3 AS tool,
  blob5 AS outcome,
  SUM(_sample_interval) AS runs
FROM creepjs_events
WHERE index1 = 'tool_run'
  AND timestamp > NOW() - INTERVAL '84' DAY
GROUP BY week, tool, outcome
ORDER BY week, tool, outcome
```

## Current limitations

- Logs are structured, but there is no long-term sink configured yet
- p95 is derivable from logs, but not pre-aggregated into a dashboard
- This is enough to satisfy repo-side observability progress, but not final
  production monitoring maturity

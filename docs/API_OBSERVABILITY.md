# API Observability

This runbook describes the current structured API logging surface and how to
inspect it with `wrangler tail`.

## What is logged

### Global request log

Every request emits a structured JSON line with:

- `msg: "api.request"`
- `request_id`
- `method`
- `path`
- `status`
- `latency_ms`
- rate-limit headers when present
- `retry_after` when present

### Error log

Unhandled API exceptions emit:

- `msg: "api.error"`
- `request_id`
- `path`
- `method`
- `error`

### Route-specific logs

`POST /v1/fingerprint`

- `msg: "fingerprint.accepted"`
- `request_id`
- `token_usage_count`
- `fingerprint_id`
- `coverage_ratio`
- `coverage_successful`
- `coverage_failed`
- `coverage_skipped`

`GET /v1/ip/public/:ip`

- `msg: "ip.public_lookup"`
- `request_id`
- `ip`
- `cached`
- `high_risk`
- `public_remaining`
- `global_count`
- `ipbot_remaining`

`GET /v1/ip/:ip`

- `msg: "ip.token_lookup"`
- `request_id`
- `ip`
- `cached`
- `high_risk`
- `ipbot_remaining`
- `ipbot_tier`

The existing IPbot service also emits `msg: "ipbot.ratelimit"` lines with
upstream quota metadata.

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

## Current limitations

- Logs are structured, but there is no long-term sink configured yet
- p95 is derivable from logs, but not pre-aggregated into a dashboard
- This is enough to satisfy repo-side observability progress, but not final
  production monitoring maturity

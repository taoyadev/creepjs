# Implementation Tasks

## 1. Governance

- [ ] 1.1 Validate change with `openspec validate update-api-security-hardening --strict`
      (openspec CLI not installed on control plane or OpenClaw as of 2026-07-26)

## 2. API hardening

- [x] 2.1 CSPRNG token generation + 64-char auth input bound
- [x] 2.2 IPv6 `isValidIp` fix (`:::`, `1:2`, `:1:2`, `1:2:` rejected)
- [x] 2.3 `utils/privacy.ts` + hashed log subjects in `ipbot.ts` / `myip.ts`
- [x] 2.4 `/my-ip` cf-geo hybrid + per-visitor/global metering (`utils/counters.ts`)
- [x] 2.5 Negative cache for upstream 429/5xx (60s)
- [x] 2.6 CORS split: `*` for data endpoints, origin-locked `/v1/token`
- [x] 2.7 Remove broken CI preview job
- [x] 2.8 `api.request` / `api.error` log paths with IP segments replaced
      by `:ip` (`/v1/ip/:ip` and `/v1/ip/public/:ip` carried the raw IP)

## 3. Tests & docs

- [x] 3.1 Tests: token uniqueness, IPv6 table, negative cache, /my-ip metering, CORS split
- [x] 3.2 Update docs/SECURITY.md (logging matrix, CORS posture, token revocation runbook)

# CreepJS 2.0 — Execution Plan (Codex-Ready Roadmap)

> **Audience:** an autonomous coding agent (codex). This document is a detailed
> task-spec reference. The delivery source of truth is
> `docs/LAUNCH_PLAN.md`. Use this file for task-level details, not sequencing.

- **Status of repo when this plan was written:** feature-rich but un-hardened.
  Web + API + core + SDK exist and were deployed once (2025-11-14) to
  `*.pages.dev` / `*.workers.dev`. Many files uncommitted. One git commit.
- **Referenced by:** `docs/LAUNCH_PLAN.md` (that file sets sequencing and
  acceptance gates); `docs/ROADMAP.md` stays the 4-line elevator version.

---

## 0. How codex must work in this repo

**Toolchain (do not change):** pnpm@9.15.4 workspaces + Turborepo. Node ≥ 20.9.
Next.js 15 (App Router, React 19), Cloudflare Workers + Hono, TypeScript strict.

**Per-task loop:**

1. Read the files listed in the task before editing.
2. Make the smallest change that satisfies Acceptance.
3. Run the task's verification commands; paste output into the PR/commit body.
4. Update the Task Tracker table (§8) status: `todo → doing → done`.
5. One task = one focused commit (or PR). Conventional Commits message style.

**Verification commands (must pass before "done"):**

```bash
pnpm install --frozen-lockfile
pnpm -w typecheck            # turbo run typecheck
pnpm -w lint                 # turbo run lint  (lints src/ only)
pnpm -w test                 # turbo run test
pnpm --filter @creepjs/web build   # static export must succeed -> apps/web/out
pnpm --filter @creepjs/api test
```

---

## 1. Global Invariants (NEVER violate — these are how you avoid drift)

1. **Web is a static export.** `apps/web/next.config.mjs` has `output: 'export'`.
   - ❌ No Server Components data fetching at request time, no Route Handlers
     (`app/**/route.ts` that need a server), no `next/headers`, no ISR, no
     middleware. `app/beacon.min.js/route.ts` is fine only because it is
     statically generated.
   - ✅ All runtime/dynamic data is fetched **client-side** from the Worker via
     `process.env.NEXT_PUBLIC_API_URL`. New dynamic pages use
     `generateStaticParams()` + client components for live data.
2. **Privacy-first (PRD non-goals are binding).** Do not store raw fingerprint
   payloads long-term. Do not add advertising/tracking. Any new storage of
   fingerprint-derived data must be aggregate/anonymized and documented in
   `docs/SECURITY.md` + `apps/web/src/app/privacy/page.tsx`.
3. **No secrets in the repo.** Keys come from Worker secrets (`wrangler secret
put`) or `.dev.vars` (gitignored). `IPBOT_API_KEY`, `IPINFO_TOKEN`,
   `CLOUDFLARE_API_TOKEN`, etc. are never hardcoded. Scan staged files before
   commit.
4. **Edge-first API.** API stays Hono on Workers. Storage stays KV unless a task
   explicitly introduces D1/R2. Keep p95 < 100 ms; cold start ~0.
5. **Bundle budgets.** SDK ≤ 15 KB gzipped. Web route JS kept lean (track in CI).
6. **Backward compatibility.** Public API response shapes and SDK signatures are
   contracts. Additive changes only; breaking changes require an OpenSpec change
   doc under `openspec/changes/` and a version bump.
7. **Accessibility & i18n posture.** New UI must be keyboard-navigable and
   WCAG 2.2 AA for color contrast/focus. Copy is English in code; do not add a
   second locale unless a task says so.

---

## 2. Current-State Assessment & Gap List (the "why")

| Area                      | State today                                                                                                                                    | Gap → fixed in                                                |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Domains                   | Live on `creepjs-b0x.pages.dev` / `creepjs-api.lively-sound-ed65.workers.dev`; canonical URLs/metadata claim `creepjs.org` / `api.creepjs.org` | **Domain/canonical mismatch breaks SEO** → A1, A2             |
| API ↔ Web wiring         | `NEXT_PUBLIC_API_URL` set to workers.dev in `apps/web/wrangler.toml`; docs/playground hardcode `api.creepjs.org`                               | Inconsistent base URLs → A2, E-tasks                          |
| `GET /v1/fingerprint/:id` | Advertised in docs & playground, **not implemented**                                                                                           | Missing endpoint → B3                                         |
| Fingerprint compute       | Done **client-side** in `@creepjs/core`; API only echoes/records usage                                                                         | "Uniqueness" has no population baseline → B4                  |
| IP intelligence           | `/my-ip` uses ipinfo; new `lookupIP()` IPbot service exists but **unwired**                                                                    | Wire IPbot → B1, B2, E5                                       |
| CI/CD                     | CI (lint/type/test/build) + deploy workflows exist                                                                                             | Verify gates + previews → A3, A4                              |
| SEO                       | sitemap/robots/OG/metadata present, 1 guide + pSEO `/fingerprint/[type]`                                                                       | Thin content, domain bug, no JSON-LD coverage audit → F-tasks |
| Tests                     | core/api have vitest; web has 1 metadata test                                                                                                  | Low coverage, no E2E → I-tasks                                |
| Observability             | console logs only                                                                                                                              | No structured metrics/error tracking → G-tasks                |
| Monetization              | token endpoint exists, no plans/limits/billing                                                                                                 | Out of scope until P4 → K-tasks                               |

---

## 3. Phase Overview & Sequencing

```
P0 STABILIZE (must finish first)      A1 A2 A3 A4  B0  I0           ~ make it correct & shippable
P1 CORE PRODUCT                       B1 B2 B3 B4  C1  D1  E1 E2 E3 E4 E5
P2 SEO + CONTENT ENGINE               F1 F2 F3 F4 F5  E6
P3 QUALITY / OBSERVABILITY / A11Y     G1 G2  H1 H2  I1 I2 I3  J1 J2
P4 GROWTH / MONETIZATION (optional)   K1 K2 K3
```

- Within a phase, respect listed `Depends on`. Across phases, do not start P(n+1)
  tasks until P(n) "Definition of Done" (§7) is met, **except** content/SEO
  copywriting (F) which may proceed in parallel once A2 lands.

**Effort key:** S = ≤½ session, M = 1 session, L = multi-session/split.

---

## 4. Workstream A — Infra, CI/CD, Domains, Secrets (P0)

### A1 — Wire custom domains (web + API) — `M`

- **Depends on:** none. **Files:** `apps/api/wrangler.toml`, `apps/web/wrangler.toml`, Cloudflare dashboard (manual steps documented in `docs/DEPLOYMENT.md`).
- **Steps:**
  1. Decide canonical apex: `creepjs.org` (web) and `api.creepjs.org` (API). If
     these domains are not owned, STOP and record the real domains in
     `docs/DEPLOYMENT.md`; do not invent.
  2. Add a `routes`/custom-domain binding for the Worker (`api.creepjs.org/*`).
  3. Map Pages project to `creepjs.org` + `www` redirect.
  4. Document the exact dashboard clicks + `wrangler` commands in
     `docs/DEPLOYMENT.md`.
- **Acceptance:** `curl -I https://api.creepjs.org/` returns the health JSON;
  `curl -I https://creepjs.org/` returns 200 with the homepage; both have valid
  TLS. If domains unavailable, Acceptance = the canonical host is changed
  everywhere to the real one (see A2) and this task is marked `blocked` with the
  reason.
- **Guardrails:** Do not hardcode account IDs/keys in committed files beyond what
  already exists. Do not enable analytics that store PII.

### A2 — Single source of truth for base URLs — `M`

- **Depends on:** A1 (or A1's decision). **Files:** `apps/web/src/lib/metadata.ts`,
  `apps/web/wrangler.toml`, `apps/web/src/app/playground/page.tsx`,
  `apps/web/src/app/docs/page.tsx`, `.env.example`.
- **Steps:**
  1. Define `SITE_CONFIG.url` and `API_URL` in `apps/web/src/lib/metadata.ts`
     driven by `NEXT_PUBLIC_SITE_URL` / `NEXT_PUBLIC_API_URL` with sane prod
     fallbacks.
  2. Replace **every** hardcoded `https://api.creepjs.org` / `creepjs.org` in TSX
     with the config constant (grep: `grep -rn "creepjs.org" apps/web/src`).
  3. Set the production values in `apps/web/wrangler.toml [env.production]`.
- **Acceptance:** `grep -rn "creepjs.org" apps/web/src` returns only the metadata
  config file. `next build` emits canonical tags that match the real deployed
  host. Sitemap/robots `baseUrl` matches.
- **Guardrails:** Code snippets shown to users in docs/playground may keep a
  display URL, but the actual fetch calls must use the config constant.

### A3 — CI gate hardening — `S`

- **Files:** `.github/workflows/ci.yml`.
- **Steps:** ensure jobs run `typecheck`, `lint`, `test`, and
  `pnpm --filter @creepjs/web build` on PRs; fail fast; cache pnpm store
  (already present — verify). Add a `format:check` step.
- **Acceptance:** A PR with a type error / lint error / failing test / broken
  build is red. Green on `main`.

### A4 — Preview deployments + secret docs — `S`

- **Files:** `.github/workflows/deploy-*.yml`, `docs/DEPLOYMENT.md`,
  `QUICK_SETUP_SECRETS.md`.
- **Steps:** PRs deploy a Pages preview; document every required GitHub/CF secret
  in one table (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `IPBOT_API_KEY`,
  `IPINFO_TOKEN`). Add `wrangler secret put` runbook.
- **Acceptance:** Opening a PR posts a preview URL; the secret table lists name,
  where used (web/api), and how to set it.

---

## 5. Workstream B — Backend / API (P1)

> Context files to read first: `apps/api/src/index.ts`, `apps/api/src/types.ts`,
> `apps/api/src/routes/*`, `apps/api/src/middleware/*`,
> `apps/api/src/services/ipbot.ts` (already implemented), `apps/api/tests/*`.

### B0 — API hygiene baseline — `S` (P0)

- **Steps:** confirm error middleware returns the documented shape
  `{ error, details? }` everywhere; ensure CORS origin is configurable per env;
  add a `/v1/health` alias to `/` with `{status, version, time}`.
- **Acceptance:** `apps/api` tests green; health returns version from
  `package.json` (inlined at build).

### B1 — IP intelligence endpoint (wire IPbot) — `M`

- **Depends on:** B0. **Files:** `apps/api/src/routes/ip.ts` (new),
  `apps/api/src/index.ts`, `apps/api/tests/ip.test.ts` (new).
- **Steps:**
  1. New route `GET /v1/ip/:ip` → validates `:ip` (reuse `isValidIp` from the
     service), calls `lookupIP(ip, c.env)`, returns
     `{ ...data, cached, highRisk, rateLimit }`.
  2. Protect it: require the same `authMiddleware` + `rateLimitMiddleware` as
     `/v1/fingerprint` (it is a paid upstream — never leave it open/unmetered).
  3. Map `IpbotError.status` to HTTP status (400 invalid IP, 429 upstream
     throttle, 502 on upstream non-2xx, 500 misconfig).
  4. On 429, surface `Retry-After` to the client.
- **Acceptance:** integration test (mock fetch like `tests/ipbot.test.ts`):
  auth required (401 without token), `GET /v1/ip/8.8.8.8` returns IPbot payload,
  invalid IP → 400, cache hit on 2nd call. `pnpm --filter @creepjs/api test`
  green.
- **Guardrails:** Do not log the API key. Do not expose `IPBOT_API_KEY` in any
  response. Keep the structured rate-limit log line.

### B2 — Enrich `/my-ip` with risk (optional merge) — `S`

- **Depends on:** B1. **Files:** `apps/api/src/routes/myip.ts`.
- **Steps:** after the existing geo lookup, optionally attach a compact
  `risk: { score, band, verdict, highRisk }` block sourced from `lookupIP` for the
  caller's own IP (server-side, cached). Feature-flag via env
  `MYIP_RISK_ENABLED` (default off) so cost is opt-in.
- **Acceptance:** with flag off, response unchanged; with flag on, includes
  `risk`. Tests cover both.

### B3 — Implement or retire `GET /v1/fingerprint/:id` — `M`

- **Depends on:** B0. **Decision required (pick one, record in commit):**
  - **(a) Implement (recommended):** store a **minimal, non-PII** record on
    `POST /v1/fingerprint` in KV (`fp:{id}` → `{confidence, coverage, timestamp,
collectorsSummary}` with a short TTL, e.g. 7 days). `GET /v1/fingerprint/:id`
    returns it or 404. Document TTL + privacy in `docs/SECURITY.md` and the
    privacy page. **No raw component values stored.**
  - **(b) Retire:** remove the endpoint from `docs/page.tsx` and
    `playground/page.tsx` and the sitemap/docs claims.
- **Acceptance:** docs and code agree. If (a): tests for store+get+404+TTL; if
  (b): grep shows no remaining references to the GET endpoint.
- **Guardrails:** if (a), the stored object must pass a "contains no raw
  fingerprint signal" review; only derived metrics allowed.

### B4 — Uniqueness baseline service (anonymized) — `L`

- **Depends on:** B3(a). **Files:** `apps/api/src/routes/stats.ts` (new),
  new KV namespace `FP_STATS` in `wrangler.toml`, `docs/ARCHITECTURE.md`.
- **Goal:** make "uniqueness" real without storing identities. Maintain
  **aggregate counters** per signal bucket (e.g. count of distinct canvas-hash
  prefixes seen) so the client can estimate rarity.
- **Steps:**
  1. On `POST /v1/fingerprint`, increment anonymized bucket counters
     (HyperLogLog-style or coarse bucket counts) — never store the raw value or
     the full fingerprint.
  2. `GET /v1/stats/uniqueness?components=...` returns rarity estimates the
     client blends into its confidence score.
  3. Document the privacy model (k-anonymity threshold; suppress buckets with
     count < k).
- **Acceptance:** counters update; endpoint returns estimates; load test shows
  KV write amplification is bounded (batch/sample if needed). Privacy doc
  updated.
- **Guardrails:** This is the most drift-prone task. If unsure, **ship coarse
  bucket counts first** (simple, safe) and leave HLL as a follow-up. Do not store
  anything that can re-identify a device.

---

## 6. Workstream C — Core Fingerprint Engine (P1)

> Read: `packages/core/src/index.ts`, `sources/registry.ts`, `collectors/*`,
> `utils/hash.ts`, `utils/async.ts`.

### C1 — Collector reliability, timing & coverage API — `M`

- **Steps:**
  1. Ensure `collectFingerprint` exposes a real progress callback (the `/checker`
     page currently **fakes** progress with a hardcoded collector list — replace
     with actual per-source events from `sources/registry.ts`).
  2. Each collector returns `{ value, durationMs, status: 'ok'|'failed'|'skipped'
}`; aggregate into `coverage { ratio, successful, failed, skipped }`.
  3. Wrap every collector in timeout + try/catch so one failure never aborts the
     run (adaptive concurrency + yielding for low-end devices).
- **Acceptance:** unit tests per collector (mock browser APIs as in CLAUDE.md);
  `coverage` is accurate; a thrown collector degrades gracefully. No collector
  exceeds its timeout budget.
- **Guardrails:** Keep hashing stable (MurmurHash3 + Base62, sorted-key JSON).
  Changing normalization changes everyone's IDs — if you must, version it
  (`fpVersion`) and document.

### C2 — "Lies"/consistency signals surfaced — `S` (P3, optional)

- Expose the existing `lies.ts`/`resistance.ts` outputs as explainable flags for
  the UI (E4). No new collection, just structured exposure.

---

## 7. Workstream D — SDK (P1)

> Read: `packages/sdk/src/index.ts`, `docs/SDK.md`.

### D1 — SDK hardening + size budget — `M`

- **Steps:**
  1. Verify `getFingerprint({token, endpoint, cache, cacheTtl})` matches
     `docs/SDK.md`; add typed errors and a `timeout` option.
  2. Build UMD + ESM; assert gzipped size ≤ 15 KB in CI (fail otherwise).
  3. Add `getIpIntelligence(ip)` thin wrapper calling `GET /v1/ip/:ip` (B1).
  4. Copy built UMD to `apps/web/public/sdk.js` in the build pipeline.
- **Acceptance:** `pnpm --filter @creepjs/sdk build` produces both formats; a CI
  size check passes; an example HTML page loads the UMD and returns a
  fingerprint; SDK README snippet works verbatim.
- **Guardrails:** No Node-only deps in the browser bundle. Tree-shakeable ESM.

---

## 8. Workstream E — Frontend / UI / UX / Design System (P1–P2)

> Read: `apps/web/src/app/*`, `apps/web/src/components/*` (incl. `ui/*`),
> `apps/web/src/app/globals.css`, existing `ThemeProvider`, `Header`, `Footer`.
> Stack: Tailwind + shadcn/ui (Radix). Keep that stack.

### E1 — Design system pass (tokens, dark mode, primitives) — `M`

- **Steps:**
  1. Consolidate color/spacing/typography tokens in `globals.css` +
     `tailwind.config`; ensure dark mode via `ThemeProvider` is consistent on
     every page.
  2. Fill out `components/ui/` (button, card, tabs, skeleton already exist) with
     `badge`, `tooltip`, `dialog`, `input`, `alert` as needed by E2–E5 — use
     shadcn generators, do not hand-roll Radix.
  3. Document the visual language in `docs/DESIGN.md` (new): one screenshot per
     primitive, do/don't.
- **Acceptance:** Storybook-or-equivalent not required, but a `/_design` (dev
  only) or doc page shows all primitives in light/dark; contrast passes AA.
- **Guardrails:** No inline styles; Tailwind utility classes only. Components
  ≤ ~300 lines (extract hooks).

### E2 — Homepage conversion redesign — `M`

- **Files:** `apps/web/src/app/page.tsx`, `HomePageClient.tsx`, `components/*`.
- **Steps:** clear hero (what/why/CTA), live "your fingerprint in 1 click" demo,
  trust/transparency section, "get an API token" CTA, social proof placeholder.
  Live IP block already uses `/my-ip` — keep, add a "is my IP risky?" teaser
  linking to E5.
- **Acceptance:** Lighthouse (mobile) Perf ≥ 90, A11y ≥ 95, SEO = 100 on the
  built static page; CTA above the fold; no CLS from the live demo (reserve
  space with skeletons — components already exist).

### E3 — `/checker` (the hero tool) polish — `L`

- **Files:** `apps/web/src/app/checker/page.tsx` + the many fingerprint
  components.
- **Steps:**
  1. Replace **fake progress** with real progress from C1.
  2. Group signals (Graphics / Hardware / Browser / Network) using
     `FingerprintCollectorCard`; show per-signal rarity from B4 when available.
  3. Wire `ConfidenceDashboard`, `UniquenessAnalysis`,
     `PrivacyLeakageAssessment`, `BrowserComparison`, `FingerprintHistory`,
     `ExportReport` to real data; remove any mock values.
  4. Add copy-to-clipboard, re-run, and "explain this signal" tooltips (C2).
- **Acceptance:** loads < 2.5 s LCP on mid-tier mobile; no hydration errors; all
  panels show real values; export produces a valid JSON/PDF report; keyboard
  navigable.
- **Guardrails:** All browser-API code stays in `"use client"` components. No
  blocking the main thread during collection (yield).

### E4 — Playground (API tester) UX — `M`

- **Files:** `apps/web/src/app/playground/page.tsx`.
- **Steps:** token-gated request builder for `POST /v1/fingerprint` and
  `GET /v1/ip/:ip`; show request/response, latency, rate-limit headers; code
  snippets (curl/JS/Go) generated from the live config (A2). Use
  `ApiResponseSkeleton` for loading.
- **Acceptance:** a user with a token can run both endpoints and see real
  responses + headers; snippets are copy-pasteable and use the correct base URL.

### E5 — IP Risk Checker page (`/ip`) — `M`

- **Depends on:** B1, D1. **Files:** `apps/web/src/app/ip/page.tsx` (new) +
  `ip/layout.tsx`, components for risk display.
- **Steps:** input an IP (default = caller's IP via `/my-ip`), call
  `GET /v1/ip/:ip`, render geo + ASN + risk band/verdict + evidence signals with
  a clear "what this means" explainer. Reuse design tokens.
- **Acceptance:** entering `8.8.8.8` shows Google LLC / low risk; a flagged IP
  shows the high-risk treatment; errors (429/invalid) handled with friendly UI;
  page is statically generated, data is client-fetched.
- **Guardrails:** Never expose the API token in client code — the page either
  uses a public/demo-limited path or instructs the user to bring their own token.
  Decide and document; do not ship the secret to the browser.

### E6 — Docs site IA + search — `M` (P2)

- **Files:** `apps/web/src/app/docs/*`.
- **Steps:** restructure docs (Quickstart, SDK, API reference, Privacy,
  Self-host); render from `react-markdown` (already a dep); add client-side
  search; ensure every endpoint in §5 is documented and matches reality.
- **Acceptance:** docs match implemented endpoints 1:1; quickstart gets to a
  working call in < 3 minutes (PRD metric); internal links valid.

---

## 9. Workstream F — SEO + Content Engine (P2)

> Read: `apps/web/src/app/sitemap.ts`, `robots.ts`, `lib/metadata.ts`,
> `components/StructuredData.tsx`, `app/fingerprint/[type]/page.tsx`,
> `app/guide/*`, `docs/CONTENT_TEMPLATE.md`.

### F1 — Technical SEO correctness — `S`

- **Depends on:** A2 (canonical host fixed).
- **Steps:** verify canonical tags, OG/Twitter cards, `robots.ts`, `sitemap.ts`
  all use the real host; one OG image per template; JSON-LD via `StructuredData`
  on every key page (WebSite, Organization, BreadcrumbList, FAQ, Article).
- **Acceptance:** Rich Results test passes for guide + tool pages; sitemap lists
  all indexable routes; no canonical points to a dead/wrong host.

### F2 — Programmatic SEO templates (`/fingerprint/[type]`) — `L`

- **Steps:** expand the existing dynamic template into a real pSEO surface:
  per-signal explainer pages (canvas, webgl, audio, fonts, timezone, …) generated
  via `generateStaticParams()` from the collector registry; each page = unique
  intro + live mini-demo (client) + "how unique is this" + internal links.
- **Acceptance:** N static pages build (one per signal), each with unique
  title/description/H1/JSON-LD, indexable, and a working live demo; no thin/dup
  content (each ≥ ~400 words unique).
- **Guardrails:** No doorway pages. Each page must have genuine, distinct
  educational value (E-E-A-T). Static-export friendly only.

### F3 — IP-intelligence pSEO (`/ip/[address]` or `/ip-lookup/...`) — `M`

- **Depends on:** B1, E5. **Steps:** decide between (a) a single interactive `/ip`
  tool (E5) for indexable head term "ip address checker / ip risk lookup", and
  (b) limited static landing pages for high-intent queries (e.g. "what is my ip",
  "is this ip a proxy"). Prefer (a) + a few hand-written landers; **do not**
  generate millions of per-IP pages (thin content + cost).
- **Acceptance:** ranks-ready landing(s) with proper metadata; tool page targets
  the head term; no auto-generated per-IP index bloat in the sitemap.

### F4 — Content/editorial baseline — `M`

- **Steps:** 5–8 cornerstone guides (what is fingerprinting, canvas FP, how to
  reduce your fingerprint, fingerprinting vs cookies, bot detection basics,
  privacy & law). Use `docs/CONTENT_TEMPLATE.md`. Internal-link to tools.
- **Acceptance:** each guide: unique, ≥ 1000 words, JSON-LD Article, TOC, CTA;
  added to sitemap; passes readability + AA contrast.

### F5 — Core Web Vitals SEO budget — `S`

- **Steps:** set per-route JS budgets; lazy-load heavy checker panels; preconnect
  to the API origin; ensure OG image weights are reasonable.
- **Acceptance:** field-or-lab CWV: LCP < 2.5 s, INP < 200 ms, CLS < 0.1 on home,
  checker, a guide, and a pSEO page.

---

## 10. Workstream G — Analytics & Observability (P3)

### G1 — Privacy-respecting product analytics — `S`

- **Files:** `apps/web/src/components/Analytics.tsx`, `lib/analytics.ts`.
- **Steps:** use cookieless analytics (Cloudflare Web Analytics or Plausible);
  track tool runs, token requests, docs funnel — **no PII, no fingerprint
  payloads**. Gate behind consent if jurisdiction requires.
- **Acceptance:** events fire on key actions; privacy page documents what's
  collected; no PII leaves the client.

### G2 — API observability — `S`

- **Steps:** structured JSON logs (already started for IPbot rate-limit); add
  request id, route, status, latency; wire Workers Analytics Engine or
  log push; optional Sentry for web. Add a `wrangler tail` runbook.
- **Acceptance:** can answer "p95 latency of /v1/fingerprint last hour" and
  "IPbot remaining quota" from logs/metrics.

---

## 11. Workstream H — Privacy / Security / Legal (P3)

### H1 — Security pass — `M`

- **Steps:** auth/rate-limit review; input validation (Zod) on every route;
  CORS locked to known origins in prod; no secret logging; dependency audit
  (`pnpm audit`); set security headers via Pages config (CSP, HSTS,
  X-Content-Type-Options, Referrer-Policy).
- **Acceptance:** OWASP-style checklist in `docs/SECURITY.md` all green; headers
  verified with `curl -I`; `pnpm audit` has no unresolved high/critical.

### H2 — Privacy & legal completeness — `S`

- **Files:** `apps/web/src/app/privacy/page.tsx`, new `terms/page.tsx`,
  `docs/SECURITY.md`.
- **Steps:** privacy policy reflects exactly what B3/B4/G1 store; add Terms,
  responsible-use, and an opt-out/Do-Not-Fingerprint note; GDPR/CCPA basics.
- **Acceptance:** policy matches implementation (no over/under-claiming);
  reviewer can trace each data item to code.

---

## 12. Workstream I — Testing / QA (P0 seed, P3 depth)

### I0 — Green baseline — `S` (P0)

- **Steps:** make `pnpm -w test`, `typecheck`, `lint`, and web `build` all green
  on the current tree before any feature work. Fix or quarantine broken tests
  (document quarantines).
- **Acceptance:** all four commands green on a clean checkout in CI.

### I1 — Unit/integration coverage — `M`

- **Steps:** core collectors (mock browser APIs), API routes (auth, rate limit,
  success/error, IPbot, ip route), SDK. Target ≥ 70% on core + api.
- **Acceptance:** coverage report meets target; new endpoints have tests.

### I2 — E2E (Playwright) — `M`

- **Files:** `apps/web/tests/*` (Playwright).
- **Steps:** smoke flows: home loads + live demo, run checker, get token in
  playground, IP checker happy path. Run against the **deployed preview** (per
  the env rules; browser QA is a hard gate for UI).
- **Acceptance:** E2E green in CI against a preview URL; artifacts (trace/video)
  on failure.

### I3 — Visual/Lighthouse regression — `S`

- **Steps:** CI Lighthouse budgets for home/checker/guide; optional visual diff
  on key components.
- **Acceptance:** budgets enforced; regressions fail the PR.

---

## 13. Workstream J — Performance (P3)

### J1 — Web performance — `S`

- Code-split checker panels; defer non-critical JS; image/OG optimization;
  preconnect API. **Acceptance:** §F5 CWV budgets met and enforced in CI.

### J2 — API performance — `S`

- Verify KV read/write patterns; cache headers on cacheable GETs; ensure IPbot
  cache hit-rate logged. **Acceptance:** p95 `/v1/fingerprint` < 100 ms (measured
  via G2); IPbot cache hit-rate reported.

---

## 14. Workstream K — Growth / Monetization (P4, optional — do not start before P0–P2 done)

- **K1 Plans & quotas:** tiered tokens (free/pro) enforced in
  `middleware/ratelimit.ts` + KV; document limits.
- **K2 Self-serve onboarding:** token dashboard page (client-only) to view usage.
- **K3 Billing:** Stripe checkout (server-side via a separate Worker route);
  **never** put Stripe secret in the browser. Out of scope until product-market
  signal exists.

---

## 15. Definition of Done per Phase (gates)

- **P0 done when:** A1–A4, B0, I0 complete → site+API on correct domains, base
  URLs unified, CI gates real, all checks green on `main`.
- **P1 done when:** B1–B4, C1, D1, E1–E5 complete → IP intelligence + fingerprint
  endpoints real and wired into polished checker/playground/IP pages; SDK ≤ 15 KB
  with both formats; uniqueness has a real (anonymized) baseline.
- **P2 done when:** F1–F5 + E6 complete → correct technical SEO, pSEO signal
  pages, cornerstone content, CWV budgets enforced, docs match reality.
- **P3 done when:** G1–G2, H1–H2, I1–I3, J1–J2 complete → measured, secure,
  privacy-complete, tested (incl. E2E on preview), within perf budgets.
- **P4:** only if pursuing monetization.

---

## 16. Task Tracker (codex updates this column)

| ID  | Title                                                            | Phase | Effort | Depends     | Status |
| --- | ---------------------------------------------------------------- | ----- | ------ | ----------- | ------ |
| A1  | Custom domains                                                   | P0    | M      | —           | todo   |
| A2  | Base-URL SSOT                                                    | P0    | M      | A1          | done   |
| A3  | CI gate hardening                                                | P0    | S      | —           | todo   |
| A4  | Previews + secret docs                                           | P0    | S      | A3          | todo   |
| B0  | API hygiene baseline                                             | P0    | S      | —           | done   |
| I0  | Green test baseline                                              | P0    | S      | —           | done   |
| B1  | IP intel endpoint (IPbot)                                        | P1    | M      | B0          | done   |
| B1b | Public no-token /v1/ip/public/:ip (per-IP + global daily limits) | P1    | M      | B1          | done   |
| B2  | Enrich /my-ip risk                                               | P1    | S      | B1          | todo   |
| B3  | GET /v1/fingerprint/:id                                          | P1    | M      | B0          | todo   |
| B4  | Uniqueness baseline                                              | P1    | L      | B3          | todo   |
| C1  | Collector reliability/coverage                                   | P1    | M      | —           | todo   |
| D1  | SDK hardening + size                                             | P1    | M      | B1          | todo   |
| E1  | Design system pass                                               | P1    | M      | —           | todo   |
| E2  | Homepage redesign                                                | P1    | M      | E1,A2       | todo   |
| E3  | /checker polish                                                  | P1    | L      | E1,C1,B4    | todo   |
| E4  | Playground UX                                                    | P1    | M      | E1,B1       | todo   |
| E5  | /ip risk checker                                                 | P1    | M      | B1,D1,E1    | done   |
| E6  | Docs IA + search                                                 | P2    | M      | A2          | todo   |
| F1  | Technical SEO                                                    | P2    | S      | A2          | todo   |
| F2  | pSEO signal pages                                                | P2    | L      | C1,F1       | todo   |
| F3  | IP pSEO landers                                                  | P2    | M      | B1,E5,F1    | todo   |
| F4  | Cornerstone content                                              | P2    | M      | F1          | todo   |
| F5  | CWV budgets                                                      | P2    | S      | E2,E3       | todo   |
| G1  | Product analytics                                                | P3    | S      | A2          | todo   |
| G2  | API observability                                                | P3    | S      | B0          | todo   |
| H1  | Security pass                                                    | P3    | M      | B1          | todo   |
| H2  | Privacy/legal                                                    | P3    | S      | B3,B4,G1    | todo   |
| I1  | Unit/integration coverage                                        | P3    | M      | B1,C1       | todo   |
| I2  | E2E Playwright                                                   | P3    | M      | E2,E3,E4,E5 | todo   |
| I3  | Lighthouse regression                                            | P3    | S      | E2          | todo   |
| J1  | Web performance                                                  | P3    | S      | E3          | todo   |
| J2  | API performance                                                  | P3    | S      | G2          | todo   |
| K1  | Plans & quotas                                                   | P4    | M      | B0          | todo   |
| K2  | Token dashboard                                                  | P4    | M      | K1          | todo   |
| K3  | Billing (Stripe)                                                 | P4    | L      | K1          | todo   |

---

## 17. Top Risks & Mitigations

1. **Static-export trap** — codex adds a Server Component/Route Handler that
   needs a runtime; build silently degrades. _Mitigation:_ Invariant #1 + the web
   `build` gate in CI (A3) must stay required.
2. **Canonical/domain drift** — SEO indexes the wrong host. _Mitigation:_ A2 SSOT
   - F1 audit; grep guard in CI.
3. **IPbot cost blowout** — `/v1/ip` left unmetered or per-IP pages generated.
   _Mitigation:_ B1 auth+rate-limit; F3 forbids per-IP bloat; G2 logs quota.
4. **Privacy overreach** — B3/B4 store re-identifiable data. _Mitigation:_
   Invariant #2 + k-anonymity in B4 + H2 policy-matches-code review.
5. **Uniqueness scope creep (B4)** — _Mitigation:_ ship coarse bucket counts
   first; HLL is a follow-up, not a blocker.
6. **Hashing change** breaks every existing fingerprint ID. _Mitigation:_ C1
   guardrail — version the algorithm, never silently change normalization.

```

> Maintenance: when a task is done, set its Status and add a one-line note under
> the task. Keep `docs/ROADMAP.md` as the short public version; this file is the
> execution contract.

### Completed notes

- A2: Runtime API fetches and snippets now use `SITE_CONFIG.apiUrl`; `apps/web/wrangler.toml` production points to `https://api.creepjs.org`; remaining `creepjs.org` grep hits are contact email/CDN display strings plus metadata fallback.
- B0: Added `/v1/health`, kept `/` health compatible, and normalized middleware error details.
- I0: `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`, and `pnpm --filter @creepjs/web build` pass.
- B1: Added token-gated `GET /v1/ip/:ip` with IPbot error mapping, cache-aware response, rate-limit metadata, and integration tests.
- E5: Added static `/ip` page with caller-IP prefill, bring-your-own-token lookup, risk/geo/ASN/evidence rendering, and friendly invalid/429/auth error handling.
```

# CreepJS 2.0 — Optimization Plan (2026-07)

> **Increment to `docs/LAUNCH_PLAN.md`, not a replacement.** LAUNCH_PLAN §12 stays
> the single task tracker; the tasks below are registered there (D2, F3a, B7, E7)
> and the reasoning + file-level detail live here. Written 2026-07-17 after a PM
> demand review and a full repo/endpoint audit.

## 0. Context — why this doc exists

The product is built and deployed but has been static for ~a month, with several
"doing" tasks stuck on the same tail: browser verification + operator actions.
A PM pass + independent endpoint probing surfaced a small number of **funnel
breaks** that make the existing SEO/SDK investment yield ~zero today. This plan
fixes those first, then builds demand capture for the highest-intent audience.

**Target audience (ranked):** ① proxy/scraping operators (verify proxy-IP
quality — IPbot data hits this dead-center, strong last-click intent, highest
willingness to pay) → drive with ② privacy enthusiasts (distribution) → ③ "what
is my IP" mass traffic (long-tail tool words only). **Not** competing on
fingerprint match-rate vs fingerprint.com short-term (no labeled dataset →
any "99.x%" claim would be a second "docs lie").

**North star:** weekly tool runs (unique visitors completing a checker scan or an
`/ip` lookup). It compounds the three flywheels at once — uniqueness sample
accrual (breaks the cold-start deadlock), share-driven distribution, SDK/token
conversion — and G1 analytics already measures it.

## 1. Verified findings (all independently re-checked 2026-07-17)

| Claim | Evidence | Impact |
| --- | --- | --- |
| npm `@creepjs/sdk` unpublished | `registry.npmjs.org/@creepjs%2Fsdk` → `{"error":"Not found"}` | docs' `npm install @creepjs/sdk` fails 100% of the time |
| `cdn.creepjs.org` dead | DNS → fake-IP `198.18.2.202`, TLS handshake fails | every `<script src="https://cdn.creepjs.org/...">` in docs is dead |
| **but a working self-hosted SDK exists** | `https://creepjs.org/sdk.js` → **200** | dead-link fix needs no npm publish — just repoint the URL |
| uniqueness cold-start deadlock | prod `/v1/stats/uniqueness` → `{"totalSamples":13,"kAnonThreshold":20,"estimates":{}}` | "real rarity" differentiator not yet true; needs traffic first |
| docs↔endpoint drift | `/v1/stats` → 404; real path is `/v1/stats/uniqueness` (`apps/api/src/routes/stats.ts:7`) | another latent "docs lie" |
| IPbot pipeline is rich & live | `8.8.8.8` returns operator / service_role / RPKI / anycast / evidence signals; tier=pro 600/min | most under-used asset; deeper than ipinfo.io free tier |

**Decisions locked with the operator (2026-07-17):** (a) this round ships the
*plan only*, no code; (b) SDK is **not** published to npm now — docs promote the
single `<script src="https://creepjs.org/sdk.js">` path, and the npm install
snippet is demoted to "planned".

## 2. IPbot integration — DONE this session (record)

The repo already carried a complete IPbot integration (`lookupIP` service + three
routes + unit tests). What was missing was local credential wiring and real
verification.

- **Service:** `apps/api/src/services/ipbot.ts` → `lookupIP(ip, env)` — KV cache
  (24h default / 1h high-risk), 429 exponential backoff + `Retry-After`,
  structured `X-RateLimit-*` logging. Credentials read from env only, never
  hardcoded.
- **Routes:** `GET /v1/ip/public/:ip` (free, rate-limited), `GET /v1/ip/:ip`
  (token), `GET /my-ip`. Front-end `/ip` consumes the public endpoint.
- **Env wiring:** `IPBOT_API_ORIGIN` + `IPBOT_API_KEY` bridged from the ops key
  file into `apps/api/.dev.vars` (new, `0600`, gitignored) and repo
  `local.env.txt` — no secret value ever printed. Prod uses the Worker secret
  (`wrangler secret put IPBOT_API_KEY`, already set).
- **Verified (real API, not mocked):** `8.8.8.8` → US / Mountain View / AS15169
  Google, risk 12 "excellent"/allow; auth header sent; cache TTL 86400s; headers
  limit 600 / remaining 596 / **tier pro** logged. Cache hit on 2nd call (0
  upstream). Invalid IP → 400, no upstream. Wrong key → upstream 401. Prod
  `/my-ip` + `/v1/ip/public/8.8.8.8` return real data. **ALL PASS.**

## 3. P0 — fix the funnel (pure code unless noted; do first)

### D2 — SDK docs dead-link fix (`S`, pure code)

**Problem:** the two advertised SDK entry points (`cdn.creepjs.org`, npm) are both
dead; `https://creepjs.org/sdk.js` (200) is the working replacement.

**Files & anchors:**

| File | Anchor | Change |
| --- | --- | --- |
| `apps/web/src/app/docs/page.tsx` | `:289` copy | "via npm or CDN" → "via a single `<script>` tag (npm package planned)" |
| ↑ | `:307-320` "Option 2: CDN" block | promote to **Option 1**; `https://cdn.creepjs.org/v1/sdk.js` → `https://creepjs.org/sdk.js`; fix `fullBundleUrl` (see preflight) |
| ↑ | `:294-303` "Option 1: NPM" block | demote to Option 2; annotate `# npm package coming soon` |
| ↑ | `:338` `import … from '@creepjs/sdk'` | ESM import needs npm; switch to UMD global `const { getFingerprint } = window.CreepJS`, or mark "available after npm publish" |
| `docs/SDK.md` | npm `:8/14/20`, cdn `:26/64/68`, imports `:38/52/125/208/223` | script-tag primary; npm/ESM examples marked planned |
| `docs/API.md` | `:424/448/452` | `cdn.creepjs.org` → `creepjs.org/sdk.js` |
| `README.md` | `:266/270` | same |

**Preflight (put in the task):** `curl -sI https://creepjs.org/sdk.full.js` — if not
200, either build+copy per CLAUDE.md deploy step (`cp packages/sdk/dist/*.js
apps/web/public/`) or drop the `fullBundleUrl` line. No second dead link allowed.

**Acceptance:** every install/import block in docs page + the 3 `.md` files runs
as written; `grep -rn 'cdn.creepjs.org'` across repo = 0. Register under **D1**
follow-up (D1 claimed "docs landed" but shipped dead links).

### F3a — `/ip` shareable report URL (`S`, pure code, single file)

**File:** `apps/web/src/app/ip/page.tsx` only (client component, static-export safe).

1. `:127-150` `useEffect`: read `?q=` first (`new URLSearchParams(location.search)
   .get('q')`); if present and valid (reuse existing IP validation), `setIp(q)` +
   trigger `runLookup()`; **else** fall back to the current `loadCurrentIp()`
   (`/my-ip` autodetect).
2. `:211` after `setResult(data)`: `history.replaceState(null, '', '?q=' +
   encodeURIComponent(ip.trim()))` — replaceState so the back stack stays clean.
3. Add a "Copy shareable link" button (reuse the `copyResult`/toast pattern at
   `:243`).

`runLookup` (`:179-241`, hits `/v1/ip/public/:ip` + analytics) is unchanged — only
a new trigger path. Honors LAUNCH_PLAN invariant #1 (no server dependency).

**Acceptance:** `/ip?q=8.8.8.8` auto-runs on load; address bar shows `?q=` after a
lookup; a copied link reproduces the same result for another visitor. Folds into
**F3**.

### §12 refresh + stats drift (`S`, docs/meta)

- S0 `doing → done` (CF token rotated + confirmed dead 2026-06-16; see memory
  `creepjs-deploy-and-secrets`).
- Fix `/v1/stats` → `/v1/stats/uniqueness` drift in docs/playground references
  (`apps/api/src/routes/stats.ts:7`). Fold into **E6**.

### Operator-only P0 (cannot be done from the control plane)

- **npm publish** — deferred by decision; docs use the script tag. When wanted:
  operator `npm login`, then `pnpm publish -r`.
- **F6 — GSC/Bing submit sitemap + confirm indexing.** Highest-ROI hour in the
  whole plan; until indexed, all 62 sitemap URLs produce zero output.

## 4. P1 — demand capture & differentiation

### F3 — IP-intent landing pages (2–4 hand-written, `M`)

- Register routes in `apps/web/src/lib/seo-routes.ts` `STATIC_SEO_ROUTES`
  (`SeoRoute` shape: `path/title/description/section/changeFrequency/priority`);
  `sitemap.ts` picks them up automatically.
- Pages at `apps/web/src/app/ip-lookup/<slug>/page.tsx`, targeting strong
  last-click proxy-operator queries: `how-to-tell-if-an-ip-is-a-proxy`,
  `datacenter-ip-detection`, `ip-fraud-score-explained`. Each embeds a live
  lookup box (share the `/ip` `runLookup` logic) and CTAs to `/ip`.
- **Forbidden:** no auto-generated per-IP pages (LAUNCH_PLAN risk #3: thin content
  + IPbot cost blowout).
- **Acceptance:** landers in sitemap, FAQ JSON-LD, last-click satisfiable.

### B7 — Batch IP lookup + CSV export (`M`)

- Backend: `POST /v1/ip/batch` in `apps/api/src/routes/ip.ts` (token auth, reuse
  `authMiddleware` + `rateLimitMiddleware`); body `{ips: string[]}`, ≤50 per call;
  serial `lookupIP` server-side (600/min is ample; KV-cache hits don't hit
  upstream); reuse existing validation + `IpbotError` handling.
- Frontend: batch input + CSV export in `/playground` or `/ip`.
- **Why:** the first real reason a proxy operator registers a token; anchor for
  future K1 tiering. Depends on token/ratelimit (live).

### E3 — `/checker` polish + refactor (`L`) & E7 — fingerprint×IP joint report (`M`)

- E3: split the 2692-line checker + shareable result URL (deps C1/B4/J1 ready).
- **E7 (new):** checker gains a "network verdict" section merging the browser
  fingerprint conclusion with the visitor's own IP risk (`/my-ip` already returns
  it) into one exportable report — a free, transparent, educational take on what
  fingerprint.com paywalls as Smart Signals. Data is all present; only UI
  synthesis. Depends on E3.

## 5. Explicitly NOT doing (solo project + free tier + IPbot quota)

1. No per-IP auto-generated pages (thin content + quota blowout; LAUNCH_PLAN risk #3).
2. No Stripe/K3, no early token dashboard/K2 — zero traffic, no PMF signal.
3. Don't chase head term "what is my IP" (Google direct-answer + incumbents);
   spend on long-tail tool words for proxy operators.
4. Don't claim fingerprint match-rate vs fingerprint.com (no labeled data → can't
   substantiate; would be a second "docs lie"). Stay educational/transparent/free.
5. No new collectors, no i18n (58 collectors suffice; a 2nd locale doubles
   single-maintainer content cost).

## 6. 90-day cadence

- **D1–30 fix the funnel:** D2 + F3a + §12 refresh (pure code) + F6 submit +
  (deferred) npm. Acceptance: GSC impressions > 0; uniqueness samples 13 → 100+.
- **D31–60 build capture:** F3 landers, B7 batch, E3 finish. Acceptance: weekly
  tool runs ≥ 200; token requests ≥ 10; ≥ 1 high-intent term in top 20.
- **D61–90 convert:** E7 joint report, first uniqueness buckets over k. Acceptance:
  weekly tool runs ≥ 1000; ≥ 3 buckets past k=20 showing real rarity.

**If only three things ship:** D2 (docs dead-link fix) → F3a (`/ip` shareable URL)
→ F6 (operator submits sitemap). All S-sized, one week, and they decide whether
every other SEO/SDK investment pays back.

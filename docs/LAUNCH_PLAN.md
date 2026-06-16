# CreepJS 2.0 — Launch & Growth Plan (ROI‑ordered, Codex‑ready)

> **This is the single source of truth for delivery.** It supersedes the ordering
> in `docs/EXECUTION_PLAN.md` (kept as a task-spec reference) and `docs/ROADMAP.md`
> (kept as the 4-line elevator pitch). Where a task here reuses an EXECUTION_PLAN
> ID (A1, B3, F1…), the spec there still applies — this doc fixes the **state
> assessment, the sequencing, and the acceptance gates**, because the project is
> much further along than EXECUTION_PLAN assumes.
>
> **Audience:** an autonomous coding agent (Codex). Execute milestones in order.
> Within a milestone, respect `Depends on`. Do not exceed a task's stated scope.
> "Acceptance" is the Definition of Done — never mark done without pasting the
> verification command output.

---

## 0. How Codex must work in this repo (read once, obey always)

**Toolchain (do not change):** pnpm@9.15.4 workspaces + Turborepo. Node ≥ 20.9.
Next.js 15 (App Router, React 19, **static export**), Cloudflare Workers + Hono,
TypeScript strict. UI = Tailwind 3 + Radix primitives + CVA (NOT full shadcn).

**Per-task loop:**

1. Read every file the task lists **before** editing.
2. Make the smallest change that satisfies Acceptance. No drive-by refactors.
3. Run the task's verification commands; paste output into the commit/PR body.
4. Flip the task Status in §9 (`todo → doing → done`) with a one-line note.
5. One task = one focused Conventional-Commits commit/PR.

**Verification commands (the green gate — all must pass before "done"):**

```bash
pnpm install --frozen-lockfile
pnpm -w typecheck
pnpm -w lint
pnpm -w test
pnpm --filter @creepjs/web build      # static export must produce apps/web/out
pnpm --filter @creepjs/api test
```

**Runtime/QA rule (from the operator's environment policy):** this machine is a
control plane — **no local dev servers, Docker, or Playwright runtime here.** Run
anything that needs a browser/server against the deployed **Cloudflare Pages
preview** (PRs auto-deploy one) or on the OpenClaw runtime. `curl 200` is a
supporting signal, **never** acceptance evidence for a UI task — a real browser
check (Lighthouse CI on the preview, or Playwright) is the gate.

---

## 1. Global Invariants (NEVER violate — this is how you avoid drift)

1. **Web is a static export** (`apps/web/next.config.mjs` → `output: 'export'`).
   ❌ No request-time Server Component fetching, no runtime Route Handlers, no
   `next/headers`, no ISR, no middleware. ✅ All dynamic data is fetched
   **client-side** from the Worker via `SITE_CONFIG.apiUrl`
   (`NEXT_PUBLIC_API_URL`). New dynamic pages = `generateStaticParams()` + a
   `"use client"` component for live data.
2. **Privacy-first is binding** (PRD non-goals). No raw fingerprint payloads
   stored long-term, no ad/tracking, no selling data. Any new storage of
   fingerprint-derived data must be **aggregate/anonymized** and documented in
   `docs/SECURITY.md` + `apps/web/src/app/privacy/page.tsx`.
3. **No secrets in the repo.** Keys come from Worker secrets (`wrangler secret
put`) or `.dev.vars` (gitignored). Scan staged files before every commit.
4. **Edge-first API.** Hono on Workers, KV storage, unless a task explicitly adds
   D1/R2. Keep p95 < 100 ms.
5. **Bundle budgets, enforced in CI.** SDK ≤ 15 KB gzipped (currently **24 KB —
   over budget**, see D1). Per-route web JS tracked.
6. **Backward compatibility.** Public API response shapes & SDK signatures are
   contracts. Additive only; breaking changes need an OpenSpec change doc +
   version bump. **Hashing/normalization is frozen** (MurmurHash3 + Base62 +
   sorted-key JSON) — changing it re-IDs every existing device; if unavoidable,
   add `fpVersion` and document.
7. **A11y & i18n posture.** New UI is keyboard-navigable, WCAG 2.2 AA contrast/
   focus. Copy is English in code; do not add a second locale unless a task says so.

---

## 2. Verified current state — June 2026 (this is the REAL baseline)

Probed live + mapped the full tree. **The product is built and deployed.** This
corrects EXECUTION_PLAN's "feature-rich but un-hardened, one git commit" snapshot.

| Module           | Reality (verified)                                                                                                                                                                                                                                     | Verdict         |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------- |
| **Domains**      | `https://creepjs.org` (Pages) + `https://api.creepjs.org` (Worker) both **live, valid TLS**, canonical/OG already point to the real host.                                                                                                              | ✅ Done (A1/A2) |
| **Web pages**    | `/`, `/checker`, `/playground`, `/docs`, `/fingerprint`, `/ip`, `/privacy`, `/guide/...` all return 200, all **real functionality** (no stubs/lorem).                                                                                                  | ✅ Done         |
| **API**          | 8 routes live: health, `/v1/health`, `POST /v1/token`, `POST /v1/fingerprint`, `GET /v1/ip/:ip` (token), `GET /v1/ip/public/:ip` (**no-token, rate-limited, rich data**), `GET /my-ip`. Full middleware (auth/ratelimit/cors/error). 23 passing tests. | ✅ Mostly done  |
| **Core engine**  | 61 collectors, all complete (canvas…webrtc…lies/resistance), MurmurHash3+Base62, weighted trust score 0–100, coverage stats.                                                                                                                           | ✅ Done         |
| **SDK**          | Complete API (`getFingerprint`, cache TTL), UMD+ESM. **But 24 KB gzipped (budget 15 KB)** because all 61 collectors are bundled. Only 4 trivial tests.                                                                                                 | ⚠️ Over budget  |
| **SEO scaffold** | sitemap (62 URLs incl. 60 pSEO signal pages), robots (+content-signals), JSON-LD (Org/WebSite/WebApp/FAQ/Breadcrumb), OG image, manifest, PWA. pSEO pages are deep (~1.4k words).                                                                      | ✅ Strong base  |
| **CI/CD**        | 4 workflows: CI (lint/type/test/build), deploy-api (rollback+health), deploy-web (preview+Lighthouse). All operational.                                                                                                                                | ✅ Done         |

### 🔴 Live defects & real gaps (the actual work — verified, not assumed)

| #   | Issue                                                                                                                                            | Evidence                                     | Module        |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------- | ------------- |
| 1   | **Leaked Cloudflare API token** committed to public repo ~6 months (old SHA `e78c0a8`); history-rewritten but **still leaked**. NOT yet rotated. | operator memory `creepjs-deploy-and-secrets` | Security      |
| 2   | **`/my-ip` returns 500** `IPINFO_TOKEN is not configured` → homepage & `/ip` self-IP block broken in prod.                                       | `curl https://api.creepjs.org/my-ip` → 500   | Backend       |
| 3   | **`GET /v1/fingerprint/:id` advertised but unimplemented** in `docs/page.tsx:524` and `playground/page.tsx:728`.                                 | grep + API map                               | Backend/Docs  |
| 4   | **"Uniqueness %" has no population baseline** — it's a client-side guess; no real rarity data.                                                   | core map (no stats service)                  | Core/Backend  |
| 5   | **SDK 24 KB gzipped** vs 15 KB budget; no CI size gate.                                                                                          | `gzip -c dist/*.js`                          | SDK           |
| 6   | **Forced dark mode** — `<html className="dark">` hardcoded though `ThemeProvider`+`ThemeToggle` exist → toggle is a no-op / hydration risk.      | `layout.tsx:28`                              | UI            |
| 7   | **Monster client pages** — `checker/page.tsx` 2517 lines, `HomePageClient.tsx` 1539 → heavy route JS, CWV/maintainability risk.                  | `wc -l`                                      | Frontend/Perf |
| 8   | **Thin test coverage** — web 2 tests / 53 files; SDK 4 trivial; `/my-ip` untested; no E2E.                                                       | repo map                                     | QA            |
| 9   | **No analytics signal confirmed** + **no search-console indexing runbook** → flying blind on the #1 growth lever.                                | `Analytics.tsx` needs token                  | SEO/Obs       |
| 10  | **No real product baseline service / monetization** (token endpoint exists, no plans/quota tiers/dashboard/billing).                             | API map                                      | Growth        |
| 11  | Minor hygiene: no root `LICENSE`/`CONTRIBUTING`, `ARCHITECTURE.md` stub, fingerprint history is client-only localStorage.                        | infra map                                    | Docs          |

**Takeaway:** don't rebuild — **harden, make the numbers real, and pour fuel on
SEO.** That is where ROI is highest for a free developer tool.

---

## 3. ROI‑ordered milestone roadmap

```
M0 TRUST & CORRECTNESS   (~2–3 days)  S0 B6 B3 A3 A4          ← stop the bleeding; cheap, unblocks all
M1 SEO TRAFFIC ENGINE    (~1–2 wk)    F1 F6 J1/F5 G1 F4a      ← turn on the compounding growth flywheel
M2 CORE PRODUCT VALUE    (~2–3 wk)    E1 B4 C1 D1 E3 E2        ← make uniqueness real + SDK adoptable + polish hero
M3 CONTENT & SEO SCALE   (~2–3 wk ∥)  F2 F3 F4b E6 E4          ← compound traffic; can run parallel to M2
M4 QUALITY/SEC/OBS       (~2 wk)      I1 I2 I3 H1 H2 G2 J2     ← stop regressions, be safe, be measured
M5 MONETIZATION (opt)    (when traffic) K1 K2 K3               ← only after PMF signal
```

**ROI rationale:** M0 fixes are hours of work that remove a live security risk, a
broken homepage feature, and a credibility-killing doc lie. M1 is the single
biggest growth lever for a free tool (technical SEO + CWV + indexing + analytics)
and is mostly cheap config + perf. M2 delivers the actual differentiator (real
uniqueness data) and unblocks SDK adoption. M3 compounds traffic. M4/M5 are
quality/scale/revenue once the funnel exists. **Content (F-tasks) may start as
soon as M0 lands — it has no code dependency and compounds slowest, so start it
early.**

**Phase gates (do not start M(n+1) until M(n) DoD is met):**

- **M0 done:** token rotated; `/my-ip` 200; docs↔API match; CI gates real & green on `main`.
- **M1 done:** Rich Results pass on every template; sitemap submitted & indexing; CWV budgets enforced (LCP<2.5s/INP<200ms/CLS<0.1 on home, checker, a guide, a pSEO page); analytics firing.
- **M2 done:** uniqueness backed by anonymized baseline; checker/home show real coverage+rarity; SDK ≤15 KB with CI gate; design system consistent (theme decision shipped).
- **M3 done:** pSEO templates hardened & deduped; IP head-term + landers live; 6–8 cornerstone guides; docs match endpoints 1:1.
- **M4 done:** ≥70% core+api coverage; Playwright E2E green on preview; security headers + audit clean; privacy/legal matches code.

---

## 4. Module coverage index (proof every module is covered)

| Module                         | Tasks                                                                                          |
| ------------------------------ | ---------------------------------------------------------------------------------------------- |
| **UI / Design system**         | E1 (tokens, theme decision, primitives), E2 (home), E3 (checker), E4 (playground), E5✅(ip)    |
| **Frontend (Next.js)**         | E1–E6, J1, plus refactors folded into E2/E3                                                    |
| **Backend (Workers/Hono)**     | B3, B4, B6, G2, J2, H1                                                                         |
| **Core engine**                | C1 (reliability/coverage/real progress), C2 (lies surfacing)                                   |
| **SDK**                        | D1 (slim build + size gate + tests)                                                            |
| **SEO / Content**              | F1 (technical), F2 (pSEO), F3 (IP SEO), F4 (guides), F5/J1 (CWV), F6 (Search Console/indexing) |
| **Security / Privacy / Legal** | S0 (token rotation), H1 (sec pass/headers), H2 (privacy+terms+license)                         |
| **Testing / QA**               | I1 (unit/integration), I2 (E2E), I3 (Lighthouse regression)                                    |
| **Analytics / Observability**  | G1 (product analytics), G2 (API observability)                                                 |
| **Infra / CI/CD / Deploy**     | A3 (CI gates), A4 (previews+secrets runbook)                                                   |
| **Growth / Monetization**      | K1 (plans/quota), K2 (dashboard), K3 (billing)                                                 |

---

## 5. MILESTONE M0 — Trust & Correctness

### S0 — Rotate the leaked Cloudflare API token — `S` — **CRITICAL, do first**

- **Why/ROI:** a valid CF API token sat in public history for months; history
  rewrite does **not** un-leak it (reachable by old SHA + caches). This is an
  account-takeover risk. Pure ops, ~30 min, infinite ROI.
- **This is a human/ops task — Codex cannot click the CF dashboard.** Codex's job
  is the code/doc side; flag the manual steps for the operator.
- **Manual (operator):** CF dashboard → My Profile → API Tokens → roll/replace the
  leaked token (old prefix `kbjm…tt8`) → update GitHub secret `CLOUDFLARE_API_TOKEN`
  and local `local.env.txt`. Verify a deploy still works.
- **Codex steps:** add a `docs/SECURITY.md` "Secret rotation runbook" section and a
  `SECURITY.md` note that no token is valid in history; add a CI/`pre-commit`
  secret-scan step (e.g. `gitleaks` or a grep for `kbjm`, `cfp_`, `ipb_`, CF token
  shapes) so it cannot recur — **non-blocking warning is not enough, fail the job**.
- **Acceptance:** secret-scan step fails on a planted fake token in a test commit
  and passes on clean tree; runbook documents exact rotation steps. Operator
  confirms rotation done (tracked in §9 note).
- **Guardrails:** never print the old/new token anywhere. Do not commit `local.env.txt`.

### B6 — Fix `/my-ip` 500 (self-IP feature broken in prod) — `S`

- **Why/ROI:** the homepage and `/ip` page both fetch `/my-ip` to show the
  visitor's own IP/geo; it currently 500s (`IPINFO_TOKEN is not configured`).
  First impression broken. Cheap fix, high visible ROI.
- **Files:** `apps/api/src/routes/myip.ts`, `apps/api/src/types.ts`,
  `apps/api/tests/myip.test.ts` (new), `apps/api/wrangler.toml`.
- **Decision (pick one, record in commit):**
  - **(a) Quick:** operator sets `wrangler secret put IPINFO_TOKEN`. Code unchanged.
  - **(b) Recommended — consolidate on one vendor:** rewrite `/my-ip` to resolve
    the caller IP from `cf-connecting-ip` and reuse the **already-working IPbot**
    path (`lookupIP`) to return geo+ASN (and optional risk), dropping the ipinfo
    dependency entirely. One vendor, one cache, gives risk for free, kills the
    untested `ipinfo` branch. Keep the response shape the web already consumes
    (map IPbot → `{ip, location, asn, hostname, cached}`) so no frontend change is
    forced; add fields additively.
- **Acceptance:** `curl https://api.creepjs.org/my-ip` → 200 with the caller's geo;
  new `myip.test.ts` covers success + local-IP fallback + upstream-error → graceful
  shape; homepage IP block renders on the preview (browser check). `pnpm --filter
@creepjs/api test` green.
- **Guardrails:** never log/expose the upstream key; cache (1 h) to protect quota;
  if (b), do not change existing keys consumers rely on — additive only.

### B3 — Resolve `GET /v1/fingerprint/:id` (docs lie) — `M`

- **Why/ROI:** docs (`docs/page.tsx:524`) and playground (`playground/page.tsx:728`)
  advertise an endpoint that returns 404. A developer's first API call fails →
  trust gone. Must fix before any SEO/marketing push.
- **Decision (pick one, record in commit):**
  - **(a) Implement (recommended):** on `POST /v1/fingerprint`, store a **minimal,
    non-PII** record in KV `fp:{id}` → `{confidence, coverage, fpVersion, timestamp,
collectorsSummary}` with short TTL (7 days). `GET /v1/fingerprint/:id` returns it
    or 404. **No raw component values.** Document TTL + privacy in `docs/SECURITY.md`
    and the privacy page.
  - **(b) Retire:** remove the endpoint from `docs/page.tsx`, `playground/page.tsx`,
    and any `docs/API.md` claims.
- **Files (if a):** `apps/api/src/routes/fingerprint.ts`, new `GET` handler,
  `apps/api/tests/fingerprint.test.ts`, `apps/api/wrangler.toml` (reuse `TOKENS`
  KV or add `FP_META`), `docs/SECURITY.md`, `apps/web/src/app/privacy/page.tsx`.
- **Acceptance:** docs/playground and code agree. If (a): tests for store→get→404→TTL
  and a "no raw signal stored" review; privacy page lists the new 7-day record. If
  (b): `grep -rn "v1/fingerprint/:id\|/v1/fingerprint/abc" apps/web/src docs` returns nothing.
- **Guardrails (if a):** stored object must pass "contains no re-identifiable signal" review.

### A3 — CI gate hardening — `S`

- **Files:** `.github/workflows/ci.yml`.
- **Steps:** ensure PRs run `typecheck`, `lint`, `test`, `pnpm --filter @creepjs/web
build`, and `pnpm --filter @creepjs/api test`; **make `format:check` and the
  secret-scan (S0) blocking** (currently lint/security are `continue-on-error` —
  flip the ones that should gate). Add a placeholder SDK size-budget step (filled by D1).
- **Acceptance:** a PR with a type error / lint error / failing test / broken build
  / planted secret is **red**; `main` green. Paste a failing-then-passing run link.

### A4 — Previews + secret runbook — `S`

- **Files:** `.github/workflows/deploy-web.yml` (verify PR preview job), `docs/DEPLOYMENT.md`, new `docs/SECRETS.md`.
- **Steps:** confirm PRs post a Pages preview URL; produce **one table** of every
  secret: name · where used (web/api/CI) · how to set (`wrangler secret put` vs GH
  secret) · rotation owner. Cover `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`,
  `IPBOT_API_KEY`, `IPINFO_TOKEN` (if kept), `TEST_API_TOKEN`, `NEXT_PUBLIC_*`.
- **Acceptance:** opening a PR comments a preview URL; the secrets table is complete
  and matches `wrangler.toml` bindings + `.env.example`.

**M0 DoD:** token rotated (operator-confirmed); `/my-ip` 200; docs↔API consistent;
CI gates real and green on `main`.

---

## 6. MILESTONE M1 — SEO Traffic Engine (the growth flywheel)

> Read first: `apps/web/src/lib/metadata.ts`, `seo-routes.ts`, `app/sitemap.ts`,
> `app/robots.ts`, `components/StructuredData.tsx`, `components/Analytics.tsx`,
> the two heavy client pages (`checker/page.tsx`, `HomePageClient.tsx`).

### F1 — Technical SEO correctness audit — `S`

- **Why/ROI:** the scaffold is strong; this guarantees Google can index & enrich
  it. Cheap, unlocks all organic traffic.
- **Steps:** verify on every **template** (home, checker, ip, fingerprint hub,
  `fingerprint/[type]`, docs, playground, guide, privacy): one canonical to the
  real host; unique title/description/H1; OG+Twitter image; correct JSON-LD type
  (WebApplication for tools, Article+FAQ for guides, BreadcrumbList everywhere,
  CollectionPage for hubs). Confirm `robots.ts` doesn't block indexable routes and
  the content-signal block is intentional. Ensure sitemap lists every indexable
  route and **excludes** non-indexable ones.
- **Acceptance:** Google **Rich Results Test** passes for one URL of each template
  (paste results); `grep -rn "creepjs.org" apps/web/src` shows only the metadata
  config (no stray hardcoded hosts); sitemap diff vs route list = 0 missing/extra.

### F6 — Search Console + indexing runbook — `S` (operator-assisted)

- **Why/ROI:** you cannot rank or measure SEO without it. The highest-ROI hour in
  the whole plan. Mostly operator clicks; Codex writes the runbook + verification.
- **Codex steps:** add `docs/SEO_OPERATIONS.md`: verify domain in Google Search
  Console + Bing Webmaster, submit `https://creepjs.org/sitemap.xml`, request
  indexing for the 8 head pages, set up the Search Console → looker/sheet weekly
  export, and a monthly "coverage/CWV" review checklist. Add IndexNow ping (Bing)
  as a static-friendly option.
- **Acceptance:** runbook complete & reproducible; operator confirms sitemap
  submitted and ≥1 page showing "Indexed" (tracked in §9).

### J1 / F5 — Core Web Vitals on the heavy pages — `M`

- **Why/ROI:** CWV is a ranking factor **and** conversion factor; the 2517-line
  checker + 1539-line home almost certainly ship excessive JS. Direct SEO+UX ROI.
- **Files:** `apps/web/src/app/checker/page.tsx`, `HomePageClient.tsx`,
  `app/page.tsx`, `next.config.mjs`, `.github/lighthouserc.json`, `deploy-web.yml`.
- **Steps:** code-split the heavy analysis panels (`ConfidenceDashboard`,
  `UniquenessAnalysis`, `PrivacyLeakageAssessment`, `BrowserComparison`,
  `FingerprintHistory`, `FingerprintComparison`, `ExportReport`) with
  `next/dynamic` (`ssr:false`, skeletons already exist → reserve space, no CLS);
  defer fingerprint collection until after first paint (idle); `preconnect`/
  `dns-prefetch` to `api.creepjs.org`; lazy-load below-the-fold; verify OG/image
  weights. Set Lighthouse CI budgets and make them **blocking** in `deploy-web.yml`.
- **Acceptance (browser-gated, on the PR preview):** Lighthouse mobile Perf ≥ 90,
  A11y ≥ 95, SEO = 100 on home, checker, a guide, a pSEO page; LCP < 2.5 s, INP <
  200 ms, CLS < 0.1; route JS for `/checker` measurably reduced (report before/after
  transferred KB). Budgets fail the PR when exceeded.

### G1 — Product analytics live — `S`

- **Why/ROI:** can't optimize the funnel you can't see. Enables every later decision.
- **Files:** `apps/web/src/components/Analytics.tsx`, `lib/analytics.ts`, `.env.example`.
- **Steps:** wire cookieless analytics (Cloudflare Web Analytics token already
  scaffolded, or Plausible) — **no PII, no fingerprint payloads.** Emit events for:
  tool run (checker/ip), token request, docs section views, SDK copy, CTA clicks.
  Gate behind consent only where legally required; document exactly what's collected
  on the privacy page.
- **Acceptance:** events visible in the analytics dashboard from the preview;
  privacy page lists every event; zero PII in payloads (reviewed).

### F4a — First 3 cornerstone guides — `M` (start anytime after M0)

- **Why/ROI:** cornerstone content compounds slowest → start earliest. Targets
  highest-intent informational keywords that feed the tools.
- **Files:** `apps/web/src/app/guide/<slug>/page.tsx` (follow the existing
  `what-is-browser-fingerprinting` page pattern), `lib/seo-routes.ts` (register),
  `docs/CONTENT_TEMPLATE.md` (follow it).
- **Topics (first 3, by intent):** "canvas fingerprinting explained",
  "how to reduce / prevent browser fingerprinting", "browser fingerprinting vs
  cookies". Each: ≥1000 unique words, TOC, Article+FAQ JSON-LD, breadcrumb,
  internal links to the matching `/fingerprint/[type]` tool + `/checker`, one CTA.
- **Acceptance:** 3 guides build into the static export, appear in sitemap, pass
  Rich Results (Article+FAQ), AA contrast; each links to ≥3 internal tool pages.

**M1 DoD:** Rich Results pass per template; sitemap submitted & ≥1 page indexed;
CWV budgets enforced & green; analytics firing; 3 cornerstone guides live.

---

## 7. MILESTONE M2 — Core Product Value

### E1 — Design system pass + theme decision — `M`

- **Why/ROI:** unblocks E2/E3 polish and fixes the no-op theme toggle (bug #6).
- **Files:** `apps/web/src/app/layout.tsx`, `globals.css`, `tailwind.config.ts`,
  `components/ThemeProvider.tsx`, `components/ThemeToggle.tsx`, `components/ui/*`,
  new `docs/DESIGN.md`.
- **Steps:**
  1. **Theme decision (record it):** either (a) **commit to dark-only as the brand**
     — then remove `ThemeProvider`/`ThemeToggle` (dead UI) and keep `<html
className="dark">`; or (b) **make the toggle real** — drop the hardcoded class,
     drive `dark` from `ThemeProvider` with no-flash inline script, persist choice.
     Pick one; do not ship a toggle that does nothing.
  2. Consolidate color/space/type tokens in `globals.css` + `tailwind.config`.
  3. Fill `components/ui/` with the primitives E2–E4 need (`badge`, `tooltip`,
     `dialog`, `input`, `alert`, `accordion`) using Radix + CVA in the existing
     `button/card/tabs` style. No hand-rolled a11y.
  4. `docs/DESIGN.md`: token table + one example per primitive, light/dark, do/don't.
- **Acceptance:** chosen theme behavior verified in a browser (toggle works **or**
  is removed); all primitives render AA-contrast in the shipped theme(s); no inline
  styles; each `ui/*` component < 120 lines.

### B4 — Uniqueness baseline service (anonymized) — `L` — **the differentiator**

- **Why/ROI:** today "uniqueness %" is a guess. A real, privacy-safe rarity baseline
  is the core value vs every other fingerprint demo. Highest product ROI in M2.
- **Files:** `apps/api/src/routes/stats.ts` (new), `apps/api/src/index.ts`,
  `apps/api/wrangler.toml` (new KV `FP_STATS`), `apps/api/tests/stats.test.ts`,
  `docs/ARCHITECTURE.md`, `docs/SECURITY.md`.
- **Steps:**
  1. On `POST /v1/fingerprint`, increment **anonymized bucket counters** per signal
     (e.g. count of distinct canvas-hash prefixes / webgl-renderer buckets). **Never**
     store the raw value or full fingerprint.
  2. `GET /v1/stats/uniqueness?components=...` returns rarity estimates the client
     blends into its confidence/uniqueness score.
  3. Enforce **k-anonymity**: suppress any bucket with count < k (e.g. k=20).
  4. Bound KV write amplification (sample/batch writes; document the sampling rate).
- **Acceptance:** counters update; endpoint returns estimates; buckets below k are
  suppressed; a load note shows write amplification is bounded; privacy model
  documented in both docs. Tests cover increment + suppression + estimate.
- **Guardrails (most drift-prone task):** **ship coarse bucket counts first**; HLL/
  sketch is a follow-up, not a blocker. Nothing stored may re-identify a device. If
  unsure, stop and leave a note rather than over-build.

### C1 — Collector reliability, real progress & coverage API — `M`

- **Why/ROI:** the checker/home fake the progress bar with a hardcoded collector
  list; wiring real per-source events + coverage makes the hero tool honest and
  enables B4 blending. Also de-risks low-end devices.
- **Files:** `packages/core/src/index.ts`, `sources/registry.ts`, `utils/async.ts`,
  `collectors/*`, `packages/core/tests/*`.
- **Steps:**
  1. Expose a real progress callback emitting per-source `start/finish` events from
     `sources/registry.ts` (replace the hardcoded list the UI iterates).
  2. Each collector returns `{ value, durationMs, status: 'ok'|'failed'|'skipped' }`;
     aggregate into `coverage { ratio, successful, failed, skipped }`.
  3. Wrap every collector in timeout + try/catch so one failure never aborts the run;
     keep adaptive concurrency + idle yielding.
- **Acceptance:** unit tests per collector (mock browser APIs); `coverage` accurate;
  a thrown collector degrades gracefully; no collector exceeds its timeout budget.
- **Guardrails:** **do not change hashing/normalization** (Invariant #6).

### D1 — SDK slim build (≤15 KB gzipped) + size gate + tests — `M`

- **Why/ROI:** 24 KB → adoption friction; the budget is a stated contract. Fixing it
  - a CI gate prevents regression forever.
- **Files:** `packages/sdk/src/index.ts`, `rollup.config.js`, `package.json`,
  `packages/sdk/tests/*`, `.github/workflows/ci.yml` (size step from A3),
  `apps/web/public/sdk.js` (copy step).
- **Steps:**
  1. Stop bundling all 61 collectors into the default entry. Options (pick, record):
     **(a)** ship a **core-signal default** (canvas, webgl, navigator, screen,
     audio, fonts, timezone — the high-entropy set) and lazy/dynamic-import the long
     tail; **(b)** make collectors tree-shakeable and document opt-in imports;
     **(c)** keep full set but as a separate `creepjs.full.js` while the default is slim.
  2. Add typed errors + a `timeout` option; verify `getFingerprint({token, endpoint,
cache, cacheTtl})` matches `docs/SDK.md`.
  3. Add `getIpIntelligence(ip)` thin wrapper for `GET /v1/ip/:ip`.
  4. CI: assert default UMD+ESM gzipped ≤ 15 KB (fail otherwise); copy built UMD to
     `apps/web/public/sdk.js` in the pipeline.
  5. Real SDK tests: mock `fetch`, assert request shape, cache hit/expiry, error paths.
- **Acceptance:** `gzip -c packages/sdk/dist/creepjs.umd.js | wc -c` ≤ 15360; CI size
  step blocks regressions; an example HTML page loads the UMD and returns a
  fingerprint; SDK README snippet works verbatim; tests cover cache+errors.
- **Guardrails:** no Node-only deps in the browser bundle; tree-shakeable ESM.

### E3 — `/checker` polish + refactor — `L`

- **Why/ROI:** the hero tool. Real data + a maintainable structure + CWV (from J1).
- **Files:** `apps/web/src/app/checker/page.tsx` (2517 lines → split), the many
  fingerprint components.
- **Steps:**
  1. Replace **fake progress** with real progress from C1.
  2. Group signals (Graphics / Hardware / Browser / Network) via
     `FingerprintCollectorCard`; show per-signal rarity from B4 when available.
  3. Wire `ConfidenceDashboard`, `UniquenessAnalysis`, `PrivacyLeakageAssessment`,
     `BrowserComparison`, `FingerprintHistory`, `ExportReport` to **real** data;
     remove any mock values.
  4. Add copy-to-clipboard, re-run, and "explain this signal" tooltips (C2).
  5. Extract the page into composable sections/hooks so no file > ~300 lines.
- **Acceptance (browser-gated):** LCP < 2.5 s on mid-tier mobile; no hydration
  errors; all panels show real values; export produces a valid JSON/PDF report;
  fully keyboard-navigable; the page file is decomposed (< 300 lines each).
- **Guardrails:** all browser-API code stays in `"use client"`; yield to avoid
  blocking the main thread during collection.

### E2 — Homepage conversion polish — `M`

- **Depends on:** B6 (self-IP fixed), E1. **Files:** `app/page.tsx`,
  `HomePageClient.tsx` (1539 lines → trim/split), `components/*`.
- **Steps:** crisp hero (what/why/CTA), one-click live "your fingerprint" demo with
  reserved space (no CLS), trust/transparency section, "get an API token" + "check
  an IP" CTAs, fixed live IP block (B6). Reuse the slim default collection so the
  home route stays light.
- **Acceptance (browser-gated):** Lighthouse mobile Perf ≥ 90 / A11y ≥ 95 / SEO 100;
  CTA above the fold; no CLS from the live demo; self-IP block renders.

**M2 DoD:** uniqueness backed by anonymized baseline & shown in UI; SDK ≤15 KB with
CI gate; checker/home on real data with CWV budgets; theme behavior consistent.

---

## 8. MILESTONE M3 — Content & SEO Scale (∥ with M2 once M0 done)

### F2 — Harden pSEO templates (`/fingerprint/[type]`) — `L`

- **Why/ROI:** 60 signal pages already exist and are deep — the cheapest way to scale
  long-tail traffic is to make them excellent, not to add more thin ones.
- **Files:** `app/fingerprint/[type]/page.tsx`, `FingerprintPlayground.tsx`,
  `lib/seo-routes.ts`, the `content/fingerprints/*.md` source.
- **Steps:** ensure each page has a **unique** intro + a working **live mini-demo**
  (client) + "how unique is this signal" (blend B4 when available) + internal links
  to related signals, the hub, `/checker`, and the matching guide; dedupe any
  boilerplate across pages; verify unique title/description/H1/JSON-LD per page.
- **Acceptance:** every signal page builds statically with unique metadata + live
  demo; no near-duplicate bodies (spot-check 5); each ≥ ~400 unique words; all in
  sitemap; Rich Results pass on a sample. **No doorway pages.**

### F3 — IP-intelligence SEO (high-volume head terms) — `M`

- **Why/ROI:** "what is my ip", "ip checker", "is this ip a proxy/vpn" are huge,
  high-intent queries the working `/ip` tool + `/v1/ip/public` can own.
- **Files:** `app/ip/page.tsx` (head-term tool, exists ✅), a few hand-written
  landers under `app/ip-lookup/<slug>/page.tsx` or `app/guide/...`, `lib/seo-routes.ts`.
- **Steps:** optimize `/ip` for "ip address checker / ip risk lookup" (title, H1,
  FAQ JSON-LD, intro copy); add **2–4 hand-written** landers for top queries (e.g.
  "what is my ip address", "how to tell if an ip is a proxy"), each linking to the
  tool. **Do not** auto-generate per-IP pages (thin content + IPbot cost blowout).
- **Acceptance:** `/ip` targets the head term with proper metadata+FAQ; 2–4 quality
  landers indexed; sitemap has **no** per-IP bloat; public IP endpoint stays
  rate-limited (verify `GET /v1/ip/public/...` 429 path).

### F4b — Remaining cornerstone guides (to 6–8 total) — `M`

- Continue F4a pattern: "bot detection basics", "fingerprinting & privacy law
  (GDPR/CCPA)", "device intelligence for fraud prevention", "anti-fingerprint
  browsers compared". Same acceptance as F4a.

### E6 — Docs IA + search + endpoint parity — `M`

- **Files:** `app/docs/*`, `docs/API.md`.
- **Steps:** restructure docs (Quickstart, SDK, API reference, Privacy, Self-host);
  render long content from `react-markdown` (already a dep); add client-side search;
  ensure **every** §API endpoint is documented and matches reality (reflect B3/B4/B6).
- **Acceptance:** docs ↔ implemented endpoints 1:1 (no phantom endpoints);
  quickstart reaches a working call in < 3 min (PRD metric); internal links valid.

### E4 — Playground UX — `M`

- **Files:** `app/playground/page.tsx`.
- **Steps:** token-gated request builder for `POST /v1/fingerprint`, `GET /v1/ip/:ip`,
  and the no-token `GET /v1/ip/public/:ip`; show request/response, latency,
  rate-limit headers; curl/JS/Python snippets generated from the live config; use
  `ApiResponseSkeleton`. Remove the `GET /v1/fingerprint/:id` reference unless B3(a) shipped.
- **Acceptance:** a user can run each endpoint and see real responses + headers;
  snippets are copy-paste correct with the real base URL.

**M3 DoD:** pSEO hardened & deduped; IP head-term + landers live (no per-IP bloat);
6–8 guides; docs match endpoints 1:1; playground covers all live endpoints.

---

## 9. MILESTONE M4 — Quality / Security / Observability

- **I1 — Unit/integration coverage `M`:** core collectors (mock browser APIs), API
  routes (auth, rate limit, success/error, IPbot, ip, **myip**, stats, fingerprint
  GET), SDK. **Target ≥ 70% on core + api.** Acceptance: coverage report meets target.
- **I2 — E2E (Playwright) `M`:** smoke flows against the **deployed preview** (env
  rule): home + live demo, run checker, get token in playground, IP checker happy
  path. Acceptance: E2E green in CI on a preview URL; trace/video on failure.
- **I3 — Lighthouse regression `S`:** CI budgets for home/checker/guide/pSEO enforced
  (extends J1). Acceptance: regressions fail the PR.
- **H1 — Security pass `M`:** Zod on every route; CORS locked to known origins in prod
  (currently `*`); no secret logging; `pnpm audit` clean (no unresolved high/critical);
  set security headers via Pages (`_headers`): CSP, HSTS, X-Content-Type-Options,
  Referrer-Policy, Permissions-Policy. Acceptance: `curl -I` shows headers; OWASP
  checklist in `docs/SECURITY.md` green.
- **H2 — Privacy/legal completeness `S`:** privacy page reflects exactly what
  B3/B4/G1 store; add `app/terms/page.tsx`, responsible-use note, GDPR/CCPA basics;
  add root `LICENSE` (MIT) + `CONTRIBUTING.md`. Acceptance: a reviewer can trace each
  stored data item to code.
- **G2 — API observability `S`:** structured JSON logs (request id, route, status,
  latency); wire Workers Analytics Engine or logpush; log IPbot remaining quota +
  cache hit-rate; `wrangler tail` runbook. Acceptance: can answer "p95 latency of
  /v1/fingerprint last hour" and "IPbot quota remaining" from logs/metrics.
- **J2 — API perf `S`:** verify KV read/write patterns; cache headers on cacheable
  GETs. Acceptance: p95 `/v1/fingerprint` < 100 ms (via G2); IPbot cache hit-rate reported.

**M4 DoD:** ≥70% core+api coverage; Playwright green on preview; headers+audit clean;
privacy matches code; metrics answer the two ops questions above.

---

## 10. MILESTONE M5 — Monetization (optional; only after traffic/PMF signal)

- **K1 — Plans & quotas `M`:** tiered tokens (free/pro) enforced in
  `middleware/ratelimit.ts` + KV; document limits. Depends on B0✅.
- **K2 — Token dashboard `M`:** client-only page to view usage/limits for a token.
- **K3 — Billing (Stripe) `L`:** Stripe Checkout via a **server-side** Worker route;
  **never** put the Stripe secret in the browser. Out of scope until demand exists.

---

## 11. Risk register (how each known failure mode is contained)

1. **Static-export trap** — Codex adds a Server Component/Route Handler needing a
   runtime; build silently degrades. _Mitigation:_ Invariant #1 + the web `build`
   gate stays required (A3).
2. **Privacy overreach (B3/B4)** — storing re-identifiable data. _Mitigation:_
   Invariant #2 + k-anonymity (B4) + H2 policy-matches-code review.
3. **IPbot cost blowout** — `/v1/ip` unmetered or per-IP pages generated.
   _Mitigation:_ auth+rate-limit (live ✅) + F3 forbids per-IP bloat + G2 logs quota.
4. **Hashing change** breaks every existing fingerprint ID. _Mitigation:_ Invariant
   #6 — version, never silently change normalization (C1 guardrail).
5. **Uniqueness scope creep (B4)** — _Mitigation:_ coarse bucket counts first; HLL later.
6. **SDK budget regression** — _Mitigation:_ CI size gate (D1) is blocking.
7. **Two-sources-of-truth drift** — this doc is SoT; EXECUTION_PLAN is spec-reference
   only. Keep the §12 tracker current.
8. **Secret re-leak** — _Mitigation:_ S0 blocking secret-scan in CI/pre-commit.

---

## 12. Task tracker (Codex updates Status + adds a one-line note when done)

| ID  | Milestone | Title                                     | Effort | Depends     | Status                                                                                                                                                                                                                         |
| --- | --------- | ----------------------------------------- | ------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| S0  | M0        | Rotate leaked CF token + secret-scan gate | S      | —           | doing (runbook + CI gate landed; operator rotation still pending)                                                                                                                                                              |
| B6  | M0        | Fix `/my-ip` 500                          | S      | —           | done                                                                                                                                                                                                                           |
| B3  | M0        | Resolve `GET /v1/fingerprint/:id`         | M      | —           | done                                                                                                                                                                                                                           |
| A3  | M0        | CI gate hardening                         | S      | —           | done                                                                                                                                                                                                                           |
| A4  | M0        | Previews + secret runbook                 | S      | A3          | done                                                                                                                                                                                                                           |
| F1  | M1        | Technical SEO audit                       | S      | —           | doing (repo-side audit and schema fixes landed; Rich Results/browser evidence still pending)                                                                                                                                   |
| F6  | M1        | Search Console + indexing runbook         | S      | F1          | doing (runbook landed; operator submission/indexed-page evidence still pending)                                                                                                                                                |
| J1  | M1        | CWV on heavy pages + budgets              | M      | —           | doing (checker panels are code-split and Lighthouse scope tightened; preview/browser budget evidence still pending)                                                                                                            |
| G1  | M1        | Product analytics live                    | S      | —           | doing (privacy-safe event wiring landed; preview/dashboard verification still pending)                                                                                                                                         |
| F4a | M1        | First 3 cornerstone guides                | M      | F1          | todo                                                                                                                                                                                                                           |
| E1  | M2        | Design system + theme decision            | M      | —           | doing (real persisted theme toggle + design tokens doc landed; browser verification and extra primitives still pending)                                                                                                        |
| B4  | M2        | Uniqueness baseline (anon)                | L      | B3          | doing (coarse aggregate bucket counts, k-anon suppression, checker + homepage baseline display, checker score/dashboard blending, and selected collector-card rarity hints landed; deeper full-surface blending still pending) |
| C1  | M2        | Collector reliability/real progress       | M      | —           | doing (real collector progress events landed in core and now drive checker/home progress UI)                                                                                                                                   |
| D1  | M2        | SDK slim build + size gate                | M      | —           | doing (default SDK bundle is under budget with thin/full split; CI gate, exports, docs, and UMD example landed; browser example verification still pending)                                                                    |
| E3  | M2        | /checker polish + refactor                | L      | E1,C1,B4,J1 | todo                                                                                                                                                                                                                           |
| E2  | M2        | Homepage polish                           | M      | E1,B6       | todo                                                                                                                                                                                                                           |
| F2  | M3        | Harden pSEO templates                     | L      | C1,F1       | todo                                                                                                                                                                                                                           |
| F3  | M3        | IP-intelligence SEO                       | M      | F1          | todo                                                                                                                                                                                                                           |
| F4b | M3        | Guides to 6–8 total                       | M      | F4a         | todo                                                                                                                                                                                                                           |
| E6  | M3        | Docs IA + search + parity                 | M      | B3          | todo                                                                                                                                                                                                                           |
| E4  | M3        | Playground UX                             | M      | E1          | todo                                                                                                                                                                                                                           |
| I1  | M4        | Unit/integration ≥70%                     | M      | B4,C1,B6    | doing (high-value core manifest, uniqueness service, request logging, stats, my-ip, and CORS paths now have direct tests; overall coverage target still pending)                                                               |
| I2  | M4        | Playwright E2E on preview                 | M      | E2,E3,E4    | todo                                                                                                                                                                                                                           |
| I3  | M4        | Lighthouse regression                     | S      | J1          | todo                                                                                                                                                                                                                           |
| H1  | M4        | Security pass + headers                   | M      | —           | doing (Pages security headers, safer prod CORS fallback, and no-secret structured logging landed; deploy-time header verification and audit cleanup still pending)                                                             |
| H2  | M4        | Privacy/legal + LICENSE                   | S      | B3,B4,G1    | doing (LICENSE, CONTRIBUTING, Terms page, privacy/terms cross-links, and data traceability matrix landed; final reviewer pass and legal copy polish still pending)                                                             |
| G2  | M4        | API observability                         | S      | —           | doing (structured request logs, request IDs, route-level cache/quota signals, and wrangler-tail runbook landed; long-term sink/dashboard still pending)                                                                        |
| J2  | M4        | API perf verification                     | S      | G2          | todo                                                                                                                                                                                                                           |
| K1  | M5        | Plans & quotas                            | M      | —           | todo                                                                                                                                                                                                                           |
| K2  | M5        | Token dashboard                           | M      | K1          | todo                                                                                                                                                                                                                           |
| K3  | M5        | Billing (Stripe)                          | L      | K1          | todo                                                                                                                                                                                                                           |

---

## 13. Go-live / launch checklist (the gate before any public push)

- [ ] S0 token rotated (operator-confirmed) + secret-scan blocking in CI
- [ ] `/my-ip` 200 in prod; homepage & `/ip` self-IP block render (browser-checked)
- [ ] No phantom endpoints — docs/playground match the live API 1:1
- [ ] Rich Results pass per template; sitemap submitted; ≥1 page indexed
- [ ] CWV budgets green on home/checker/guide/pSEO (Lighthouse CI)
- [ ] Analytics firing; privacy page matches what's collected/stored
- [ ] SDK ≤ 15 KB gzipped with CI gate; example HTML returns a fingerprint
- [ ] Uniqueness shows real (anonymized) rarity, not a guess
- [ ] Security headers present (`curl -I`); `pnpm audit` clean; CORS locked in prod
- [ ] Playwright smoke green on the preview
- [ ] LICENSE + CONTRIBUTING + Terms present

> Maintenance: when a task is done, set Status and add a one-line note below it.
> Keep this file as the execution contract; `docs/ROADMAP.md` stays the short
> public version; `docs/EXECUTION_PLAN.md` stays the detailed task-spec reference.

2026-06-15:

- `S0` Added `docs/SECRETS.md`, `docs/SECURITY.md` rotation guidance, and a blocking CI secret scan; operator still must rotate the exposed Cloudflare token manually.
- `B6` `/my-ip` now reuses IPbot, returns a stable fallback shape on local/upstream failure, and is covered by `apps/api/tests/myip.test.ts`.
- `B3` Retired the phantom `GET /v1/fingerprint/:id` references from the public docs and playground so the product surface matches the live API.
- `A3` CI now blocks on secret scan, ESLint, and `format:check` instead of soft-failing hygiene checks.
- `A4` Added a repo-local secrets inventory/runbook in `docs/SECRETS.md` and linked deployment/security docs to the same source of truth.
- `B4` Added a coarse uniqueness baseline service at `/v1/stats/uniqueness` backed by aggregate KV bucket counts only, with k-anonymity suppression and bounded write amplification (one total counter + up to five component buckets per fingerprint). The checker and homepage now fetch and display the anonymous population baseline for high-value signals, the checker uniqueness score/ranking and coverage dashboard now blend in the server-side rarity baseline when available, and selected checker collector cards now show per-signal rarity hints for baseline-backed components. The homepage also derives a clearer rarity conclusion from the same baseline. API tests cover increment, suppression, and estimate return paths.
- `F1` Added `docs/TECHNICAL_SEO_AUDIT.md`, upgraded tool templates to `WebApplication` schema where appropriate, added missing privacy/article structured data, and fixed the deployment OG-image verification path; remaining evidence is Rich Results and deployed HTML validation.
- `G1` Added privacy-safe product analytics wiring for checker, IP lookups, playground token/API flows, docs section views, and major CTAs; privacy disclosure now lists the exact event classes and data limits.
- `E1` Removed the hardcoded dark root class, added a persisted no-flash theme bootstrap, documented the current token/theme baseline in `docs/DESIGN.md`, and introduced shared `badge` / `input` / `alert` primitives on the IP, playground, and fingerprint index pages; remaining E1 scope is browser verification plus additional shared primitives.
- `D1` Split the SDK into a slim default loader bundle plus a full collector bundle, added typed SDK errors, `timeoutMs`, `getIpIntelligence(ip)`, a CI size gate, `./full` package export, staged `sdk.js/sdk.full.js` in CI/deploy workflows, refreshed SDK/API/README snippets, and added a UMD example page. Current gzip evidence: `creepjs.umd.js` 2788 bytes, `creepjs.esm.js` 2561 bytes; full bundles remain separate for opt-in loading.
- `F6` Added `docs/SEO_OPERATIONS.md` covering Search Console, Bing Webmaster Tools, sitemap submission, the 8 head pages for indexing requests, weekly exports, monthly review checks, and an IndexNow notification template; remaining evidence is operator-side submission and indexed-page confirmation.
- `J1` Code-split the heaviest `/checker` analysis panels with client-only dynamic imports, deferred homepage/checker fingerprint collection until post-paint idle time, added `preconnect`/`dns-prefetch` for `api.creepjs.org`, and expanded Lighthouse preview coverage to the guide and a fingerprint detail page. Current build evidence: `/checker` route JS dropped from 27.2 kB to 13.7 kB.
- `C1` Added collector `start/finish` progress events to the core source runner, exported a shared collector manifest for label/category/order metadata plus tab definitions, and wired homepage/checker progress UIs and checker tab headers to the real collector lifecycle instead of hardcoded name lists. The `graphics`, `system`, `media`, `network`, `security`, and `accessibility` tabs now derive collector membership from the shared manifest rather than hand-maintained JSX sequences. Core tests now cover progress emission; current build evidence shows `/checker` at 14.6 kB route JS after the expanded manifest-driven tab integration.
- `H2` Added root `LICENSE` and `CONTRIBUTING.md`, shipped `app/terms/page.tsx`, linked privacy/terms/docs hub references, and added a data traceability matrix to `docs/SECURITY.md` so reviewers can map stored/transmitted items back to code. The web build now exports `/terms`; remaining work is final reviewer/legal copy polish against the latest data flows.
- `H1` Added static security headers via `apps/web/public/_headers`, tightened API production CORS fallback to `https://creepjs.org` when `CORS_ORIGIN` is unset, and aligned `docs/SECURITY.md` with the current headers/request-id logging behavior. API tests now verify the production CORS fallback and request-id header behavior; remaining work is deployed header verification and final audit cleanup.
- `G2` Added global structured API request logs with `X-Request-Id`, method/path/status/latency fields, route-level fingerprint and IP lookup observability events, and `docs/API_OBSERVABILITY.md` with a `wrangler tail` runbook. Current API tests show the new request-id header and emit usable logs for `/v1/fingerprint` latency and IPbot quota remaining.
- `I1` Added focused tests for the shared core collector manifest, the top-level `collectFingerprint()` aggregator, and the new API observability/security paths: request-id header emission, fingerprint request logging, public-IP `retry_after` logging, the error middleware path, and the direct uniqueness service helper. Current passing counts: core 6 files / 30 tests, api 10 files / 36 tests.

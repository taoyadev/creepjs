## 1. Governance

- [x] 1.1 Review and approve this scope (approved in the operator's locked D2,
  D3, and D6 decisions plus Phase 2 E3 plan).
- [x] 1.2 Run
  `openspec validate refactor-checker-single-page-experience --strict`.

## 2. Mechanical Decomposition

- [x] 2.1 Pure-move the six category collector renderers into
  `components/checker/cards/`.
- [x] 2.2 Extract scan state into `useFingerprintScan` and compose it through
  the checker runtime with an in-slot `ScanProgress`.

## 3. Static Single-Page Shell

- [x] 3.1 Convert `app/checker/page.tsx` to a server component with exactly one
  H1, substantial explanatory content, taxonomy, privacy promise, and visible
  FAQ.
- [x] 3.2 Keep the client application mounted inside the task region without a
  full-viewport loading swap.

## 4. Navigation and Share Context

- [x] 4.1 Add sticky anchor navigation and progressive scroll-spy state.
- [x] 4.2 Add tested `?tab=` state and honest `?fp=&cov=&b=` snapshot context.

## 5. Polish and Honesty

- [x] 5.1 Add manifest-derived tooltips, restrained reveal/indicator motion, and
  live scan announcements.
- [x] 5.2 Render `baseline warming up (N/20)` while production samples are below
  the k-anonymity threshold and never show a fabricated rarity percentage.

## 6. Validation

- [x] 6.1 Pass ordered web build, lint, typecheck, and tests on OpenClaw.
- [x] 6.2 Assert exported checker HTML contains one H1 and required static
  anchors/content.
- [ ] 6.3 Complete desktop/mobile, light/dark, keyboard, URL-state, failure,
  sticky-nav, and reduced-motion QA on a Cloudflare Pages preview.

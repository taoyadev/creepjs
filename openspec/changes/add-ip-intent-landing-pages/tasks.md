## 1. Governance and Research

- [x] 1.1 Review and approve this proposal, design, and delta specification.
- [x] 1.2 Run `openspec validate add-ip-intent-landing-pages --strict` in an
  environment with the OpenSpec CLI.
- [x] 1.3 Create a dated research/content-delta brief using primary sources and
  identify which statements require visible provenance or limitations.

## 2. Task-First Pilot

- [ ] 2.1 Extract a small typed public-IP lookup boundary reusable by `/ip` and
  the pilot without moving unrelated page state.
- [ ] 2.2 Build an accessible compact lookup that covers loading, success,
  validation, rate-limit, and network-error states without tracking raw IPs.
- [ ] 2.3 Build the static proxy-detection pilot with unique decision guidance,
  source links, limitations, and a clear route to the full `/ip` report.

## 3. Search Integration

- [ ] 3.1 Add unique metadata, canonical, breadcrumb data, and internal links
  that match visible content.
- [ ] 3.2 Add optional per-route `lastModified` support, register the pilot, and
  verify exact sitemap inclusion without updating unrelated route dates.
- [ ] 3.3 Add route/metadata/sitemap tests and a private editorial QA note.

## 4. Validation and Rollout

- [ ] 4.1 Run web tests, typecheck, lint, and production build on OpenClaw.
- [ ] 4.2 Verify rendered HTML plus desktop/mobile, light/dark, keyboard,
  success, validation, rate-limit, and network-error flows in a managed preview.
- [ ] 4.3 Deploy after the batch/API dependency and web quality gates pass, then
  capture availability, indexing eligibility, and task-completion baselines.
- [ ] 4.4 Keep additional IP-intent pages out of scope until a separately
  approved change records demand and a distinct user task/value increment.

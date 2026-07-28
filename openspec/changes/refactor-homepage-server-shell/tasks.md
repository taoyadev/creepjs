## 1. Governance

- [x] 1.1 Review and approve this scope (approved by the operator's locked E2
  Phase 3 plan and D2/D3 boundaries).
- [x] 1.2 Run
  `openspec validate refactor-homepage-server-shell --strict`.

## 2. Static Shell

- [x] 2.1 Add a server-rendered hero, correct primary/secondary routes, answer
  block, value sections, audience block, and 350–600 words of static content.
- [x] 2.2 Add a server-rendered signal grid derived from
  `FINGERPRINT_TECHNIQUES`.

## 3. Client Islands

- [x] 3.1 Extract a fixed-height `LiveFingerprintTeaser` with in-card progress
  and error states.
- [x] 3.2 Extract a fixed-height `LiveIpCard` using the existing `/my-ip`
  contract and graceful risk-optional degradation.
- [x] 3.3 Delete `HomePageClient.tsx` after required behavior is represented by
  the server shell or one of the two islands.

## 4. Validation

- [x] 4.1 Pass ordered web build, lint, typecheck, and tests on OpenClaw.
- [x] 4.2 Assert exported homepage HTML contains exactly one H1, the answer
  anchor, both live routes, and substantial static content.
- [ ] 4.3 Complete mobile/desktop, light/dark, keyboard, failure, and
  reduced-motion QA on a Cloudflare Pages preview.

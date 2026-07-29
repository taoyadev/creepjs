## 1. Governance and Source Review

- [x] 1.1 Review and approve this proposal, design, and delta specification.
- [x] 1.2 Validate `add-geo-ai-search-surface` with OpenSpec strict mode.
- [x] 1.3 Verify current crawler tokens and purpose boundaries against official
      OpenAI, Anthropic, Perplexity, and Google documentation (2026-07-28).
- [x] 1.4 Record that Google Search does not use `llms.txt` as a ranking or
      generative-search requirement.

## 2. Content Honesty Gate

- [x] 2.1 Add a deterministic fingerprint Markdown quality validator.
- [x] 2.2 Remove unsupported first-hand claims, exact performance/adoption
      statistics, market forecasts, match-rate claims, and fabricated citations
      from all 55 signal mirrors.
- [x] 2.3 Add tests proving all expected signal files exist, pass the quality
      gate, and stay aligned with the canonical manifest.

## 3. Crawler and Machine Navigation

- [x] 3.1 Add explicit reviewed crawler groups without broadening restricted
      paths.
- [x] 3.2 Expand `llms.txt` to all vetted tools and 55 signal pages, grouped by
      category, with HTML/Markdown links and an interoperability disclaimer.
- [x] 3.3 Add static `llms-full.txt` using deterministic build-time filesystem
      reads and fail-closed content validation.

## 4. Answer and Entity Surface

- [x] 4.1 Verify or add the four concise answer anchors in rendered HTML.
- [x] 4.2 Add visible product/entity disambiguation and standardize visible and
      exported `CreepJS` branding.
- [x] 4.3 Keep product `sameAs` references consistent and product-owned.
- [x] 4.4 Add tests proving no new FAQPage, HowTo, or Dataset schema is emitted.

## 5. Validation and Rollout

- [x] 5.1 Run repository typecheck, lint, tests, web build, and OpenSpec strict
      validation on OpenClaw.
- [x] 5.2 Assert static robots, llms, llms-full, answer anchors, signal counts,
      canonical links, and forbidden-schema absence in `out/`.
- [x] 5.3 Verify desktop/mobile/browser-agent behavior and deployed file
      availability in a managed Pages preview.
- [ ] 5.4 Deploy, observe crawler traffic without raw-query logging, and record
      monthly GEO/Search Console evidence without ranking or citation claims.

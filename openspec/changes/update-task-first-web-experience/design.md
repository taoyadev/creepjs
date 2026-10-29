## Context

The 65 public page URLs use ten fixed pages and one template for 55 signal
pages. Existing collectors, API routes, history normalization, shared clipboard
feedback, theme tokens, and the OpenClaw validation lane already provide the
required foundations. The work improves those flows without adding a service,
application dependency, or public route.

## Decisions

- Put task controls and qualified results before supporting prose. Keep static
  headings, method/limit explanations, and discovery links server-rendered.
- Use the existing signal registry and collectors. Replace simulated stages
  with actual module/collection state and bounded waiting. Comparisons contain
  JSON observations in tab memory, with image payloads omitted.
- Keep false, zero, an empty list, unsupported APIs, and missing provider data
  distinct. Derive IP presentation in a small tested result interpreter.
- Give delayed work explicit ownership through AbortController or run IDs.
  Preserve user edits, ignore cancelled results, retain the last checker scan
  during refresh, and never automatically replay a POST.
- Keep optional population requests outside the automatic scan. Disclose their
  subset at the requesting action. Keep the existing automatic checker/STUN
  behavior disclosed and require an action on individual network-sensitive
  signal pages.
- Reuse the shared HTTP and clipboard boundaries. Mask playground tokens and
  keep them in memory; code examples include them only by choice.
- Retain actual coverage, timings, consistency/network evidence, local scan
  comparison, and exports. Remove the extra uncalibrated privacy grades and
  generic browser recommendation panel from the checker flow.
- Use native search, select, details, links, labels, and live status. Secondary
  text must retain AA contrast on tinted surfaces; overflowing data regions
  must be named and keyboard-focusable.

## Migration and validation

Public paths, API contracts, fingerprint ID projection, and saved-history IDs
remain compatible. Existing data needs no migration. The validation contract
is recorded in docs/UX_ACCEPTANCE.md, including isolated browser/API fixtures,
static/first-render checks, per-state recovery, and accessibility evidence.

Production publication remains a separate operation. Browser fixtures establish
UI behavior, not the accuracy of external IP intelligence or real-device field
performance.

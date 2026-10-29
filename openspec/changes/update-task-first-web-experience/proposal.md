## Why

The operator's 2026-10-29 implementation request covers all 65 existing pages
and explicitly requires task-first interaction, meaningful scenarios, deep
results, complete state handling, accessibility, privacy, and recovery. The
existing UI pushes tools below introductory content, simulates signal progress,
and can interpret missing IP risk data as low risk.

## What Changes

- Put the current tools and qualified output in the first task region.
- Replace duplicated marketing/FAQ content with controls, focused method and
  limit explanations, and next actions.
- Add signal search and same-tab setting comparison using the existing registry
  and collectors; revise all 55 reviewed signal documents against their code.
- Make IP input ownership, cancellation, missing fields, and error recovery
  explicit; keep zero, false, and unknown distinct.
- Bound playground HTTP requests, retain inputs on failure, mask memory-only
  tokens, and state the actual token issuance behavior.
- Require an explicit action for population comparison and individual
  network-sensitive signal checks.
- Preserve the API contracts, public paths, existing history format, theme,
  and static export. No data or public URL migration is required.

## Impact

- Affected capabilities: web experience foundation, fingerprint signal pages,
  API playground, public IP tool, and developer documentation.
- Affected code: apps/web, the existing reviewed public signal documents, and
  a bounded OpenClaw browser acceptance harness.
- Scope authority: the operator's current seven-part implementation request.
- Validation and per-page mapping: docs/UX_ACCEPTANCE.md.
- Publication remains a separate operation.

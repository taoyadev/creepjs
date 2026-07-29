## Why

The fingerprint signal pages still hydrate reviewed educational Markdown through
a large client component, and the API playground still hydrates its entire page.
Phase 8 needs smaller, auditable server/client boundaries without reopening the
approved fingerprint content or changing the existing interactive contracts.

## What Changes

- Render each vetted fingerprint Markdown document into the static signal page
  and leave only live collection behavior in the client island.
- Remove the duplicated signal metadata and unsupported educational copy from
  the client bundle.
- Split the API playground into a server shell and focused client components
  while preserving its token, fingerprint collection, endpoint, and analytics
  behavior.
- Add static and unit regression checks for content safety, bundle boundaries,
  response semantics, and in-memory token handling.
- Map the work only to the existing `J1` and `E4` tracker IDs.

## Non-Goals

- No new tracker IDs, dependencies, state libraries, client syntax highlighters,
  code-generator frameworks, downloads, Swagger/Postman surfaces, or brand
  redesign.
- No restoration or expansion of the pre-F5 fingerprint long-form copy.
- No collector-engine refactor and no completion claim for F2, F5, J1, or E4
  before their remaining preview/deployment evidence exists.

## Impact

- Affected specs: `fingerprint-signal-page`, `api-playground`
- Affected code:
  - `apps/web/src/app/fingerprint/[type]/*`
  - `apps/web/src/lib/fingerprint-markdown.ts`
  - `apps/web/src/app/playground/page.tsx`
  - `apps/web/src/components/playground/*`
  - focused web tests and dependency manifests when a dependency becomes unused
- Tracker source of truth: `docs/LAUNCH_PLAN.md` section 12


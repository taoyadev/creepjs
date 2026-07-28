## Why

E1 needs a small, accessible frontend foundation before the checker, homepage,
and playground can be decomposed without duplicating interaction behavior.
The current UI has hand-rolled mobile navigation, copy controls, progress bars,
and fetch lifecycles with inconsistent keyboard, cancellation, and feedback
semantics.

## What Changes

- Register the existing semantic success, warning, and chart tokens in Tailwind.
- Add shared Tooltip, Dialog/Sheet, Accordion, and Progress primitives.
- Rebuild mobile navigation on the focus-managed Sheet primitive.
- Add one shared CopyButton and a bounded typed JSON fetch helper.
- Add restrained cross-document motion and a global reduced-motion guard.
- Keep the static-export architecture, existing routes, and current theme
  decision unchanged.

## Impact

- Affected tracker item: E1 in `docs/LAUNCH_PLAN.md` §12.
- Affected capability: web experience foundation.
- Affected code: `apps/web/src/components/`, `apps/web/src/lib/api-client.ts`,
  `apps/web/src/app/globals.css`, and `apps/web/tailwind.config.ts`.
- New runtime dependencies: three focused Radix packages (accordion, dialog,
  tooltip); Sheet reuses dialog.

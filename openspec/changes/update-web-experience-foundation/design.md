## Context

CreepJS is a static-export Next.js application. E2, E3, E4, and E7 need shared
interaction behavior, but the project must avoid a client-heavy state or
animation stack. The 2026-07 plan locks the dependency boundary to CSS,
Tailwind animation utilities, and three small Radix accessibility primitives.

## Goals / Non-Goals

- Goals:
  - Provide accessible, reusable interaction primitives for the planned page
    decompositions.
  - Centralize copy and JSON request behavior where existing pages diverge.
  - Preserve keyboard, reduced-motion, static-export, and bundle constraints.
- Non-goals:
  - Restyle or restructure the checker/homepage in this change.
  - Add a client data library, global store, or general animation framework.
  - Change API contracts or route ownership.

## Decisions

### Accessibility primitives

Radix Accordion, Dialog, and Tooltip own focus, Escape, disclosure, and
description semantics. Sheet is a local Dialog composition so it does not add
another dependency.

### Shared client boundaries

CopyButton owns clipboard feedback and per-button copied state. `fetchJson`
owns API URL resolution, timeout, caller cancellation, typed error bodies, and
at most one retry for GET requests. Non-idempotent requests are never replayed.

### Motion

CSS owns all motion. Cross-document transitions are progressive enhancement
only, and a global `prefers-reduced-motion` rule neutralizes non-essential
animation and smooth scrolling.

## Risks / Trade-offs

- Radix adds transitive focus/portal/scroll-lock packages.
  - Mitigation: keep the dependency set to the three approved primitives and
    verify the frozen lockfile on OpenClaw.
- Shared primitives can become unused abstractions.
  - Mitigation: migrate the four existing clipboard implementations and three
    progress surfaces in the same change.
- App Router client navigation does not guarantee cross-document transitions.
  - Mitigation: describe view transitions as progressive enhancement, not an
    acceptance dependency.

## Migration Plan

1. Land the primitives and shared utilities.
2. Migrate existing copy and progress consumers without changing page output.
3. Run build, lint, typecheck, and unit tests on OpenClaw.
4. Verify MobileNav keyboard/focus and reduced-motion behavior on a Pages
   preview before closing E1.

## Open Questions

- None. Dependency and motion boundaries are locked by the approved 2026-07
  plan.

## Context

The checker is both a task-first privacy utility and a durable search entry
point. Static export rules out request-time server rendering, but it does not
require the whole route to be client-only: explanatory content can render in a
server component while the browser scan remains a client island.

The design lane is a task-first utility with a quiet technical command-surface
feel. Reference rules, not identity, come from:

- Stripe Docs: progressive disclosure and clear section hierarchy.
- Linear: calm density, restrained chrome, and decisive typography.
- Cloudflare Radar: readable security data, explicit state labels, and
  evidence before conclusions.

A Gemini Pro direction pass was attempted through the approved OpenClaw lane,
but the command returned no response artifact. No Gemini suggestion is treated
as design evidence; the direction below is the Codex-reviewed brief.

## Goals / Non-Goals

- Goals:
  - Ship meaningful static HTML with one H1 and substantial visible content.
  - Keep the live scan dominant and usable without a full-page loading swap.
  - Make long results scannable on desktop and mobile.
  - Preserve honest, privacy-safe interpretation of coverage and rarity.
- Non-goals:
  - Merge or remove SEO routes.
  - Persist or reconstruct another person's fingerprint.
  - Add collectors, heavy state/data libraries, or new API contracts.
  - Implement the E7 own-IP trust synthesis in this change.

## Decisions

### First viewport

The first viewport uses a two-column composition on wide screens: concise
product explanation and privacy promise on the left, live scan/status surface
on the right. On mobile the heading and one-sentence promise precede the scan
slot, keeping the task visible without an oversized marketing hero.

### Long-page rhythm

Content alternates between cardless explanatory bands and bounded result
objects. The order is: scan/result identity, what the checker reports, category
results, privacy interpretation, how it works, and FAQ. Cards represent actual
data or interactions, not decorative feature mosaics.

### Client boundary

`page.tsx` remains a server component. `CheckerApp` owns scan state and composes
category cards. Hooks own collection, own-IP preparation for E7, and URL state.
Static explanatory copy and taxonomy stay outside the client boundary.

### Navigation and URL state

A sticky section navigation becomes a compact horizontal scroller on mobile.
It marks the current section without intercepting normal anchor behavior.
`?tab=` owns the selected collector category. `?fp=<id>&cov=<coverage>&b=<count>`
is context only: it labels a shared snapshot while the recipient's own scan
still runs and is never presented as a reproduction.

### Motion

Exactly three motion roles are allowed:

1. In-slot progress width and collector label transitions explain scan state.
2. Completed result regions use a short fade-in-up reveal.
3. Active section/tab indicators transition position or color.

All three are neutralized by the global reduced-motion rule.

### Mobile adaptation

The section nav scrolls horizontally, collector grids collapse to one column,
long IDs wrap without forcing viewport overflow, and tab/result controls retain
44px-class touch targets. No sticky element may cover the current heading.

## Risks / Trade-offs

- Moving 1,500+ lines can introduce behavior drift.
  - Mitigation: land pure moves before state or layout changes.
- URL state can imply false share reproducibility.
  - Mitigation: use an explicit snapshot-context banner and always run the
    recipient's local scan.
- Static shell and client result headings can duplicate semantics.
  - Mitigation: keep exactly one page H1 and use section H2/H3 hierarchy.
- Scroll-spy can become hydration or accessibility overhead.
  - Mitigation: progressive enhancement with anchors as the functional base.

## Validation

- Build/static:
  - exported checker HTML contains exactly one H1 and the explanatory anchors;
  - no full-viewport loading shell is the only main content;
  - route remains statically exported.
- Unit/component:
  - URL parsing/serialization round-trips;
  - baseline below 20 renders a warming state, never a percentage;
  - progress exposes live, bounded values.
- Pages preview:
  - desktop and mobile light/dark screenshots;
  - scan success and failure stay in-slot;
  - keyboard section/tab navigation;
  - `?fp`/`?tab` round-trips;
  - reduced-motion behavior and no sticky-header occlusion.

## Anti-Patterns

- No purple-gradient SaaS hero, dashboard-card mosaic, floating mock dashboard,
  eyebrow-pill soup, or decorative risk score.
- No fabricated rarity percentages, match-rate claims, fraud probability, or
  implication that a shared fingerprint was reconstructed.
- No viewport-height loading replacement, ornamental animation, or new client
  dependency.

## Migration Plan

1. Pure-move collector renderers.
2. Extract scan orchestration and keep progress in the checker slot.
3. Flip the route to a server shell with static explanatory content.
4. Add section navigation and URL state.
5. Add tooltips, motion restraint, live announcements, and warming states.

## Open Questions

- None. Page ownership, URL honesty, dependency limits, and baseline behavior
  are locked by the approved 2026-07 plan.

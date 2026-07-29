## Context

The 55 signal routes are statically exported, but their reviewed Markdown is
currently fetched and rendered by `FingerprintPlayground`, which also contains a
second unreviewed education corpus. The playground route is a 1,195-line client
component containing both static explanation and all interactive state.

## Goals / Non-Goals

- Goals:
  - make reviewed signal education part of the static server-rendered document
  - reduce fingerprint route client JavaScript without changing collectors
  - make the playground shell server-rendered and keep token state memory-only
  - preserve current endpoint and analytics behavior
- Non-goals:
  - change signal claims, collectors, public APIs, or product branding
  - add endpoint families, client highlighters, state libraries, or generators

## Decisions

- `FINGERPRINT_TECHNIQUES` remains the canonical registry for route metadata and
  static params.
- `readVettedSignalMarkdown` remains the fail-closed content gate and is called
  while rendering the static route.
- The server route owns the unique H1 and Markdown article. The client signal
  island owns only collector state and interaction.
- The playground page owns static headings and copy. `PlaygroundApp` owns the
  existing React state and delegates presentation to focused components.
- Token values may flow only through component props inside the client island;
  they are not persisted or included in analytics.
- Code snippets use plain `<pre><code>` markup and existing copy behavior.

## Risks / Trade-offs

- Server Markdown rendering can accidentally reintroduce a client dependency.
  Static source and built-chunk assertions guard this boundary.
- Component extraction can alter request concurrency or analytics timing. The
  orchestrator keeps the existing single-request state and mount effect.
- Static export failures now fail closed when vetted content is invalid. This is
  intentional and extends the existing F5 build gate to the HTML route.

## Migration Plan

1. Land and validate the OpenSpec change.
2. Refactor fingerprint route rendering and verify all 55 routes plus bundle
   boundaries.
3. Refactor the playground by moving behavior before tightening semantics.
4. Run the full OpenClaw validation chain and compare route JavaScript.
5. Keep J1 and E4 `doing` until preview, Lighthouse, and browser evidence pass.

## Open Questions

- None. The operator approved the Phase 8 direction in the implementation
  handoff.

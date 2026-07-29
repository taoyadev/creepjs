## Why

`/checker` is a top sitemap route but its exported HTML contains only a loading
state because the entire 2,600-line page is a client component. That weakens
first-load comprehension, accessibility, resilience, and crawlability while
making the live scan difficult to maintain.

## What Changes

- Refactor the checker into a server-rendered explanatory shell plus a focused
  client scan application.
- Keep scan progress and failures inside the checker slot instead of replacing
  the viewport.
- Split collector presentation into category cards, hooks, and small checker
  components.
- Add sticky section navigation and URL-owned `tab` and honest snapshot
  context.
- Add tooltips, restrained transitions, live progress announcements, and
  baseline-warming states that never fabricate rarity.
- Preserve the existing route, collector set, static export, privacy model, and
  API contracts.

## Impact

- Affected tracker items: E3, with existing C1/B4/J1 dependencies.
- Affected capability: checker single-page experience.
- Affected code: `apps/web/src/app/checker/page.tsx` and
  `apps/web/src/components/checker/`.
- No new runtime dependencies.

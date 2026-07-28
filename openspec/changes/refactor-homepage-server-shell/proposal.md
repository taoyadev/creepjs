# Refactor Homepage Server Shell

## Why

The highest-priority sitemap URL currently delegates its entire experience to a
large client component. Static export therefore ships an initial loading
surface instead of a durable marketing and answer page, weakening first-load
UX, crawlability, and the route's role as the product entry point.

## What Changes

- Replace the monolithic homepage client component with a substantial server
  component shell.
- Put the fingerprint checker and IP risk checker above the fold with correct,
  live routes.
- Generate the signal taxonomy from the shared fingerprint technique registry.
- Keep only two bounded client islands: a live fingerprint teaser and an own-IP
  card, each with a stable reserved height.
- Add self-contained product, audience, privacy, and answer content without
  adding routes, collectors, dependencies, or unsupported claims.

## Impact

- **Affected tracker IDs:** E2, with E1 primitives reused.
- **Affected code:** `apps/web/src/app/page.tsx`,
  `apps/web/src/app/HomePageClient.tsx`, and new homepage components.
- **Static contract:** `output: 'export'` remains unchanged; the route performs
  no request-time server work.
- **Out of scope:** checker implementation, arbitrary-IP lookup behavior,
  localization, monetization, and new fingerprint collectors.

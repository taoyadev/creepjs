# Technical SEO Audit

This document records the repository-verifiable portion of `F1` from
`docs/LAUNCH_PLAN.md`. It does not replace external Rich Results or browser
validation, but it captures the current source-of-truth coverage for metadata,
canonical URLs, sitemap, robots, and JSON-LD templates.

## Audit basis

- Audit source: current repository state
- Canonical site host: `https://creepjs.org`
- Canonical API host: `https://api.creepjs.org`

## Template coverage matrix

| Template           | Representative route                    | Metadata source                                     | Structured data in repo                          | Status |
| ------------------ | --------------------------------------- | --------------------------------------------------- | ------------------------------------------------ | ------ |
| Home               | `/`                                     | `app/page.tsx` + `lib/metadata.ts`                  | `WebApplication` + `BreadcrumbList`              | pass   |
| Checker            | `/checker`                              | `app/checker/layout.tsx`                            | `WebApplication` + `BreadcrumbList`              | pass   |
| IP checker         | `/ip`                                   | `app/ip/layout.tsx`                                 | `WebApplication` + `BreadcrumbList`              | pass   |
| Fingerprint hub    | `/fingerprint`                          | `app/fingerprint/page.tsx`                          | `CollectionPage` + `BreadcrumbList` + `ItemList` | pass   |
| Fingerprint detail | `/fingerprint/canvas`                   | `app/fingerprint/[type]/page.tsx`                   | `TechArticle` + `BreadcrumbList`                 | pass   |
| Docs               | `/docs`                                 | `app/docs/layout.tsx`                               | `WebPage` + `BreadcrumbList`                     | pass   |
| Playground         | `/playground`                           | `app/playground/layout.tsx`                         | `WebApplication` + `BreadcrumbList`              | pass   |
| Guide              | `/guide/what-is-browser-fingerprinting` | `app/guide/what-is-browser-fingerprinting/page.tsx` | `TechArticle` + `FAQPage` + `BreadcrumbList`     | pass   |
| Privacy            | `/privacy`                              | `app/privacy/page.tsx`                              | `WebPage` + `BreadcrumbList`                     | pass   |

## Repo-level checks completed

### Canonical URL generation

- `apps/web/src/lib/metadata.ts` centralizes `SITE_CONFIG.url` and `SITE_CONFIG.apiUrl`
- `generateMetadata()` sets `alternates.canonical` from the canonical path
- route-level metadata uses `generateMetadata()` or a canonical override derived from the same host

### Sitemap

- Source: `apps/web/src/app/sitemap.ts`
- Registry: `apps/web/src/lib/seo-routes.ts`
- Current static head routes covered in the registry:
  - `/`
  - `/checker`
  - `/ip`
  - `/fingerprint`
  - `/docs`
  - `/playground`
  - `/guide/what-is-browser-fingerprinting`
  - `/privacy`
- Fingerprint detail pages are represented through the route registry and sitemap generation path

### Robots

- Source: `apps/web/src/app/robots.ts`
- Current behavior:
  - allows crawl of public site routes
  - disallows `/api/*` and `/v1/*`
  - points at the canonical sitemap `https://creepjs.org/sitemap.xml`

### Open Graph asset path

- Metadata source uses `SITE_CONFIG.ogImage = https://creepjs.org/og-image.png`
- The public asset exists at `apps/web/public/og-image.png`
- Deployment docs now verify the actual shipped asset path

## Low-cost inconsistencies fixed during this audit

- Converted home, checker, IP, and playground template schemas from generic
  `WebPage` to `WebApplication`
- Added missing `WebPage` + `BreadcrumbList` structured data to `/privacy`
- Added missing `TechArticle` structured data to the guide page so it now ships
  `TechArticle` + `FAQPage` + `BreadcrumbList`
- Corrected deployment docs to verify `/og-image.png` instead of the non-existent
  `/opengraph-image.png`

## External checks still required

These items are not provable from source alone and still need operator or
preview evidence:

- Google Rich Results Test for one representative URL from each template
- browser-side confirmation that canonical tags, OG tags, and JSON-LD render as expected in deployed HTML
- Search Console and Bing validation that the sitemap is accepted and pages are indexed

## Suggested evidence to attach

- Rich Results screenshots for:
  - `/`
  - `/checker`
  - `/ip`
  - `/fingerprint`
  - `/docs`
  - `/playground`
  - `/guide/what-is-browser-fingerprinting`
  - `/privacy`
- one rendered HTML or view-source capture per template showing canonical and JSON-LD
- Search Console sitemap acceptance and at least one indexed head page

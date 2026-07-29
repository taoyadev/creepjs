## Why

CreepJS already exports a working tool surface and 55 crawlable fingerprint
signal routes, but machine discovery is incomplete: `llms.txt` lists only a
small featured subset, no full text index exists, crawler policy is implicit,
the IP tool lacks a static answer anchor, and the CreepJS.org entity is easy to
confuse with Abraham Juliot's separate open-source project.

The existing fingerprint Markdown also contains unsupported exact statistics
and purported first-hand test claims. Advertising or concatenating that corpus
without an editorial gate would amplify misinformation. GEO work must improve
access and attribution without inventing a ranking mechanism or lowering the
content quality bar.

## What Changes

- Register exactly one new launch-tracker task: `F5` (GEO / AI-search surface),
  milestone M3, dependency F1.
- Make the permissive crawler policy explicit for the current official OpenAI,
  Anthropic, Perplexity, and Google control tokens while preserving the
  existing restricted paths and a dated review note.
- Expand `llms.txt` to all vetted tool and signal pages, grouped by category,
  with HTML and Markdown mirror links plus a pointer to a statically exported
  `llms-full.txt`.
- Generate `llms-full.txt` at build time from the canonical signal registry and
  editorially safe Markdown sources. The build SHALL reject unsupported
  first-hand claims, unverified exact performance/adoption statistics,
  fabricated citations, match-rate claims, and market forecasts.
- Add concise, visible, brand-named answer anchors to the homepage, checker, IP
  tool, and proxy pilot.
- Disambiguate the CreepJS.org product from the separate Abraham Juliot project,
  standardize the visible product name as `CreepJS`, and keep entity `sameAs`
  references limited to the product's official profiles.
- Record schema restraint: no new `FAQPage`, `HowTo`, or `Dataset` markup; the
  existing guide FAQ may remain because it mirrors visible content.

## Impact

- Affected specs: `geo-ai-search` (new capability)
- Affected web: robots, llms routes, content-quality validation, answer blocks,
  metadata/entity helpers, tests, and static export
- Affected content: 55 fingerprint Markdown mirrors must pass the new
  evidence/honesty gate before inclusion
- Affected docs: `docs/LAUNCH_PLAN.md` §12 gains the single F5 row and records
  implementation/rollout evidence
- No new dependency, route fan-out, crawler-ranking promise, schema stuffing,
  internationalization, or new collector

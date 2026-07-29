## Why

The working IP checker can satisfy proxy-operator tasks that a generic article
or search result cannot complete, but the current site has no focused entry page
for the decision "is this IP a proxy?". Shipping several near-identical pages
before indexing and task data exists would create avoidable thin-content risk.

## What Changes

- Add one hand-written pilot at
  `/ip-lookup/how-to-tell-if-an-ip-is-a-proxy`.
- Put a working, no-signup IP lookup near the top of the page and explain how to
  interpret proxy, VPN, Tor, datacenter, ownership, routing, evidence, and risk
  fields without claiming certainty the data cannot support.
- Add unique metadata, canonical URL, visible provenance/limitations, relevant
  internal links, and sitemap registration with a route-specific last-modified
  date.
- Measure non-sensitive task completion and the transition to the full `/ip`
  report.
- Gate any `datacenter-ip-detection` or `ip-fraud-score-explained` expansion on
  observed demand and a separate approved delta instead of generating a page
  family now.

## Impact

- Affected specs: `ip-intent-content` (new capability)
- Affected web: one static landing route, a reusable compact IP lookup, SEO route
  metadata/sitemap handling, internal links, and tests
- Affected docs: launch tracker and private content QA evidence
- No per-address pages, hidden content, default FAQ schema, new dependency, or
  claim of guaranteed rankings/traffic

## Context

The July optimization plan proposed three IP-intent pages, but sitemap indexing
and query evidence are still pending. Current project policy favors a working
task surface over commodity prose, and current search guidance no longer treats
FAQ structured data as a default visibility action. The pilot must earn its
existence through live IP analysis plus decision guidance, not keyword variants.

## Goals / Non-Goals

- Goals:
  - satisfy the proxy-detection task with a live result and concise interpretation
  - expose method, provenance, uncertainty, and safe next actions
  - produce a crawlable static page with correct canonical and sitemap metadata
  - establish task-success evidence before expanding the page family
- Non-goals:
  - automatic per-IP pages or a programmatic keyword fan-out
  - proxy detection guarantees or unsupported accuracy claims
  - FAQ rich-result targeting, fixed word counts, or keyword-density targets

## Decisions

### Asset choice

The pilot is a task-first landing page, not a long-form article. A compact lookup
uses the existing public IP endpoint and returns enough result context to answer
the proxy question. Supporting prose explains signal combinations, limitations,
and escalation to the full report.

### Content and trust

Claims that may change or depend on provider behavior are checked against
primary sources and dated in a private research/QA note. The page distinguishes
direct response fields from editorial interpretation. Visible content explains
that a negative result is not proof that an address is residential or benign,
and that classifications can change.

Question-and-answer copy is permitted only when it helps the reader; the page
does not emit `FAQPage` solely for search appearance.

### Search and routing

The route is server-rendered/static except for the compact lookup client island.
It receives unique metadata and canonical URL, is linked from `/ip`, and is
registered in the central SEO route list. `SeoRoute` gains an optional
`lastModified`, and the sitemap uses it so this new page does not falsely update
every existing URL.

### Measurement

Analytics records only endpoint name, success/failure class, and CTA action.
It does not record raw IPs, query strings containing IPs, tokens, or provider
payloads. Expansion requires evidence such as impressions for the intent,
completed lookups, or qualified token transitions; no metric is represented as
a disclosed ranking factor.

## Risks / Trade-offs

- A single pilot has less keyword surface than three pages, but it lowers
  duplication risk and produces cleaner evidence for the next decision.
- Provider classifications can be stale or wrong. The page states limitations
  and exposes evidence rather than presenting one boolean as certainty.

## Migration Plan

This is an additive static route. It can be removed from the central route list
and app tree without data migration if the pilot fails its usefulness gate.

## Open Questions

- Whether to add datacenter- and fraud-score-specific pages remains gated on
  post-launch demand and task evidence.

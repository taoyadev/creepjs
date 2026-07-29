# fingerprint-signal-page Specification

## Purpose

TBD - created by archiving change refactor-fingerprint-playground-boundaries. Update Purpose after archive.

## Requirements

### Requirement: Static reviewed signal education

The web application SHALL derive every public fingerprint signal route from the
canonical signal registry, validate the corresponding reviewed Markdown during
the static build, and render that content as a server-owned HTML article.

#### Scenario: Canonical signal is built

- **WHEN** the static export builds a registered fingerprint signal slug
- **THEN** the output contains exactly one H1 and a server-rendered article with
  the matching content accepted by the fail-closed review gate

#### Scenario: Reviewed content is invalid

- **WHEN** a registered signal Markdown document is missing, mismatched, or
  rejected by the content safety rules
- **THEN** the build fails instead of publishing partial or unreviewed education

### Requirement: Bounded live signal island

The signal page client island SHALL contain only live collector state and
interaction and SHALL NOT fetch, render, or duplicate the educational Markdown.

#### Scenario: Browser loads a signal page

- **WHEN** a visitor loads any registered fingerprint signal route
- **THEN** the browser makes no request for
  `/content/fingerprints/<slug>.md` and the client chunks contain no Markdown
  renderer, `highlight.js`, or `rehype-highlight`

#### Scenario: Signal education is displayed

- **WHEN** the page presents explanatory content
- **THEN** it uses only the reviewed Markdown and does not expose the removed
  `longDescription` or `useCases` corpus

### Requirement: Static route safety and schema restraint

The signal route SHALL preserve safe invalid-slug handling, unique canonical
metadata, breadcrumbs, and the existing restrained schema set.

#### Scenario: Unknown slug is requested

- **WHEN** the route receives a slug outside the canonical registry
- **THEN** it returns the existing static-safe invalid state without emitting
  metadata or structured data for a valid signal

#### Scenario: Valid signal is rendered

- **WHEN** the route renders a canonical signal
- **THEN** it includes only the approved TechArticle and BreadcrumbList schema
  behavior and does not add HowTo, Dataset, or additional FAQPage schema

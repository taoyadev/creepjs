## ADDED Requirements

### Requirement: Explicit Reviewed Crawler Policy

The web application SHALL publish a statically generated robots policy that
explicitly records the approved current AI/search crawler tokens while
preserving the same restricted paths for wildcard and specific groups.

#### Scenario: Specific crawler group

- **WHEN** robots.txt is generated for an approved specific crawler token
- **THEN** it allows the public site and repeats the `/api/*` and `/v1/*`
  disallows rather than silently broadening access

#### Scenario: Policy review

- **WHEN** crawler policy is changed
- **THEN** the source records a review date and official vendor references
  because token names and purposes may change

### Requirement: Complete Machine Navigation

The application SHALL expose deterministic `llms.txt` and `llms-full.txt`
navigation artifacts derived from the canonical route and signal registries.

#### Scenario: Compact index

- **WHEN** `/llms.txt` is built
- **THEN** it lists every vetted non-legal tool/guide and all 55 signal pages
  grouped by category with canonical HTML and Markdown mirror links

#### Scenario: Full text index

- **WHEN** `/llms-full.txt` is built
- **THEN** it reads expected Markdown files in canonical order, concatenates
  only content that passes the honesty gate, and fails closed for a missing or
  rejected source

#### Scenario: No ranking claim

- **WHEN** either machine-navigation file is served
- **THEN** it does not claim that the file is required for or improves Google
  Search rankings, AI citations, or generative-search inclusion

### Requirement: Public Content Honesty

Every fingerprint Markdown mirror included in machine navigation or rendered
as HTML MUST avoid fabricated experience and unsupported exact claims.

#### Scenario: Unsupported evidence claim

- **WHEN** a signal document contains an unverified first-person study/test,
  sample size, percentage, accuracy, match-rate, market forecast, or fabricated
  citation
- **THEN** validation fails and the document is not included in the full-text
  artifact or rollout

#### Scenario: Concise reference content

- **WHEN** a signal page uses concise registry-backed prose plus its working
  collector
- **THEN** it remains eligible even without long-form word count because the
  live task surface is the primary utility

### Requirement: Answer-Shaped Rendered Surface

The homepage, checker, IP tool, and proxy pilot SHALL expose stable
server-rendered answer anchors with concise self-contained CreepJS explanations.

#### Scenario: Static answer retrieval

- **WHEN** a crawler or browser agent fetches the exported HTML
- **THEN** the expected answer anchor and useful text are present without
  requiring client interaction

#### Scenario: Claim restraint

- **WHEN** an answer explains fingerprint or IP risk output
- **THEN** it distinguishes observations from uniqueness, identity, or fraud
  probability and does not fabricate a match rate

### Requirement: Clear Product Entity and Restrained Schema

The site SHALL visibly distinguish CreepJS.org from the separate Abraham Juliot
project, use the `CreepJS` product name consistently, and emit only structured
data that mirrors supported visible content.

#### Scenario: Entity identity

- **WHEN** the product is described on the homepage or in machine navigation
- **THEN** the description names the CreepJS.org diagnostic/API and identifies
  the separate same-name research project without treating it as a product-owned
  profile

#### Scenario: Schema restraint

- **WHEN** the updated pages and machine-navigation routes are built
- **THEN** they add no FAQPage, HowTo, or Dataset schema; the existing visible
  guide FAQ is the only grandfathered FAQPage

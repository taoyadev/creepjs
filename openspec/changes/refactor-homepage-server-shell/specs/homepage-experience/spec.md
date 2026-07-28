# Homepage Experience

## ADDED Requirements

### Requirement: Static Product Entry

The homepage SHALL export substantial product and task content independently of
client-side fingerprint or IP collection.

#### Scenario: JavaScript has not executed

- **WHEN** the exported homepage HTML is loaded
- **THEN** it contains one descriptive H1, working `/checker` and `/ip` links,
  the CreepJS answer block, audience guidance, and a signal taxonomy

### Requirement: Bounded Live Evidence

The homepage SHALL present fingerprint and own-IP evidence as bounded client
islands that do not replace or shift the static shell.

#### Scenario: A client request is loading or fails

- **WHEN** fingerprint collection or `/my-ip` is incomplete or unavailable
- **THEN** only the corresponding reserved card changes state and the rest of
  the homepage remains readable and interactive

### Requirement: Honest Security Positioning

The homepage SHALL distinguish collector coverage, browser fingerprint
exposure, IP risk context, and population rarity without treating them as
identity or fraud probability.

#### Scenario: A visitor reviews the live teaser

- **WHEN** a local fingerprint scan completes
- **THEN** the teaser may show its diagnostic ID and coverage but does not show
  a fabricated uniqueness percentage

### Requirement: Registry-Backed Signal Taxonomy

The homepage signal grid SHALL be generated from the canonical web fingerprint
technique registry.

#### Scenario: Technique metadata changes

- **WHEN** `FINGERPRINT_TECHNIQUES` is updated
- **THEN** the homepage taxonomy reflects the updated names, categories, and
  links without a duplicate manually maintained table

# Network Trust Report

## ADDED Requirements

### Requirement: Explainable Combined Report

The checker SHALL combine browser integrity observations and optional own-IP
context into explicit, source-labeled dimensions.

#### Scenario: Browser and IP data are available

- **WHEN** the browser scan and `/my-ip` request complete
- **THEN** the report shows browser consistency, automation exposure, coverage,
  IP risk context, ASN/location, and conservative guidance

### Requirement: Browser-Only Degradation

The report SHALL remain useful when own-IP or paid risk data is unavailable.

#### Scenario: `/my-ip` fails

- **WHEN** the own-IP request rejects or times out
- **THEN** the report renders the browser dimensions, labels network context
  unavailable, and makes no IP-risk inference

#### Scenario: only free geo context is returned

- **WHEN** `/my-ip` has no risk block
- **THEN** the report shows address/geo/ASN when present and labels risk
  enrichment unavailable

### Requirement: No Fraud Probability Claim

The combined verdict SHALL be a diagnostic status, not an identity or fraud
probability.

#### Scenario: elevated indicators exist

- **WHEN** webdriver, browser inconsistencies, or an elevated upstream IP band
  is present
- **THEN** the report recommends review and names those indicators without
  assigning a probability

### Requirement: Joint User Export

The checker export SHALL optionally include the own-IP summary used by the
visible report.

#### Scenario: own-IP context is available at export time

- **WHEN** the user exports JSON or CSV
- **THEN** the exported report includes IP, geo/ASN, and optional risk context
  alongside the fingerprint data

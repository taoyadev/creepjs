## ADDED Requirements

### Requirement: Published provider information SHALL come from one reviewed static source

The system SHALL publish provider information from one repository-owned source with stable, unique provider IDs, explicit active or paused status, verified public claims, source references and verification dates. An active record SHALL have valid HTTPS outbound URLs without embedded credentials. Private contracts, customer records and credentials SHALL NOT enter this public source. Public reads SHALL NOT fetch merchant truth, reconstruct rankings, publish updates or send notifications.

#### Scenario: Valid active provider

- **WHEN** a reviewed active provider is included in a build
- **THEN** its directory and recommendation content use the same validated data
- **AND** rendering requires no request-time merchant or business-store access

#### Scenario: Invalid active provider

- **WHEN** an active record has a duplicate ID, missing required information or an invalid outbound URL
- **THEN** a runnable validation or build check fails with the offending record identified
- **AND** the invalid record is not silently published

#### Scenario: No active providers

- **WHEN** there are no valid active providers
- **THEN** the directory shows an honest unavailable state with useful internal links
- **AND** provider recommendations and the directory navigation entry are absent
- **AND** the directory is noindex and excluded from the sitemap

### Requirement: IP recommendations SHALL follow complete results and remain independent of diagnostics

The IP tool SHALL show at most two active provider recommendations after the complete successful result, evidence and method information. Selection SHALL use fixed reviewed editorial order and placements. The system SHALL NOT use IP addresses, risk scores, ASN, location, fingerprints or identity to select providers or change diagnostic conclusions. Promotional data SHALL NOT enter reports, shared query parameters or exports.

#### Scenario: Successful result with unknown fields

- **WHEN** an IP lookup succeeds with missing risk or classification fields
- **THEN** missing fields remain unknown and the original diagnostic explanation is preserved
- **AND** any following recommendation uses neutral network-service language

#### Scenario: Changing risk classification

- **WHEN** otherwise equivalent lookup fixtures have low, high or unknown risk
- **THEN** provider selection remains independent of the classification
- **AND** no purchase is presented as required or as a guaranteed fix

#### Scenario: Lookup fails or is cancelled

- **WHEN** the lookup is loading, invalid, rate limited, cancelled or failed
- **THEN** the recommendation section is not inserted into that non-success result state
- **AND** retry, cancellation and input recovery retain their existing behavior

### Requirement: Commercial content SHALL offer truthful choices and visible disclosure

The site SHALL provide `/proxy-providers` and `/guide/static-vs-rotating-proxies` as static content. Provider information SHALL describe supported uses and limitations with evidence dates. Partnership disclosure SHALL appear adjacent to recommendations and outbound calls to action. The site SHALL NOT invent product tests, ratings, discounts, endorsements or safety guarantees. Expired benefits SHALL NOT be promised as currently available.

#### Scenario: One provider is available

- **WHEN** exactly one active partner has verified data
- **THEN** the directory presents that provider without fabricating comparison entries or a multi-provider ranking

#### Scenario: No verified special offer

- **WHEN** a provider has a valid partnership link but no verified special benefit
- **THEN** its action uses neutral plans or pricing language
- **AND** the page does not claim an exclusive discount or trial

#### Scenario: Static content without JavaScript

- **WHEN** JavaScript is disabled
- **THEN** directory and guide content, partnership disclosure and ordinary provider anchors remain readable and usable

### Requirement: Outbound links SHALL preserve diagnostic privacy and navigation reliability

Provider links SHALL use prevalidated static HTTPS destinations, `rel="sponsored noopener noreferrer"` and a no-referrer policy. They SHALL NOT include detection data, complete current-page URLs, personal identifiers or user-controlled redirect targets. Outbound navigation SHALL NOT await analytics. The site SHALL NOT contact merchants through automatic prefetch, remote logos or advertising scripts before deliberate navigation.

#### Scenario: Visitor opens a provider from an IP query page

- **WHEN** a visitor activates a provider link from `/ip?q=<address>`
- **THEN** the destination contains only reviewed merchant attribution parameters
- **AND** the referrer does not expose the query address

#### Scenario: Analytics is unavailable

- **WHEN** a visitor activates a provider link while analytics is blocked or fails
- **THEN** normal anchor navigation still proceeds
- **AND** IP checking continues to operate independently

### Requirement: Navigation and public routes SHALL remain coherent and accessible

Desktop and mobile navigation SHALL share the provider entry and correct current-page state when active providers exist. The central SEO registry, canonical metadata and sitemap SHALL agree with indexable content. New content SHALL preserve keyboard operation, visible focus, readable disclosure, both themes and layouts without whole-page horizontal overflow at supported widths.

#### Scenario: Narrow desktop navigation

- **WHEN** a visitor uses a 768 or 1024 pixel wide viewport
- **THEN** the added navigation item does not overflow or hide existing tool access
- **AND** any menu fallback retains focus, Escape and close behavior

#### Scenario: Published routes

- **WHEN** a build contains verified active providers
- **THEN** the directory and guide have stable canonical paths and valid internal links
- **AND** pre-existing public paths and API contracts remain unchanged

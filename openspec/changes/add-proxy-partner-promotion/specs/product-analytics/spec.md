## ADDED Requirements

### Requirement: Partner measurement SHALL extend the existing anonymous event contract

The shared allowlist SHALL add `partner_impression` with required `label` (provider ID) and `section` (placement). Outbound activations SHALL reuse `link_clicked` with these dimensions. Partner events SHALL preserve existing property rules, transport, path normalization, fixed columns and single-point writes without identifying fields or new storage dependencies.

#### Scenario: Partner impression is stored

- **WHEN** a valid `partner_impression` with label `example-provider` and section `partner-ip-result` reaches a configured events dataset
- **THEN** it is stored using the existing columns with empty values for unused properties
- **AND** existing events and their column meanings remain unchanged
- **AND** no database, KV or Durable Object operation is introduced

#### Scenario: Storage binding is absent

- **WHEN** the events binding is absent
- **THEN** valid partner events preserve the existing 204-without-write behavior
- **AND** acceptance documentation does not treat that response as evidence of persisted analytics

### Requirement: Partner observation SHALL be bounded to a page lifecycle

The client SHALL emit impressions only when half a card is visible in a visible document. Each provider/placement SHALL have at most one impression and one activation event per page lifecycle. Memory-only deduplication SHALL survive repeated queries and section remounts. It SHALL NOT create visitor IDs, cookies or persistent storage. Missing observation support SHALL skip impressions without disabling links.

#### Scenario: Card has not been viewed

- **WHEN** a provider card is rendered outside the viewport
- **THEN** no impression is emitted until the visibility condition is met

#### Scenario: IP query or React rendering repeats

- **WHEN** a visitor repeats an IP lookup or the same provider section rerenders or remounts within the page lifecycle
- **THEN** the same provider and placement are not counted as another impression

#### Scenario: Repeated outbound activation

- **WHEN** the same provider link is activated again within that lifecycle
- **THEN** navigation remains available
- **AND** the deduplicated activation counter is not incremented again

### Requirement: Partner events SHALL honor existing privacy choices and failure isolation

Partner measurement SHALL respect Do Not Track and Global Privacy Control. It SHALL NOT transmit IP addresses, risk scores, fingerprint IDs, tokens, full URLs, user agents, emails or coupon codes. Analytics failure SHALL NOT block diagnostic requests or outbound navigation.

#### Scenario: Privacy opt-out is enabled

- **WHEN** DNT or GPC is enabled
- **THEN** no partner measurement is sent
- **AND** static content and normal provider navigation remain available

#### Scenario: Query parameters contain an IP

- **WHEN** partner measurement originates from an IP lookup page with query parameters
- **THEN** only its normalized pathname and approved provider/placement dimensions are transmitted

### Requirement: Commercial reporting SHALL distinguish observations from merchant-confirmed outcomes

Commercial reporting and acceptance SHALL distinguish observed page-instance impressions, observed link activations, merchant-confirmed orders, refunds and settled commissions. Fixed merchant channel parameters MAY identify placements only when supported by the merchant. The site SHALL NOT claim person-level attribution, unique-user conversion or persisted production events from client activation or HTTP status alone.

#### Scenario: Merchant supplies only provider-level reporting

- **WHEN** merchant reports cannot separate placement channels
- **THEN** merchant outcomes are reported at provider level
- **AND** no placement-level order attribution is invented

#### Scenario: Production measurement is declared operational

- **WHEN** production measurement is accepted as operational
- **THEN** evidence includes an authorized query showing stored partner events in a known test window
- **AND** report limitations include applicable sampling, opt-out, delivery loss and merchant attribution windows

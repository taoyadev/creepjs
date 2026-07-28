## ADDED Requirements

### Requirement: Task-First Proxy Detection Pilot

The web application SHALL provide a hand-written static page at
`/ip-lookup/how-to-tell-if-an-ip-is-a-proxy` whose primary value is a working
public IP lookup plus guidance for interpreting proxy-related signals.

#### Scenario: Successful live lookup

- **WHEN** a visitor submits a valid IP literal
- **THEN** the page displays the returned proxy, VPN, Tor, datacenter, network,
  risk, and evidence context needed to make a qualified decision

#### Scenario: Invalid or unavailable lookup

- **WHEN** the input is invalid, rate-limited, or the API is unavailable
- **THEN** the page exposes a specific accessible error state and a safe next
  action without fabricating a result

### Requirement: Evidence and Limitations

The pilot MUST distinguish provider response fields from interpretation,
provide visible provenance for material source-dependent claims, and state that
IP classification is probabilistic and can change.

#### Scenario: Negative proxy signal

- **WHEN** the provider does not flag an address as a proxy
- **THEN** the page does not claim that the address is definitively residential,
  trusted, or free of intermediary use

#### Scenario: Conflicting signals

- **WHEN** proxy, datacenter, ownership, routing, risk, or evidence fields point
  in different directions
- **THEN** the page presents the fields and limitations instead of collapsing
  them into an unsupported certainty claim

### Requirement: Correct Search Surface

The pilot SHALL expose unique visible content, metadata, canonical URL,
internal discovery, and sitemap registration that reflect the real task and
route-specific update date.

#### Scenario: Static search output

- **WHEN** the pilot is built
- **THEN** its rendered HTML includes a unique title, description, canonical,
  heading, useful explanatory content, and links to the full IP checker

#### Scenario: Sitemap update

- **WHEN** the sitemap is generated
- **THEN** it contains the pilot exactly once with its own `lastModified` value
  and does not change unrelated route dates

#### Scenario: Structured data restraint

- **WHEN** structured data is emitted
- **THEN** it represents visible supported entities and does not add `FAQPage`
  merely to target a search appearance

### Requirement: Privacy-Safe Measurement and Expansion Gate

The pilot SHALL measure non-sensitive task outcomes without recording raw IPs,
tokens, or provider payloads, and additional intent pages MUST require a
separate approved change supported by distinct demand and utility evidence.

#### Scenario: Task analytics

- **WHEN** a lookup or full-report transition is tracked
- **THEN** analytics records only safe event/status/count metadata and excludes
  the submitted IP and response data

#### Scenario: Proposed page-family expansion

- **WHEN** another IP-intent route is proposed
- **THEN** its change identifies distinct demand, click necessity, and user
  value beyond a renamed version of the pilot

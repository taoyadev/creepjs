# API Security

## ADDED Requirements

### Requirement: API tokens SHALL be unguessable CSPRNG values

Tokens minted by `/v1/token` SHALL be generated from a cryptographically
secure random source with at least 128 bits of entropy. Previously issued
tokens SHALL continue to authenticate (auth is a literal KV lookup).

#### Scenario: Two mints for the same email differ

- **WHEN** the same email requests a token twice
- **THEN** the two returned tokens are different values with the `cfp_` prefix

#### Scenario: Oversized token input is rejected before storage access

- **WHEN** a request carries an `X-API-Token` longer than 64 characters
- **THEN** the API responds 401 without reading KV

### Requirement: Logs SHALL NOT contain raw lookup subjects

Structured logs SHALL identify visitor or queried IPs only by a truncated
SHA-256 hash (`ip_hash`), never the raw address.

#### Scenario: Upstream rate-limit log is hashed

- **WHEN** an IPbot lookup logs `ipbot.ratelimit`
- **THEN** the log line contains `ip_hash` and no raw IP field

### Requirement: `/my-ip` SHALL meter the paid risk lookup

`/my-ip` SHALL always serve geolocation from `request.cf` at zero upstream
cost, and SHALL invoke the paid IP intelligence lookup only within a
per-visitor daily cap and the shared global daily budget. On cap exhaustion
the response SHALL degrade to geo-only (the `risk` field is optional).

#### Scenario: Visitor over the daily risk cap gets geo-only

- **WHEN** a visitor exceeds the per-visitor daily risk-lookup cap
- **THEN** `/my-ip` returns 200 with geolocation and no `risk` block, and no
  upstream request is made

### Requirement: Upstream failures SHALL be negative-cached

A final upstream 429 or ≥500 failure SHALL be cached for a short TTL so
repeat lookups of the same IP short-circuit without contacting upstream.

#### Scenario: Repeat lookup after upstream failure

- **WHEN** a lookup fails upstream with 429 and the same IP is looked up
  again within the negative-cache TTL
- **THEN** the second lookup fails fast with the mapped error and performs
  zero upstream requests

### Requirement: Token minting SHALL be origin-locked in browsers

CORS for `/v1/token` SHALL allow only the configured site origin
(production fallback `https://creepjs.org`). Data endpoints remain `*` by
design; their security boundary is token auth and rate limiting.

#### Scenario: Third-party page cannot mint tokens

- **WHEN** a cross-origin browser page preflights `POST /v1/token`
- **THEN** the response does not allow the foreign origin

#### Scenario: Data endpoints stay publicly consumable

- **WHEN** any origin calls `/v1/fingerprint` or `/v1/ip/public/:ip`
- **THEN** CORS allows the request (`Access-Control-Allow-Origin: *`)

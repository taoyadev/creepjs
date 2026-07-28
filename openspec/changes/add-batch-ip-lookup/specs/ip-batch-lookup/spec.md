## ADDED Requirements

### Requirement: Bounded Authenticated Batch Lookup

The API SHALL expose `POST /v1/ip/batch` to authenticated token holders and
accept a bounded JSON envelope containing 1–50 IP-literal strings.

#### Scenario: Valid batch request

- **WHEN** a client submits 1–50 bounded IP strings with a valid `X-API-Token`
- **THEN** the API normalizes and deduplicates the strings in first-seen order
  and processes the resulting unique addresses

#### Scenario: Invalid authentication

- **WHEN** the token is missing or invalid
- **THEN** the API returns `401` without contacting the IP-intelligence provider

#### Scenario: Unsafe request envelope

- **WHEN** the body exceeds 8 KiB, `ips` is missing or not an array, the array
  is empty or exceeds 50 entries, or an entry is empty or longer than 45
  characters after trimming
- **THEN** the API returns a request-level client error without contacting the
  IP-intelligence provider

### Requirement: Lookup-Unit Quota Reservation

The API MUST reserve daily quota before batch execution using one unit per
unique syntactically valid IP, with a minimum cost of one unit per accepted
batch envelope, including cache hits.

#### Scenario: Sufficient quota

- **WHEN** the token has enough remaining units for the complete batch cost
- **THEN** the API reserves that cost, exposes unit-based rate-limit headers,
  and begins lookup execution

#### Scenario: Insufficient quota

- **WHEN** reserving the complete batch would exceed the token's daily limit
- **THEN** the API returns `429` and performs zero IP-intelligence lookups

#### Scenario: Duplicate and invalid inputs

- **WHEN** a batch contains duplicates and bounded malformed IP strings
- **THEN** duplicates do not multiply quota cost, malformed IPs do not consume
  additional units, and an invalid-only batch still consumes one unit

### Requirement: Safe Serial Execution and Partial Results

The API SHALL execute unique valid lookups serially, return item-level outcomes
for local input errors, and stop contacting the provider after a dependency-wide
failure.

#### Scenario: Mixed valid and invalid addresses

- **WHEN** one bounded entry is not a valid IP literal and other entries are
  valid
- **THEN** the invalid entry receives a per-item error while valid entries are
  processed in order

#### Scenario: Dependency failure after success

- **WHEN** at least one lookup succeeds and a later lookup receives provider
  throttling, provider authentication/configuration failure, network failure,
  or provider `5xx`
- **THEN** the API returns explicit partial and aborted metadata, marks later
  addresses skipped, and makes no more provider calls

#### Scenario: Dependency failure before success

- **WHEN** the first attempted lookup fails with a dependency-wide error
- **THEN** the API returns the mapped request-level `429`, `502`, or `503`,
  propagates `Retry-After` when available, and makes no later provider calls

### Requirement: Privacy-Preserving Batch Observability

The system MUST keep API tokens and submitted address pools out of URLs,
persistent browser storage, analytics properties, CSV output, and application
logs while retaining count- and status-level operational telemetry.

#### Scenario: Batch telemetry

- **WHEN** a batch completes, partially completes, or aborts
- **THEN** structured logs may contain request ID, counts, quota cost, cache and
  risk totals, and statuses but contain no raw submitted IP or API token

#### Scenario: Approximate usage telemetry

- **WHEN** token usage is recorded in KV
- **THEN** product documentation identifies it as best-effort telemetry and not
  an atomic billing ledger

### Requirement: Accessible Batch Workspace and Safe CSV

The `/ip` page SHALL provide an accessible batch workflow that accepts up to 50
addresses, reports complete and partial outcomes, and exports a fixed-column CSV
without exposing the API token.

#### Scenario: Successful operator workflow

- **WHEN** a user enters a token and a bounded list of addresses and submits it
- **THEN** the page reports loading, summary, and row outcomes with semantic
  labels, focus management, and a keyboard-operable result table

#### Scenario: Partial result export

- **WHEN** a batch contains both successful and failed or skipped rows
- **THEN** the user can export all rows with explicit status/error columns and
  without the API token

#### Scenario: Spreadsheet formula safety

- **WHEN** an exported text cell begins with a spreadsheet formula trigger
- **THEN** the CSV serializer neutralizes the trigger before RFC 4180 escaping

#### Scenario: Mobile result review

- **WHEN** the workspace is used at a narrow viewport
- **THEN** controls remain readable and the result table can be reviewed without
  page-level horizontal overflow

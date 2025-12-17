## ADDED Requirements

### Requirement: Fingerprint Uniqueness Ranking

The system MUST provide an API endpoint and frontend UI to compare a user's fingerprint against an anonymized database, calculating and displaying uniqueness as "1-in-X" messaging and percentile rank.

#### Scenario: Uniqueness comparison successful

- **GIVEN** a user generates a fingerprint with ID "abc123"
- **WHEN** they request uniqueness comparison via `POST /v1/fingerprint/compare { fingerprintId: 'abc123' }`
- **THEN** the API queries Cloudflare D1 to calculate uniqueness (e.g., "1-in-500"), percentile rank (e.g., 99.8%), and returns JSON `{ uniqueness: 500, percentile: 99.8, componentRarity: {...} }`.

#### Scenario: Display uniqueness on demo page

- **GIVEN** the uniqueness data is returned from the API
- **WHEN** the frontend renders the comparison section
- **THEN** it displays "Your fingerprint is 1-in-500 unique" prominently, shows a percentile badge ("Top 0.2%"), and includes a heat map visualization with each component color-coded by rarity (green = common, red = rare).

### Requirement: Component Rarity Scoring

The system MUST calculate and display rarity scores (0-100%) for each of the 21 fingerprint components, indicating how common or rare each value is compared to the database population.

#### Scenario: Component rarity calculation

- **GIVEN** a fingerprint with Canvas hash "xyz789"
- **WHEN** the API calculates component rarity
- **THEN** it queries D1 for the count of fingerprints with matching Canvas hash, calculates rarity as `(total - matches) / total * 100`, and includes in response `{ componentRarity: { canvas: 95.2, webgl: 12.3, ... } }`.

#### Scenario: Heat map visualization

- **GIVEN** component rarity scores are available
- **WHEN** the frontend renders the heat map
- **THEN** each component is displayed with a color indicating rarity (green for <25%, yellow for 25-75%, red for >75%), and hovering shows tooltip with exact rarity percentage.

### Requirement: Anonymized Fingerprint Storage

The system MUST store fingerprints in Cloudflare D1 as hashed values only, never storing raw data, IP addresses, or personally identifiable information, with automatic cleanup of fingerprints older than 90 days.

#### Scenario: Fingerprint storage on submission

- **GIVEN** a user generates a fingerprint
- **WHEN** the fingerprint is submitted via `POST /v1/fingerprint`
- **THEN** the API hashes the fingerprint ID with SHA-256, stores only the hash and component hashes in D1 with timestamp, and does not store IP address, user agent, or any PII.

#### Scenario: Automatic cleanup of old fingerprints

- **GIVEN** a Cloudflare Workers Cron trigger runs daily
- **WHEN** the cleanup job executes
- **THEN** it deletes all fingerprints from D1 with `created_at < (now() - 90 days)`, logs the count of deleted records, and confirms success.

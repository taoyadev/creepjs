## ADDED Requirements

### Requirement: Persistent Fingerprint Timeline

The system MUST use Cloudflare Durable Objects to store fingerprint history per visitor ID, allowing retrieval of chronological timelines and anomaly detection for security purposes.

#### Scenario: Store fingerprint in timeline

- **GIVEN** a user generates a fingerprint with visitor ID "visitor123"
- **WHEN** `POST /v1/history/visitor123` is called with fingerprint data
- **THEN** the Durable Object for "visitor123" appends the fingerprint to its timeline with timestamp, stores in persistent storage, and returns success confirmation.

#### Scenario: Retrieve fingerprint timeline

- **GIVEN** a visitor ID "visitor123" with 5 historical fingerprints
- **WHEN** `GET /v1/history/visitor123` is called
- **THEN** it returns JSON array with all fingerprints sorted chronologically, includes timestamps and component hashes, and calculates time between each change.

### Requirement: Anomaly Detection

The system MUST detect significant fingerprint changes that may indicate account takeovers or session hijacking, alerting when >30% of components change between visits.

#### Scenario: Normal fingerprint change (no anomaly)

- **GIVEN** a visitor's fingerprint changes only in Screen resolution (minor upgrade)
- **WHEN** the new fingerprint is stored
- **THEN** anomaly detection calculates <30% component change, marks as "normal", and stores without alert.

#### Scenario: Anomaly detected (significant change)

- **GIVEN** a visitor's fingerprint changes in Canvas, WebGL, Fonts, and Navigator (4+ major components)
- **WHEN** the new fingerprint is stored
- **THEN** anomaly detection calculates >30% component change, marks as "anomaly", logs alert, and includes "possible account takeover" flag in response.

### Requirement: User Privacy Controls

The system MUST allow users to opt out of history tracking and delete their stored timeline on request, with automatic expiration after 90 days.

#### Scenario: User opts out of tracking

- **GIVEN** a user enables "Do Not Track History" option
- **WHEN** they generate a fingerprint
- **THEN** no history is stored in Durable Objects, fingerprint still works normally, and opt-out preference is respected in localStorage.

#### Scenario: User-initiated deletion

- **GIVEN** a user requests deletion of their history
- **WHEN** they call `DELETE /v1/history/:visitorId`
- **THEN** the Durable Object deletes all timeline data, confirms deletion, and returns "History deleted successfully" message.

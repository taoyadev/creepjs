# web-task-experience Specification

## Purpose

Define task-first interaction, qualified diagnostic states, recovery, accessibility, and explicit privacy boundaries for the existing 65 CreepJS page URLs.

## Requirements

### Requirement: Task-first existing routes

The existing 65 routes SHALL retain their public URLs and render one
task-oriented H1, the core controls or truthful automatic loading state, and
the nearest material method or privacy limit before unrelated explanation.

#### Scenario: A visitor opens a tool on a narrow viewport

- **WHEN** a tool is opened on desktop or mobile
- **THEN** its core control or report region is in the first useful viewport
  and supporting content does not replace the tool during collection

### Requirement: Fingerprint-first homepage

The homepage SHALL lead with the visitor's own browser fingerprint. Its first
task region SHALL start the local scan without an action once the page is
interactive, report progress from actual collector events, and then show the
diagnostic ID with a summary of observed browser signals. Signals that were
not returned SHALL be labelled as missing. The own-IP summary SHALL remain on
the page as secondary context. A rerun SHALL keep the previous result visible
until the new scan finishes or fails.

#### Scenario: A visitor opens the homepage on a phone

- **WHEN** the homepage loads in a 390 × 844 viewport
- **THEN** the scan starts without a click and the diagnostic ID region is
  inside the first viewport

#### Scenario: A rerun fails

- **WHEN** a completed homepage result exists and the next scan fails
- **THEN** the previous ID and signals stay visible with an error that offers
  another attempt

### Requirement: Qualified diagnostic states

Tools SHALL distinguish idle, loading, success, invalid, empty/no-result,
partial, and error where applicable. Zero and false SHALL remain valid returned
values; missing evidence SHALL NOT be presented as safety or low risk.

#### Scenario: The IP provider returns location without risk data

- **WHEN** an IP response lacks a usable risk score or classification
- **THEN** available fields remain visible, missing fields are identified, and
  the tool describes risk as unavailable rather than low

#### Scenario: A browser API is unsupported

- **WHEN** a collector returns no value or an explicit unsupported status
- **THEN** the page explains the unavailable observation without inventing a
  signal, identity, population estimate, or risk conclusion

### Requirement: Input ownership and recovery

User input SHALL take precedence over delayed auto-detection. Requests SHALL
support bounded waiting and preserve usable input or previous reports on error.
Non-idempotent API requests SHALL NOT be automatically replayed.

#### Scenario: Detection finishes after the visitor edits an IP

- **WHEN** the visitor types an address before own-IP detection finishes
- **THEN** detection does not overwrite the typed value

#### Scenario: A cancelled request completes late

- **WHEN** an older request is cancelled and a newer request completes
- **THEN** the older response does not replace the newer report

### Requirement: Actionable signal investigation

The signal index SHALL support search, category selection, and no-match
recovery while retaining static discovery links. Signal pages SHALL provide
readable values, complete inspectable JSON with image payloads omitted, and
an in-memory comparison for a setting change.

#### Scenario: A visitor compares one changed setting

- **WHEN** a visitor keeps a signal result and reruns the same check
- **THEN** changed fields are identified without treating any change as proof
  of improved privacy or identity

### Requirement: Explicit optional network boundaries

Population comparison SHALL occur only after the visitor requests it and sees
the disclosed subset. Individual WebRTC and full-consistency signal checks
SHALL require an action with a STUN disclosure. The automatic full scans on
the homepage and the checker SHALL disclose their STUN contact next to the
scan, and the checker SHALL also disclose its local-history behavior.

#### Scenario: A normal checker scan completes

- **WHEN** the local scan completes without an optional comparison action
- **THEN** no population-comparison request is sent and the local report is
  usable independently

#### Scenario: The homepage scan starts on load

- **WHEN** a visitor opens the homepage
- **THEN** the STUN disclosure is visible beside the automatic scan, no
  population-comparison request is sent, and no scan history is saved

### Requirement: Playground credential and response clarity

The playground SHALL keep tokens in tab memory, mask them by default, explain
that token issuance does not send email, and require a choice before including
the token in visible and copied examples. Responses SHALL expose HTTP status,
timing, returned data, and empty/partial/error recovery.

#### Scenario: An authenticated request fails

- **WHEN** the API rejects a token or times out
- **THEN** the token and collected snapshot remain usable for manual recovery
  and no credential is written to storage, analytics, or a URL

### Requirement: Accessible progressive interaction

The UI SHALL provide a skip link, labelled controls, visible keyboard focus,
touch-sized actions, mobile-readable inputs, concise live status, reduced-motion
support, and static explanations. Clipboard failures SHALL offer manual-copy
recovery.

#### Scenario: Clipboard access is denied

- **WHEN** copying fails
- **THEN** a non-blocking message explains that the visitor can select and
  copy the visible text manually

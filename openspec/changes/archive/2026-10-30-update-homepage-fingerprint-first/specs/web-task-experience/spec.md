## ADDED Requirements

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

## MODIFIED Requirements

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

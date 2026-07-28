## ADDED Requirements

### Requirement: Static Checker Content Shell

The `/checker` route SHALL remain statically exportable and SHALL emit visible
HTML containing exactly one page heading, a task explanation, signal taxonomy,
privacy promise, and visible frequently asked questions before client
JavaScript runs.

#### Scenario: Crawler or no-JavaScript reader opens the checker

- **WHEN** the exported checker HTML is read without executing client scripts
- **THEN** the page heading and substantial explanatory content are present
  instead of only a loading spinner

### Requirement: In-Slot Browser Scan

The live fingerprint scan SHALL run as a client island inside the checker task
region and SHALL NOT replace the whole viewport with its loading, error, or
result state.

#### Scenario: Scan is in progress

- **WHEN** collectors are running
- **THEN** the task region reports bounded progress and the surrounding
  navigation and explanatory content remain available

#### Scenario: Scan fails

- **WHEN** collection fails
- **THEN** the task region presents a retry action without removing the static
  page shell

### Requirement: Honest URL-Owned Context

The checker SHALL use URL parameters for selected tabs and optional shared
snapshot context without claiming to reproduce another browser's fingerprint.

#### Scenario: Collector tab is shared

- **WHEN** a user opens a supported `?tab=` value
- **THEN** the corresponding category is selected and subsequent selection
  updates the URL without a full navigation

#### Scenario: Snapshot context is shared

- **WHEN** a user opens `?fp=` with optional coverage and baseline context
- **THEN** the page labels that context as a snapshot while independently
  running and presenting the recipient's own scan

### Requirement: Navigable Long-Page Results

The checker SHALL provide semantic anchors and a sticky section navigation that
progressively identifies the active section without preventing ordinary anchor
navigation.

#### Scenario: Keyboard user navigates sections

- **WHEN** a keyboard user activates a section link
- **THEN** focus and scroll reach the named section without it being hidden
  behind sticky navigation

### Requirement: Honest Baseline Warming

The checker SHALL suppress rarity percentages while the production sample count
is below the k-anonymity threshold of 20.

#### Scenario: Baseline has fewer than 20 samples

- **WHEN** the checker receives a baseline sample count below 20
- **THEN** rarity UI states `baseline warming up (N/20)` and does not render an
  inferred rarity percentage

### Requirement: Accessible and Restrained Checker Motion

Scan progress SHALL be announced live, category descriptions SHALL be available
through accessible disclosure or tooltip semantics, and motion SHALL be limited
to state, reveal, and active-indicator changes with reduced-motion support.

#### Scenario: User prefers reduced motion

- **WHEN** `prefers-reduced-motion: reduce` is active
- **THEN** the checker remains fully usable with non-essential movement
  effectively disabled

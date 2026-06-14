## ADDED Requirements

### Requirement: Inconsistency Validation Rules

The system MUST implement 20+ validation rules to detect inconsistencies between fingerprint components (e.g., userAgent vs Canvas GPU, timezone vs locale) and anti-fingerprinting tools.

#### Scenario: userAgent vs Canvas GPU mismatch detected

- **GIVEN** a fingerprint claims Windows OS in userAgent but Canvas reveals Mac GPU
- **WHEN** lie detection runs
- **THEN** it flags "userAgent/Canvas mismatch", deducts 10 points from confidence score, and includes explanation "Operating system mismatch detected".

#### Scenario: Canvas Blocker detected

- **GIVEN** Canvas returns randomized noise pattern (characteristic of Canvas Blocker)
- **WHEN** lie detection analyzes Canvas data
- **THEN** it detects random noise signature, flags "Canvas Blocker detected", deducts 15 points, and warns "Fingerprint may be unreliable".

### Requirement: Confidence Scoring

The system MUST calculate a confidence score (0-100) based on detected inconsistencies, starting at 100 and deducting points per failed rule weighted by severity.

#### Scenario: High confidence (no issues)

- **GIVEN** a fingerprint passes all 20+ consistency checks
- **WHEN** confidence score is calculated
- **THEN** it returns 100, displays "High Confidence" badge (green), and shows "No inconsistencies detected" message.

#### Scenario: Low confidence (multiple issues)

- **GIVEN** a fingerprint fails 5 checks (userAgent mismatch, Canvas Blocker, timezone conflict, fake resolution, automation detected)
- **WHEN** confidence score is calculated
- **THEN** it returns score 45, displays "Low Confidence" badge (red), and lists all detected issues with explanations.

### Requirement: Anti-Fingerprinting Tool Detection

The system MUST detect common anti-fingerprinting browser extensions and privacy modes (Canvas Blocker, Brave shields, Firefox Resist Fingerprinting).

#### Scenario: Brave shields detected

- **GIVEN** WebGL and Canvas APIs return "blocked" or null values
- **WHEN** tool detection runs
- **THEN** it identifies "Brave Browser with shields enabled", explains blocked APIs, and adjusts confidence score accordingly.

#### Scenario: Firefox Resist Fingerprinting detected

- **GIVEN** timezone is UTC, screen resolution is 1920x1080, and Canvas returns identical hash across tests
- **WHEN** tool detection analyzes patterns
- **THEN** it flags "Firefox Resist Fingerprinting mode likely enabled", explains fake values, and warns fingerprint may not be unique.

## ADDED Requirements

### Requirement: Source-Based Fingerprint Pipeline

The core engine MUST expose a source registry that executes entropy collectors concurrently, captures per-source duration/error data, and feeds `collectFingerprint()` with a structured `components` object for hashing and confidence scoring.

#### Scenario: Successful registry execution

- **GIVEN** the registry contains canvas, webgl, navigator, screen, fonts, timezone, and audio sources
- **WHEN** `collectFingerprint()` runs on a supported browser
- **THEN** each source resolves to a `Component` with `{ value, duration }`, the function hashes the canonicalized component set into `fingerprintId`, and `confidence` reflects the ratio of successful sources.

#### Scenario: Source failure handled gracefully

- **GIVEN** the audio source throws (unsupported API)
- **WHEN** the registry executes
- **THEN** the audio component records `{ error, duration }`, `collectFingerprint()` continues without throwing, confidence decreases accordingly, and telemetry flags the failure for UI/API consumers.

### Requirement: Expanded Collector Coverage

The engine MUST add at least 10 new collectors (domBlockers, fontPreferences, colorGamut, contrast, forcedColors, monochrome, reducedMotion, reducedTransparency, hdr, audioBaseLatency, applePay) and surface their data in the demo UI and API responses.

#### Scenario: Accessibility collectors in UI

- **GIVEN** a visitor with forced colors enabled and reduced motion preference
- **WHEN** the demo renders the Privacy/Accessibility section
- **THEN** it displays "Forced Colors: enabled" and "Reduced Motion: prefers-reduced" sourced from the new collectors, including timing/status badges.

#### Scenario: API exposes new collectors

- **GIVEN** the SDK posts fingerprint data containing `domBlockers` and `audioBaseLatency`
- **WHEN** `/v1/fingerprint` responds
- **THEN** the JSON payload echoes the provided `fingerprintId`, includes `confidence`, and returns a `collectors` map where `domBlockers` and `audioBaseLatency` entries show status/value for the front-end.

### Requirement: Documentation & Testing Coverage

The refactor MUST include documentation describing the source pipeline and new collectors, plus automated tests covering scheduler behavior and each collector's main branches.

#### Scenario: Docs describe pipeline

- **GIVEN** a developer reads the updated Docs → Architecture → Fingerprint Engine section
- **WHEN** they follow the instructions
- **THEN** they can see how to add a new source (interface, registry entry, testing expectations) with references to the new collectors.

#### Scenario: Tests guard scheduler

- **GIVEN** the scheduler unit tests run in CI
- **WHEN** a contributor accidentally removes the idle-yield behavior
- **THEN** tests fail because they assert that between synchronous sources the scheduler yields control (verifying `mapWithBreaks` behavior), preventing regressions.

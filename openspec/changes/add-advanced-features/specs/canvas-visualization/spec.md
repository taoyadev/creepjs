## ADDED Requirements

### Requirement: Deterministic Fingerprint Visualization

The system MUST generate unique SVG artwork ("Fingerprint DNA") from fingerprint components using a deterministic algorithm, ensuring the same fingerprint always produces identical visuals.

#### Scenario: SVG generation from fingerprint

- **GIVEN** a fingerprint with specific Canvas, WebGL, Font, and Timezone values
- **WHEN** visualization is requested
- **THEN** it generates SVG with color gradient from Canvas hash (HSL), shapes from WebGL params (circles, triangles), pattern density from font count, rotation from timezone offset, and outputs 1200x630px SVG.

#### Scenario: Deterministic output verification

- **GIVEN** the same fingerprint ID "abc123" is visualized twice
- **WHEN** both SVGs are compared
- **THEN** they are byte-for-byte identical, visual appearance is identical, and algorithm confirms deterministic behavior.

### Requirement: Visual Uniqueness

The visualization algorithm MUST ensure that different fingerprints produce visually distinct artwork, with no collisions in a dataset of 10,000+ fingerprints.

#### Scenario: Uniqueness test with large dataset

- **GIVEN** 10,000 unique fingerprints
- **WHEN** visualizations are generated for all
- **THEN** all SVGs are visually distinct (no identical artwork), color/shape combinations are unique per fingerprint, and human review confirms no perceptual collisions.

### Requirement: Social Media Sharing

The web app MUST allow users to download fingerprint visualizations as SVG files and share on social media with rich previews.

#### Scenario: Download SVG

- **GIVEN** a user views their fingerprint DNA visualization
- **WHEN** they click "Download as SVG"
- **THEN** browser triggers download of `fingerprint-dna-[id].svg` file, SVG opens correctly in vector editors (Illustrator, Figma), and file size is <100KB.

#### Scenario: Social media preview

- **GIVEN** a user shares a fingerprint URL with embedded visualization
- **WHEN** Twitter/LinkedIn fetches Open Graph metadata
- **THEN** it displays rich preview card with fingerprint DNA image (1200x630px), title "My Browser Fingerprint DNA", and description "Unique digital fingerprint visualization from CreepJS.org".

## ADDED Requirements

### Requirement: Tor Browser Detection

The system MUST detect Tor Browser usage by analyzing navigator properties, timezone (always UTC), and optional IP reputation checks against known Tor exit nodes.

#### Scenario: Tor Browser detected

- **GIVEN** a user accesses the site via Tor Browser
- **WHEN** privacy mode detection runs
- **THEN** it checks navigator.productSub (Tor-specific value), verifies timezone is UTC, matches IP against Tor exit node list (optional), and displays "Tor Browser detected" with 99%+ confidence.

#### Scenario: Regular browser (false positive check)

- **GIVEN** a user in UK with timezone set to UTC manually
- **WHEN** privacy mode detection runs
- **THEN** it checks navigator.productSub (normal value), finds no Tor signatures, and does NOT flag as Tor Browser despite UTC timezone.

### Requirement: VPN/Proxy Detection

The system MUST detect VPN and proxy usage by integrating with IP reputation APIs, DNS leak testing, and WebRTC IP exposure checks.

#### Scenario: VPN detected via IP reputation

- **GIVEN** a user connects through a commercial VPN (NordVPN, ExpressVPN)
- **WHEN** privacy mode detection queries IP reputation (via my-ip-data API)
- **THEN** it receives `isVPN: true` from API, displays "VPN detected", shows VPN provider name (if available), and flags in detection results.

#### Scenario: DNS leak test

- **GIVEN** a user's DNS resolver location differs from IP geolocation
- **WHEN** DNS leak test runs
- **THEN** it compares DNS resolver country to IP country, detects mismatch, flags "Possible VPN/proxy (DNS leak)", and explains the discrepancy.

### Requirement: Privacy Browser Detection

The system MUST detect privacy-focused browsers and modes (Brave shields, Safari Private mode, Firefox Resist Fingerprinting) by analyzing blocked APIs and fake values.

#### Scenario: Brave shields detected

- **GIVEN** a user browses with Brave and shields enabled
- **WHEN** privacy mode detection checks API availability
- **THEN** it finds WebGL blocked, Canvas returns null, detects Brave-specific blocking patterns, and displays "Brave Browser with shields enabled".

#### Scenario: Safari Private mode detected

- **GIVEN** a user browses in Safari Private mode
- **WHEN** privacy mode detection tests storage quota
- **THEN** it finds localStorage quota is 0 or very low, detects Safari Private mode, and displays "Safari Private Browsing mode".

#### Scenario: Firefox Resist Fingerprinting detected

- **GIVEN** a user enables Firefox privacy.resistFingerprinting setting
- **WHEN** privacy mode detection analyzes fingerprint values
- **THEN** it finds timezone is UTC, screen is 1920x1080, Canvas hash is generic, detects fake value patterns, and displays "Firefox Resist Fingerprinting enabled".

### Requirement: Ethical Detection Labeling

The system MUST clearly label privacy tool detection as "educational" and explain why detection occurs, respecting user privacy choices.

#### Scenario: Detection results display

- **GIVEN** Tor Browser is detected
- **WHEN** results are shown to user
- **THEN** it displays "Educational Detection: Tor Browser" with explanation "We detected Tor to demonstrate fingerprinting limitations, not to track you", includes privacy policy link, and confirms no data is logged differently for Tor users.

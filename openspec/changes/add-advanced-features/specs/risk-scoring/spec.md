## ADDED Requirements

### Requirement: Statistical Risk Model

The system MUST calculate a fraud risk score (0-100) based on fingerprint uniqueness, lie detection confidence, VPN/proxy usage, and browser automation detection, weighted by configurable factors.

#### Scenario: Low risk score (legitimate user)

- **GIVEN** a fingerprint with moderate uniqueness (1-in-50), high confidence (95), no VPN, no automation
- **WHEN** risk score is calculated
- **THEN** it returns score 15 (low risk), displays green "Low Risk" badge, and explains "Fingerprint appears legitimate".

#### Scenario: High risk score (potential fraud)

- **GIVEN** a fingerprint with extreme uniqueness (1-in-10000), low confidence (45), VPN detected, automation tools found
- **WHEN** risk score is calculated
- **THEN** it returns score 85 (high risk), displays red "High Risk" badge, and lists factors: "Unusual fingerprint, inconsistencies detected, VPN usage, automation tools".

### Requirement: Cloudflare Workers AI Integration with Fallback

The system MUST support optional Cloudflare Workers AI for ML-based risk prediction and MUST implement fallback to rule-based scoring if AI is unavailable or exceeds quota.

#### Scenario: Workers AI inference successful

- **GIVEN** Workers AI binding is configured and quota available
- **WHEN** risk scoring is requested
- **THEN** it sends fingerprint features to Workers AI model, receives prediction (risk probability), combines with rule-based score (weighted average), and returns hybrid risk score with "ML-enhanced" label.

#### Scenario: Workers AI unavailable (fallback)

- **GIVEN** Workers AI quota exceeded or service unavailable
- **WHEN** risk scoring is requested
- **THEN** it falls back to pure rule-based scoring, returns risk score without ML component, logs warning, and continues without errors.

### Requirement: Risk Explanation

The system MUST provide human-readable explanations for risk scores, listing contributing factors and their weights.

#### Scenario: Risk breakdown display

- **GIVEN** a risk score of 65
- **WHEN** the frontend displays risk results
- **THEN** it shows score gauge (yellow zone), lists factors: "Uniqueness (40 points), Low confidence (20 points), VPN detected (5 points)", and provides actionable insights "This fingerprint shows signs of spoofing or privacy tools".

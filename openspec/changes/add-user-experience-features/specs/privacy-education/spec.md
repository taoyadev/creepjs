## ADDED Requirements

### Requirement: Interactive Privacy Tutorial

The web app MUST provide an interactive step-by-step tutorial that explains each of the 21 fingerprint components, what data they reveal, their risk level, and protection recommendations.

#### Scenario: Tutorial walkthrough

- **GIVEN** a user clicks "Learn about fingerprinting" on the demo page
- **WHEN** the tutorial modal opens
- **THEN** it displays step 1 of 21 with Canvas component explanation, includes description ("Canvas fingerprinting uses HTML5 Canvas API to detect GPU and font rendering differences"), what it reveals ("GPU model, driver version, font rendering engine"), risk level badge (red for "High"), and Next/Previous navigation buttons.

#### Scenario: Tutorial progress tracking

- **GIVEN** a user is on step 10 of the tutorial
- **WHEN** they navigate through steps
- **THEN** a progress indicator shows "Step 10 of 21", completed steps are marked with checkmarks, and clicking on any completed step allows jumping back to that section.

#### Scenario: Tutorial completion

- **GIVEN** a user reaches step 21
- **WHEN** they click "Finish"
- **THEN** the tutorial modal closes, a completion badge appears on their profile (if implemented), and they receive a summary of high-risk components detected in their browser.

### Requirement: Risk Level Classification

The system MUST classify each fingerprint component as Low, Medium, or High risk based on how much personally identifiable or unique information it reveals, and display risk levels with color-coded badges.

#### Scenario: Risk level display

- **GIVEN** a fingerprint includes Canvas (High), Navigator (Low), and Screen (Medium) components
- **WHEN** the frontend renders component details
- **THEN** each component shows a colored badge (red for High, yellow for Medium, green for Low) and includes a tooltip explaining the risk classification criteria.

#### Scenario: Privacy Score calculation

- **GIVEN** a fingerprint with 5 High-risk, 10 Medium-risk, and 6 Low-risk components
- **WHEN** the Privacy Score is calculated
- **THEN** it uses formula `100 - (Σ(riskLevel * present) / maxPossibleRisk * 100)`, returns a score (e.g., 75), and displays with gauge visualization labeled "Good Privacy" (>80), "Fair Privacy" (50-80), or "Weak Privacy" (<50).

### Requirement: Personalized Protection Recommendations

The system MUST analyze a user's fingerprint configuration and provide personalized, actionable recommendations for improving privacy protection.

#### Scenario: WebGL protection recommendation

- **GIVEN** a user's fingerprint includes WebGL with unique GPU signature
- **WHEN** protection recommendations are generated
- **THEN** the system suggests "Consider disabling WebGL in browser settings or using Privacy Badger extension to block WebGL fingerprinting" with links to instructions.

#### Scenario: Canvas protection recommendation

- **GIVEN** a user's fingerprint includes Canvas with rare rendering signature
- **WHEN** protection recommendations are generated
- **THEN** the system suggests "Enable 'Block Canvas Fingerprinting' in Brave browser or install CanvasBlocker extension for Firefox/Chrome" with download links.

#### Scenario: Multiple recommendations prioritized

- **GIVEN** a user has 8 high-risk components detected
- **WHEN** recommendations are displayed
- **THEN** they are sorted by impact (high-risk first), limited to top 5 most actionable suggestions, and each includes difficulty rating ("Easy", "Moderate", "Advanced").

### Requirement: Interactive Privacy Quiz

The web app MUST provide a 5-question multiple-choice quiz to test user understanding of fingerprinting concepts, with immediate feedback and explanations for incorrect answers.

#### Scenario: Quiz question display

- **GIVEN** a user starts the privacy quiz
- **WHEN** question 1 is shown
- **THEN** it displays the question ("What does Canvas fingerprinting primarily reveal?"), 4 multiple-choice options, and a Submit button.

#### Scenario: Correct answer feedback

- **GIVEN** a user selects the correct answer
- **WHEN** they click Submit
- **THEN** the option is highlighted in green, a checkmark appears, and a brief explanation is shown ("Correct! Canvas fingerprinting reveals GPU and font rendering differences.").

#### Scenario: Incorrect answer feedback

- **GIVEN** a user selects an incorrect answer
- **WHEN** they click Submit
- **THEN** the selected option is highlighted in red, the correct option is highlighted in green, and an explanation is shown explaining why the correct answer is right.

#### Scenario: Quiz results summary

- **GIVEN** a user completes all 5 questions
- **WHEN** the quiz ends
- **THEN** it displays their score (e.g., "4 out of 5 correct"), provides a rating ("Fingerprinting Expert" for 5/5, "Privacy Aware" for 3-4/5, "Keep Learning" for 0-2/5), and offers a "Retake Quiz" button.

### Requirement: Data Deletion and Privacy Policy

The web app MUST provide a clear privacy policy explaining data collection practices and offer users a mechanism to delete their fingerprint data from the database.

#### Scenario: Privacy policy access

- **GIVEN** a user visits the privacy policy page (`/privacy`)
- **WHEN** the page loads
- **THEN** it displays a clear explanation of what data is collected (hashed fingerprints only), why it's collected (uniqueness comparison), how long it's stored (90 days), and how to opt out.

#### Scenario: Data deletion request

- **GIVEN** a user wants to delete their fingerprint from the database
- **WHEN** they click "Delete my data" on the privacy page and confirm
- **THEN** the frontend calls `DELETE /v1/fingerprint/[id]`, the API removes the fingerprint hash from D1, and a confirmation message is displayed ("Your data has been deleted.").

#### Scenario: GDPR/CCPA compliance statement

- **GIVEN** a user reads the privacy policy
- **WHEN** they scroll to the compliance section
- **THEN** it includes statements confirming GDPR and CCPA compliance, explains user rights (access, deletion, portability), and provides contact information for privacy inquiries.

# Tasks: add-user-experience-features

## 1. Fingerprint Uniqueness Comparison

- [ ] 1.1 Design Cloudflare D1 database schema for fingerprint storage
  - Create `fingerprints` table with columns: `id`, `fingerprint_hash`, `component_hashes` (JSON), `created_at`
  - Add indexes on `fingerprint_hash` and `created_at`
  - Write migration script in `apps/api/migrations/`
- [ ] 1.2 Implement API endpoint for fingerprint submission and comparison
  - `POST /v1/fingerprint/compare` accepts fingerprint ID
  - Query D1 to calculate percentile rank (1-in-X uniqueness)
  - Return JSON: `{ uniqueness: 'X', percentile: 99.2, componentRarity: {...} }`
- [ ] 1.3 Create uniqueness calculation algorithm
  - Count total fingerprints in database
  - Count matching fingerprints for each component
  - Calculate rarity score: `(totalFingerprints - matchingFingerprints) / totalFingerprints * 100`
- [ ] 1.4 Build frontend comparison UI in `apps/web/app/demo/page.tsx`
  - Display "1-in-X" messaging prominently
  - Show heat map visualization (green = common, red = rare)
  - Add bar chart comparing user to population average
- [ ] 1.5 Implement D1 cleanup job to remove old fingerprints
  - Delete fingerprints older than 90 days
  - Run daily via Cloudflare Workers Cron Triggers
  - Log deletion count for monitoring

## 2. Export and Sharing

- [ ] 2.1 Install and configure `@react-pdf/renderer` in `apps/web`
  - Add dependency: `pnpm add @react-pdf/renderer`
  - Create PDF template component in `apps/web/components/pdf/FingerprintReport.tsx`
  - Style PDF to match brand (use Tailwind-like syntax for react-pdf)
- [ ] 2.2 Implement PDF generation and download
  - Create `generatePDF()` utility in `apps/web/lib/pdf.ts`
  - Trigger download on button click
  - Include all 21 components with explanatory text
  - Add CreepJS branding (logo, footer with URL)
- [ ] 2.3 Create share link API endpoint
  - `POST /v1/share` accepts fingerprint data, returns short URL
  - Generate random 7-character ID (alphanumeric)
  - Store in KV: `share:[id] -> { fingerprintData, createdAt, expiresAt }`
  - Return `{ shareUrl: 'https://creepjs.org/s/abc123' }`
- [ ] 2.4 Implement share link page at `apps/web/app/s/[id]/page.tsx`
  - Fetch data from API: `GET /v1/share/[id]`
  - Display read-only fingerprint view
  - Show expiration date if temporary
  - Add "Clone this fingerprint" button to generate own fingerprint
- [ ] 2.5 Add PNG/SVG export using `html-to-image`
  - Install `html-to-image` library
  - Create `exportAsImage()` utility
  - Capture fingerprint visualization div as PNG (1200x630px)
  - Trigger download on button click
- [ ] 2.6 Implement share link expiration cleanup
  - Cloudflare Workers Cron: daily job to delete expired links from KV
  - Query KV for keys with `expiresAt < now()`
  - Delete expired entries, log count

## 3. Privacy Education Module

- [ ] 3.1 Create education data structure for 21 components
  - JSON file: `apps/web/data/component-education.json`
  - Each component: `{ name, description, whatItReveals, riskLevel, examples, protectionTips }`
  - Risk levels: "low", "medium", "high"
- [ ] 3.2 Build interactive tutorial component
  - Create `apps/web/components/education/PrivacyTutorial.tsx`
  - Step-by-step walkthrough with Next/Previous buttons
  - Code highlighting for technical details (use `prism-react-renderer`)
  - Progress indicator (step 5 of 21)
- [ ] 3.3 Implement risk level visualization
  - Color-coded badges (green/yellow/red for low/medium/high)
  - Aggregate Privacy Score calculation algorithm
  - Display score with gauge component (0-100 scale)
- [ ] 3.4 Create personalized protection recommendations
  - `getRecommendations(components)` function in `apps/web/lib/privacy.ts`
  - If WebGL enabled → recommend "Consider blocking WebGL in browser settings"
  - If Canvas fingerprinting detected → suggest Privacy Badger extension
  - If many unique components → recommend Tor Browser for anonymity
- [ ] 3.5 Add interactive quiz to test understanding
  - 5-question multiple choice quiz
  - Questions: "What does Canvas fingerprinting reveal?" etc.
  - Show score at end with explanations for wrong answers
- [ ] 3.6 Create privacy policy and data deletion page
  - `apps/web/app/privacy/page.tsx` explaining data collection
  - "Delete my data" button → API call to remove fingerprint from D1
  - GDPR/CCPA compliance statements

## 4. Browser Compatibility Matrix

- [ ] 4.1 Create static compatibility data file
  - JSON file: `apps/web/data/browser-compatibility.json`
  - Structure: `{ component: { chrome: 'supported', firefox: 'partial', safari: 'blocked', ... } }`
  - Include version notes: `{ version: '15.4+', status: 'blocked', reason: 'Privacy protection' }`
- [ ] 4.2 Build compatibility matrix component
  - Table component: `apps/web/components/compatibility/BrowserMatrix.tsx`
  - Rows: 21 fingerprint components
  - Columns: Chrome, Firefox, Safari, Edge, Brave
  - Cell colors: green (supported), yellow (partial), red (blocked/unsupported)
- [ ] 4.3 Implement real-time feature detection
  - Run all 21 collectors in current browser
  - Compare results to expected behavior
  - Display "Your browser" column in matrix showing detected support
  - Highlight discrepancies (e.g., "Canvas blocked by extension")
- [ ] 4.4 Add known issues and workarounds documentation
  - Create `apps/web/app/compatibility/page.tsx`
  - Document common failures: "Safari 15.4+ blocks Canvas in private mode"
  - Provide fallback strategies for SDK users
  - Link to polyfill recommendations (e.g., "Use ua-parser-js for User Agent parsing")
- [ ] 4.5 Set up automated browser testing with Playwright
  - Create `tests/e2e/fingerprint-compatibility.spec.ts`
  - Test all 21 collectors across Chrome/Firefox/Safari/Edge
  - Generate compatibility report (JSON)
  - Update `browser-compatibility.json` automatically
  - Run weekly via GitHub Actions cron

## 5. Integration & Testing

- [ ] 5.1 Write unit tests for uniqueness calculation
  - Test percentile ranking algorithm
  - Test component rarity scoring
  - Mock D1 database responses
- [ ] 5.2 Write integration tests for export features
  - Test PDF generation (verify output is valid PDF)
  - Test share link creation and retrieval
  - Test PNG/SVG export (verify image dimensions)
- [ ] 5.3 Test privacy education module UX
  - Ensure all 21 components have education content
  - Verify quiz scoring logic
  - Test protection recommendations for various configurations
- [ ] 5.4 Test browser compatibility matrix
  - Verify real-time detection works in different browsers
  - Check static data accuracy against manual testing
  - Ensure matrix renders correctly on mobile devices
- [ ] 5.5 Run OpenSpec validation
  - Execute `openspec validate add-user-experience-features --strict`
  - Resolve any validation errors
  - Ensure all requirements have scenarios

## 6. Documentation

- [ ] 6.1 Update `docs/FEATURES.md` with new capabilities
  - Document uniqueness comparison feature
  - Explain export and sharing workflows
  - Describe privacy education module
  - Detail browser compatibility matrix usage
- [ ] 6.2 Create API documentation for new endpoints
  - `POST /v1/fingerprint/compare` endpoint docs
  - `POST /v1/share` and `GET /v1/share/[id]` docs
  - Include request/response examples
- [ ] 6.3 Add user guide for privacy features
  - How to interpret Privacy Score
  - How to use protection recommendations
  - How to delete personal data
- [ ] 6.4 Document D1 schema and migration process
  - Schema definition in `docs/DATABASE.md`
  - Migration instructions for local development
  - Backup and restore procedures

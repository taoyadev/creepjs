## ADDED Requirements

### Requirement: PDF Export

The web app MUST provide a client-side PDF export feature using `@react-pdf/renderer` that generates a professional report containing all 21 fingerprint components with explanatory text and CreepJS branding.

#### Scenario: PDF generation and download

- **GIVEN** a user views their fingerprint on the demo page
- **WHEN** they click the "Export as PDF" button
- **THEN** the browser generates a PDF file using `@react-pdf/renderer`, includes all 21 components with values and explanations, adds CreepJS logo and footer with URL, and triggers a download as `creepjs-fingerprint-[id].pdf`.

#### Scenario: PDF renders correctly across browsers

- **GIVEN** a user exports a PDF in Chrome, Firefox, or Safari
- **WHEN** they open the downloaded PDF
- **THEN** all components are rendered with correct formatting, text is selectable, images (logo, charts) display properly, and the PDF is under 2MB in size.

### Requirement: Share Link Generation

The system MUST provide an API endpoint to create shareable read-only links for fingerprints, storing link data in Cloudflare KV with automatic expiration after 30 days.

#### Scenario: Share link creation

- **GIVEN** a user clicks "Share" on the demo page
- **WHEN** the frontend calls `POST /v1/share { fingerprintData }`
- **THEN** the API generates a random 7-character alphanumeric ID, stores fingerprint data in KV with key `share:{id}` and 30-day TTL, and returns `{ shareUrl: 'https://creepjs.org/s/abc123' }`.

#### Scenario: Share link retrieval

- **GIVEN** a recipient visits `https://creepjs.org/s/abc123`
- **WHEN** the page loads
- **THEN** it calls `GET /v1/share/abc123`, the API fetches data from KV, returns fingerprint data, and the page renders a read-only view with all 21 components and a "Clone this fingerprint" button.

#### Scenario: Share link expiration

- **GIVEN** a share link is 30 days old
- **WHEN** a user tries to access it
- **THEN** the API returns 404 Not Found, KV has automatically deleted the expired key, and the frontend displays "This link has expired" message.

### Requirement: PNG/SVG Image Export

The web app MUST provide image export functionality using `html-to-image` library to capture fingerprint visualizations as PNG or SVG files, optimized for social media sharing (1200x630px).

#### Scenario: PNG export

- **GIVEN** a user views their fingerprint visualization
- **WHEN** they click "Export as PNG"
- **THEN** the browser uses `html-to-image` to capture the visualization div, generates a PNG image at 1200x630px resolution, and triggers download as `creepjs-fingerprint-[id].png`.

#### Scenario: SVG export

- **GIVEN** a user views their fingerprint visualization
- **WHEN** they click "Export as SVG"
- **THEN** the browser captures the visualization as SVG vector format, generates a scalable image, and triggers download as `creepjs-fingerprint-[id].svg`.

### Requirement: Share Link Rate Limiting

The system MUST enforce rate limiting on share link creation to prevent abuse, allowing maximum 10 share links per IP address per day.

#### Scenario: Rate limit not exceeded

- **GIVEN** a user has created 5 share links today
- **WHEN** they create another share link
- **THEN** the API successfully creates the link and returns the share URL.

#### Scenario: Rate limit exceeded

- **GIVEN** a user has created 10 share links today
- **WHEN** they attempt to create another share link
- **THEN** the API returns 429 Too Many Requests with error message "Share link limit exceeded. Try again tomorrow.", and frontend displays the error to the user.

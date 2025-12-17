## ADDED Requirements

### Requirement: Cloudflare Web Analytics Integration

The Next.js web app MUST integrate Cloudflare Web Analytics beacon to track page views, visitor counts, referrer sources, device breakdowns, and Core Web Vitals, without using cookies or collecting personally identifiable information.

#### Scenario: Analytics beacon loads on all pages

- **GIVEN** a user visits any page on the site
- **WHEN** the page loads
- **THEN** the Cloudflare Web Analytics beacon script is loaded from a first-party endpoint, a pageview event is sent to Cloudflare Analytics, and the beacon does not block page rendering or impact Core Web Vitals.

#### Scenario: Analytics respects Do Not Track

- **GIVEN** a user has Do Not Track (DNT) enabled in their browser
- **WHEN** the page loads
- **THEN** the analytics beacon checks for the DNT header, respects the user's preference by not sending tracking events, and logs a message to the console (in dev mode only) indicating DNT is active.

#### Scenario: Analytics data appears in Cloudflare dashboard

- **GIVEN** users visit the site after analytics integration is deployed
- **WHEN** an administrator accesses the Cloudflare Analytics dashboard
- **THEN** they see aggregated data including page views, unique visitors, referrer sources, top pages, device types (desktop/mobile/tablet), browser breakdowns, and Core Web Vitals metrics (LCP, FID, CLS).

### Requirement: Custom Event Tracking

The project MUST provide a utility function to track custom events (API calls, SDK downloads, demo usage, playground interactions) without exposing user identity or sensitive data.

#### Scenario: Track demo fingerprint generation

- **GIVEN** a user generates a fingerprint on the demo page
- **WHEN** the fingerprint generation completes successfully
- **THEN** a custom event `fingerprint_generated` is sent to analytics with properties `{ page: '/demo', success: true }`, and the event appears in Cloudflare Analytics (if custom events are supported) or is logged for future analysis.

#### Scenario: Track API call success and error rates

- **GIVEN** a user makes a request to the fingerprint API endpoint
- **WHEN** the Workers API handler processes the request
- **THEN** a custom event is logged to Cloudflare Analytics or Workers logs with properties `{ endpoint: '/v1/fingerprint', status: 200|400|500, responseTime: <ms> }`, enabling monitoring of API success rates and performance.

#### Scenario: Track SDK download from CDN

- **GIVEN** a user requests the SDK from the CDN (`/sdk.js` or npm package)
- **WHEN** the request is served
- **THEN** the download event is tracked via Cloudflare Analytics or logged in Workers logs with properties `{ source: 'cdn'|'npm', version: '<version>' }`, allowing measurement of SDK adoption.

#### Scenario: Track playground API testing

- **GIVEN** a user tests the API in the playground
- **WHEN** they submit a test request
- **THEN** a custom event `playground_test` is sent with properties `{ endpoint: '<endpoint>', success: true|false }`, enabling analysis of playground usage patterns.

### Requirement: Privacy-First Analytics

The analytics implementation MUST comply with GDPR and CCPA by not using cookies, not collecting PII (IP addresses, user agents, or identifiable data), and providing users with a clear opt-out mechanism.

#### Scenario: No cookies used for tracking

- **GIVEN** a user visits the site with an empty cookie jar
- **WHEN** analytics beacon loads and sends events
- **THEN** no cookies are set in the user's browser, and subsequent pageviews do not require or create cookies for tracking.

#### Scenario: No PII collected in events

- **GIVEN** a custom event is tracked (e.g., `fingerprint_generated`)
- **WHEN** the event data is sent to analytics
- **THEN** it contains only aggregated, non-identifiable properties (page path, event name, timestamp), and does not include IP address, user agent, fingerprint ID, or any other PII.

#### Scenario: User opt-out mechanism

- **GIVEN** a user wants to opt out of analytics
- **WHEN** they enable Do Not Track or visit a `/privacy` page with opt-out instructions
- **THEN** the analytics beacon respects DNT and does not send tracking events, and the privacy page explains how analytics work and how to opt out.

### Requirement: Real-Time Dashboard Access

The project MUST document how to access the Cloudflare Analytics dashboard for viewing traffic data, custom events, and performance metrics in real-time.

#### Scenario: Access Cloudflare Analytics dashboard

- **GIVEN** an administrator wants to view site analytics
- **WHEN** they log into the Cloudflare dashboard and navigate to the Web Analytics section
- **THEN** they see real-time and historical data for page views, visitors, referrers, devices, and Core Web Vitals for the CreepJS.org domain.

#### Scenario: Dashboard shows custom events

- **GIVEN** custom events are being tracked (e.g., `fingerprint_generated`, `api_call`)
- **WHEN** an administrator views the analytics dashboard
- **THEN** they see a breakdown of custom events by type, count, and trend over time (if Cloudflare supports custom events), or they access Workers logs to analyze event data.

# product-analytics Specification

## Purpose

First-party product events from the site: an allowlist of event names
and props shared by the web client and the API, a tokenless
`POST /v1/events` endpoint that writes to Workers Analytics Engine, and
the guarantee that no stored event identifies a person or a device.

## Requirements

### Requirement: The API SHALL accept allowlisted product events

`POST /v1/events` SHALL accept a JSON body `{ name, path, props? }` sent as
`text/plain` or `application/json`, without an API token. `name` SHALL be one
of the event names in the shared allowlist (`@creepjs/core/analytics-events`).
Prop keys outside that event's allowlist SHALL be dropped. A known prop whose
value breaks its rule SHALL be rejected. `path` SHALL be reduced to a pathname
with no query string or fragment. A valid event SHALL get `204` with an empty
body.

#### Scenario: Valid beacon is accepted

- **WHEN** the site posts `{"name":"tool_run","path":"/checker","props":{"tool":"fingerprint_scan","surface":"checker","outcome":"success"}}` as `text/plain`
- **THEN** the API responds `204` with no body

#### Scenario: Unknown event name is rejected

- **WHEN** the body names an event that is not on the allowlist
- **THEN** the API responds `400` with an `{ error }` JSON body and writes nothing

#### Scenario: Unknown prop is dropped

- **WHEN** a valid event carries an extra prop such as `fingerprintId`
- **THEN** the event is accepted and the extra prop is not stored

#### Scenario: Query string is stripped from the path

- **WHEN** `path` is `/ip?q=203.0.113.7#result`
- **THEN** the stored path is `/ip`

### Requirement: The events endpoint SHALL limit abuse without stateful counters

The endpoint SHALL accept requests only from the site origin resolved from
`CORS_ORIGIN` (falling back to `https://creepjs.org` in production), SHALL
reject bodies over 1 KiB by `Content-Length` and by bytes read, and SHALL NOT
read or write KV, the `QuotaCounter` Durable Object or the `StatsCounter`
Durable Object.

#### Scenario: Foreign origin is refused

- **WHEN** a request carries an `Origin` other than the site origin, or none
- **THEN** the API responds `403` and writes nothing

#### Scenario: Oversized body is refused

- **WHEN** the body exceeds 1 KiB
- **THEN** the API responds `413` and writes nothing

#### Scenario: No stateful storage is touched

- **WHEN** any request reaches `/v1/events`
- **THEN** no KV namespace, `QUOTA` stub or `STATS` stub is accessed

### Requirement: Stored events SHALL contain no identifying data

Each accepted event SHALL be written as exactly one Analytics Engine data
point with `indexes: [name]`, `blobs: [name, path, tool, surface, outcome,
status, section, label]` and `doubles: [1]`. The data point SHALL NOT contain
the client IP, user agent, fingerprint ID, API token or email. If the
Analytics Engine binding is absent, the endpoint SHALL respond `204` and write
nothing. A failed write SHALL NOT fail the request.

#### Scenario: Data point carries only allowlisted fields

- **WHEN** a valid event arrives with `CF-Connecting-IP`, `User-Agent` and an extra `fingerprintId` prop
- **THEN** the single data point contains none of those values

#### Scenario: Binding is absent

- **WHEN** the Worker runs without the `EVENTS` binding
- **THEN** a valid event gets `204` and nothing is written

### Requirement: The web client SHALL send events first-party without a preflight

`trackEvent` SHALL send the event to `${API_BASE}/v1/events` with
`navigator.sendBeacon` and a `text/plain` Blob, and SHALL fall back to
`fetch` with `keepalive: true`, `credentials: 'omit'` and a `text/plain`
content type when `sendBeacon` is missing or returns false. It SHALL send only
the props the shared allowlist permits for that event, SHALL swallow send
errors, SHALL do nothing during server rendering, and SHALL send nothing when
Do Not Track or Global Privacy Control is enabled.

#### Scenario: Beacon path

- **WHEN** `trackEvent('tool_run', …)` runs in a browser with `sendBeacon`
- **THEN** one beacon is queued to `${API_BASE}/v1/events` with a `text/plain` Blob holding the event JSON

#### Scenario: Fetch fallback

- **WHEN** `sendBeacon` is missing or returns false
- **THEN** the event is sent with `fetch` using `keepalive: true` and `credentials: 'omit'`

#### Scenario: Do Not Track

- **WHEN** `navigator.doNotTrack` is `"1"` or `navigator.globalPrivacyControl` is true
- **THEN** no request is made

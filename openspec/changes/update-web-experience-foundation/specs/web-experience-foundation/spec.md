## ADDED Requirements

### Requirement: Accessible Shared Interaction Primitives

The web application SHALL provide shared Tooltip, Dialog/Sheet, Accordion, and
Progress primitives with keyboard and assistive-technology semantics suitable
for use by the checker, homepage, and playground.

#### Scenario: Mobile navigation opens and closes accessibly

- **WHEN** a keyboard user opens the mobile navigation
- **THEN** focus is contained in the Sheet, Escape closes it, focus returns to
  the trigger, and the active route is exposed with current-page semantics

#### Scenario: Progress is announced

- **WHEN** a fingerprint scan reports progress
- **THEN** the rendered progressbar has an accessible name and bounded current,
  minimum, and maximum values matching the visible state

### Requirement: Shared Clipboard Feedback

Copy controls SHALL use a shared component that keeps copied state local to the
activated control and reports success or failure without a blocking dialog.

#### Scenario: One of several copy controls is activated

- **WHEN** a user activates one copy control on a page with multiple controls
- **THEN** only that control changes state and the result is announced with
  non-blocking feedback

### Requirement: Bounded JSON Requests

The shared JSON client SHALL support caller cancellation and per-request
timeouts, SHALL return a typed error for non-success responses, and SHALL retry
at most once only for GET requests.

#### Scenario: GET fails transiently

- **WHEN** an idempotent GET fails because of a network error or server error
- **THEN** the client retries once and returns the second response or error

#### Scenario: Non-idempotent request fails

- **WHEN** a POST request fails even if a caller requests retry behavior
- **THEN** the client does not replay the request

#### Scenario: Caller is already cancelled

- **WHEN** the caller passes an already-aborted signal
- **THEN** the request observes the aborted state and no retry is attempted

### Requirement: Reduced-Motion Respect

The web application SHALL treat navigation and component motion as progressive
enhancement and SHALL neutralize non-essential animation and smooth scrolling
when the user prefers reduced motion.

#### Scenario: Reduced motion is enabled

- **WHEN** the operating system exposes `prefers-reduced-motion: reduce`
- **THEN** non-essential animations, transitions, and smooth scrolling complete
  effectively immediately

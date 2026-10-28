# api-playground Specification

## Purpose

The `/playground` page lets developers request a token and exercise the
fingerprint and IP APIs from the browser, with a server-rendered shell and a
small interactive workspace that never persists the token.

## Requirements

### Requirement: Server-rendered playground shell

The API playground SHALL render its page heading and stable explanatory shell
on the server while hydrating only the interactive request workspace.

#### Scenario: Playground document is requested

- **WHEN** a visitor loads `/playground`
- **THEN** the static HTML contains the unique H1 and task-first explanation
  without waiting for client JavaScript

### Requirement: Memory-only token boundary

The interactive playground SHALL keep the API token only in component memory
and SHALL NOT place it in URLs, browser storage, logs, or analytics payloads.

#### Scenario: Token is generated and used

- **WHEN** the token endpoint returns a token and the visitor runs the existing
  fingerprint endpoint
- **THEN** the token may populate the controlled field, request header, and
  visible copyable snippet but is not persisted or reported

### Requirement: Preserved interactive contracts

The playground SHALL preserve the existing token request, fingerprint
collection, endpoint request, toast, copy, and analytics behavior while
decomposing the UI into focused components.

#### Scenario: Existing request succeeds or fails

- **WHEN** the visitor completes an existing playground request
- **THEN** the same endpoint, request body, token header, response body, and
  success/failure analytics contract are used

### Requirement: Accessible response and snippet surfaces

The playground SHALL use the existing response skeleton for loading, expose
stable status and error semantics, and render copyable snippets with native
`pre` and `code` elements without a client syntax highlighter.

#### Scenario: Response state changes

- **WHEN** a request is idle, loading, successful, or failed
- **THEN** the response region exposes an appropriate stable label, busy state,
  polite status, or alert without replacing the full page

#### Scenario: Narrow or keyboard-only interaction

- **WHEN** the playground is used on a narrow viewport, with a keyboard, in
  either theme, or with reduced motion
- **THEN** controls remain reachable, focus remains visible, code and response
  output scroll without page overflow, and state meaning is preserved

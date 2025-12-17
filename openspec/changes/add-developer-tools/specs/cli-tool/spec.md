## ADDED Requirements

### Requirement: CLI Installation and Configuration

The project MUST provide a global CLI tool `@creepjs/cli` installable via npm that allows developers to test fingerprinting locally and manage API configuration.

#### Scenario: CLI installation

- **GIVEN** a developer runs `npm install -g @creepjs/cli`
- **WHEN** installation completes
- **THEN** the `creepjs` command is available globally, running `creepjs --version` shows the version number, and `creepjs --help` displays all available commands.

#### Scenario: Configuration setup

- **GIVEN** a developer runs `creepjs config`
- **WHEN** interactive prompts ask for API endpoint and token
- **THEN** values are saved to `~/.creepjsrc` file, and subsequent commands use these defaults without requiring flags.

### Requirement: Local Fingerprint Testing

The CLI MUST provide a `check` command that runs fingerprinting locally using the SDK and jsdom, displaying results in a formatted table.

#### Scenario: Fingerprint check execution

- **GIVEN** a developer runs `creepjs check`
- **WHEN** the command executes
- **THEN** it runs all collectors with jsdom mocking browser APIs, displays results in a colorized table with component names and values, shows fingerprint ID, and indicates which collectors are limited in Node.js environment.

#### Scenario: JSON export

- **GIVEN** a developer runs `creepjs check --format json`
- **WHEN** the command completes
- **THEN** it outputs fingerprint data as JSON to stdout, allowing redirection to a file (`> fingerprint.json`).

### Requirement: Fingerprint Comparison

The CLI MUST provide a `compare` command that fetches two fingerprints via API and highlights differences.

#### Scenario: Fingerprint comparison

- **GIVEN** a developer runs `creepjs compare abc123 def456`
- **WHEN** the command fetches both fingerprints
- **THEN** it displays a side-by-side comparison table, highlights differing components in yellow, shows a similarity score (e.g., "85% similar"), and lists changed components.

### Requirement: Token Validation

The CLI MUST provide a `validate` command that tests API token validity and displays rate limit information.

#### Scenario: Token validation success

- **GIVEN** a developer runs `creepjs validate cfp_test123`
- **WHEN** the command tests the token
- **THEN** it calls the API health endpoint with the token, displays "✓ Token is valid", shows rate limit remaining (e.g., "950/1000 requests remaining"), and confirms endpoint reachability.

#### Scenario: Token validation failure

- **GIVEN** a developer runs `creepjs validate invalid_token`
- **WHEN** the API returns 401 Unauthorized
- **THEN** the CLI displays "✗ Token is invalid", suggests running `creepjs config` to set a valid token, and exits with code 1.

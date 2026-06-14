## ADDED Requirements

### Requirement: Workspace Toolchain

The repository MUST use pnpm + Turborepo with shared lint/test/build pipelines, base TypeScript config, Prettier/ESLint rules, and workspace definitions for apps (`web`, `api`) and packages (`core`, `sdk`).

#### Scenario: Consistent commands

- **GIVEN** a developer at repo root
- **WHEN** they run `pnpm install`, `turbo run lint`, `turbo run test`, or `turbo run build`
- **THEN** each command executes across all workspaces with shared tsconfig + eslint settings without manual per-package steps.

### Requirement: Core Fingerprint Library

`packages/core` MUST expose collectors for Canvas, WebGL, Navigator, Screen, Fonts plus MurmurHash3 hashing utilities and unit tests verifying deterministic output.

#### Scenario: Generate fingerprint hash

- **GIVEN** collected component data
- **WHEN** `generateFingerprint(components)` is called
- **THEN** it returns `{ fingerprintId, confidence, components }` with deterministic Base62 IDs and tests covering canonical fixtures.

### Requirement: SDK Client Package

`packages/sdk` MUST wrap `@creepjs/core` collectors, provide `getFingerprint` and `createClient` APIs for browser + edge runtimes, offer caching/retry hooks, and include unit tests with mocked fetch.

#### Scenario: Browser client request

- **GIVEN** a token and default options
- **WHEN** `getFingerprint()` runs in a browser build
- **THEN** it collects components, respects DNT, performs a fetch to `/v1/fingerprint`, caches the response for the configured TTL, and tests assert both DNT short-circuit and fetch payload formation.

### Requirement: Cloudflare Worker API

`apps/api` MUST deliver a Hono-based Worker exposing `GET /` (health), `POST /v1/fingerprint`, and `GET /v1/token`, with middleware for auth + rate limiting, schema validation, and unit/integration tests using Miniflare or mocked bindings.

#### Scenario: Fingerprint endpoint flow

- **GIVEN** a request with `X-API-Token` and valid body
- **WHEN** it hits `/v1/fingerprint`
- **THEN** the worker authenticates the token, applies rate limit, delegates to `@creepjs/core`, and responds with JSON following `docs/API.md`, with tests covering success + auth failure.

### Requirement: Next.js Web Experience

`apps/web` MUST implement a Next.js App Router app with landing page, demo page leveraging the SDK, docs index linking to markdown docs, and a playground that proxies API requests; include Tailwind config and at least one integration smoke test.

#### Scenario: Demo renders fingerprint

- **GIVEN** a user visiting `/demo`
- **WHEN** the page loads client-side components
- **THEN** it calls the SDK (using demo token env var) and renders the resulting fingerprint ID plus component list, with a test ensuring the component mounts and shows placeholder/loading states.

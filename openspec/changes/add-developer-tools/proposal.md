# Change Proposal: add-developer-tools

## Summary

Enhance developer experience and SDK adoption by providing comprehensive API documentation (Swagger/OpenAPI), code generation tools for popular frameworks, pre-configured API testing collections (Postman/Insomnia), and a CLI tool for local fingerprint testing. These tools reduce integration time from hours to minutes and lower the barrier to entry for new users.

## Motivation

- Current API lacks interactive documentation—developers must read markdown files and manually craft requests
- No code examples for popular frameworks (React, Vue, Angular, Svelte)—slows integration
- Manual API testing is tedious—need pre-configured collections with authentication
- Developers want to test fingerprinting locally without deploying to production
- Competitors (Fingerprint.com, FingerprintJS) offer better developer tooling

## Scope

### 1. Interactive API Documentation (Swagger/OpenAPI 3.0)

- **OpenAPI 3.0 specification**:
  - Document all API endpoints (`GET /`, `POST /v1/fingerprint`, `GET /v1/token`, etc.)
  - Include request/response schemas (Zod schemas converted to OpenAPI)
  - Authentication requirements (X-API-Token header)
  - Rate limit headers and error codes
- **Swagger UI integration**:
  - Embed Swagger UI at `/api/docs` route
  - "Try it out" functionality with token input
  - Real-time testing against production/staging API
  - Code generation snippets (curl, JavaScript, Python)

### 2. Code Generator

- **Framework support**:
  - React (hooks: `useFingerprintAPI`, components)
  - Vue 3 (composables: `useFingerprintAPI`)
  - Angular (services + dependency injection)
  - Svelte (stores + actions)
  - Vanilla JavaScript/TypeScript (promises, async/await)
- **Generation features**:
  - Copy-to-clipboard for generated code
  - Customizable options (API endpoint, token, cache TTL)
  - TypeScript type definitions included
  - Error handling patterns
- **Web UI**:
  - `/playground` page with framework selector dropdown
  - Configuration panel (endpoint URL, token, options)
  - Live code preview with syntax highlighting
  - Download as `.ts`/`.js` file

### 3. Postman/Insomnia Collections

- **Postman Collection v2.1**:
  - All API endpoints pre-configured
  - Environment variables for tokens and base URL
  - Pre-request scripts for authentication
  - Test scripts for response validation
  - Export as JSON file for import
- **Insomnia Collection**:
  - Same endpoints in Insomnia format
  - Template variables for dynamic values
  - Request chaining (token → fingerprint)
  - Export as YAML/JSON

### 4. CLI Tool (@creepjs/cli)

- **Commands**:
  - `creepjs check` - Run fingerprinting locally, display results
  - `creepjs compare <id>` - Compare two fingerprints
  - `creepjs validate <token>` - Test API token validity
  - `creepjs config` - Configure default API endpoint/token
- **Features**:
  - Colorized terminal output (chalk)
  - Progress indicators (ora spinner)
  - Table formatting (cli-table3)
  - JSON/CSV export options
  - Runs in Node.js (uses SDK with jsdom for collectors)

## Out of Scope

- SDKs for mobile platforms (Swift, Kotlin)—defer to future
- GraphQL API alternative—stick to REST for MVP
- Webhooks for fingerprint events—not needed yet
- Rate limit monitoring dashboard—use Cloudflare dashboard

## Risks & Mitigations

- **OpenAPI spec drift**: Auto-generate from Zod schemas to keep in sync
- **Code generator bugs**: Test generated code across frameworks with automated tests
- **CLI Node.js limitations**: Some collectors (Canvas, WebGL) won't work in Node—document limitations
- **Postman collection maintenance**: Automate export from OpenAPI spec

## Success Criteria

- Swagger UI accessible at `/api/docs` with "Try it out" working for all endpoints
- Code generator produces working code for React, Vue, Angular, Svelte, and Vanilla JS
- Postman collection imports successfully and all requests pass with valid token
- CLI tool installs via `npm install -g @creepjs/cli` and runs `creepjs check` successfully
- Developer integration time reduced from 2+ hours to <15 minutes
- `openspec validate add-developer-tools --strict` passes without errors

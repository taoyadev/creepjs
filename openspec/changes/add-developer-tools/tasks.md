# Tasks: add-developer-tools

## 1. OpenAPI 3.0 Specification

- [ ] 1.1 Install OpenAPI/Swagger dependencies
  - Add `swagger-ui-react` to `apps/web`
  - Add `zod-to-openapi` for schema conversion
- [ ] 1.2 Generate OpenAPI spec from Zod schemas
  - Create `apps/api/src/openapi/generator.ts`
  - Convert all Zod request/response schemas to OpenAPI format
  - Include authentication (X-API-Token header)
  - Document rate limit headers (X-RateLimit-Remaining, X-RateLimit-Reset)
- [ ] 1.3 Create Swagger UI page at `/api/docs`
  - Build `apps/web/app/api/docs/page.tsx`
  - Embed Swagger UI component
  - Configure "Try it out" with token input field
  - Style to match CreepJS branding
- [ ] 1.4 Add code generation snippets
  - Configure Swagger UI to show curl, JavaScript, Python examples
  - Include authentication headers in generated code
  - Test snippet accuracy

## 2. Code Generator

- [ ] 2.1 Build code generation engine
  - Create `apps/web/lib/code-generator.ts`
  - Template system for 5 frameworks
  - Variable substitution (endpoint, token, options)
- [ ] 2.2 Create React code template
  - Hook: `useFingerprintAPI(options)`
  - Component example with loading states
  - TypeScript types included
  - Error handling pattern
- [ ] 2.3 Create Vue 3 code template
  - Composable: `useFingerprintAPI()`
  - Reactivity with `ref()` and `computed()`
  - TypeScript support
- [ ] 2.4 Create Angular code template
  - Service with dependency injection
  - Observable pattern (RxJS)
  - TypeScript decorators
- [ ] 2.5 Create Svelte code template
  - Svelte store for fingerprint state
  - Reactive statements
  - TypeScript support
- [ ] 2.6 Create Vanilla JS template
  - Promise-based API
  - Async/await examples
  - Both ES6 modules and CommonJS
- [ ] 2.7 Build code generator UI
  - Framework selector dropdown
  - Configuration form (endpoint, token, cache TTL)
  - Live preview with syntax highlighting (prism-react-renderer)
  - Copy button + download as file
  - Add to `/playground` page

## 3. Postman/Insomnia Collections

- [ ] 3.1 Generate Postman Collection v2.1 from OpenAPI spec
  - Use `openapi-to-postmanv2` converter
  - Output: `collections/creepjs-api.postman_collection.json`
- [ ] 3.2 Configure Postman environment template
  - Variables: `base_url`, `api_token`
  - Pre-request scripts for auth header injection
  - Test scripts for status code validation
- [ ] 3.3 Generate Insomnia collection
  - Export OpenAPI spec in Insomnia-compatible format
  - Output: `collections/creepjs-api.insomnia.yaml`
  - Template variables for dynamic values
- [ ] 3.4 Add download links on docs page
  - "Download Postman Collection" button
  - "Download Insomnia Collection" button
  - Include quick start guide

## 4. CLI Tool (@creepjs/cli)

- [ ] 4.1 Scaffold CLI package
  - Create `packages/cli/` directory
  - Initialize `package.json` with bin entry
  - Install dependencies: `commander`, `chalk`, `ora`, `cli-table3`, `inquirer`
- [ ] 4.2 Implement `creepjs check` command
  - Run fingerprinting locally (use SDK with jsdom)
  - Display results in formatted table
  - Colorized output (green for success, red for errors)
  - JSON export option: `--format json`
- [ ] 4.3 Implement `creepjs compare <id1> <id2>` command
  - Fetch two fingerprints via API
  - Highlight differences in component values
  - Show similarity score (0-100%)
- [ ] 4.4 Implement `creepjs validate <token>` command
  - Test token against API health endpoint
  - Display token validity, rate limit remaining
  - Warn if token near expiration
- [ ] 4.5 Implement `creepjs config` command
  - Interactive prompts for endpoint and token
  - Save to `~/.creepjsrc` config file
  - Commands use config as defaults
- [ ] 4.6 Add global error handling
  - Network errors → helpful messages
  - Invalid token → suggest running `creepjs config`
  - API errors → display error details
- [ ] 4.7 Publish to npm
  - Set up npm publishing workflow
  - Version: 1.0.0
  - Keywords: fingerprinting, browser, cli
  - README with usage examples

## 5. Integration & Testing

- [ ] 5.1 Test OpenAPI spec accuracy
  - Validate spec with `swagger-cli validate`
  - Test all endpoints in Swagger UI
  - Verify request/response schemas match actual API
- [ ] 5.2 Test generated code across frameworks
  - Create test apps for React, Vue, Angular, Svelte, Vanilla
  - Run generated code and verify fingerprint retrieval
  - Check TypeScript compilation
- [ ] 5.3 Test Postman/Insomnia collections
  - Import into Postman and run all requests
  - Import into Insomnia and verify
  - Ensure environment variables work correctly
- [ ] 5.4 Test CLI tool
  - Run `creepjs check` and verify output
  - Test `creepjs compare` with two fingerprint IDs
  - Validate `creepjs validate` with valid and invalid tokens
  - Test config save/load
- [ ] 5.5 Run OpenSpec validation
  - Execute `openspec validate add-developer-tools --strict`
  - Resolve any validation errors

## 6. Documentation

- [ ] 6.1 Create API documentation guide
  - How to access Swagger UI
  - How to authenticate in "Try it out"
  - Common use cases and examples
- [ ] 6.2 Create code generator guide
  - Step-by-step instructions for each framework
  - Configuration options explained
  - Troubleshooting common issues
- [ ] 6.3 Create Postman/Insomnia quick start
  - How to import collections
  - How to set up environment variables
  - How to run automated tests
- [ ] 6.4 Create CLI documentation
  - Installation instructions
  - Command reference (check, compare, validate, config)
  - Configuration file format
  - Examples and use cases

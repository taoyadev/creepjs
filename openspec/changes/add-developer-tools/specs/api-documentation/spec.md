## ADDED Requirements

### Requirement: OpenAPI 3.0 Specification

The project MUST provide an OpenAPI 3.0 specification file documenting all API endpoints, request/response schemas, authentication, and error codes, auto-generated from Zod validation schemas.

#### Scenario: OpenAPI spec generation from Zod schemas

- **GIVEN** API endpoints use Zod schemas for validation
- **WHEN** the OpenAPI generation script runs
- **THEN** it converts all Zod schemas to OpenAPI format, includes authentication (X-API-Token), documents rate limit headers, and outputs `openapi.json` file.

### Requirement: Swagger UI Integration

The web app MUST embed Swagger UI at `/api/docs` allowing developers to browse API documentation and test endpoints interactively with "Try it out" functionality.

#### Scenario: Interactive API testing in Swagger UI

- **GIVEN** a developer visits `/api/docs`
- **WHEN** they expand the `POST /v1/fingerprint` endpoint
- **THEN** they see request/response schemas, click "Try it out", enter their API token, provide request body, execute the request, and view the live response from the API.

#### Scenario: Code snippet generation

- **GIVEN** a developer tests an endpoint in Swagger UI
- **WHEN** they view the code snippets section
- **THEN** Swagger UI shows examples in curl, JavaScript (fetch), and Python (requests) with authentication headers included.

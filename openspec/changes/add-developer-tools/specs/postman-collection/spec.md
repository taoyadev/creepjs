## ADDED Requirements

### Requirement: Postman Collection Export

The project MUST provide a Postman Collection v2.1 file with all API endpoints, environment variables, authentication, and test scripts, auto-generated from the OpenAPI specification.

#### Scenario: Postman collection import

- **GIVEN** a developer downloads `creepjs-api.postman_collection.json`
- **WHEN** they import it into Postman
- **THEN** all endpoints appear organized in folders, environment variables (`base_url`, `api_token`) are configured, and authentication headers are automatically injected via pre-request scripts.

#### Scenario: Request execution with environment variables

- **GIVEN** a developer sets `api_token` in Postman environment
- **WHEN** they send `POST /v1/fingerprint` request
- **THEN** the request includes `X-API-Token: {{api_token}}` header, succeeds with 200 status, and test script validates the response schema.

### Requirement: Insomnia Collection Export

The project MUST provide an Insomnia-compatible collection (YAML format) with the same endpoints and configuration as the Postman collection.

#### Scenario: Insomnia collection import

- **GIVEN** a developer downloads `creepjs-api.insomnia.yaml`
- **WHEN** they import it into Insomnia
- **THEN** all requests are available with template variables, authentication headers are configured, and requests can be chained (token generation → fingerprint submission).

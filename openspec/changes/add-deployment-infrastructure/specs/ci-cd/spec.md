## ADDED Requirements

### Requirement: Automated Deployment Pipeline

The project MUST provide GitHub Actions workflows that automatically deploy the Workers API and Next.js web app to Cloudflare on every push to the `main` branch, with pre-deployment validation (lint, test, build) and post-deployment health checks.

#### Scenario: Successful deployment to production

- **GIVEN** a developer pushes code to the `main` branch
- **WHEN** all pre-deployment checks pass (lint, test, build, OpenSpec validation)
- **THEN** the Workers API is deployed to Cloudflare Workers, the Next.js app is deployed to Cloudflare Pages, health checks verify the API responds with HTTP 200, and deployment status is posted to GitHub commit status.

#### Scenario: Deployment failure triggers rollback

- **GIVEN** a deployment to production is initiated
- **WHEN** the post-deployment health check fails (API returns non-200 status or times out)
- **THEN** the workflow automatically executes `wrangler rollback` to restore the previous working version, marks the GitHub Actions run as failed, and notifies developers.

#### Scenario: Pull request preview deployment

- **GIVEN** a developer opens a pull request
- **WHEN** the PR is created or updated
- **THEN** a preview deployment is created on Cloudflare Pages with a unique preview URL, the API is deployed to a staging environment (optional), and the preview URL is posted as a PR comment.

### Requirement: Environment Management

The project MUST provide automated scripts to create and configure Cloudflare KV namespaces, manage Wrangler secrets, and validate environment configuration across development, staging, and production environments.

#### Scenario: KV namespace creation

- **GIVEN** a developer runs the `scripts/setup-kv.sh` script with production credentials
- **WHEN** the script executes
- **THEN** it creates `creepjs_tokens_prod` and `creepjs_ratelimit_prod` KV namespaces, updates `apps/api/wrangler.toml` with the namespace IDs, and outputs success confirmation with namespace details.

#### Scenario: Secrets configuration

- **GIVEN** a developer runs the `scripts/setup-secrets.sh` script
- **WHEN** prompted for required secrets (API keys, tokens)
- **THEN** the script uploads secrets to Wrangler via CLI, validates they are set correctly by reading back (without exposing values), and confirms successful configuration.

#### Scenario: Health check validation

- **GIVEN** the `scripts/health-check.sh` script is executed after deployment
- **WHEN** the script runs
- **THEN** it tests the API health endpoint (`GET /`), verifies the fingerprint endpoint with a valid token, checks response times are under 100ms (p95), and reports success or failure with detailed error messages.

### Requirement: Pre-deployment Validation

The project MUST enforce pre-deployment checks on all pull requests and main branch pushes, blocking merges or deployments if any check fails (linting, type checking, testing, OpenSpec validation).

#### Scenario: Pre-merge checks pass

- **GIVEN** a pull request is opened
- **WHEN** the GitHub Actions CI workflow runs
- **THEN** it executes lint, type check, unit tests, integration tests, and OpenSpec validation in sequence, marks all checks as passed, and allows merge when approved.

#### Scenario: Pre-merge checks fail

- **GIVEN** a pull request contains code that fails linting
- **WHEN** the GitHub Actions CI workflow runs
- **THEN** the lint step fails, subsequent steps are skipped, the PR is marked as failing checks, and merge is blocked until issues are resolved.

### Requirement: Deployment Secrets Management

The project MUST securely manage sensitive credentials (Cloudflare API tokens, account IDs) using GitHub encrypted secrets and Wrangler secrets, never committing credentials to version control.

#### Scenario: GitHub Actions secrets configuration

- **GIVEN** an administrator configures GitHub repository secrets
- **WHEN** the deployment workflow runs
- **THEN** it accesses `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` from GitHub secrets, uses them for Wrangler authentication, and completes deployment without exposing credentials in logs.

#### Scenario: Local development secrets

- **GIVEN** a developer sets up the project locally
- **WHEN** they copy `.env.example` to `.env.local` and fill in required values
- **THEN** the application reads secrets from `.env.local`, Wrangler CLI uses local secrets for development, and `.env.local` is excluded from version control via `.gitignore`.

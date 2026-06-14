# Architecture

This document describes the high-level architecture of the CreepJS monorepo (web app, API, core engine, and SDK) and how data flows through the system.

## System Overview

- **Web (Next.js / Cloudflare Pages)**: the public site, documentation UI, checker, and playground.
- **API (Hono / Cloudflare Workers + KV)**: validates requests, enforces rate limits, and returns results.
- **Core (`@creepjs/core`)**: the fingerprinting engine and collector implementations.
- **SDK (`@creepjs/sdk`)**: a thin client wrapper around the core engine + transport helpers.

## Data Flow

1. The browser runs collectors via `@creepjs/core` and generates a `fingerprintId` plus optional per-collector telemetry.
2. The web app (or SDK consumer) sends a request to the API with:
   - `X-API-Token`
   - fingerprint payload (ID + data + telemetry)
3. The API:
   - authenticates the token (KV: `TOKENS`)
   - applies per-token rate limiting (KV: `RATE_LIMIT`)
   - returns a normalized JSON response for UI consumption

## Packages & Responsibilities

### `apps/web`

- Next.js App Router UI
- Static export (`output: 'export'`) for Cloudflare Pages
- SEO primitives: metadata, sitemap, robots

### `apps/api`

- Hono router and middlewares (auth, CORS, rate limit, error handling)
- Cloudflare KV bindings:
  - `TOKENS` (token records)
  - `RATE_LIMIT` (rate limit buckets)
  - `IP_CACHE` (optional IP metadata cache)

### `packages/core`

- Collector implementations (Canvas, WebGL, Audio, Storage APIs, etc.)
- Hashing + ID generation utilities
- Collector telemetry types (status/duration/value/error)

### `packages/sdk`

- Consumer-facing API surface for `getFingerprint(...)`
- Bundles for ESM + UMD

## Key Constraints

- Prefer **client-side computation** for educational transparency.
- Keep the API **stateless for fingerprint payload storage** (KV is used for tokens and rate-limits only).
- Keep exports **static** (Cloudflare Pages) where possible to simplify deployment and improve cacheability.

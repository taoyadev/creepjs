# Project Context

## Purpose

CreepJS.org is an educational, privacy-first browser fingerprint platform that pairs a public demo, docs hub, and SDK with a lightweight Cloudflare Workers API. The goal is to let developers understand, prototype, and integrate device fingerprinting within 3 minutes while keeping data collection transparent and minimal.

## Tech Stack

- Monorepo managed by Turborepo + pnpm
- Frontend: Next.js 15 (App Router), TypeScript, TailwindCSS, shadcn/ui, deployed on Cloudflare Pages
- Backend/API: Hono.js running on Cloudflare Workers with KV storage
- SDK: Vanilla TypeScript compiled to ESM + UMD bundles (<15KB gz)
- Tooling: ESLint, Prettier, Vitest/Jest (unit), Playwright (e2e), Wrangler CLI, Posthog (optional analytics)

## Project Conventions

### Code Style

- TypeScript everywhere with `strict` mode enabled; prefer interfaces over types for public contracts.
- Follow ESLint `@typestrict` + Next.js presets and Prettier defaults (2 spaces, single quotes, trailing commas).
- Component/file naming uses PascalCase for React components, camelCase for utilities, and kebab-case for file paths.
- Keep modules focused (<300 LOC) with clear docblocks for exported APIs; avoid comment noise for obvious code.

### Architecture Patterns

- Turborepo layout: `apps/web`, `apps/api`, shared packages under `packages/`.
- Frontend uses App Router with server components by default, client components only when needed (stateful UI, demos).
- Workers API is stateless; KV is only used for tokens + lightweight rate-limit buckets. All handlers use Hono middlewares (auth, rate-limit, error handler).
- SDK consumes `@creepjs/core` collectors and exposes a simple `getFingerprint` API; builds via Rollup emitting ESM + UMD.
- Configuration is environment-driven via `.env` + Wrangler secrets, never commit secrets.

### Testing Strategy

- Unit tests (Vitest/Jest) live alongside source files (`*.test.ts`); cover hashing, collectors, API handlers, and SDK utilities.
- Integration tests (Playwright) cover demo page, docs navigation, and API playground happy-paths.
- Worker routes validated with Miniflare-based tests before deployment.
- CI runs lint → unit → integration; failing stages block deploys. Snapshot tests discouraged unless value proven.

### Git Workflow

- Trunk-based flow on `main` with short-lived feature branches named `feat/*`, `fix/*`, or `docs/*`.
- Conventional Commits (`feat:`, `fix:`, `docs:` etc.) to keep changelog automation simple.
- Pull Requests must reference the relevant OpenSpec change ID and include test evidence or rationale when tests are skipped.

## Domain Context

- Browser fingerprinting combines Canvas, WebGL, Navigator, Screen, and Fonts signals, hashed via MurmurHash3 + Base62 to produce deterministic IDs.
- Product scope includes: marketing site, live demo, docs, SDK, Cloudflare API, and Playground. No persistent fingerprint storage (hash only, no history).
- Privacy commitments: honor DNT, minimize data retention, and keep everything transparent for educational use.

## Important Constraints

- API p95 latency <100 ms globally; SDK bundle <15 KB gz; demo LCP <2 s on mid-tier devices.
- Must run entirely on Cloudflare free tier initially—Workers + KV + Pages; no regional lock-in.
- GDPR/CCPA compliance: no sensitive data, clear consent messaging, ability to opt-out.
- Rate limiting: 1000 requests/day/token with IP backoff for abuse.

## External Dependencies

- Cloudflare Workers + KV + Pages (runtime + hosting)
- Wrangler CLI for deployments
- Posthog or Vercel/Cloudflare Analytics for observability (optional but supported)
- Resend (optional) for transactional emails (token delivery)
- GitHub Actions (CI runners) or Cloudflare Pipelines for automation

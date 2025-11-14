# Change Proposal: bootstrap-monorepo

## Summary

Stand up the initial Turborepo workspace for CreepJS.org, including shared tooling, Next.js web app, Cloudflare Workers API, and reusable packages (`@creepjs/core`, `@creepjs/sdk`). Provide baseline functionality for fingerprint collection + hashing, SDK transport, demo UI shell, and API endpoints so future iterations can layer on product polish.

## Motivation

- Current repo only contains documentation; there is no runnable code that reflects the PRD/Architecture specs.
- Contributors lack a consistent build/test pipeline, causing inevitable drift between docs and implementation.
- Product demos, SDK clients, and API references need living code to validate assumptions and support future changes.

## Scope

1. Root workspace
   - pnpm workspaces + turbo.json + base tsconfig/eslint configuration
   - Shared scripts for `build`, `dev`, `lint`, `test`
2. Packages
   - `@creepjs/core`: collectors (canvas/webgl/navigator/screen/fonts), MurmurHash3 + Base62 fingerprint generator, unit tests
   - `@creepjs/sdk`: browser + edge client using `@creepjs/core`, caching, transport abstraction, TypeScript types, unit tests
3. API (Cloudflare Workers + Hono)
   - Routes: `GET /` health, `POST /v1/fingerprint`, `GET /v1/token`
   - Middleware: auth, rate-limit (KV mock), error handler, schema validation (Zod)
   - Minimal token issuance backed by in-memory adapter (stub for KV)
4. Web (Next.js App Router)
   - Landing page hero with CTA + feature list
   - Demo page using SDK to display live fingerprint data
   - Docs index page linking to `/docs` markdown
   - Playground skeleton with JSON editor + response pane, calling API route

## Out of Scope

- Production-ready styling/branding (use Tailwind primitives only)
- Full KV persistence or email integration (mock/stub only)
- Analytics, auth, payments, or multi-tenant features

## Risks & Mitigations

- **Complexity creep**: baseline might become too large → enforce modular packages and small components (<300 LOC)
- **Testing friction**: new packages require dependencies; ensure Vitest configuration per package and root scripts orchestrate via turbo
- **Environment drift**: Cloudflare Worker requires Wrangler config; supply `wrangler.toml` and mock env utilities for local dev

## Success Criteria

- `pnpm install` + `turbo run build` succeed locally
- `packages/core` and `packages/sdk` have passing unit tests covering collectors + transport logic
- Next.js app runs with demo + playground hitting API (in dev, using local worker)
- `openspec validate bootstrap-monorepo --strict` passes

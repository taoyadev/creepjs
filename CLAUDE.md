# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CreepJS 2.0 is an **educational, privacy-first browser fingerprinting platform** built as a SaaS service. It provides developers with easy-to-integrate APIs for browser fingerprinting while prioritizing transparency and user privacy.

**Tech Stack**: pnpm monorepo (Turborepo) with Next.js 15 (frontend), Cloudflare Workers + Hono.js (API), and TypeScript throughout.

## Monorepo Structure

```
creepjs/
├── apps/
│   ├── web/                    # Next.js 15 App Router site (Landing, Demo, Docs, Playground)
│   └── api/                    # Cloudflare Workers API (Hono.js + KV)
├── packages/
│   ├── core/                   # Fingerprint collectors (Canvas, WebGL, Navigator) + hashing
│   └── sdk/                    # Browser SDK with UMD/ESM build
├── docs/                       # Product & architecture documentation
└── openspec/                   # Spec-driven development (proposals, changes, specs)
```

**Workspace Dependencies**: All packages use `workspace:*` protocol. `apps/web` depends on both `@creepjs/core` and `@creepjs/sdk`.

## Common Commands

### Development

```bash
# Install all dependencies (MUST use pnpm)
pnpm install

# Run all dev servers concurrently
pnpm dev

# Run specific app
pnpm --filter @creepjs/web dev          # Next.js on port 3000
pnpm --filter @creepjs/api dev          # Wrangler dev (Workers local)

# Build all packages
turbo run build

# Run tests
turbo run test                          # All tests
pnpm --filter @creepjs/core test        # Core package only
pnpm --filter @creepjs/api test         # API tests (Vitest + Workers pool)
```

### Linting & Type Checking

```bash
# Lint all packages
pnpm lint                               # or turbo run lint

# Type check
turbo run typecheck

# Format code
pnpm format
```

### Cloudflare Workers (API)

```bash
cd apps/api

# Local development with KV
wrangler dev

# Deploy to Cloudflare
wrangler deploy

# Manage KV storage
wrangler kv:key put --namespace-id=<ID> "token:cfp_xxx" '{"email":"test@example.com"}'
wrangler kv:key get --namespace-id=<ID> "token:cfp_xxx"

# View production logs
wrangler tail
```

### SDK Build

```bash
# Build SDK (outputs UMD + ESM)
pnpm --filter @creepjs/sdk build

# Watch mode during development
pnpm --filter @creepjs/sdk build --watch
```

## Architecture Highlights

### API Design (apps/api)

- **Framework**: Hono.js (lightweight, optimized for Cloudflare Workers)
- **Runtime**: Cloudflare Workers (V8 Isolates, <50ms response time)
- **Storage**: Cloudflare KV (tokens + rate limits)
- **Validation**: Zod schemas for all inputs

**Key Endpoints**:

- `POST /v1/fingerprint` - Generate fingerprint ID from browser components
- `GET /v1/token?email=<email>` - Request API token

**Middleware Stack**:

1. CORS (`hono/cors`)
2. Logger (`hono/logger`)
3. Auth middleware (validates `X-API-Token` header against KV)
4. Rate limit middleware (1000 requests/day per token, tracked in KV)

**File Structure**:

```
apps/api/src/
├── index.ts                    # Main Hono app + route registration
├── routes/
│   ├── fingerprint.ts          # POST /v1/fingerprint
│   └── token.ts                # GET /v1/token
├── middleware/
│   ├── auth.ts                 # Token validation
│   ├── ratelimit.ts            # Request quota enforcement
│   ├── cors.ts                 # CORS configuration
│   └── error.ts                # Error handling
└── utils/
    └── validation.ts           # Zod schemas
```

### Core Fingerprinting Engine (packages/core)

**Collectors** (`src/collectors/`):

- `canvas.ts` - Canvas fingerprinting (text + shapes rendering)
- `webgl.ts` - WebGL parameters (vendor, renderer, extensions)
- `navigator.ts` - Navigator API data (userAgent, platform, languages)
- `screen.ts` - Screen dimensions and color depth
- `fonts.ts` - Font detection
- `audio.ts` - Audio context fingerprinting
- `timezone.ts` - Timezone detection
- Additional collectors: CSS, media devices, text metrics, SVG, math precision, etc.

**Hashing** (`src/utils/hash.ts`):

- Algorithm: MurmurHash3
- Encoding: Base62 for compact fingerprint IDs
- Normalization: Stable JSON serialization (sorted keys)

**Main Function**:

```typescript
generateFingerprintId(components: Components): string
// Normalizes components → hashes with MurmurHash3 → Base62 encoding
```

### Frontend (apps/web)

- **Framework**: Next.js 15 (App Router)
- **UI**: Tailwind CSS + shadcn/ui (Radix UI primitives)
- **Key Pages**:
  - `/` - Landing page
  - `/demo` - Live fingerprint demonstration
  - `/docs` - Documentation center
  - `/playground` - Interactive API testing

**Important**: Browser-specific APIs (Canvas, WebGL, etc.) MUST be in Client Components (`"use client"`). Server Components cannot access browser APIs.

### JavaScript SDK (packages/sdk)

**Main API**:

```typescript
import { getFingerprint } from '@creepjs/sdk';

const result = await getFingerprint({
  token: 'cfp_your_token',
  endpoint: 'https://api.creepjs.org', // optional
  cache: true, // localStorage caching
  cacheTtl: 3600, // cache TTL in seconds
});

// Returns: { fingerprintId, confidence, uniqueness, timestamp, cached }
```

**Build Output**:

- `dist/creepjs.umd.js` - UMD format for CDN
- `dist/creepjs.esm.js` - ES modules
- Target: <15KB gzipped

## Development Workflow

### OpenSpec Integration

This project uses **OpenSpec** for spec-driven development. For major changes:

1. **Read `@/openspec/AGENTS.md`** - Learn workflow and conventions
2. **Use `/openspec:proposal`** - Create change proposals for new features
3. **Use `/openspec:apply`** - Implement approved changes
4. **Use `/openspec:archive`** - Archive deployed changes

**When to use OpenSpec**:

- New capabilities or breaking changes
- Architecture shifts
- Performance or security work
- Ambiguous requirements needing clarification

**Structure**:

```
openspec/changes/<change-id>/
├── proposal.md                 # Change description & rationale
├── tasks.md                    # Implementation checklist
└── specs/                      # Detailed specifications
```

### Testing Strategy

| Type       | Location                    | Tools                                      |
| ---------- | --------------------------- | ------------------------------------------ |
| Unit tests | `*.test.ts` in each package | Vitest                                     |
| API tests  | `apps/api/tests/`           | Vitest + Cloudflare Workers pool + mock KV |
| E2E tests  | `apps/web/tests/`           | Playwright (optional)                      |

**Running Tests**:

```bash
# All tests
turbo run test

# Specific package
pnpm --filter @creepjs/core test
pnpm --filter @creepjs/api test         # Uses Cloudflare Workers test environment
```

**API Testing**: Uses `@cloudflare/vitest-pool-workers` with in-memory KV simulator. Test utilities in `apps/api/tests/utils.ts` provide helpers for auth tokens, rate limits, and request mocking.

### Environment Variables

**Development**:

```bash
# Copy template
cp .env.example .env.local

# Key variables
NEXT_PUBLIC_API_BASE=https://api.creepjs.org
CREEPJS_TOKEN_PRIVATE_KEY=<optional-for-local>
CREEPJS_KV_NAMESPACE=<from-wrangler>
```

**Production (Cloudflare Workers)**:

```bash
# Set secrets via Wrangler
wrangler secret put CREEPJS_TOKEN_PRIVATE_KEY
```

**Important**: Workers environment variables are configured in `apps/api/wrangler.toml` and use KV bindings.

## Code Standards

### TypeScript

- **Strict mode** enabled in all packages
- Use Zod for runtime validation (especially in API routes)
- Prefer explicit return types for exported functions
- Use `interface` for object shapes, `type` for unions/intersections

### Components (apps/web)

- Use `"use client"` directive for any component using browser APIs
- Keep components under ~300 lines; extract hooks/utils when complex
- Use shadcn/ui components from `components/ui/`
- Follow Tailwind CSS conventions (no inline styles)

### API Routes (apps/api)

- All network operations must have `try/catch` with structured error responses
- Validate inputs with Zod schemas
- Use middleware for cross-cutting concerns (auth, logging, rate limits)
- Return consistent JSON error format: `{ error: string, details?: any }`

### Testing

- Write tests for all collectors in `@creepjs/core`
- API endpoints must have integration tests covering auth, rate limits, success/error paths
- Mock browser APIs (Canvas, WebGL) in tests using Vitest mocks

## Deployment

### Cloudflare Workers (API)

```bash
cd apps/api
wrangler deploy                 # Deploys to production

# Or via GitHub Actions (automated on main branch push)
```

### Cloudflare Pages (Frontend)

- Automatically deploys from GitHub on push to `main`
- Build command: `turbo run build --filter=@creepjs/web`
- Output directory: `apps/web/.next`

### SDK Publishing

```bash
# Bump versions
pnpm changeset

# Publish to npm
pnpm publish -r

# Copy built SDK to web public folder for CDN
cp packages/sdk/dist/creepjs.umd.js apps/web/public/sdk.js
```

## Key Architecture Decisions

1. **Cloudflare Workers for API**: Edge computing ensures <50ms response times globally, zero cold starts
2. **Stateless Design**: No database required; KV only for tokens and rate limits
3. **Privacy-First**: No fingerprint data stored; only computed hashes returned
4. **Monorepo**: Shared TypeScript types and utilities across web/api/sdk
5. **MurmurHash3**: Fast, collision-resistant hashing for fingerprint IDs

## Common Issues

### "KV namespace not bound"

- Check `wrangler.toml` has correct KV binding
- Ensure KV namespace exists: `wrangler kv:namespace list`
- For local dev: `wrangler dev` auto-creates local KV

### Next.js "ReferenceError: navigator is not defined"

- Browser APIs must be in Client Components with `"use client"`
- Use dynamic imports with `ssr: false` if needed

### SDK not found in web app

- Ensure `pnpm install` ran successfully (workspace linking)
- Check `package.json` has `"@creepjs/sdk": "workspace:*"`
- Rebuild SDK: `pnpm --filter @creepjs/sdk build`

### Rate limit not working in tests

- Ensure test uses Workers test environment: `pool: '@cloudflare/vitest-pool-workers'`
- Mock KV operations in `vitest.config.ts`

## Documentation

- **Architecture**: `docs/ARCHITECTURE.md` - System design and data flow
- **API Reference**: `docs/API.md` - Endpoint specifications
- **Development Guide**: `docs/DEVELOPMENT.md` - Setup and workflows
- **SDK Guide**: `docs/SDK.md` - SDK usage and examples
- **Deployment**: `docs/DEPLOYMENT.md` - Production deployment steps
- **Security**: `docs/SECURITY.md` - Privacy and security considerations

## Package Manager

**MUST use pnpm** (not npm or yarn). The project uses pnpm workspaces with:

- `packageManager: "pnpm@9.15.4"` in root `package.json`
- Node.js >= 20.9.0 required
- Turborepo for build orchestration

## Performance Targets

| Metric                    | Target |
| ------------------------- | ------ |
| API response time (p95)   | <100ms |
| SDK bundle size (gzipped) | <15KB  |
| Lighthouse score          | >95    |
| Uptime                    | >99.9% |

## License

- Core engine: Based on [CreepJS](https://github.com/abrahamjuliot/creepjs) (MIT License)
- This project: MIT License

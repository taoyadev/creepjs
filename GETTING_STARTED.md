# Getting Started with CreepJS.org

This guide will help you set up and run the CreepJS.org platform locally.

## Prerequisites

- **Node.js** >= 20.9.0
- **pnpm** >= 9.0.0 (install with `npm install -g pnpm`)
- **Cloudflare account** (for Workers deployment)

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

This will install all dependencies for the monorepo using pnpm workspaces.

### 2. Build All Packages

```bash
pnpm run build
```

This uses Turborepo to build packages in the correct order:

1. `@creepjs/core` (fingerprinting engine)
2. `@creepjs/sdk` (browser SDK)
3. `@creepjs/api` (Cloudflare Workers API)
4. `@creepjs/web` (Next.js frontend)

### 3. Run Development Servers

In separate terminals:

**Terminal 1 - API Server**:

```bash
cd apps/api
pnpm dev
```

API will run on `http://localhost:8787`

**Terminal 2 - Web Server**:

```bash
cd apps/web
pnpm dev
```

Website will run on `http://localhost:3000`

Or use Turborepo to run all dev servers at once:

```bash
pnpm dev
```

### 4. Visit the Demo

Open your browser to:

- **Landing Page**: http://localhost:3000
- **Live Demo**: http://localhost:3000/demo
- **Documentation**: http://localhost:3000/docs
- **API Playground**: http://localhost:3000/playground

## Project Structure

```
creepjs/
├── apps/
│   ├── api/              # Cloudflare Workers API
│   │   ├── src/
│   │   │   ├── routes/   # API routes (fingerprint, token)
│   │   │   ├── middleware/ # Auth, CORS, rate limit
│   │   │   └── index.ts  # Main entry point
│   │   └── wrangler.toml # Cloudflare config
│   │
│   └── web/              # Next.js frontend
│       ├── src/
│       │   ├── app/      # App Router pages
│       │   │   ├── page.tsx       # Landing page
│       │   │   ├── demo/          # Demo page
│       │   │   ├── docs/          # Docs page
│       │   │   └── playground/    # API testing
│       │   └── components/ # React components
│       └── next.config.mjs
│
├── packages/
│   ├── core/             # Fingerprinting engine
│   │   ├── src/
│   │   │   ├── collectors/ # Canvas, WebGL, Navigator, etc.
│   │   │   ├── utils/      # Hash functions
│   │   │   └── index.ts
│   │   └── tests/
│   │
│   └── sdk/              # Browser SDK
│       ├── src/
│       │   └── index.ts  # Main SDK client
│       └── rollup.config.js # UMD/ESM bundling
│
├── docs/                 # Project documentation
├── openspec/             # OpenSpec changes
├── turbo.json            # Turborepo config
└── package.json          # Root workspace
```

## Development Workflow

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
cd packages/core
pnpm test:watch
```

### Linting & Formatting

```bash
# Lint all packages
pnpm lint

# Format code
pnpm format
```

### Type Checking

```bash
# Check types across all packages
pnpm typecheck
```

## Using the SDK Locally

### In a separate project

1. Build the SDK:

```bash
cd packages/sdk
pnpm build
```

2. Link it locally:

```bash
pnpm link --global
```

3. In your project:

```bash
pnpm link --global @creepjs/sdk
```

4. Use it:

```typescript
import { getFingerprint } from '@creepjs/sdk';

const fp = await getFingerprint({
  token: 'cfp_test123',
  endpoint: 'http://localhost:8787/v1/fingerprint',
});

console.log(fp.fingerprintId);
```

## Cloudflare Setup

### 1. Install Wrangler

```bash
pnpm add -g wrangler
```

### 2. Login to Cloudflare

```bash
wrangler login
```

### 3. Create KV Namespaces

```bash
# Create TOKENS namespace
wrangler kv:namespace create TOKENS

# Create RATE_LIMIT namespace
wrangler kv:namespace create RATE_LIMIT
```

### 4. Update wrangler.toml

In `apps/api/wrangler.toml`, replace the placeholder IDs:

```toml
[[kv_namespaces]]
binding = "TOKENS"
id = "your-tokens-namespace-id"  # Replace with actual ID

[[kv_namespaces]]
binding = "RATE_LIMIT"
id = "your-ratelimit-namespace-id"  # Replace with actual ID
```

### 5. Deploy API

```bash
cd apps/api
pnpm deploy
```

Your API will be deployed to Cloudflare Workers!

## Deploying the Frontend

### Option 1: Cloudflare Pages

1. Connect your GitHub repo to Cloudflare Pages
2. Build command: `cd apps/web && pnpm run build`
3. Output directory: `apps/web/.next`
4. Environment variables:
   - `NEXT_PUBLIC_API_URL`: Your deployed API URL

### Option 2: Vercel

1. Install Vercel CLI: `pnpm add -g vercel`
2. Deploy:

```bash
cd apps/web
vercel
```

## Troubleshooting

### Build Errors

If you encounter build errors:

1. Clean the project:

```bash
pnpm clean
```

2. Delete node_modules and reinstall:

```bash
rm -rf node_modules packages/*/node_modules apps/*/node_modules
pnpm install
```

3. Rebuild:

```bash
pnpm build
```

### API Connection Issues

If the web app can't connect to the API:

1. Check API is running: `curl http://localhost:8787`
2. Check CORS settings in `apps/api/src/middleware/cors.ts`
3. Verify `next.config.mjs` rewrites are correct

### TypeScript Errors

If you see TypeScript errors about missing types:

1. Build packages first: `pnpm build`
2. Check project references in `tsconfig.json`
3. Restart your editor's TypeScript server

## Next Steps

- Read [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) for architecture details
- Check [docs/PRD.md](./docs/PRD.md) for product requirements
- Review [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for technical design
- See [docs/API.md](./docs/API.md) for API documentation

## Need Help?

- Check the [docs/](./docs/) folder for detailed documentation
- Review OpenSpec changes in [openspec/changes/](./openspec/changes/)
- Open an issue on GitHub (if using GitHub)

Happy hacking! 🎉

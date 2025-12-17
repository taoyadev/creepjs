# Tasks: bootstrap-monorepo

## Workspace & Tooling

- [x] Create root `package.json`, `pnpm-workspace.yaml`, `turbo.json`, and base `tsconfig.json` with shared compiler options.
- [x] Configure ESLint/Prettier settings (root `.eslintrc.cjs`, `.prettierrc`), plus `.npmrc`, `.gitignore`, `.env.example`.

## Packages

- [x] Scaffold `packages/core` with collectors (canvas/webgl/navigator/screen/fonts), MurmurHash3 hashing, TypeScript types, and Vitest unit tests.
- [x] Scaffold `packages/sdk` with browser + edge clients, caching/transport utilities, type exports, and Vitest tests mocking fetch.

## API (apps/api)

- [x] Initialize Hono-based Cloudflare Worker with `routes/fingerprint.ts`, `routes/token.ts`, middleware (auth, rate limit, error), and Zod schemas.
- [x] Provide `wrangler.toml`, `src/index.ts`, `tests` using Miniflare/vitest to validate endpoints (with mock KV).

## Web (apps/web)

- [x] Create Next.js 15 App Router project with Tailwind + shadcn base config, `app/(marketing)/page.tsx` hero, `app/demo/page.tsx`, `app/docs/page.tsx`, and `app/playground/page.tsx` (playground uses SDK + API proxy route).
- [x] Add shared UI components (Navbar, Footer, CTA, FingerprintDemo, PlaygroundEditor) and integrate `@creepjs/sdk` via dynamic import/client boundary.
- [x] Include `next.config.mjs`, `postcss.config.js`, `tailwind.config.ts`, and minimal e2e smoke test (Playwright or Vitest + React Testing Library).

## Integration & Verification

- [x] Wire turborepo pipelines (`dev`, `build`, `lint`, `test`) across packages/apps.
- [x] Run `pnpm install`, `turbo run lint`, `turbo run test`, and `turbo run build` (capture any blockers if offline).
- [x] Validate OpenSpec change with `openspec validate bootstrap-monorepo --strict`.

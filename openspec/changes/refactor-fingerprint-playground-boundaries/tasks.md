## 1. Governance and baselines

- [x] 1.1 Audit the frontend, test, OpenSpec, and deployment surfaces.
- [x] 1.2 Strict-validate this change before implementation.
- [x] 1.3 Record the pre-change fingerprint signal route client JavaScript.

## 2. Fingerprint signal route

- [x] 2.1 Derive route metadata and static params from the shared registry.
- [x] 2.2 Read and validate the matching Markdown during static rendering.
- [x] 2.3 Render a unique server H1 and a real reviewed article for all 55 routes.
- [x] 2.4 Reduce the client island to live collection and remove duplicate,
  unsupported education copy and runtime Markdown fetches.
- [x] 2.5 Add static checks for route coverage, safe article content, invalid
  slugs, schema restraint, runtime fetch absence, and client chunk exclusions.
- [x] 2.6 Remove Markdown/highlight dependencies only if they are unused across
  the web app.

## 3. API playground

- [ ] 3.1 Move the page heading and static explanation into a server shell.
- [ ] 3.2 Extract `PlaygroundApp`, `TokenRequestCard`, `EndpointRunner`,
  `ResponseViewer`, and `CodeSnippets` without changing request or analytics
  behavior.
- [ ] 3.3 Keep tokens in component memory and connect `ApiResponseSkeleton`.
- [ ] 3.4 Add stable response status/error/live-region semantics and keyboard,
  focus, theme, and mobile-overflow safeguards.
- [ ] 3.5 Add focused Vitest/static-markup and source-boundary tests without
  React Testing Library.

## 4. Validation and rollout

- [ ] 4.1 Run the full OpenClaw typecheck, lint, test, and web build chain.
- [ ] 4.2 Strict-validate the change and run `git diff --check`.
- [ ] 4.3 Record post-change route JavaScript and update J1/E4 notes in the
  existing launch tracker while keeping them `doing`.
- [ ] 4.4 Validate the affected routes on a real Cloudflare Pages preview,
  including desktop, mobile, keyboard, failure, network, and Lighthouse checks.
- [ ] 4.5 Validate production after deployment before archiving the change.

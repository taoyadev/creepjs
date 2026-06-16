# Contributing Guide

## Scope

This project is privacy-first by design. Contributions must preserve that
stance:

- do not add ad-tech or user-tracking features
- do not add long-term storage of raw fingerprint payloads
- do not commit secrets, copied browser profiles, or production credentials

## Workflow

1. Read `AGENTS.md` and the current execution source of truth in
   `docs/LAUNCH_PLAN.md`.
2. If your change affects behavior, architecture, security posture, or public
   API/SDK contracts, follow the OpenSpec workflow in `openspec/AGENTS.md`.
3. Keep diffs surgical. Avoid bundling unrelated refactors into the same PR.
4. Update docs and tests when behavior changes.

## Validation

Run the relevant checks before opening a PR:

```bash
pnpm install --frozen-lockfile
pnpm -w typecheck
pnpm -w lint
pnpm -w test
pnpm --filter @creepjs/web build
pnpm --filter @creepjs/api test
```

If you touch the SDK, also run:

```bash
pnpm --filter @creepjs/sdk build
node scripts/check-sdk-size.mjs
```

If you touch CI, secrets, or auth safety controls, also run:

```bash
bash scripts/secret-scan.sh
```

## PR expectations

- explain what changed and why
- include the exact commands you ran
- include acceptance evidence for any plan task you claim is complete
- call out assumptions, operator-side follow-up, or browser-gated validation
  you could not perform locally

## Privacy and responsible use

Changes that affect data storage, transmission, logging, or third-party
integrations must keep these artifacts aligned in the same PR:

- `docs/SECURITY.md`
- `apps/web/src/app/privacy/page.tsx`
- `apps/web/src/app/terms/page.tsx`

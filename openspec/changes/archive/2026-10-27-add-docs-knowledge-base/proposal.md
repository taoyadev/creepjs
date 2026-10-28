# Change Proposal: add-docs-knowledge-base

## Summary

Create a cohesive knowledge base under `docs/` so contributors have a single entry point plus deep dives for development workflow, SDK usage, security posture, and the demo/playground experience. The existing PRD/Architecture/API/Deployment/Roadmap files stay as references but the new guides explain how to operationalize them.

## Motivation

- Onboarding currently requires piecing context across long-form documents and the README.
- SDK consumers lack a focused reference for integrating, building, and self-hosting the library.
- Security and privacy expectations are scattered across PRD/Architecture; a dedicated policy is needed for compliance.
- Demo + Playground flows arent documented, making it hard to reproduce the interactive experiences described in the PRD.

## Scope

- Add `docs/README.md` as the table of contents + navigation guidance.
- Add `docs/DEVELOPMENT.md` detailing repository setup, monorepo layout, scripts, and QA expectations.
- Add `docs/SDK.md` covering SDK API surface, bundling targets, and integration recipes.
- Add `docs/SECURITY.md` describing security, privacy, and data-handling controls.
- Add `docs/PLAYGROUND.md` outlining the demo architecture, API playground behavior, and troubleshooting steps.
- Cross-link the new docs with existing references where relevant.

## Out of Scope

- No changes to runtime code, Cloudflare configuration, or SDK build tooling.
- No decision tracking for payments, dashboards, or other post-MVP scope.

## Risks & Mitigations

- **Risk:** Documentation drifts from implementation.
  - _Mitigation:_ Embed references to authoritative specs (PRD/API) and note owners.
- **Risk:** Overlap with existing docs.
  - _Mitigation:_ Position new guides as how-to/operational docs vs strategic references.
- **Risk:** Missing context for compliance.
  - _Mitigation:_ Capture privacy promises + response procedures in SECURITY.md with actionable steps.

## Success Criteria

- Each new doc answers "where do I start?" for its audience (contributors, SDK users, security reviewers, demo maintainers).
- Links between docs allow navigation without searching.
- OpenSpec validation passes for the new documentation capability.

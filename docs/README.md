# CreepJS Documentation Hub

> Start here to navigate the project knowledge base.

## Audience Map

| Who you are            | Read first                               | Deep dives                                                 |
| ---------------------- | ---------------------------------------- | ---------------------------------------------------------- |
| Product / GTM          | [PRD](./PRD.md), [LAUNCH_PLAN](./LAUNCH_PLAN.md) | [Deployment](./DEPLOYMENT.md) for launch planning   |
| Platform / Backend     | [ARCHITECTURE](./ARCHITECTURE.md)        | [DEVELOPMENT](./DEVELOPMENT.md), [SECURITY](./SECURITY.md) |
| Frontend / SDK         | [API](./API.md) overview                 | [SDK](./SDK.md), [PLAYGROUND](./PLAYGROUND.md)             |
| Site Reliability / Ops | [DEPLOYMENT](./DEPLOYMENT.md)            | [SECURITY](./SECURITY.md), [DEVELOPMENT](./DEVELOPMENT.md) |

## Quick Start Paths

1. **New contributor** → skim project goals in [README.md](../README.md), then follow [DEVELOPMENT](./DEVELOPMENT.md) for setup and testing.
2. **Integrator** → jump to [SDK](./SDK.md) for client usage and [API](./API.md) for server endpoints.
3. **Security/privacy review** → start with [SECURITY](./SECURITY.md) then reference [ARCHITECTURE](./ARCHITECTURE.md).
4. **Demo maintainer** → work through [PLAYGROUND](./PLAYGROUND.md) plus the deployment guide for Cloudflare Pages.

## Document Catalog

### Product Strategy

- [PRD](./PRD.md) — product positioning, personas, KPIs, and release criteria.
- [LAUNCH_PLAN](./LAUNCH_PLAN.md) — single source of truth for delivery sequencing and acceptance.
- [ROADMAP](./ROADMAP.md) — lightweight public summary of phases and priorities.

### Architecture & Implementation

- [ARCHITECTURE](./ARCHITECTURE.md) — system diagrams, data flows, and module responsibilities.
- [DEVELOPMENT](./DEVELOPMENT.md) — tooling, repo layout, scripts, testing, and QA workflow.
- [SDK](./SDK.md) — SDK API surface, build process, and integration recipes.

### Operations & Compliance

- [DEPLOYMENT](./DEPLOYMENT.md) — environment prep, Cloudflare commands, rollback, and monitoring.
- [SEO_OPERATIONS](./SEO_OPERATIONS.md) — Search Console, Bing, sitemap submission, IndexNow, and recurring SEO review workflow.
- [SECURITY](./SECURITY.md) — threat model, data handling, incident response, and compliance posture.
- [Terms of Use](/Volumes/SSD/dev/ip-dataset/creepjs/apps/web/src/app/terms/page.tsx) — responsible use, privacy boundaries, and legal expectations for the site, API, and SDK.

### Experience Guides

- [API](./API.md) — HTTP endpoints, payload schemas, and SDK interop notes.
- [PLAYGROUND](./PLAYGROUND.md) — demo + playground UX, local replication, and debugging tips.

## Contribution Workflow

- Changes that impact behavior, architecture, or docs must follow the [OpenSpec](../openspec/AGENTS.md) workflow.
- Create or update specs under `openspec/changes/<change-id>/` before implementing.
- Reference the change ID in commits/PRs and ensure `openspec validate` plus lint/test commands pass locally.

## Support

- Questions/feedback → open an issue on GitHub or email `hello@creepjs.org`.
- Real-time incidents → follow the contacts listed in [SECURITY](./SECURITY.md#incident-response).

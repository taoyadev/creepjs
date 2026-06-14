# Design: add-deployment-infrastructure

## Context

CreepJS.org is a monorepo with two deployable apps (Workers API + Next.js web) and two published packages (core + SDK). The project targets Cloudflare's free tier for hosting, requiring specific deployment patterns and infrastructure choices. This change establishes the deployment automation, SEO foundation, and analytics integration needed for public launch.

### Constraints

- **Cloudflare free tier only**: Workers (100k req/day), KV (1GB storage), Pages (500 builds/month)
- **Zero-downtime deploys**: API must maintain 99.9% uptime during deployments
- **Privacy-first analytics**: No cookies, no PII, GDPR/CCPA compliant
- **Fast iteration**: Deployments must complete within 5 minutes of merge
- **Developer experience**: Local development must mirror production behavior

### Stakeholders

- **Developers**: Need automated deployments and clear environment configuration
- **End users**: Expect fast load times, SEO discoverability, and privacy
- **Product owner**: Needs usage insights without compromising privacy commitments

## Goals / Non-Goals

### Goals

1. **Automated deployments**: Push to `main` auto-deploys Workers API and Next.js web to production
2. **Environment parity**: Dev/staging/production use identical configuration patterns
3. **SEO readiness**: Rich previews on social media, Google indexing within 1 week
4. **Privacy-friendly analytics**: Track usage without cookies or user identification
5. **Zero-touch KV setup**: Scripts create and configure KV namespaces automatically

### Non-Goals

- **Multi-region deployments**: Cloudflare handles global edge distribution automatically
- **Blue-green deployments**: Not needed for free tier; Cloudflare handles gradual rollout
- **Advanced monitoring**: Defer error tracking (Sentry) and APM to future changes
- **Custom CDN configuration**: Use Cloudflare defaults; no need for Workers caching logic yet

## Decisions

### 1. GitHub Actions vs Cloudflare Pipelines

**Decision**: Use GitHub Actions for all CI/CD workflows.

**Rationale**:

- Existing repo on GitHub; no migration needed
- Mature ecosystem with official Wrangler action
- Free tier includes 2000 minutes/month (sufficient)
- Better integration with PR previews and status checks

**Alternatives considered**:

- **Cloudflare Pipelines**: Newer, less mature; lacks PR preview support
- **Vercel CI**: Better for Next.js but locks into Vercel platform

### 2. KV Namespace Strategy

**Decision**: Use separate KV namespaces for tokens and rate limits, with environment-specific naming (`prod`, `staging`, `dev`).

**Rationale**:

- Separation of concerns: tokens have different lifecycle than rate limit counters
- Environment isolation prevents dev/staging from affecting production data
- Simplifies migration if we need to move to D1 or Durable Objects later

**Namespace design**:

```
creepjs_tokens_prod       # Production API tokens
creepjs_ratelimit_prod    # Production rate limit counters
creepjs_tokens_staging    # Staging environment (optional)
creepjs_ratelimit_staging # Staging environment (optional)
```

### 3. SEO Implementation Approach

**Decision**: Use Next.js App Router metadata API with static sitemap generation and JSON-LD for structured data.

**Rationale**:

- Next.js 13+ metadata API is built-in, type-safe, and SSR-friendly
- Static sitemap generation avoids runtime overhead
- JSON-LD preferred by Google over microdata/RDFa

**OG image strategy**:

- Single global OG image (`/og-image.png`) for MVP
- Defer dynamic OG images (Vercel OG) to future enhancement
- Manual creation ensures brand consistency

### 4. Analytics Platform

**Decision**: Use Cloudflare Web Analytics (free tier) exclusively.

**Rationale**:

- Zero cost, aligns with Cloudflare-first infrastructure
- First-party beacon minimizes ad blocker impact
- No cookies = automatic GDPR/CCPA compliance
- Core Web Vitals monitoring included

**Custom events**:

- Use Cloudflare Analytics API or simple fetch beacon
- Track high-value events: API calls, SDK downloads, demo usage
- No event batching needed for MVP (low traffic expected)

**Alternatives considered**:

- **Posthog**: Powerful but adds dependency and complexity
- **Plausible**: Paid after 10k pageviews
- **Google Analytics**: Cookie-based, privacy concerns

### 5. Deployment Health Checks

**Decision**: Implement simple HTTP health checks with automated rollback on failure.

**Rationale**:

- Cloudflare Workers don't support blue-green natively on free tier
- Health check ensures new deployment responds correctly
- Automated rollback via `wrangler rollback` reduces downtime

**Health check implementation**:

```bash
# In GitHub Actions workflow
- name: Deploy to Cloudflare Workers
  run: wrangler deploy
- name: Health check
  run: |
    response=$(curl -s -o /dev/null -w "%{http_code}" https://api.creepjs.org/)
    if [ $response -ne 200 ]; then
      wrangler rollback
      exit 1
    fi
```

## Architecture Overview

### Deployment Flow

```
Developer Push to main
    ↓
GitHub Actions Trigger
    ↓
┌─────────────────────────────────┐
│  Pre-deployment Checks          │
│  - Lint (ESLint + Prettier)     │
│  - Type check (tsc --noEmit)    │
│  - Tests (Vitest)               │
│  - Build (turbo run build)      │
│  - OpenSpec validation          │
└─────────────────────────────────┘
    ↓ (if all pass)
┌─────────────────────────────────┐
│  Parallel Deployments           │
├─────────────────────────────────┤
│  Workers API                    │
│  - wrangler deploy              │
│  - Health check                 │
│  - Rollback on failure          │
├─────────────────────────────────┤
│  Cloudflare Pages               │
│  - turbo run build --filter web │
│  - Cloudflare Pages deploy      │
│  - Preview URL for PRs          │
└─────────────────────────────────┘
    ↓
Production Live ✅
```

### SEO Architecture

```
User Request (Google/Social)
    ↓
Cloudflare Edge CDN
    ↓
Next.js SSR (Cloudflare Pages)
    ↓
Response with:
  - Meta tags (title, description, OG)
  - JSON-LD structured data
  - Canonical URL
    ↓
Crawlers index content
    ↓
Rich previews on social media
```

### Analytics Flow

```
User visits page
    ↓
Cloudflare Web Analytics beacon loads
    ↓
Beacon sends pageview event (first-party)
    ↓
Cloudflare Analytics dashboard updates
    ↓
(Optional) Custom events via fetch:
  - Demo fingerprint generation
  - API calls (from Worker logs)
  - Playground usage
```

## Risks / Trade-offs

### Risk: Deployment Pipeline Complexity

**Impact**: Medium
**Mitigation**:

- Use battle-tested GitHub Actions (wrangler-action, cloudflare-pages-action)
- Test workflows in staging environment first
- Document rollback procedures clearly

### Risk: KV Free Tier Limits (1GB, 100k writes/day)

**Impact**: Low (initially)
**Mitigation**:

- Monitor KV usage via Cloudflare dashboard
- Alert at 80% capacity
- Plan migration to D1 (SQLite) if limits approached

### Risk: SEO Indexing Delays

**Impact**: Low
**Mitigation**:

- Submit sitemap to Google Search Console on launch
- Share content on social media for backlinks
- Ensure Core Web Vitals pass (LCP <2s, CLS <0.1)

### Risk: Analytics Script Blocking

**Impact**: Low
**Mitigation**:

- Cloudflare beacon is first-party, bypasses most ad blockers
- Analytics is for insights, not critical functionality
- Gracefully degrade if script fails to load

### Trade-off: Manual OG Image Creation

**Benefit**: Full control over branding and consistency
**Cost**: Slower iteration when pages change
**Decision**: Accept for MVP; revisit if page count grows >20

## Migration Plan

### Phase 1: Staging Environment Setup (Week 1)

1. Create KV namespaces for staging (`creepjs_tokens_staging`, `creepjs_ratelimit_staging`)
2. Deploy API to Cloudflare Workers staging environment
3. Deploy web to Cloudflare Pages preview branch
4. Test deployment scripts end-to-end

### Phase 2: Production Deployment (Week 1-2)

1. Create production KV namespaces
2. Configure GitHub Actions secrets (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`)
3. Deploy API to production Workers
4. Deploy web to Cloudflare Pages production
5. Verify health checks and analytics

### Phase 3: SEO Launch (Week 2)

1. Submit sitemap to Google Search Console
2. Test Open Graph previews on Twitter/LinkedIn
3. Share launch announcement on social media
4. Monitor Cloudflare Analytics for traffic

### Rollback Plan

If production deployment fails:

1. Execute `wrangler rollback` for API (reverts to previous version)
2. Use Cloudflare Pages rollback UI for web (revert to previous deployment)
3. Investigate logs via `wrangler tail` or Cloudflare dashboard
4. Fix issues in feature branch and re-deploy

## Open Questions

### Q1: Should we use Cloudflare Pages Functions for API routes?

**Status**: Deferred
**Discussion**: Pages Functions could replace some API endpoints, but Workers offer more control and are already implemented. Revisit if monorepo complexity becomes an issue.

### Q2: Do we need separate staging and production environments?

**Status**: Optional for MVP
**Discussion**: Staging environment is helpful for testing but adds overhead. Start with preview deployments on PRs; add staging if needed.

### Q3: Should we implement custom domain for API (api.creepjs.org)?

**Status**: Yes, include in this change
**Discussion**: Custom domain improves branding and allows future migration if needed. Configure in Cloudflare dashboard and update Wrangler config.

### Q4: How to handle Wrangler secrets for PR previews?

**Status**: Use shared staging secrets
**Discussion**: PR previews use staging environment secrets, not production. Document this in deployment guide.

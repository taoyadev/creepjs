# Change Proposal: add-deployment-infrastructure

## Summary

Establish production-ready deployment infrastructure for CreepJS.org, including automated CI/CD pipelines, SEO optimization, and privacy-friendly analytics integration. This change enables the project to launch publicly with zero-touch deployments, strong organic discoverability, and usage insights without compromising user privacy.

## Motivation

- Current project has working code but no deployment automation—manual deployments are error-prone and slow iteration
- Public launch requires SEO optimization to drive organic traffic from developers searching for fingerprinting solutions
- Need visibility into user engagement and API usage without tracking cookies or PII
- Cloudflare KV namespaces must be created and configured before API can persist tokens in production
- Environment-driven configuration missing for secrets management across dev/staging/production

## Scope

### 1. CI/CD Automation

- **GitHub Actions workflows** for automated deployments:
  - Workers API → Cloudflare Workers (on push to `main`)
  - Web app → Cloudflare Pages (on push to `main`)
  - Preview deployments for pull requests
- **Environment management scripts**:
  - Automated KV namespace creation (`creepjs_tokens_prod`, `creepjs_ratelimit_prod`)
  - Wrangler secrets management helpers
  - Health check validation post-deployment
  - Rollback mechanism for failed deploys
- **Pre-deployment checks**:
  - Lint, test, and build pipelines must pass
  - OpenSpec validation must succeed
  - TypeScript compilation with zero errors

### 2. SEO Optimization

- **Next.js metadata API integration**:
  - Dynamic meta tags (title, description, keywords)
  - Open Graph tags for social sharing (Twitter, LinkedIn, Facebook)
  - Canonical URLs and alternate language tags
- **Automated sitemap generation**:
  - `/sitemap.xml` with all public pages
  - Priority and change frequency hints
  - Last modification timestamps
- **robots.txt configuration**:
  - Allow all crawlers
  - Sitemap location reference
- **JSON-LD structured data**:
  - Organization schema
  - WebApplication schema
  - SoftwareApplication schema for SDK

### 3. Analytics Integration

- **Cloudflare Web Analytics**:
  - Zero-cookie tracking (GDPR/CCPA compliant)
  - Page views and visitor counts
  - Referrer and device breakdowns
  - Core Web Vitals monitoring
- **Custom event tracking**:
  - API endpoint calls (success/error rates)
  - SDK download/CDN requests
  - Demo page fingerprint generation
  - Playground API testing
- **Real-time dashboard**:
  - Cloudflare Analytics dashboard access
  - Custom metrics visualization (optional future enhancement)

## Out of Scope

- Paid analytics platforms (Posthog, Mixpanel, etc.)—stick to Cloudflare free tier
- A/B testing or feature flags
- Error monitoring (Sentry)—defer to future change
- CDN configuration beyond Cloudflare defaults
- Custom domain SSL setup (assume Cloudflare handles this)

## Risks & Mitigations

- **Deployment failures**: Implement health checks and automated rollback on API errors
- **KV quota limits**: Monitor usage and alert at 80% capacity; upgrade plan if needed
- **SEO indexing delays**: Submit sitemap to Google Search Console manually on launch
- **Analytics script blocking**: Cloudflare Web Analytics uses first-party beacon, minimizing ad blocker impact
- **Secrets exposure**: Use GitHub encrypted secrets and Wrangler secrets; never commit credentials

## Success Criteria

- `git push` to `main` triggers automatic deployment to Cloudflare (Workers + Pages) within 5 minutes
- `/sitemap.xml` and `/robots.txt` return valid responses
- Open Graph previews render correctly on Twitter/LinkedIn
- Cloudflare Web Analytics dashboard shows traffic within 24 hours of launch
- Health check endpoint (`GET /`) returns `200 OK` with uptime > 99.9%
- `openspec validate add-deployment-infrastructure --strict` passes without errors

# Tasks: add-deployment-infrastructure

## 1. CI/CD Pipeline Setup

- [x] 1.1 Create `.github/workflows/deploy-api.yml` for Cloudflare Workers deployment
  - Trigger on push to `main` and pull requests
  - Run lint, test, and build steps before deployment
  - Use Wrangler GitHub Action for deployment
  - Include health check validation post-deployment
- [x] 1.2 Create `.github/workflows/deploy-web.yml` for Cloudflare Pages deployment
  - Trigger on push to `main` and pull requests
  - Build Next.js app with production optimizations
  - Deploy to Cloudflare Pages with preview URLs for PRs
- [x] 1.3 Create `.github/workflows/ci.yml` for pre-merge checks
  - Run on all pull requests
  - Execute lint, typecheck, test, and OpenSpec validation
  - Block merge if any step fails
- [x] 1.4 Add GitHub Actions secrets configuration documentation
  - `CLOUDFLARE_API_TOKEN` for Wrangler deployments
  - `CLOUDFLARE_ACCOUNT_ID` for account targeting
  - Environment-specific secrets (staging vs production)

## 2. Environment Management Scripts

- [x] 2.1 Create `scripts/setup-kv.sh` for automated KV namespace creation
  - Create `creepjs_tokens_prod` namespace
  - Create `creepjs_ratelimit_prod` namespace
  - Update `apps/api/wrangler.toml` with namespace IDs
  - Provide rollback mechanism
- [x] 2.2 Create `scripts/setup-secrets.sh` for Wrangler secrets management
  - Prompt for required secrets (API keys, tokens)
  - Upload to Wrangler via CLI
  - Validate secrets are set correctly
- [x] 2.3 Create `scripts/health-check.sh` for post-deployment validation
  - Test API health endpoint (`GET /`)
  - Test fingerprint endpoint with valid token
  - Verify response times < 100ms (p95)
  - Alert on failures
- [ ] 2.4 Add environment-specific configuration files
  - `.env.example` with all required variables
  - `.env.production.example` for production-specific overrides
  - Document each variable in README

## 3. SEO Optimization

- [x] 3.1 Configure Next.js metadata API in `apps/web/src/app/layout.tsx`
  - Add global metadata (title, description, keywords)
  - Configure Open Graph tags (og:image, og:title, og:description)
  - Add Twitter Card tags
  - Set canonical URL
- [x] 3.2 Create page-specific metadata for key routes
  - Landing page (`apps/web/src/app/page.tsx`)
  - Checker page (`apps/web/src/app/checker/page.tsx`)
  - Docs page (`apps/web/src/app/docs/page.tsx`)
  - Playground page (`apps/web/src/app/playground/page.tsx`)
- [x] 3.3 Generate Open Graph images
  - Create `apps/web/public/og-image.png` (1200x630px)
  - Create page-specific OG images if needed
  - Use Vercel OG image generation (optional)
- [x] 3.4 Implement sitemap generation in `apps/web/src/app/sitemap.ts`
  - List all public pages
  - Set priority and change frequency
  - Include last modification timestamps
- [x] 3.5 Create `apps/web/src/app/robots.ts` route
  - Allow all crawlers
  - Reference sitemap location
  - Block admin/internal routes (if any)
- [x] 3.6 Add JSON-LD structured data in `apps/web/src/app/layout.tsx`
  - Organization schema (CreepJS.org)
  - WebApplication schema (main site)
  - SoftwareApplication schema (SDK)

## 4. Analytics Integration

- [x] 4.1 Create Cloudflare Web Analytics beacon in `apps/web/src/app/layout.tsx`
  - Add beacon script tag
  - Configure site ID from environment variable
  - Verify script loads without blocking render
- [x] 4.2 Implement custom event tracking utilities in `apps/web/src/lib/analytics.ts`
  - `trackEvent(name, properties)` function
  - Events: `api_call`, `sdk_download`, `fingerprint_generated`, `playground_test`
  - Use Cloudflare Analytics API or simple beacon
- [ ] 4.3 Add analytics events to key user flows
  - Demo page: track fingerprint generation
  - Playground: track API test executions
  - Docs: track page views and time on page
  - SDK download: track CDN requests (via Cloudflare logs)
- [ ] 4.4 Configure Cloudflare Analytics dashboard
  - Enable Web Analytics for domain
  - Set up custom metrics (if supported)
  - Document dashboard access in README

## 5. Integration & Testing

- [ ] 5.1 Test GitHub Actions workflows locally with `act` (optional)
  - Verify `deploy-api.yml` workflow steps
  - Verify `deploy-web.yml` workflow steps
  - Ensure secrets handling works correctly
- [ ] 5.2 Create staging environment for testing
  - Deploy to Cloudflare Workers staging environment
  - Deploy to Cloudflare Pages preview branch
  - Test all deployment scripts end-to-end
- [ ] 5.3 Verify SEO implementation with tools
  - Use Google Rich Results Test for structured data
  - Validate sitemap with XML sitemap validator
  - Test Open Graph previews with LinkedIn/Twitter debuggers
- [ ] 5.4 Validate analytics tracking
  - Trigger test events in staging environment
  - Verify events appear in Cloudflare Analytics dashboard
  - Confirm no PII or sensitive data is tracked
- [x] 5.5 Run OpenSpec validation
  - Execute `openspec validate add-deployment-infrastructure --strict`
  - Resolve any validation errors
  - Ensure all requirements have scenarios

## 6. Documentation

- [x] 6.1 Update `docs/DEPLOYMENT.md` with deployment procedures
  - How to deploy manually with Wrangler
  - How to trigger automated deployments
  - How to rollback failed deployments
  - Environment variable configuration
- [ ] 6.2 Update root `README.md` with deployment badges
  - Add deployment status badges from GitHub Actions
  - Add Cloudflare Pages deployment status
  - Link to production URLs
- [ ] 6.3 Create `docs/SEO.md` with SEO guidelines
  - How to update metadata for new pages
  - Open Graph image specifications
  - Sitemap update procedures
- [ ] 6.4 Create `docs/ANALYTICS.md` with analytics usage guide
  - How to access Cloudflare Analytics dashboard
  - How to track custom events
  - Privacy policy compliance notes

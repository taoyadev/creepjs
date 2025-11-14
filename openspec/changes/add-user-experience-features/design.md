# Design: add-user-experience-features

## Context

CreepJS.org currently provides basic fingerprint generation but lacks comparison, export, and educational features that would increase user engagement and trust. This change adds features that help users understand their fingerprint's uniqueness, share results, learn about privacy implications, and verify browser compatibility.

### Constraints

- **Cloudflare D1 free tier**: 5M row reads/day, 100k row writes/day, 5GB storage—sufficient for 1M+ fingerprints
- **No user accounts**: All features must work anonymously without authentication
- **Client-side heavy**: Minimize server load by doing PDF/image generation in browser
- **Privacy-first**: Store only hashed fingerprints, never raw data or IP addresses
- **Fast load times**: Additional features must not impact Core Web Vitals (LCP <2s)

### Stakeholders

- **End users**: Want to understand what makes their fingerprint unique and how to protect privacy
- **Educators**: Need shareable results for classroom demonstrations
- **Developers**: Need browser compatibility info before SDK integration
- **Privacy advocates**: Need transparency about what data is collected and why

## Goals / Non-Goals

### Goals

1. **Increase engagement**: Users spend 3+ minutes exploring comparison and education features
2. **Enable sharing**: 20%+ of users export or share their fingerprint
3. **Build trust**: Privacy education reduces concerns about fingerprinting
4. **Support developers**: Compatibility matrix helps SDK adoption decisions

### Non-Goals

- **Real-time fraud detection**: Not building risk scoring for production use (Phase 4 feature)
- **Historical tracking**: Not storing fingerprint changes over time per user
- **Advanced analytics**: No cohort analysis or user segmentation
- **Paid features**: All features free; no paywalls or tier restrictions

## Decisions

### 1. Database Choice: Cloudflare D1 vs KV

**Decision**: Use Cloudflare D1 (SQLite) for fingerprint storage.

**Rationale**:

- D1 supports SQL queries for percentile ranking (complex aggregations)
- KV is key-value only—would require manual aggregation in Workers
- D1 free tier (5M reads/day) sufficient for comparison queries
- D1 provides better data integrity guarantees than KV

**Alternatives considered**:

- **KV**: Simpler but can't do SQL aggregations
- **Durable Objects**: More powerful but complex for this use case
- **External DB (Supabase)**: Adds dependency and potential latency

**D1 schema**:

```sql
CREATE TABLE fingerprints (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fingerprint_hash TEXT NOT NULL UNIQUE,
  component_hashes TEXT NOT NULL, -- JSON array
  created_at INTEGER NOT NULL
);
CREATE INDEX idx_fingerprint_hash ON fingerprints(fingerprint_hash);
CREATE INDEX idx_created_at ON fingerprints(created_at);
```

### 2. PDF Generation: Client-Side vs Server-Side

**Decision**: Generate PDFs client-side using `@react-pdf/renderer`.

**Rationale**:

- Avoids server load—PDF generation is CPU-intensive
- Works offline after initial page load
- No API request required—instant download
- `@react-pdf/renderer` is well-maintained and React-friendly

**Trade-off**:

- Client must support ES2015+ (excludes very old browsers)
- Larger bundle size (+50KB gzipped)—acceptable for this feature

**Alternatives considered**:

- **Server-side (Puppeteer)**: Too slow for Cloudflare Workers, requires separate service
- **Third-party API (PDFMonkey)**: Adds cost and dependency

### 3. Share Link Storage: KV vs D1

**Decision**: Use Cloudflare KV for share links.

**Rationale**:

- Share links are simple key-value lookups—KV is optimized for this
- TTL support (automatic expiration) built into KV
- Lower latency than D1 for read-heavy workloads
- D1 better for fingerprint comparison (complex queries)

**KV structure**:

```
Key: share:{id}
Value: {
  fingerprintData: { ... },
  createdAt: 1234567890,
  expiresAt: 1237159890  // 30 days later
}
TTL: 2592000 (30 days in seconds)
```

### 4. Uniqueness Calculation Algorithm

**Decision**: Use simple statistical percentile ranking without machine learning.

**Rationale**:

- ML overkill for MVP—statistical ranking is accurate enough
- Lower latency (no model inference)
- Easier to explain to users ("1-in-500" is intuitive)
- Can add ML later if needed (Phase 4)

**Algorithm**:

```javascript
function calculateUniqueness(fingerprintHash, db) {
  const total = db.count(); // Total fingerprints
  const matches = db.count(WHERE fingerprint_hash = fingerprintHash);
  const uniqueness = total / matches; // e.g., 1000 / 2 = "1-in-500"
  const percentile = ((total - matches) / total) * 100; // e.g., 99.8%

  return { uniqueness, percentile };
}
```

**Component rarity**:

```javascript
function calculateComponentRarity(componentHash, componentType, db) {
  const total = db.count();
  const matches = db.count(WHERE component_hashes CONTAINS componentHash);
  return ((total - matches) / total) * 100; // Rarity score (0-100)
}
```

### 5. Privacy Score Calculation

**Decision**: Use weighted average of component risk levels (low=1, medium=5, high=10).

**Rationale**:

- Simple, interpretable scoring system
- Can be adjusted based on user feedback
- Aligns with industry standards (NIST cybersecurity framework)

**Formula**:

```
Privacy Score = 100 - (Σ(riskLevel * componentPresent) / maxPossibleRisk * 100)
```

**Example**:

- Canvas (high risk=10): present
- WebGL (high risk=10): present
- Navigator (low risk=1): present
- Total risk: 21 / 210 (max) = 90% privacy score

## Architecture Overview

### Fingerprint Comparison Flow

```
User generates fingerprint
    ↓
Frontend calls POST /v1/fingerprint/compare
    ↓
Workers API queries D1:
  - Count total fingerprints
  - Count matching fingerprints
  - Count matching components
    ↓
Calculate uniqueness and rarity scores
    ↓
Return JSON to frontend
    ↓
Display "1-in-X" messaging + heat map
```

### Export & Share Flow

```
User clicks "Export PDF"
    ↓
@react-pdf/renderer generates PDF in browser
    ↓
Download triggered (no server interaction)
```

```
User clicks "Share"
    ↓
Frontend calls POST /v1/share { fingerprintData }
    ↓
Workers API:
  - Generates random 7-char ID
  - Stores in KV with 30-day TTL
  - Returns share URL
    ↓
Frontend displays URL + copy button
    ↓
Recipient visits /s/[id]
    ↓
Page calls GET /v1/share/[id]
    ↓
Workers fetches from KV, returns fingerprint data
    ↓
Read-only view rendered
```

### Privacy Education Flow

```
User clicks component (e.g., Canvas)
    ↓
Modal/accordion opens with:
  - What it is
  - What it reveals
  - Risk level (color-coded)
  - Protection tips
    ↓
User can take quiz to test understanding
    ↓
Quiz results show score + explanations
```

## Risks / Trade-offs

### Risk: D1 Query Performance at Scale

**Impact**: Medium
**Mitigation**:

- Index fingerprint_hash and created_at columns
- Limit queries to last 90 days of data (reduces dataset size)
- Cache popular queries in KV (e.g., "total fingerprint count")
- Monitor query latency via Cloudflare Analytics

### Risk: Share Link Abuse

**Impact**: Low
**Mitigation**:

- Rate limit: max 10 share links per IP per day
- Auto-expire after 30 days
- No PII in shared data (only fingerprint ID + components)
- Monitor KV usage for spikes

### Risk: PDF Bundle Size

**Impact**: Low
**Mitigation**:

- Lazy-load `@react-pdf/renderer` only when user clicks "Export PDF"
- Use code splitting: `const generatePDF = lazy(() => import('./pdf.ts'))`
- Target <50KB gzipped for PDF library

### Risk: Privacy Education Backfires

**Impact**: Low
**Mitigation**:

- Emphasize transparency and user control
- Avoid fear-mongering language
- Provide actionable protection tips (not just "you're tracked")
- User-test messaging with privacy advocates

### Trade-off: Client-Side PDF Generation

**Benefit**: No server load, instant downloads, works offline
**Cost**: Larger bundle size, requires modern browser
**Decision**: Accept trade-off; 95%+ of users on modern browsers

## Migration Plan

### Phase 1: D1 Setup (Week 3)

1. Create D1 database via Wrangler CLI
2. Run migration to create `fingerprints` table
3. Update Wrangler config to bind D1 to Workers
4. Test queries in staging environment

### Phase 2: Comparison Feature (Week 3-4)

1. Implement comparison API endpoint
2. Build frontend heat map visualization
3. Deploy to staging, test with synthetic data
4. Launch to production

### Phase 3: Export/Share (Week 4-5)

1. Integrate `@react-pdf/renderer` and `html-to-image`
2. Implement share link API + KV storage
3. Build share page (`/s/[id]`)
4. Test across browsers, deploy

### Phase 4: Privacy Education (Week 5-6)

1. Write education content for 21 components
2. Build tutorial component
3. Implement quiz logic
4. Deploy and gather user feedback

### Phase 5: Compatibility Matrix (Week 6-7)

1. Create static compatibility data
2. Build matrix component
3. Set up Playwright testing
4. Deploy with automated updates

### Rollback Plan

If D1 performance degrades:

1. Disable comparison feature temporarily
2. Cache aggregated stats in KV (fallback to approximate uniqueness)
3. Investigate slow queries via Cloudflare dashboard
4. Optimize indexes or switch to KV-based approach

## Open Questions

### Q1: Should share links be permanent or always expire?

**Status**: Expire after 30 days by default, add "permanent" option later
**Discussion**: Permanent links increase storage costs; start with expiration, add option if users request it.

### Q2: How to handle D1 migrations in production?

**Status**: Use Wrangler migrations CLI
**Discussion**: D1 supports versioned migrations; test in staging first, then apply to production.

### Q3: Should privacy education be mandatory (e.g., shown on first visit)?

**Status**: Optional modal on first visit, skippable
**Discussion**: Avoid annoying users; make it easy to dismiss but visible enough to encourage engagement.

### Q4: How granular should component rarity be (percentile vs simple rare/common)?

**Status**: Use percentile for now (e.g., "Top 5% rarest")
**Discussion**: Percentile is more informative than binary rare/common; can simplify later if confusing.

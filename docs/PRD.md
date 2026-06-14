# Product Requirements (PRD)

## Positioning

CreepJS is an educational, privacy-first browser fingerprinting platform that helps developers understand fingerprinting signals and build responsible device intelligence.

## Target Users

- **Developers** integrating device intelligence (fraud prevention, bot mitigation, account security)
- **Security/privacy researchers** evaluating fingerprint surfaces
- **Educators** demonstrating fingerprinting concepts

## Core Jobs To Be Done

- Generate a browser fingerprint with clear, explainable breakdowns.
- Understand which signals contribute to uniqueness and stability.
- Provide a simple API + SDK for integration.
- Keep the platform transparent and privacy-conscious by default.

## Non‑Goals

- Tracking users for advertising.
- Storing raw fingerprint payloads long-term.
- Selling fingerprint data.

## Success Metrics (examples)

- Time-to-first-successful-integration < 3 minutes for SDK users.
- p95 API latency < 100ms globally (Cloudflare edge).
- Web UX: responsive, accessible, and stable (no blocking UI during collection).

## Release Criteria (baseline)

- Web, API, core, and SDK build and run reliably.
- No secrets committed to version control; deployment uses GitHub Secrets / Wrangler secrets.
- SEO essentials: canonical URLs, sitemap, robots, Open Graph, and privacy page present.

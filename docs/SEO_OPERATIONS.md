# SEO Operations Runbook

This runbook is the operator-facing source of truth for search indexing,
webmaster tooling, and recurring SEO review work for CreepJS.

## Scope

Use this document when you need to:

- verify ownership in Google Search Console and Bing Webmaster Tools
- submit the canonical sitemap
- request indexing for the highest-priority pages
- set up recurring exports and monthly review checks
- notify Bing through IndexNow after meaningful content or SEO changes

This runbook assumes the canonical production hosts are:

- site: `https://creepjs.org`
- API: `https://api.creepjs.org`
- sitemap: `https://creepjs.org/sitemap.xml`
- robots: `https://creepjs.org/robots.txt`

## High-priority pages

These are the first 8 URLs to submit and monitor because they map to the core
product, docs, and privacy surfaces referenced in the launch plan.

| Priority | URL                                                        | Purpose                        |
| -------- | ---------------------------------------------------------- | ------------------------------ |
| 1        | `https://creepjs.org/`                                     | Homepage / primary entry point |
| 2        | `https://creepjs.org/checker`                              | Core browser fingerprint tool  |
| 3        | `https://creepjs.org/ip`                                   | IP risk checker                |
| 4        | `https://creepjs.org/fingerprint`                          | Fingerprint signals hub        |
| 5        | `https://creepjs.org/docs`                                 | Docs hub                       |
| 6        | `https://creepjs.org/playground`                           | API playground                 |
| 7        | `https://creepjs.org/guide/what-is-browser-fingerprinting` | Cornerstone guide              |
| 8        | `https://creepjs.org/privacy`                              | Privacy policy / trust page    |

These URLs are derived from `apps/web/src/lib/seo-routes.ts`. If that file
changes, update this list in the same PR.

## Before using webmaster tools

Run these checks first:

```bash
curl -I https://creepjs.org/
curl -I https://creepjs.org/robots.txt
curl -I https://creepjs.org/sitemap.xml
```

Expected:

- all three return `200`
- `robots.txt` points at the production sitemap
- `sitemap.xml` contains the current indexable routes

## Google Search Console

### 1. Verify ownership

1. Open Google Search Console.
2. Add a new property.
3. Prefer the `Domain` property for `creepjs.org` so `www` and subdomains are covered.
4. Complete the DNS TXT verification in Cloudflare.
5. Wait for Search Console to confirm ownership.

Fallback:

- if domain-wide verification is blocked, add a `URL prefix` property for `https://creepjs.org/`

### 2. Submit the sitemap

1. Open the verified property in Search Console.
2. Go to `Indexing` → `Sitemaps`.
3. Submit `https://creepjs.org/sitemap.xml`.
4. Record the submission date in the tracking note below.

### 3. Request indexing for the head pages

For each URL in the priority table:

1. Paste the URL into the Search Console inspection bar.
2. Wait for the inspection result.
3. If the page is not indexed or has stale content, click `Request Indexing`.
4. Record whether Search Console reports `URL is on Google`, `Crawled - currently not indexed`, or another state.

### 4. Weekly export

Once the property has data:

1. Open `Performance` → `Search results`.
2. Set date range to `Last 7 days`.
3. Export:
   - Queries
   - Pages
   - Countries
   - Devices
4. Save to a shared Google Sheet or Looker Studio source.

Recommended sheet tabs:

- `queries_weekly`
- `pages_weekly`
- `coverage_notes`
- `cwv_notes`

## Bing Webmaster Tools

### 1. Verify the site

1. Open Bing Webmaster Tools.
2. Add the site `https://creepjs.org/`.
3. Prefer importing from Search Console if the Google property already exists.
4. If import is unavailable, verify ownership using DNS or XML file verification.

### 2. Submit the sitemap

1. Open `Sitemaps`.
2. Submit `https://creepjs.org/sitemap.xml`.
3. Confirm Bing accepts the canonical host with no redirect mismatch.

### 3. Request recrawl for priority pages

Use the URL inspection / submit URL flow for the same 8 head pages listed above.

## IndexNow

IndexNow is optional but useful for Bing and other supporting engines after new
guides, major metadata changes, or large sitemap updates.

### Recommended approach

1. Generate a stable IndexNow key, for example a UUID-like lowercase string.
2. Host the key file at:
   - `https://creepjs.org/<key>.txt`
3. Its body must contain only the exact same key.
4. Notify IndexNow after meaningful content changes.

Example notification:

```bash
curl "https://api.indexnow.org/indexnow?url=https://creepjs.org/guide/what-is-browser-fingerprinting&key=<your-key>"
```

Batch form:

```bash
curl -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{
    "host": "creepjs.org",
    "key": "<your-key>",
    "keyLocation": "https://creepjs.org/<your-key>.txt",
    "urlList": [
      "https://creepjs.org/",
      "https://creepjs.org/checker",
      "https://creepjs.org/guide/what-is-browser-fingerprinting"
    ]
  }'
```

Guardrails:

- do not use IndexNow for every tiny deploy
- use it after new guides, major metadata changes, or route additions
- keep the hosted key file stable unless you intentionally rotate it

## Monthly review checklist

Run this once per month:

- confirm the sitemap status is still `Success` in both Google and Bing
- inspect coverage for the 8 head pages
- inspect `Page indexing` for new exclusions or duplicate-canonical issues
- inspect `Core Web Vitals` for mobile and desktop regressions
- review the top gaining and losing queries
- review the top gaining and losing landing pages
- confirm `robots.txt` and canonical tags still point at `https://creepjs.org`
- log any fixes needed in `docs/LAUNCH_PLAN.md`

## Tracking note template

Use this flat template in PR notes, issue comments, or `docs/LAUNCH_PLAN.md`
status updates:

```text
SEO ops check
- Property verified: yes/no
- Sitemap submitted: yyyy-mm-dd
- Indexed head pages: X/8
- Bing sitemap submitted: yes/no
- IndexNow key live: yes/no
- Weekly export destination: <sheet or dashboard>
- Monthly review owner: <name>
- Notes: <blocking issue or next action>
```

## Operator evidence to collect

When F6 is ready to move from `todo` to `doing` or `done`, capture:

- screenshot or exported confirmation that Search Console accepted the sitemap
- screenshot or exported confirmation that Bing accepted the sitemap
- at least one head page showing as indexed
- the location of the weekly export sheet/dashboard

Without that external evidence, the repo-side runbook is complete but the F6
task is not fully done.

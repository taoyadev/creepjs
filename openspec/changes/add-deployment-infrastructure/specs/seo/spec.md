## ADDED Requirements

### Requirement: Next.js Metadata Configuration

The Next.js web app MUST use the App Router metadata API to configure page-specific and global SEO metadata, including title, description, keywords, Open Graph tags, Twitter Card tags, and canonical URLs.

#### Scenario: Global metadata applied to all pages

- **GIVEN** a user visits any page on the site
- **WHEN** the page is rendered server-side
- **THEN** the HTML includes global meta tags (site title, description, keywords), Open Graph tags (og:title, og:description, og:image), Twitter Card tags (twitter:card, twitter:title, twitter:image), and a canonical URL pointing to the production domain.

#### Scenario: Page-specific metadata overrides global defaults

- **GIVEN** a user visits the demo page (`/demo`)
- **WHEN** the page is rendered
- **THEN** the HTML includes page-specific title ("Live Demo - CreepJS"), description ("Try browser fingerprinting in real-time"), and Open Graph tags that override global defaults while preserving global og:image.

#### Scenario: Open Graph preview on social media

- **GIVEN** a user shares a CreepJS.org URL on Twitter or LinkedIn
- **WHEN** the social platform fetches the Open Graph metadata
- **THEN** a rich preview card is displayed with the correct title, description, and image (1200x630px), and clicking the card navigates to the shared URL.

### Requirement: Sitemap Generation

The project MUST automatically generate an XML sitemap at `/sitemap.xml` listing all public pages with priority hints, change frequency, and last modification timestamps.

#### Scenario: Sitemap includes all public pages

- **GIVEN** a search engine crawler requests `/sitemap.xml`
- **WHEN** the sitemap is generated
- **THEN** it includes entries for landing page, demo, docs, playground, and any additional public pages, with each entry containing `<loc>`, `<lastmod>`, `<changefreq>`, and `<priority>` tags.

#### Scenario: Sitemap excludes private or admin pages

- **GIVEN** the sitemap generation logic runs
- **WHEN** it enumerates routes
- **THEN** it excludes any routes under `/admin` or marked as private (e.g., via route metadata), ensuring only public-facing pages are listed.

### Requirement: Robots.txt Configuration

The project MUST serve a `/robots.txt` file that allows all crawlers, references the sitemap location, and blocks any private or admin routes.

#### Scenario: Robots.txt allows crawlers

- **GIVEN** a search engine crawler requests `/robots.txt`
- **WHEN** the file is served
- **THEN** it contains `User-agent: *` and `Allow: /`, indicating all crawlers are permitted to index all public pages.

#### Scenario: Robots.txt references sitemap

- **GIVEN** a crawler reads `/robots.txt`
- **WHEN** the file is parsed
- **THEN** it includes a `Sitemap:` directive pointing to `https://creepjs.org/sitemap.xml`.

### Requirement: Structured Data (JSON-LD)

The project MUST embed JSON-LD structured data in the HTML to provide search engines with semantic information about the organization, web application, and software SDK.

#### Scenario: Organization schema on all pages

- **GIVEN** a user visits any page
- **WHEN** the HTML is rendered
- **THEN** it includes a JSON-LD script tag with `@type: Organization`, containing name ("CreepJS"), url ("https://creepjs.org"), logo, and social media profile links.

#### Scenario: WebApplication schema on landing page

- **GIVEN** a user visits the landing page
- **WHEN** the HTML is rendered
- **THEN** it includes a JSON-LD script tag with `@type: WebApplication`, describing the CreepJS platform (name, description, url, applicationCategory: "DeveloperApplication", offers: free tier details).

#### Scenario: SoftwareApplication schema on docs/SDK pages

- **GIVEN** a user visits the SDK documentation page
- **WHEN** the HTML is rendered
- **THEN** it includes a JSON-LD script tag with `@type: SoftwareApplication`, describing the CreepJS SDK (name, version, operatingSystem: "browser", applicationCategory: "DeveloperApplication", downloadUrl, installUrl pointing to npm).

### Requirement: Open Graph Image Assets

The project MUST provide Open Graph images (1200x630px) for social media previews, with a global default image and optional page-specific images.

#### Scenario: Global OG image used by default

- **GIVEN** a page does not specify a custom Open Graph image
- **WHEN** metadata is rendered
- **THEN** the `og:image` tag points to `/og-image.png` (1200x630px), and social platforms display this image in preview cards.

#### Scenario: Page-specific OG image overrides global

- **GIVEN** the demo page specifies a custom OG image path
- **WHEN** metadata is rendered
- **THEN** the `og:image` tag points to the custom image (e.g., `/og-demo.png`), and social platforms use this image for the demo page preview.

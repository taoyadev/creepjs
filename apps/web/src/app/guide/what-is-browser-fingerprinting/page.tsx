import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { StructuredData } from '@/components/StructuredData';
import { generateMetadata, SITE_CONFIG, structuredData } from '@/lib/metadata';
import { SeoInternalLinks } from '@/components/SeoInternalLinks';
import { TrackedLink } from '@/components/TrackedLink';

const CANONICAL_PATH = '/guide/what-is-browser-fingerprinting';
const CANONICAL_URL = `${SITE_CONFIG.url}${CANONICAL_PATH}`;

const baseMetadata = generateMetadata({
  title: 'What is Browser Fingerprinting? Complete Guide',
  description:
    'Learn what browser fingerprinting is, how it works, privacy implications, and how to protect yourself. Comprehensive guide from CreepJS.',
  path: CANONICAL_PATH,
});

export const metadata: Metadata = {
  ...baseMetadata,
  keywords: [
    ...(Array.isArray(baseMetadata.keywords) ? baseMetadata.keywords : []),
    'tracking',
    'online privacy',
  ],
  openGraph: {
    ...(baseMetadata.openGraph ?? {}),
    type: 'article',
    url: CANONICAL_URL,
  },
  alternates: { canonical: CANONICAL_URL },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is browser fingerprinting?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Browser fingerprinting is a tracking method that identifies users by collecting unique device and browser characteristics like screen resolution, installed fonts, canvas rendering, and WebGL data. Unlike cookies, fingerprints cannot be easily deleted or blocked.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is browser fingerprinting legal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Browser fingerprinting is generally legal but subject to privacy regulations like GDPR and CCPA. Companies must disclose tracking practices in their privacy policies and obtain consent in certain jurisdictions. Some privacy-focused browsers block fingerprinting by default.',
      },
    },
    {
      '@type': 'Question',
      name: 'How accurate is browser fingerprinting?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Research shows browser fingerprinting can identify 80-90% of users uniquely. The Electronic Frontier Foundation found that 94% of browsers have a unique fingerprint. When combined with IP address and other tracking methods, accuracy approaches 99%.',
      },
    },
    {
      '@type': 'Question',
      name: 'How can I protect against browser fingerprinting?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Use privacy-focused browsers like Tor Browser or Brave, install browser extensions that randomize fingerprint data, disable JavaScript when possible, use a VPN to hide your IP, and keep your browser updated to take advantage of new privacy protections.',
      },
    },
  ],
};

export default function BrowserFingerprintingGuide() {
  return (
    <>
      <StructuredData
        data={[
          structuredData.techArticle({
            headline: 'What Is Browser Fingerprinting? Complete Guide',
            description:
              'Learn what browser fingerprinting is, how it works, privacy implications, and how to protect yourself.',
            path: CANONICAL_PATH,
            keywords: [
              'browser fingerprinting',
              'online privacy',
              'tracking',
              'fingerprinting guide',
            ],
          }),
          faqSchema,
          structuredData.breadcrumb([
            { name: 'Home', url: SITE_CONFIG.url },
            {
              name: 'What is Browser Fingerprinting',
              url: CANONICAL_URL,
            },
          ]),
        ]}
      />

      <div className="from-background to-secondary min-h-screen bg-gradient-to-b">
        <div className="container mx-auto max-w-4xl px-4 py-16 md:py-24">
          {/* Breadcrumb */}
          <nav
            className="text-muted-foreground mb-8 text-sm"
            aria-label="Breadcrumb"
          >
            <ol className="flex items-center gap-2">
              <li>
                <Link href="/" className="hover:text-foreground">
                  Home
                </Link>
              </li>
              <li>/</li>
              <li className="text-foreground">
                What is Browser Fingerprinting
              </li>
            </ol>
          </nav>

          {/* Article Header */}
          <header className="mb-12">
            <h1 className="mb-6 text-4xl font-bold md:text-5xl">
              What is Browser Fingerprinting?
            </h1>
            <p className="text-muted-foreground text-xl leading-relaxed">
              Browser fingerprinting is a sophisticated tracking technique that
              identifies your device by collecting unique characteristics from
              your browser and hardware. Unlike cookies, fingerprints persist
              even when you clear your browsing data.
            </p>
            <div className="text-muted-foreground mt-6 flex items-center gap-4 text-sm">
              <time dateTime="2025-01-15">Updated January 15, 2025</time>
              <span>•</span>
              <span>12 min read</span>
            </div>
          </header>

          {/* Table of Contents */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle>Table of Contents</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#definition"
                    className="text-primary hover:underline"
                  >
                    Definition & How It Works
                  </a>
                </li>
                <li>
                  <a
                    href="#techniques"
                    className="text-primary hover:underline"
                  >
                    Fingerprinting Techniques
                  </a>
                </li>
                <li>
                  <a href="#accuracy" className="text-primary hover:underline">
                    How Accurate Is It?
                  </a>
                </li>
                <li>
                  <a href="#privacy" className="text-primary hover:underline">
                    Privacy Implications
                  </a>
                </li>
                <li>
                  <a
                    href="#protection"
                    className="text-primary hover:underline"
                  >
                    How to Protect Yourself
                  </a>
                </li>
                <li>
                  <a href="#faq" className="text-primary hover:underline">
                    FAQ
                  </a>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Main Content */}
          <article className="prose prose-lg dark:prose-invert max-w-none">
            {/* Definition Section */}
            <section id="definition" className="mb-16">
              <h2 className="mb-6 text-3xl font-bold">
                What is Browser Fingerprinting?
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Browser fingerprinting is a method of tracking web browsers by
                the configuration and settings information they make visible to
                websites, rather than traditional identifiers like cookies. This
                creates a unique identifier—a "fingerprint"—that can be used to
                track you across the internet.
              </p>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Think of it like this: if someone described your appearance,
                your gait, your voice, and your habits, they could identify you
                even without knowing your name. Browser fingerprinting does the
                same thing for your web browser.
              </p>
              <Card className="bg-primary/5 border-primary/20 my-6">
                <CardContent className="p-6">
                  <h3 className="mb-2 text-lg font-semibold">
                    Key Difference from Cookies
                  </h3>
                  <p className="text-muted-foreground">
                    Unlike cookies, which are stored on your device and can be
                    deleted, browser fingerprints are calculated from your
                    device's inherent characteristics. You cannot simply "clear"
                    your fingerprint without fundamentally changing your browser
                    or device configuration.
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* Techniques Section */}
            <section id="techniques" className="mb-16">
              <h2 className="mb-6 text-3xl font-bold">
                Common Fingerprinting Techniques
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Dozens of data points are collected to create a browser
                fingerprint. Here are the most significant ones:
              </p>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Canvas Fingerprinting
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      Draws invisible text and shapes on an HTML5 canvas and
                      analyzes the resulting pixel data. Different GPUs,
                      browsers, and operating systems render slightly
                      differently, creating a unique signature.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      WebGL Fingerprinting
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      Extracts graphics card information including vendor,
                      renderer, supported extensions, and maximum texture sizes.
                      This data varies significantly between devices.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Font Detection</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      Measures which fonts are installed on your system by
                      checking which fonts can render specific text characters.
                      The combination of installed fonts is highly unique.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Audio Fingerprinting
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      Uses the Web Audio API to generate sound and analyze how
                      your device processes it. Audio stack implementations vary
                      between browsers and operating systems.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Screen & Display</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      Collects screen resolution, color depth, pixel ratio, and
                      whether certain display features are supported. Uncommon
                      resolutions are highly identifying.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Hardware Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      Detects CPU cores, device memory, GPU model, touch
                      support, and battery status. The combination creates a
                      unique hardware profile.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Accuracy Section */}
            <section id="accuracy" className="mb-16">
              <h2 className="mb-6 text-3xl font-bold">
                How Accurate Is Browser Fingerprinting?
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Browser fingerprinting is remarkably effective. Research from
                the Electronic Frontier Foundation found:
              </p>
              <ul className="text-muted-foreground mb-6 list-disc space-y-2 pl-6">
                <li>
                  <strong>84%</strong> of browsers had a unique fingerprint in
                  their 2010 study
                </li>
                <li>
                  <strong>94%</strong> of browsers had a unique fingerprint in
                  their updated 2021 study
                </li>
                <li>
                  <strong>99.24%</strong> of users can be uniquely identified
                  when combining browser and device characteristics
                </li>
                <li>
                  <strong>80-90%</strong> of browser fingerprints remain stable
                  across sessions
                </li>
              </ul>
              <Card className="my-6 border-amber-500/20 bg-amber-500/10">
                <CardContent className="p-6">
                  <p className="text-amber-900 dark:text-amber-200">
                    <strong>Important:</strong> The more unique your device
                    configuration (uncommon screen size, rare fonts, specific
                    GPU), the easier it is to fingerprint you. Common
                    configurations provide some natural protection.
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* Privacy Section */}
            <section id="privacy" className="mb-16">
              <h2 className="mb-6 text-3xl font-bold">Privacy Implications</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Browser fingerprinting enables persistent tracking that bypasses
                user controls:
              </p>
              <div className="mb-6 space-y-4">
                <div className="border-l-4 border-red-500 pl-4">
                  <h3 className="mb-1 font-semibold">Cross-Site Tracking</h3>
                  <p className="text-muted-foreground text-sm">
                    Websites can recognize you when you return, even if you
                    cleared cookies or use private browsing mode.
                  </p>
                </div>
                <div className="border-l-4 border-red-500 pl-4">
                  <h3 className="mb-1 font-semibold">Profile Building</h3>
                  <p className="text-muted-foreground text-sm">
                    Advertisers build detailed profiles of your browsing habits
                    across different websites and sessions.
                  </p>
                </div>
                <div className="border-l-4 border-red-500 pl-4">
                  <h3 className="mb-1 font-semibold">Anti-Fraud Evasion</h3>
                  <p className="text-muted-foreground text-sm">
                    While fingerprinting can detect fraudsters, the same
                    technology can be used to bypass VPNs and privacy tools.
                  </p>
                </div>
                <div className="border-l-4 border-red-500 pl-4">
                  <h3 className="mb-1 font-semibold">No Universal Opt-Out</h3>
                  <p className="text-muted-foreground text-sm">
                    Unlike cookies, there's no simple way to opt out of
                    fingerprinting through browser settings alone.
                  </p>
                </div>
              </div>
            </section>

            {/* Protection Section */}
            <section id="protection" className="mb-16">
              <h2 className="mb-6 text-3xl font-bold">
                How to Protect Yourself
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                While complete protection is difficult, these strategies
                significantly reduce your fingerprintability:
              </p>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      1. Use Privacy-Focused Browsers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-muted-foreground list-disc space-y-1 pl-6 text-sm">
                      <li>
                        <strong>Tor Browser:</strong> Makes all users appear
                        identical by standardizing window size, fonts, and other
                        attributes
                      </li>
                      <li>
                        <strong>Brave:</strong> Blocks fingerprinting scripts
                        and randomizes certain fingerprintable attributes
                      </li>
                      <li>
                        <strong>Firefox:</strong> Enhanced Tracking Protection
                        and resistFingerprinting option
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      2. Install Privacy Extensions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-muted-foreground list-disc space-y-1 pl-6 text-sm">
                      <li>
                        <strong>uBlock Origin:</strong> Blocks tracking scripts
                        and pixels
                      </li>
                      <li>
                        <strong>Privacy Badger:</strong> Learn and block
                        invisible trackers
                      </li>
                      <li>
                        <strong>Canvas Defender:</strong> Adds noise to canvas
                        fingerprinting
                      </li>
                      <li>
                        <strong>Ghostery:</strong> Blocks trackers and provides
                        transparency
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      3. Disable JavaScript
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      Most fingerprinting requires JavaScript. Disabling it
                      provides strong protection but breaks many websites.
                      Consider using NoScript to selectively enable JavaScript
                      only when needed.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">4. Use a VPN</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      While VPNs don't prevent fingerprinting, they hide your
                      real IP address, making it harder to correlate your
                      fingerprint with your actual identity.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      5. Keep Software Updated
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      Modern browsers are adding more anti-fingerprinting
                      protections. Keep your browser updated to benefit from
                      these improvements.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="mb-16">
              <h2 className="mb-6 text-3xl font-bold">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                <details className="rounded-lg border">
                  <summary className="cursor-pointer p-4 font-semibold">
                    Can websites be blocked from fingerprinting?
                  </summary>
                  <div className="text-muted-foreground px-4 pb-4 text-sm">
                    <p>
                      There's no perfect block, but privacy browsers and
                      extensions can significantly reduce fingerprinting
                      effectiveness. The Tor Browser offers the strongest
                      protection by making all users appear identical.
                    </p>
                  </div>
                </details>
                <details className="rounded-lg border">
                  <summary className="cursor-pointer p-4 font-semibold">
                    Is browser fingerprinting always used for tracking?
                  </summary>
                  <div className="text-muted-foreground px-4 pb-4 text-sm">
                    <p>
                      No, it has legitimate uses too: fraud detection, bot
                      prevention, security analytics, and preventing account
                      takeovers. However, the same technology is used for
                      advertising tracking.
                    </p>
                  </div>
                </details>
                <details className="rounded-lg border">
                  <summary className="cursor-pointer p-4 font-semibold">
                    Does private browsing prevent fingerprinting?
                  </summary>
                  <div className="text-muted-foreground px-4 pb-4 text-sm">
                    <p>
                      No. Private/incognito mode only clears cookies and local
                      storage. Your browser fingerprint remains the same because
                      it's based on your device's inherent characteristics, not
                      stored data.
                    </p>
                  </div>
                </details>
                <details className="rounded-lg border">
                  <summary className="cursor-pointer p-4 font-semibold">
                    Can I check my own browser fingerprint?
                  </summary>
                  <div className="text-muted-foreground px-4 pb-4 text-sm">
                    <p>
                      Yes! You can check your browser fingerprint right here on
                      CreepJS. Visit our{' '}
                      <Link
                        href="/checker"
                        className="text-primary hover:underline"
                      >
                        fingerprint checker
                      </Link>{' '}
                      to see what information your browser exposes.
                    </p>
                  </div>
                </details>
                <details className="rounded-lg border">
                  <summary className="cursor-pointer p-4 font-semibold">
                    Do mobile devices have unique fingerprints too?
                  </summary>
                  <div className="text-muted-foreground px-4 pb-4 text-sm">
                    <p>
                      Yes, but mobile devices are less fingerprintable because
                      they have more standardized hardware and screen sizes. iOS
                      devices are particularly uniform, making them harder to
                      distinguish via fingerprinting alone.
                    </p>
                  </div>
                </details>
              </div>
            </section>
          </article>

          {/* CTA Section */}
          <Card className="from-primary to-primary/80 text-primary-foreground mt-16 bg-gradient-to-r">
            <CardContent className="p-8 text-center">
              <h2 className="mb-4 text-2xl font-bold">
                Check Your Browser Fingerprint
              </h2>
              <p className="mb-6 opacity-90">
                See exactly what information your browser exposes to websites.
                Test your privacy protections and learn how to improve them.
              </p>
              <TrackedLink
                href="/checker"
                className="text-primary inline-block rounded-full bg-white px-6 py-3 font-semibold"
                eventLabel="guide_checker_cta"
                eventSection="guide-what-is-browser-fingerprinting"
                eventKind="button"
              >
                Check My Fingerprint
              </TrackedLink>
            </CardContent>
          </Card>

          {/* Related Articles */}
          <section className="mt-16">
            <h2 className="mb-6 text-2xl font-bold">Related Articles</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <Link
                href="/docs"
                className="hover:border-primary block rounded-xl border p-4 transition"
              >
                <h3 className="font-semibold">Documentation</h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  Technical details about fingerprinting
                </p>
              </Link>
              <Link
                href="/playground"
                className="hover:border-primary block rounded-xl border p-4 transition"
              >
                <h3 className="font-semibold">Playground</h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  Test individual fingerprinting methods
                </p>
              </Link>
              <Link
                href="/fingerprint/canvas"
                className="hover:border-primary block rounded-xl border p-4 transition"
              >
                <h3 className="font-semibold">Canvas Fingerprinting</h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  Deep dive into canvas fingerprinting
                </p>
              </Link>
            </div>
          </section>
        </div>
      </div>
      <SeoInternalLinks
        currentPath={CANONICAL_PATH}
        title="Continue from the browser fingerprinting guide"
        description="Open the live checker, compare individual fingerprint signals, or review the API documentation for implementation details."
      />
    </>
  );
}

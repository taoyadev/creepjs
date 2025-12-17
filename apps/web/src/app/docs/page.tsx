import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import {
  BookOpen,
  Code,
  Shield,
  Fingerprint,
  Zap,
  Globe,
  Lock,
  AlertCircle,
  CheckCircle,
  Info,
} from 'lucide-react';

export default function DocsPage() {
  return (
    <div className="from-background to-secondary min-h-screen bg-gradient-to-b">
      <div className="container mx-auto max-w-6xl p-4 md:p-8">
        {/* Page Header */}
        <div className="mb-8 space-y-4 text-center">
          <h1 className="text-3xl font-bold md:text-5xl">Documentation</h1>
          <p className="text-muted-foreground mx-auto max-w-3xl text-lg">
            Comprehensive guide to browser fingerprinting with CreepJS. Learn
            how to implement privacy-first device identification, understand
            fingerprinting techniques, and integrate our API into your
            applications.
          </p>
        </div>

        <Tabs defaultValue="introduction" className="space-y-8">
          <TabsList className="grid h-auto w-full grid-cols-2 md:grid-cols-5">
            <TabsTrigger value="introduction" className="text-xs md:text-sm">
              Introduction
            </TabsTrigger>
            <TabsTrigger value="quickstart" className="text-xs md:text-sm">
              Quick Start
            </TabsTrigger>
            <TabsTrigger value="api" className="text-xs md:text-sm">
              API Reference
            </TabsTrigger>
            <TabsTrigger value="collectors" className="text-xs md:text-sm">
              Collectors
            </TabsTrigger>
            <TabsTrigger value="faq" className="text-xs md:text-sm">
              FAQ
            </TabsTrigger>
          </TabsList>

          {/* Introduction Tab */}
          <TabsContent value="introduction" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  What is Browser Fingerprinting?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-relaxed md:text-base">
                <p>
                  Browser fingerprinting is a technique used to identify and
                  track web browsers based on their unique characteristics and
                  configurations. Unlike cookies or local storage, fingerprints
                  are collected from the browser's inherent properties, making
                  them more persistent and harder to block.
                </p>
                <p>
                  Every browser has a unique combination of features including
                  canvas rendering behavior, WebGL capabilities, installed
                  fonts, screen resolution, audio stack properties, and dozens
                  of other parameters. By collecting and hashing these
                  characteristics, we can create a stable identifier that
                  remains consistent across sessions.
                </p>
                <p>
                  CreepJS is an educational platform that demonstrates advanced
                  browser fingerprinting techniques. Our API provides developers
                  with tools to implement device identification for fraud
                  prevention, security analytics, and user experience
                  optimization while respecting privacy regulations like GDPR
                  and CCPA.
                </p>
                <div className="mt-4 rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
                  <div className="flex items-start gap-2">
                    <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" />
                    <div>
                      <p className="mb-1 font-semibold text-blue-500">
                        Educational Purpose
                      </p>
                      <p className="text-muted-foreground text-sm">
                        This platform is designed for educational purposes and
                        legitimate use cases such as fraud detection, bot
                        prevention, and security research. Always respect user
                        privacy and comply with applicable regulations when
                        implementing fingerprinting.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fingerprint className="h-5 w-5" />
                  How CreepJS Works
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-relaxed md:text-base">
                <p>
                  CreepJS collects over 24 different types of browser
                  characteristics, each contributing to the overall fingerprint
                  stability and uniqueness. The process involves three main
                  stages:
                </p>
                <div className="ml-4 space-y-3">
                  <div>
                    <h4 className="mb-1 font-semibold">1. Data Collection</h4>
                    <p className="text-muted-foreground">
                      Our collector modules run directly in the browser,
                      gathering data from Canvas API, WebGL, Navigator
                      properties, Audio Context, Media Devices, CSS rendering,
                      Math operations, and more. Each collector is optimized to
                      avoid detection by anti-fingerprinting tools.
                    </p>
                  </div>
                  <div>
                    <h4 className="mb-1 font-semibold">
                      2. Normalization & Hashing
                    </h4>
                    <p className="text-muted-foreground">
                      Collected data is normalized to handle minor variations
                      and then hashed using MurmurHash3 algorithm. The hash is
                      encoded in Base62 format to produce a compact, URL-safe
                      fingerprint ID that's easy to store and transmit.
                    </p>
                  </div>
                  <div>
                    <h4 className="mb-1 font-semibold">3. Coverage Scoring</h4>
                    <p className="text-muted-foreground">
                      Each fingerprint includes a coverage ratio (0-1)
                      indicating how many collectors finished successfully.
                      Higher coverage means more browser APIs responded, which
                      gives the fingerprint better stability (but it is not a
                      uniqueness metric).
                    </p>
                  </div>
                </div>
                <p className="mt-4">
                  The entire fingerprinting process completes in under 500ms on
                  modern browsers, with minimal impact on page load performance.
                  All processing happens client-side, and we only transmit the
                  final hashed fingerprint ID to our API, never raw browser
                  data.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Use Cases
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm md:text-base">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="mt-1 h-4 w-4 text-green-500" />
                      <div>
                        <p className="font-semibold">Fraud Detection</p>
                        <p className="text-muted-foreground text-xs">
                          Identify suspicious accounts and prevent account
                          takeover attacks
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="mt-1 h-4 w-4 text-green-500" />
                      <div>
                        <p className="font-semibold">Bot Prevention</p>
                        <p className="text-muted-foreground text-xs">
                          Detect automated scrapers and malicious bots
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="mt-1 h-4 w-4 text-green-500" />
                      <div>
                        <p className="font-semibold">Session Continuity</p>
                        <p className="text-muted-foreground text-xs">
                          Maintain user sessions across devices without cookies
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="mt-1 h-4 w-4 text-green-500" />
                      <div>
                        <p className="font-semibold">Analytics Enhancement</p>
                        <p className="text-muted-foreground text-xs">
                          Accurate visitor tracking for analytics platforms
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="mt-1 h-4 w-4 text-green-500" />
                      <div>
                        <p className="font-semibold">Security Research</p>
                        <p className="text-muted-foreground text-xs">
                          Study browser privacy and anti-tracking mechanisms
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="mt-1 h-4 w-4 text-green-500" />
                      <div>
                        <p className="font-semibold">Device Intelligence</p>
                        <p className="text-muted-foreground text-xs">
                          Understand user device profiles and capabilities
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quick Start Tab */}
          <TabsContent value="quickstart" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Installation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm md:text-base">
                  Install the CreepJS SDK via npm or use it directly via CDN.
                  The SDK provides a simple JavaScript API for collecting and
                  submitting fingerprints.
                </p>
                <div>
                  <h4 className="mb-2 text-sm font-semibold">
                    Option 1: NPM Installation
                  </h4>
                  <pre className="bg-muted overflow-x-auto rounded-lg p-4 text-xs md:text-sm">
                    {`npm install @creepjs/sdk
# or
yarn add @creepjs/sdk
# or
pnpm add @creepjs/sdk`}
                  </pre>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-semibold">
                    Option 2: CDN (UMD)
                  </h4>
                  <pre className="bg-muted overflow-x-auto rounded-lg p-4 text-xs md:text-sm">
                    {`<script src="https://cdn.creepjs.org/sdk/v1/creepjs.min.js"></script>
<script>
  // CreepJS is now available globally
  CreepJS.getFingerprint({ token: 'YOUR_TOKEN' })
    .then(fp => console.log(fp.fingerprintId));
</script>`}
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Basic Usage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm md:text-base">
                  After installation, you can collect fingerprints with just a
                  few lines of code:
                </p>
                <pre className="bg-muted overflow-x-auto rounded-lg p-4 text-xs md:text-sm">
                  {`import { getFingerprint } from '@creepjs/sdk';

// Collect fingerprint and send to API
const result = await getFingerprint({
  token: 'cfp_your_api_token_here',
  endpoint: 'https://api.creepjs.org', // optional
  cache: true, // enable localStorage caching
  cacheTtl: 3600, // cache for 1 hour
});

console.log('Fingerprint ID:', result.fingerprintId);
console.log('Coverage:', result.confidence);
console.log('Uniqueness:', result.uniqueness);
console.log('Timestamp:', result.timestamp);

// Check if result was cached
if (result.cached) {
  console.log('Loaded from cache');
}`}
                </pre>
                <div className="mt-4 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="mb-1 font-semibold text-yellow-500">
                        API Token Required
                      </p>
                      <p className="text-muted-foreground text-sm">
                        You need an API token to use CreepJS. Visit the{' '}
                        <Link href="/playground" className="underline">
                          Playground
                        </Link>{' '}
                        to generate a free token (1,000 requests/day). For
                        higher limits, contact us about Pro or Enterprise plans.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SDK Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="p-2 text-left">Option</th>
                        <th className="p-2 text-left">Type</th>
                        <th className="p-2 text-left">Default</th>
                        <th className="p-2 text-left">Description</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs md:text-sm">
                      <tr className="border-b">
                        <td className="p-2">
                          <code>token</code>
                        </td>
                        <td className="text-muted-foreground p-2">string</td>
                        <td className="text-muted-foreground p-2">required</td>
                        <td className="p-2">
                          Your API authentication token (cfp_...)
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">
                          <code>endpoint</code>
                        </td>
                        <td className="text-muted-foreground p-2">string</td>
                        <td className="text-muted-foreground p-2">
                          api.creepjs.org
                        </td>
                        <td className="p-2">
                          API base URL (for self-hosted instances)
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">
                          <code>cache</code>
                        </td>
                        <td className="text-muted-foreground p-2">boolean</td>
                        <td className="text-muted-foreground p-2">true</td>
                        <td className="p-2">
                          Enable localStorage caching of fingerprints
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">
                          <code>cacheTtl</code>
                        </td>
                        <td className="text-muted-foreground p-2">number</td>
                        <td className="text-muted-foreground p-2">3600</td>
                        <td className="p-2">Cache time-to-live in seconds</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">
                          <code>timeout</code>
                        </td>
                        <td className="text-muted-foreground p-2">number</td>
                        <td className="text-muted-foreground p-2">10000</td>
                        <td className="p-2">
                          API request timeout in milliseconds
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Reference Tab */}
          <TabsContent value="api" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Authentication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm md:text-base">
                  All API requests require authentication using an API token.
                  Include your token in the{' '}
                  <code className="bg-muted rounded px-2 py-1">
                    X-API-Token
                  </code>{' '}
                  header:
                </p>
                <pre className="bg-muted overflow-x-auto rounded-lg p-4 text-xs md:text-sm">
                  {`curl -X POST https://api.creepjs.org/v1/fingerprint \\
  -H "Content-Type: application/json" \\
  -H "X-API-Token: cfp_your_token_here" \\
  -d '{"fingerprintId": "abc123...", "data": {...}}'`}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>POST /v1/token</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm md:text-base">
                  Generate a new API token by providing your email address.
                </p>
                <div>
                  <h4 className="mb-2 font-semibold">Request Body</h4>
                  <pre className="bg-muted overflow-x-auto rounded-lg p-4 text-xs">
                    {`{
  "email": "your@email.com"
}`}
                  </pre>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold">Response (200 OK)</h4>
                  <pre className="bg-muted overflow-x-auto rounded-lg p-4 text-xs">
                    {`{
  "token": "cfp_abc123def456...",
  "expiresAt": "2024-12-31T23:59:59Z",
  "rateLimit": {
    "requests": 1000,
    "period": "day"
  }
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>POST /v1/fingerprint</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm md:text-base">
                  Submit fingerprint data for processing and storage.
                </p>
                <div>
                  <h4 className="mb-2 font-semibold">Request Headers</h4>
                  <pre className="bg-muted overflow-x-auto rounded-lg p-4 text-xs">
                    {`Content-Type: application/json
X-API-Token: cfp_your_token_here`}
                  </pre>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold">Request Body</h4>
                  <pre className="bg-muted overflow-x-auto rounded-lg p-4 text-xs">
                    {`{
  "fingerprintId": "abc123def456",
  "confidence": 0.95,
  "timestamp": 1703980800000,
  "data": {
    "canvas": { "hash": "...", "dataURL": "..." },
    "webgl": { "vendor": "...", "renderer": "..." },
    "navigator": { "userAgent": "...", "platform": "..." },
    // ... additional collectors
  }
}`}
                  </pre>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold">Response (200 OK)</h4>
                  <pre className="bg-muted overflow-x-auto rounded-lg p-4 text-xs">
                    {`{
  "success": true,
  "fingerprintId": "abc123def456",
  "stored": true,
  "uniqueness": 0.89,
  "metadata": {
    "firstSeen": "2024-01-01T00:00:00Z",
    "lastSeen": "2024-01-10T12:30:00Z",
    "visitCount": 5
  }
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>GET /v1/fingerprint/:id</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm md:text-base">
                  Retrieve a previously stored fingerprint by its ID.
                </p>
                <div>
                  <h4 className="mb-2 font-semibold">Request</h4>
                  <pre className="bg-muted overflow-x-auto rounded-lg p-4 text-xs">
                    {`GET /v1/fingerprint/abc123def456
Headers:
  X-API-Token: cfp_your_token_here`}
                  </pre>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold">Response (200 OK)</h4>
                  <pre className="bg-muted overflow-x-auto rounded-lg p-4 text-xs">
                    {`{
  "fingerprintId": "abc123def456",
  "confidence": 0.95,
  "uniqueness": 0.89,
  "metadata": {
    "firstSeen": "2024-01-01T00:00:00Z",
    "lastSeen": "2024-01-10T12:30:00Z",
    "visitCount": 5,
    "devices": ["desktop", "mobile"]
  }
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rate Limits & Error Codes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="mb-2 font-semibold">Rate Limits</h4>
                  <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
                    <li>
                      <strong>Free Tier:</strong> 1,000 requests per day
                    </li>
                    <li>
                      <strong>Pro Tier:</strong> 100,000 requests per day
                    </li>
                    <li>
                      <strong>Enterprise:</strong> Unlimited requests with SLA
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold">HTTP Status Codes</h4>
                  <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
                    <li>
                      <code>200 OK</code> - Request successful
                    </li>
                    <li>
                      <code>400 Bad Request</code> - Invalid request body or
                      parameters
                    </li>
                    <li>
                      <code>401 Unauthorized</code> - Missing or invalid API
                      token
                    </li>
                    <li>
                      <code>429 Too Many Requests</code> - Rate limit exceeded
                    </li>
                    <li>
                      <code>500 Internal Server Error</code> - Server error
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Collectors Tab */}
          <TabsContent value="collectors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Fingerprint Collectors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-relaxed md:text-base">
                  CreepJS uses 24+ specialized collectors to gather browser
                  characteristics. Each collector focuses on a specific API or
                  browser feature, contributing to the overall fingerprint
                  uniqueness and stability.
                </p>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Graphics Collectors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <h4 className="font-semibold">Canvas 2D</h4>
                    <p className="text-muted-foreground text-xs">
                      Renders text and shapes to detect anti-aliasing and
                      rendering differences across GPUs and drivers.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">WebGL</h4>
                    <p className="text-muted-foreground text-xs">
                      Collects GPU vendor, renderer, extensions, and rendering
                      capabilities.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">SVG Rendering</h4>
                    <p className="text-muted-foreground text-xs">
                      Measures SVG element dimensions to detect vector graphics
                      rendering variations.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Text Metrics</h4>
                    <p className="text-muted-foreground text-xs">
                      Analyzes text measurement APIs for font rendering
                      differences.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Emoji Rendering</h4>
                    <p className="text-muted-foreground text-xs">
                      Uses DOM rect measurements to detect emoji rendering
                      variations.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">System Collectors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <h4 className="font-semibold">Navigator</h4>
                    <p className="text-muted-foreground text-xs">
                      Collects user agent, platform, language, hardware
                      concurrency, and device memory.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Screen</h4>
                    <p className="text-muted-foreground text-xs">
                      Captures resolution, color depth, pixel ratio, and
                      available screen dimensions.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Fonts</h4>
                    <p className="text-muted-foreground text-xs">
                      Detects installed system fonts using text measurement
                      techniques.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Timezone</h4>
                    <p className="text-muted-foreground text-xs">
                      Identifies timezone, offset, locale, calendar system, and
                      currency settings.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Math Precision</h4>
                    <p className="text-muted-foreground text-xs">
                      Tests JavaScript Math constants and floating-point
                      precision.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Media Collectors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <h4 className="font-semibold">Audio Context</h4>
                    <p className="text-muted-foreground text-xs">
                      Analyzes audio processing characteristics including sample
                      rate and oscillator output.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Media Devices</h4>
                    <p className="text-muted-foreground text-xs">
                      Enumerates available cameras, microphones, and speakers.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Speech Voices</h4>
                    <p className="text-muted-foreground text-xs">
                      Lists available text-to-speech voices and languages.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Browser & Network</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <h4 className="font-semibold">CSS Styles</h4>
                    <p className="text-muted-foreground text-xs">
                      Computes CSS styles and system font stacks.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">HTML Element</h4>
                    <p className="text-muted-foreground text-xs">
                      Analyzes HTML element prototype properties and methods.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">MIME Types</h4>
                    <p className="text-muted-foreground text-xs">
                      Lists browser-supported MIME types for media formats.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">WebRTC</h4>
                    <p className="text-muted-foreground text-xs">
                      Collects ICE candidates and local IP addresses via WebRTC.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Service Worker</h4>
                    <p className="text-muted-foreground text-xs">
                      Detects service worker support and registration status.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Security & Privacy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <h4 className="font-semibold">
                      Anti-Fingerprinting Detection
                    </h4>
                    <p className="text-muted-foreground text-xs">
                      Identifies privacy tools and browser modifications that
                      block fingerprinting.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Lies Detection</h4>
                    <p className="text-muted-foreground text-xs">
                      Detects inconsistencies between reported and actual
                      browser characteristics.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Console Errors</h4>
                    <p className="text-muted-foreground text-xs">
                      Analyzes error stack traces and console API methods.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Additional Collectors
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <h4 className="font-semibold">DOM Rectangle</h4>
                    <p className="text-muted-foreground text-xs">
                      Measures DOM element layout precision.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Content Window</h4>
                    <p className="text-muted-foreground text-xs">
                      Analyzes iframe contentWindow properties.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">CSS Media Queries</h4>
                    <p className="text-muted-foreground text-xs">
                      Tests media query support and system preferences.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privacy & Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="mb-2 font-semibold">
                    Is browser fingerprinting legal?
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    Yes, when used responsibly and in compliance with privacy
                    regulations like GDPR and CCPA. You must inform users about
                    data collection practices and provide opt-out mechanisms.
                    CreepJS is designed for legitimate use cases such as fraud
                    prevention and security analytics, not for covert tracking.
                  </p>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold">
                    What data does CreepJS store?
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    CreepJS only stores hashed fingerprint IDs and metadata
                    (timestamps, visit counts). We never store raw browser
                    characteristics or personally identifiable information. All
                    fingerprint processing happens client-side, and only the
                    final hash is transmitted to our API.
                  </p>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold">
                    Can fingerprinting bypass VPNs or Tor?
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    Fingerprinting works alongside network-based identification,
                    not as a replacement. While VPNs and Tor can mask IP
                    addresses, fingerprinting identifies the browser/device
                    itself. However, privacy-focused browsers like Tor Browser
                    implement anti-fingerprinting measures that significantly
                    reduce fingerprint uniqueness.
                  </p>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold">
                    How stable are fingerprints over time?
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    Fingerprint stability varies by browser and usage patterns.
                    In controlled environments, fingerprints can remain stable
                    for weeks or months. However, browser updates, extension
                    changes, font installations, or screen resolution changes
                    may alter the fingerprint. Our confidence scoring helps you
                    assess fingerprint reliability.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Best Practices
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="mb-2 font-semibold">
                    How should I implement fingerprinting ethically?
                  </h4>
                  <p className="text-muted-foreground mb-2 text-sm">
                    Follow these guidelines for responsible fingerprinting:
                  </p>
                  <ul className="text-muted-foreground ml-4 list-inside list-disc space-y-1 text-sm">
                    <li>Disclose fingerprinting in your privacy policy</li>
                    <li>Provide clear opt-out mechanisms</li>
                    <li>
                      Use fingerprints only for stated purposes (fraud
                      prevention, analytics)
                    </li>
                    <li>
                      Comply with GDPR, CCPA, and other applicable regulations
                    </li>
                    <li>
                      Implement data retention policies and automatic deletion
                    </li>
                    <li>
                      Never combine fingerprints with PII without explicit
                      consent
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold">
                    Should I cache fingerprints?
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    Yes, caching improves performance and reduces API calls.
                    Enable SDK caching with reasonable TTL (1-24 hours). This
                    allows fingerprints to be reused across page loads without
                    re-collection, significantly improving user experience.
                  </p>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold">
                    How do I handle low-confidence fingerprints?
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    Low confidence scores (below 0.6) indicate limited
                    distinguishing characteristics were collected. This often
                    occurs in privacy-focused browsers or with
                    anti-fingerprinting extensions. Consider combining
                    fingerprinting with other identification methods (session
                    cookies, device IDs) for better reliability.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Technical Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="mb-2 font-semibold">
                    What browsers are supported?
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    CreepJS works on all modern browsers: Chrome 90+, Firefox
                    88+, Safari 14+, Edge 90+, Opera 76+. Mobile browsers (iOS
                    Safari, Chrome Android) are fully supported. Some collectors
                    may have limited functionality on older browsers.
                  </p>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold">
                    What's the performance impact?
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    Fingerprint collection typically completes in 200-500ms on
                    modern devices, with minimal CPU and memory overhead. All
                    collection happens asynchronously without blocking the main
                    thread. Page load performance is not affected when using
                    proper async loading techniques.
                  </p>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold">
                    Can I self-host the API?
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    Yes, CreepJS API is open-source and can be self-hosted.
                    Check our GitHub repository for deployment instructions.
                    Self-hosting gives you full control over data storage and
                    processing, which may be required for compliance in certain
                    jurisdictions.
                  </p>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold">
                    How do I upgrade my rate limit?
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    Contact us at hello@creepjs.org to discuss Pro (100K
                    req/day) or Enterprise (unlimited) plans. Enterprise plans
                    include custom SLAs, dedicated support, and advanced
                    analytics features.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer Links */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Related Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Link
                href="/demo"
                className="hover:border-primary block rounded-lg border p-4 transition-colors"
              >
                <div className="mb-1 font-semibold">Live Demo</div>
                <div className="text-muted-foreground text-xs">
                  See your browser's fingerprint in action
                </div>
              </Link>
              <Link
                href="/playground"
                className="hover:border-primary block rounded-lg border p-4 transition-colors"
              >
                <div className="mb-1 font-semibold">API Playground</div>
                <div className="text-muted-foreground text-xs">
                  Test the API interactively with code examples
                </div>
              </Link>
              <a
                href="https://github.com/abrahamjuliot/creepjs"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:border-primary block rounded-lg border p-4 transition-colors"
              >
                <div className="mb-1 font-semibold">GitHub Repository</div>
                <div className="text-muted-foreground text-xs">
                  View source code and contribute
                </div>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

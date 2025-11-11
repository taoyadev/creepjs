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
  Info
} from 'lucide-react';

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <div className="container mx-auto max-w-6xl p-4 md:p-8">
        {/* Page Header */}
        <div className="mb-8 text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-bold">Documentation</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Comprehensive guide to browser fingerprinting with CreepJS. Learn how to implement privacy-first device identification, understand fingerprinting techniques, and integrate our API into your applications.
          </p>
        </div>

        <Tabs defaultValue="introduction" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto">
            <TabsTrigger value="introduction" className="text-xs md:text-sm">Introduction</TabsTrigger>
            <TabsTrigger value="quickstart" className="text-xs md:text-sm">Quick Start</TabsTrigger>
            <TabsTrigger value="api" className="text-xs md:text-sm">API Reference</TabsTrigger>
            <TabsTrigger value="collectors" className="text-xs md:text-sm">Collectors</TabsTrigger>
            <TabsTrigger value="faq" className="text-xs md:text-sm">FAQ</TabsTrigger>
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
              <CardContent className="space-y-4 text-sm md:text-base leading-relaxed">
                <p>
                  Browser fingerprinting is a technique used to identify and track web browsers based on their unique characteristics and configurations. Unlike cookies or local storage, fingerprints are collected from the browser's inherent properties, making them more persistent and harder to block.
                </p>
                <p>
                  Every browser has a unique combination of features including canvas rendering behavior, WebGL capabilities, installed fonts, screen resolution, audio stack properties, and dozens of other parameters. By collecting and hashing these characteristics, we can create a stable identifier that remains consistent across sessions.
                </p>
                <p>
                  CreepJS is an educational platform that demonstrates advanced browser fingerprinting techniques. Our API provides developers with tools to implement device identification for fraud prevention, security analytics, and user experience optimization while respecting privacy regulations like GDPR and CCPA.
                </p>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mt-4">
                  <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-blue-500 mb-1">Educational Purpose</p>
                      <p className="text-sm text-muted-foreground">
                        This platform is designed for educational purposes and legitimate use cases such as fraud detection, bot prevention, and security research. Always respect user privacy and comply with applicable regulations when implementing fingerprinting.
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
              <CardContent className="space-y-4 text-sm md:text-base leading-relaxed">
                <p>
                  CreepJS collects over 24 different types of browser characteristics, each contributing to the overall fingerprint stability and uniqueness. The process involves three main stages:
                </p>
                <div className="space-y-3 ml-4">
                  <div>
                    <h4 className="font-semibold mb-1">1. Data Collection</h4>
                    <p className="text-muted-foreground">
                      Our collector modules run directly in the browser, gathering data from Canvas API, WebGL, Navigator properties, Audio Context, Media Devices, CSS rendering, Math operations, and more. Each collector is optimized to avoid detection by anti-fingerprinting tools.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">2. Normalization & Hashing</h4>
                    <p className="text-muted-foreground">
                      Collected data is normalized to handle minor variations and then hashed using MurmurHash3 algorithm. The hash is encoded in Base62 format to produce a compact, URL-safe fingerprint ID that's easy to store and transmit.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">3. Confidence Scoring</h4>
                    <p className="text-muted-foreground">
                      Each fingerprint includes a confidence score (0-1) indicating its reliability and uniqueness. Higher scores mean more distinguishing characteristics were successfully collected, resulting in better identification accuracy.
                    </p>
                  </div>
                </div>
                <p className="mt-4">
                  The entire fingerprinting process completes in under 500ms on modern browsers, with minimal impact on page load performance. All processing happens client-side, and we only transmit the final hashed fingerprint ID to our API, never raw browser data.
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
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                      <div>
                        <p className="font-semibold">Fraud Detection</p>
                        <p className="text-xs text-muted-foreground">Identify suspicious accounts and prevent account takeover attacks</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                      <div>
                        <p className="font-semibold">Bot Prevention</p>
                        <p className="text-xs text-muted-foreground">Detect automated scrapers and malicious bots</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                      <div>
                        <p className="font-semibold">Session Continuity</p>
                        <p className="text-xs text-muted-foreground">Maintain user sessions across devices without cookies</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                      <div>
                        <p className="font-semibold">Analytics Enhancement</p>
                        <p className="text-xs text-muted-foreground">Accurate visitor tracking for analytics platforms</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                      <div>
                        <p className="font-semibold">Security Research</p>
                        <p className="text-xs text-muted-foreground">Study browser privacy and anti-tracking mechanisms</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                      <div>
                        <p className="font-semibold">Device Intelligence</p>
                        <p className="text-xs text-muted-foreground">Understand user device profiles and capabilities</p>
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
                  Install the CreepJS SDK via npm or use it directly via CDN. The SDK provides a simple JavaScript API for collecting and submitting fingerprints.
                </p>
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Option 1: NPM Installation</h4>
                  <pre className="bg-muted p-4 rounded-lg text-xs md:text-sm overflow-x-auto">
{`npm install @creepjs/sdk
# or
yarn add @creepjs/sdk
# or
pnpm add @creepjs/sdk`}
                  </pre>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Option 2: CDN (UMD)</h4>
                  <pre className="bg-muted p-4 rounded-lg text-xs md:text-sm overflow-x-auto">
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
                  After installation, you can collect fingerprints with just a few lines of code:
                </p>
                <pre className="bg-muted p-4 rounded-lg text-xs md:text-sm overflow-x-auto">
{`import { getFingerprint } from '@creepjs/sdk';

// Collect fingerprint and send to API
const result = await getFingerprint({
  token: 'cfp_your_api_token_here',
  endpoint: 'https://api.creepjs.org', // optional
  cache: true, // enable localStorage caching
  cacheTtl: 3600, // cache for 1 hour
});

console.log('Fingerprint ID:', result.fingerprintId);
console.log('Confidence:', result.confidence);
console.log('Uniqueness:', result.uniqueness);
console.log('Timestamp:', result.timestamp);

// Check if result was cached
if (result.cached) {
  console.log('Loaded from cache');
}`}
                </pre>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mt-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="font-semibold text-yellow-500 mb-1">API Token Required</p>
                      <p className="text-sm text-muted-foreground">
                        You need an API token to use CreepJS. Visit the <Link href="/playground" className="underline">Playground</Link> to generate a free token (1,000 requests/day). For higher limits, contact us about Pro or Enterprise plans.
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
                        <th className="text-left p-2">Option</th>
                        <th className="text-left p-2">Type</th>
                        <th className="text-left p-2">Default</th>
                        <th className="text-left p-2">Description</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs md:text-sm">
                      <tr className="border-b">
                        <td className="p-2"><code>token</code></td>
                        <td className="p-2 text-muted-foreground">string</td>
                        <td className="p-2 text-muted-foreground">required</td>
                        <td className="p-2">Your API authentication token (cfp_...)</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2"><code>endpoint</code></td>
                        <td className="p-2 text-muted-foreground">string</td>
                        <td className="p-2 text-muted-foreground">api.creepjs.org</td>
                        <td className="p-2">API base URL (for self-hosted instances)</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2"><code>cache</code></td>
                        <td className="p-2 text-muted-foreground">boolean</td>
                        <td className="p-2 text-muted-foreground">true</td>
                        <td className="p-2">Enable localStorage caching of fingerprints</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2"><code>cacheTtl</code></td>
                        <td className="p-2 text-muted-foreground">number</td>
                        <td className="p-2 text-muted-foreground">3600</td>
                        <td className="p-2">Cache time-to-live in seconds</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2"><code>timeout</code></td>
                        <td className="p-2 text-muted-foreground">number</td>
                        <td className="p-2 text-muted-foreground">10000</td>
                        <td className="p-2">API request timeout in milliseconds</td>
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
                  All API requests require authentication using an API token. Include your token in the <code className="bg-muted px-2 py-1 rounded">X-API-Token</code> header:
                </p>
                <pre className="bg-muted p-4 rounded-lg text-xs md:text-sm overflow-x-auto">
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
                <p className="text-sm md:text-base">Generate a new API token by providing your email address.</p>
                <div>
                  <h4 className="font-semibold mb-2">Request Body</h4>
                  <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`{
  "email": "your@email.com"
}`}
                  </pre>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Response (200 OK)</h4>
                  <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
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
                <p className="text-sm md:text-base">Submit fingerprint data for processing and storage.</p>
                <div>
                  <h4 className="font-semibold mb-2">Request Headers</h4>
                  <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`Content-Type: application/json
X-API-Token: cfp_your_token_here`}
                  </pre>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Request Body</h4>
                  <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
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
                  <h4 className="font-semibold mb-2">Response (200 OK)</h4>
                  <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
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
                <p className="text-sm md:text-base">Retrieve a previously stored fingerprint by its ID.</p>
                <div>
                  <h4 className="font-semibold mb-2">Request</h4>
                  <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`GET /v1/fingerprint/abc123def456
Headers:
  X-API-Token: cfp_your_token_here`}
                  </pre>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Response (200 OK)</h4>
                  <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
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
                  <h4 className="font-semibold mb-2">Rate Limits</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                    <li><strong>Free Tier:</strong> 1,000 requests per day</li>
                    <li><strong>Pro Tier:</strong> 100,000 requests per day</li>
                    <li><strong>Enterprise:</strong> Unlimited requests with SLA</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">HTTP Status Codes</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                    <li><code>200 OK</code> - Request successful</li>
                    <li><code>400 Bad Request</code> - Invalid request body or parameters</li>
                    <li><code>401 Unauthorized</code> - Missing or invalid API token</li>
                    <li><code>429 Too Many Requests</code> - Rate limit exceeded</li>
                    <li><code>500 Internal Server Error</code> - Server error</li>
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
                <p className="text-sm md:text-base leading-relaxed">
                  CreepJS uses 24+ specialized collectors to gather browser characteristics. Each collector focuses on a specific API or browser feature, contributing to the overall fingerprint uniqueness and stability.
                </p>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Graphics Collectors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <h4 className="font-semibold">Canvas 2D</h4>
                    <p className="text-xs text-muted-foreground">Renders text and shapes to detect anti-aliasing and rendering differences across GPUs and drivers.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">WebGL</h4>
                    <p className="text-xs text-muted-foreground">Collects GPU vendor, renderer, extensions, and rendering capabilities.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">SVG Rendering</h4>
                    <p className="text-xs text-muted-foreground">Measures SVG element dimensions to detect vector graphics rendering variations.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Text Metrics</h4>
                    <p className="text-xs text-muted-foreground">Analyzes text measurement APIs for font rendering differences.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Emoji Rendering</h4>
                    <p className="text-xs text-muted-foreground">Uses DOM rect measurements to detect emoji rendering variations.</p>
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
                    <p className="text-xs text-muted-foreground">Collects user agent, platform, language, hardware concurrency, and device memory.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Screen</h4>
                    <p className="text-xs text-muted-foreground">Captures resolution, color depth, pixel ratio, and available screen dimensions.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Fonts</h4>
                    <p className="text-xs text-muted-foreground">Detects installed system fonts using text measurement techniques.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Timezone</h4>
                    <p className="text-xs text-muted-foreground">Identifies timezone, offset, locale, calendar system, and currency settings.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Math Precision</h4>
                    <p className="text-xs text-muted-foreground">Tests JavaScript Math constants and floating-point precision.</p>
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
                    <p className="text-xs text-muted-foreground">Analyzes audio processing characteristics including sample rate and oscillator output.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Media Devices</h4>
                    <p className="text-xs text-muted-foreground">Enumerates available cameras, microphones, and speakers.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Speech Voices</h4>
                    <p className="text-xs text-muted-foreground">Lists available text-to-speech voices and languages.</p>
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
                    <p className="text-xs text-muted-foreground">Computes CSS styles and system font stacks.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">HTML Element</h4>
                    <p className="text-xs text-muted-foreground">Analyzes HTML element prototype properties and methods.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">MIME Types</h4>
                    <p className="text-xs text-muted-foreground">Lists browser-supported MIME types for media formats.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">WebRTC</h4>
                    <p className="text-xs text-muted-foreground">Collects ICE candidates and local IP addresses via WebRTC.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Service Worker</h4>
                    <p className="text-xs text-muted-foreground">Detects service worker support and registration status.</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Security & Privacy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <h4 className="font-semibold">Anti-Fingerprinting Detection</h4>
                    <p className="text-xs text-muted-foreground">Identifies privacy tools and browser modifications that block fingerprinting.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Lies Detection</h4>
                    <p className="text-xs text-muted-foreground">Detects inconsistencies between reported and actual browser characteristics.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Console Errors</h4>
                    <p className="text-xs text-muted-foreground">Analyzes error stack traces and console API methods.</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Additional Collectors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <h4 className="font-semibold">DOM Rectangle</h4>
                    <p className="text-xs text-muted-foreground">Measures DOM element layout precision.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Content Window</h4>
                    <p className="text-xs text-muted-foreground">Analyzes iframe contentWindow properties.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">CSS Media Queries</h4>
                    <p className="text-xs text-muted-foreground">Tests media query support and system preferences.</p>
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
                  <h4 className="font-semibold mb-2">Is browser fingerprinting legal?</h4>
                  <p className="text-sm text-muted-foreground">
                    Yes, when used responsibly and in compliance with privacy regulations like GDPR and CCPA. You must inform users about data collection practices and provide opt-out mechanisms. CreepJS is designed for legitimate use cases such as fraud prevention and security analytics, not for covert tracking.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">What data does CreepJS store?</h4>
                  <p className="text-sm text-muted-foreground">
                    CreepJS only stores hashed fingerprint IDs and metadata (timestamps, visit counts). We never store raw browser characteristics or personally identifiable information. All fingerprint processing happens client-side, and only the final hash is transmitted to our API.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Can fingerprinting bypass VPNs or Tor?</h4>
                  <p className="text-sm text-muted-foreground">
                    Fingerprinting works alongside network-based identification, not as a replacement. While VPNs and Tor can mask IP addresses, fingerprinting identifies the browser/device itself. However, privacy-focused browsers like Tor Browser implement anti-fingerprinting measures that significantly reduce fingerprint uniqueness.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">How stable are fingerprints over time?</h4>
                  <p className="text-sm text-muted-foreground">
                    Fingerprint stability varies by browser and usage patterns. In controlled environments, fingerprints can remain stable for weeks or months. However, browser updates, extension changes, font installations, or screen resolution changes may alter the fingerprint. Our confidence scoring helps you assess fingerprint reliability.
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
                  <h4 className="font-semibold mb-2">How should I implement fingerprinting ethically?</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Follow these guidelines for responsible fingerprinting:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                    <li>Disclose fingerprinting in your privacy policy</li>
                    <li>Provide clear opt-out mechanisms</li>
                    <li>Use fingerprints only for stated purposes (fraud prevention, analytics)</li>
                    <li>Comply with GDPR, CCPA, and other applicable regulations</li>
                    <li>Implement data retention policies and automatic deletion</li>
                    <li>Never combine fingerprints with PII without explicit consent</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Should I cache fingerprints?</h4>
                  <p className="text-sm text-muted-foreground">
                    Yes, caching improves performance and reduces API calls. Enable SDK caching with reasonable TTL (1-24 hours). This allows fingerprints to be reused across page loads without re-collection, significantly improving user experience.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">How do I handle low-confidence fingerprints?</h4>
                  <p className="text-sm text-muted-foreground">
                    Low confidence scores (below 0.6) indicate limited distinguishing characteristics were collected. This often occurs in privacy-focused browsers or with anti-fingerprinting extensions. Consider combining fingerprinting with other identification methods (session cookies, device IDs) for better reliability.
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
                  <h4 className="font-semibold mb-2">What browsers are supported?</h4>
                  <p className="text-sm text-muted-foreground">
                    CreepJS works on all modern browsers: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+, Opera 76+. Mobile browsers (iOS Safari, Chrome Android) are fully supported. Some collectors may have limited functionality on older browsers.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">What's the performance impact?</h4>
                  <p className="text-sm text-muted-foreground">
                    Fingerprint collection typically completes in 200-500ms on modern devices, with minimal CPU and memory overhead. All collection happens asynchronously without blocking the main thread. Page load performance is not affected when using proper async loading techniques.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Can I self-host the API?</h4>
                  <p className="text-sm text-muted-foreground">
                    Yes, CreepJS API is open-source and can be self-hosted. Check our GitHub repository for deployment instructions. Self-hosting gives you full control over data storage and processing, which may be required for compliance in certain jurisdictions.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">How do I upgrade my rate limit?</h4>
                  <p className="text-sm text-muted-foreground">
                    Contact us at contact@creepjs.org to discuss Pro (100K req/day) or Enterprise (unlimited) plans. Enterprise plans include custom SLAs, dedicated support, and advanced analytics features.
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
            <div className="grid md:grid-cols-3 gap-4">
              <Link href="/demo" className="block p-4 rounded-lg border hover:border-primary transition-colors">
                <div className="font-semibold mb-1">Live Demo</div>
                <div className="text-xs text-muted-foreground">See your browser's fingerprint in action</div>
              </Link>
              <Link href="/playground" className="block p-4 rounded-lg border hover:border-primary transition-colors">
                <div className="font-semibold mb-1">API Playground</div>
                <div className="text-xs text-muted-foreground">Test the API interactively with code examples</div>
              </Link>
              <a href="https://github.com/abrahamjuliot/creepjs" target="_blank" rel="noopener noreferrer" className="block p-4 rounded-lg border hover:border-primary transition-colors">
                <div className="font-semibold mb-1">GitHub Repository</div>
                <div className="text-xs text-muted-foreground">View source code and contribute</div>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

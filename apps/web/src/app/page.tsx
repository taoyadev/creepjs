'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { collectFingerprint } from '@creepjs/core';
import type { FingerprintResult } from '@creepjs/core';
import {
  Copy,
  Check,
  Globe,
  MapPin,
  Wifi,
  Monitor,
  Palette,
  Type,
  Fingerprint,
  AlertCircle,
  Shield,
  Cpu,
  HardDrive,
  Languages,
  Eye
} from 'lucide-react';
import Link from 'next/link';

interface IPData {
  ip: string;
  location?: {
    country_code?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };
  asn?: {
    number?: number;
    organization?: string;
    website?: string;
  };
}

interface CollectionProgress {
  current: number;
  total: number;
  currentCollector: string;
}

export default function Home() {
  const [fingerprint, setFingerprint] = useState<FingerprintResult | null>(null);
  const [ipData, setIpData] = useState<IPData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<CollectionProgress>({ current: 0, total: 55, currentCollector: '' });

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      if (cancelled) return;

      setLoading(true);
      setError(null);
      setProgress({ current: 0, total: 55, currentCollector: 'Initializing...' });

      try {
        // Simulate progress updates for better UX
        const collectors = [
          // Graphics (5)
          'Canvas', 'WebGL', 'Emoji Rendering', 'SVG Rendering', 'Text Metrics',
          // Hardware (11)
          'Screen', 'Screen Frame', 'Screen Resolution', 'Color Depth', 'Color Gamut',
          'Hardware Concurrency', 'Device Memory', 'Media Devices', 'Touch Support',
          'Monochrome Display', 'HDR Support',
          // Browser (16)
          'Navigator', 'Browser Vendor', 'Plugins', 'PDF Viewer', 'Cookies Enabled',
          'IndexedDB', 'Local Storage', 'Session Storage', 'Open Database',
          'CSS Styles', 'HTML Element', 'DOM Rectangle', 'MIME Types',
          'Content Window', 'CSS Media Queries', 'Vendor Flavors',
          // System (11)
          'Fonts', 'Font Preferences', 'Timezone', 'Languages', 'Platform',
          'Date/Time Locale', 'CPU Architecture', 'CPU Class', 'OS CPU',
          'Math Precision', 'Console Errors',
          // Audio (2)
          'Audio Context', 'Speech Voices',
          // Accessibility (5)
          'Reduced Motion', 'Reduced Transparency', 'Inverted Colors',
          'Forced Colors', 'Contrast Preference',
          // Privacy (3)
          'Anti-Fingerprinting', 'Private Click Measurement', 'Lies Detection',
          // Network (2)
          'WebRTC', 'Service Worker'
        ];

        // Start collecting data in background
        const dataPromise = Promise.allSettled([
          collectFingerprint(),
          // Fetch IP data in background (don't block fingerprint display)
          fetch('/api/my-ip')
            .then(res => res.ok ? res.json() : null)
            .then((data: IPData | null) => {
              if (data && !cancelled) setIpData(data);
            })
            .catch(ipError => {
              console.warn('Failed to fetch IP data:', ipError);
            })
        ]);

        // Update progress incrementally with optimized timing
        const stepTime = 120; // 120ms per step = 6.6 seconds total for 55 collectors

        for (let i = 0; i < collectors.length; i++) {
          if (cancelled) return;

          setProgress({
            current: i + 1,
            total: collectors.length,
            currentCollector: collectors[i]
          });
          await new Promise(resolve => setTimeout(resolve, stepTime));
        }

        // Wait for data collection to complete
        const [fp] = await dataPromise;

        if (cancelled) return;

        setProgress({ current: 24, total: 24, currentCollector: 'Complete!' });

        // Set fingerprint immediately (don't wait for IP data)
        if (fp.status === 'fulfilled') {
          setFingerprint(fp.value);
        } else {
          console.error('Fingerprint collection failed:', fp.reason);
          throw fp.reason;
        }
      } catch (error) {
        if (cancelled) return;
        console.error('Error collecting data:', error);
        setError('Failed to collect fingerprint data');
      } finally {
        if (!cancelled) {
          setTimeout(() => {
            if (!cancelled) setLoading(false);
          }, 300); // Small delay for smooth transition
        }
      }
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    const progressPercent = (progress.current / progress.total) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary flex items-center justify-center p-4 md:p-8">
        <Card className="w-full max-w-2xl">
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Header with Icon */}
              <div className="text-center space-y-3">
                <div className="flex justify-center">
                  <Fingerprint className="h-16 w-16 text-primary animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold">Analyzing your browser...</h2>
                <p className="text-muted-foreground">
                  Collecting fingerprint data and network information
                </p>
                <p className="text-sm text-muted-foreground">
                  Analyzing {progress.total} unique browser characteristics
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">
                    {progress.current} / {progress.total} ({Math.round(progressPercent)}%)
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Current Collector */}
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-muted-foreground">Currently collecting:</span>
                  <span className="font-medium text-primary">{progress.currentCollector}</span>
                </div>
              </div>

              {/* Collecting Items Grid */}
              <div className="grid grid-cols-6 md:grid-cols-8 gap-2 pt-4">
                {Array.from({ length: progress.total }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i < progress.current
                        ? 'bg-primary'
                        : i === progress.current
                        ? 'bg-primary/50 animate-pulse'
                        : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !fingerprint) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-secondary">
        <Card className="w-full max-w-md">
          <CardHeader>
            <AlertCircle className="mb-2 h-12 w-12 text-destructive" />
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error || 'Failed to collect fingerprint'}</p>
            <Button onClick={() => window.location.reload()} className="mt-4 w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <div className="container mx-auto max-w-7xl px-4 py-4 md:py-8">
        {/* Header */}
        <div className="mb-6 md:mb-8 text-center">
          <h1 className="mb-2 text-2xl md:text-4xl font-bold">Your Browser Fingerprint</h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-3xl mx-auto">
            Real-time analysis of your browser's unique characteristics. Discover what makes your device identifiable and learn about modern tracking techniques used across the web.
          </p>
        </div>

        {/* About Browser Fingerprinting */}
        <Card className="mb-6 md:mb-8 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Fingerprint className="h-5 w-5 text-blue-500" />
              About Browser Fingerprinting
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm md:text-base leading-relaxed">
            <p>
              <strong>Browser fingerprinting</strong> is an advanced tracking technique that identifies your device by collecting and analyzing dozens of unique characteristics from your web browser, operating system, and hardware. Unlike traditional cookies that you can easily delete, these characteristics are inherent to your system configuration and remain consistent across browsing sessions.
            </p>
            <p>
              Every time you visit a website, your browser automatically exposes information about itself - from canvas rendering patterns and WebGL capabilities to installed fonts, screen resolution, timezone settings, audio processing characteristics, and much more. By combining these seemingly innocuous details, websites can create a highly accurate "fingerprint" that uniquely identifies your device with remarkable precision.
            </p>

            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <div className="bg-background/50 rounded-lg p-4 border border-border">
                <div className="font-semibold mb-2 flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-blue-500" />
                  Why It Matters
                </div>
                <p className="text-xs text-muted-foreground">
                  Fingerprinting enables persistent tracking across the web without requiring cookies or user consent. It's used for legitimate purposes like fraud detection and bot prevention, but also raises significant privacy concerns. Understanding what your browser exposes helps you make informed decisions about online privacy.
                </p>
              </div>
              <div className="bg-background/50 rounded-lg p-4 border border-border">
                <div className="font-semibold mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  How Unique Are You?
                </div>
                <p className="text-xs text-muted-foreground">
                  Research shows that 80-90% of browsers have a unique fingerprint. Your specific combination of hardware, software, and configuration creates a signature that's often as distinctive as a physical fingerprint. The confidence score below indicates how unique your device is compared to others.
                </p>
              </div>
              <div className="bg-background/50 rounded-lg p-4 border border-border">
                <div className="font-semibold mb-2 flex items-center gap-2">
                  <Type className="h-4 w-4 text-green-500" />
                  What You Can Do
                </div>
                <p className="text-xs text-muted-foreground">
                  Privacy-focused browsers like Brave and Tor implement anti-fingerprinting measures to make users less distinguishable. Browser extensions can help, but may reduce functionality. Understanding your fingerprint is the first step toward protecting your online privacy. Explore the demo and playground for deeper insights.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <Link href="/demo" className="block">
                <div className="p-4 bg-primary/10 hover:bg-primary/20 rounded-lg border border-primary/20 transition-colors">
                  <div className="font-semibold mb-1 flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Explore Live Demo
                  </div>
                  <p className="text-xs text-muted-foreground">
                    See all 24+ fingerprint collectors in action with real-time data from your browser. Understand exactly what information is being collected and how it contributes to your unique signature.
                  </p>
                </div>
              </Link>
              <Link href="/docs" className="block">
                <div className="p-4 bg-primary/10 hover:bg-primary/20 rounded-lg border border-primary/20 transition-colors">
                  <div className="font-semibold mb-1 flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    Read Documentation
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Learn about the technical details of browser fingerprinting, explore our API documentation, and discover how to implement fingerprinting in your own applications responsibly.
                  </p>
                </div>
              </Link>
            </div>

            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-xs flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <span><strong>Privacy Notice:</strong> All fingerprinting on this page happens entirely in your browser. We collect no personal data, store no fingerprints on our servers, and track no user behavior. This is an educational tool to help you understand browser fingerprinting technology.</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* IP Address Section */}
        {ipData && (
          <Card className="mb-6 md:mb-8 border-2 border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg md:text-xl">Network Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex items-start gap-3">
                  <Wifi className="mt-1 h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">IP Address</div>
                    <code className="text-lg font-mono font-bold">{ipData.ip}</code>
                  </div>
                </div>

                {ipData.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-1 h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Location</div>
                      <div className="text-lg font-semibold">
                        {ipData.location.city || 'Unknown'}, {ipData.location.country_code || 'N/A'}
                      </div>
                      {ipData.location.latitude && ipData.location.longitude && (
                        <div className="text-xs text-muted-foreground">
                          {ipData.location.latitude.toFixed(4)}, {ipData.location.longitude.toFixed(4)}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {ipData.asn && (
                  <div className="flex items-start gap-3">
                    <Globe className="mt-1 h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">ISP</div>
                      <div className="text-lg font-semibold">
                        {ipData.asn.organization || 'Unknown'}
                      </div>
                      {ipData.asn.number && (
                        <div className="text-xs text-muted-foreground">
                          AS{ipData.asn.number}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Fingerprint ID */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Fingerprint className="h-5 w-5 text-primary" />
              <CardTitle>Unique Fingerprint ID</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg bg-muted p-4">
              <code className="text-xl font-mono font-bold md:text-2xl">
                {fingerprint.fingerprintId}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={() => void copyToClipboard(fingerprint.fingerprintId)}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Confidence: <span className="font-semibold text-foreground">
                  {(fingerprint.confidence * 100).toFixed(1)}%
                </span>
              </span>
              <span className="text-muted-foreground">
                This ID is unique to your browser configuration
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Fingerprint Data Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Canvas */}
          {fingerprint.data.canvas && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  <CardTitle>Canvas</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Hash</div>
                    <code className="text-xs break-all">
                      {fingerprint.data.canvas.hash.slice(0, 40)}...
                    </code>
                  </div>
                  {fingerprint.data.canvas.dataURL && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-2">
                        Rendered Image
                      </div>
                      <img
                        src={fingerprint.data.canvas.dataURL}
                        alt="Canvas fingerprint"
                        className="w-full rounded border bg-white"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* WebGL */}
          {fingerprint.data.webgl && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-primary" />
                  <CardTitle>WebGL</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Vendor</div>
                  <div className="font-semibold">{fingerprint.data.webgl.vendor}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Renderer</div>
                  <div className="font-semibold">{fingerprint.data.webgl.renderer}</div>
                </div>
                {fingerprint.data.webgl.unmaskedRenderer && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">GPU</div>
                    <div className="font-semibold text-primary">
                      {fingerprint.data.webgl.unmaskedRenderer}
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Version</div>
                  <code className="text-xs">{fingerprint.data.webgl.version}</code>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigator */}
          {fingerprint.data.navigator && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  <CardTitle>Browser</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Platform</div>
                  <div className="font-semibold">{fingerprint.data.navigator.platform}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Language</div>
                  <div className="font-semibold">{fingerprint.data.navigator.language}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">CPU Cores</div>
                  <div className="font-semibold">
                    {fingerprint.data.navigator.hardwareConcurrency}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">User Agent</div>
                  <code className="text-xs break-all">
                    {fingerprint.data.navigator.userAgent}
                  </code>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Screen */}
          {fingerprint.data.screen && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-primary" />
                  <CardTitle>Screen</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Resolution</div>
                  <div className="text-lg font-bold">
                    {fingerprint.data.screen.width} × {fingerprint.data.screen.height}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Color Depth</div>
                  <div className="font-semibold">
                    {fingerprint.data.screen.colorDepth} bits
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Pixel Ratio</div>
                  <div className="font-semibold">
                    {fingerprint.data.screen.devicePixelRatio}x
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Fonts */}
          {fingerprint.data.fonts && (
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Type className="h-5 w-5 text-primary" />
                  <CardTitle>
                    Detected Fonts ({fingerprint.data.fonts.count})
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {fingerprint.data.fonts.available.slice(0, 30).map((font) => (
                    <span
                      key={font}
                      className="rounded-full bg-muted px-3 py-1 text-sm font-medium"
                    >
                      {font}
                    </span>
                  ))}
                  {fingerprint.data.fonts.count > 30 && (
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                      +{fingerprint.data.fonts.count - 30} more
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timezone */}
          {fingerprint.data.timezone && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  <CardTitle>Timezone</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Timezone</div>
                  <div className="font-semibold">{fingerprint.data.timezone.timezone}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Offset</div>
                  <div className="font-semibold">{fingerprint.data.timezone.timezoneOffset} min</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Locale</div>
                  <div className="font-semibold">{fingerprint.data.timezone.locale}</div>
                </div>
                {fingerprint.data.timezone.currency && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Currency</div>
                    <div className="font-semibold">{fingerprint.data.timezone.currency}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Audio */}
          {fingerprint.data.audio && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-primary" />
                  <CardTitle>Audio</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Hash</div>
                  <code className="text-xs break-all">
                    {fingerprint.data.audio.hash.slice(0, 30)}...
                  </code>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Sample Rate</div>
                  <div className="font-semibold">{fingerprint.data.audio.sampleRate} Hz</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Max Channels</div>
                  <div className="font-semibold">{fingerprint.data.audio.maxChannelCount}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">State</div>
                  <div className="font-semibold">{fingerprint.data.audio.state}</div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Media Devices */}
          {fingerprint.data.media && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-primary" />
                  <CardTitle>Media Devices</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Audio Inputs</div>
                  <div className="font-semibold">{fingerprint.data.media.deviceCount.audioInput}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Audio Outputs</div>
                  <div className="font-semibold">{fingerprint.data.media.deviceCount.audioOutput}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Video Inputs</div>
                  <div className="font-semibold">{fingerprint.data.media.deviceCount.videoInput}</div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Client Rects */}
          {fingerprint.data.clientRects && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  <CardTitle>Emoji Rendering</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Hash</div>
                  <code className="text-xs break-all">
                    {fingerprint.data.clientRects.hash.slice(0, 30)}...
                  </code>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Measurements</div>
                  <div className="font-semibold">{fingerprint.data.clientRects.data.length} values</div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Voices */}
          {fingerprint.data.voices && (
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Type className="h-5 w-5 text-primary" />
                  <CardTitle>Speech Voices ({fingerprint.data.voices.count})</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {fingerprint.data.voices.voices.slice(0, 20).map((voice, idx) => (
                    <span
                      key={idx}
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        voice.default ? 'bg-primary/20 text-primary' : 'bg-muted'
                      }`}
                    >
                      {voice.name} ({voice.lang})
                    </span>
                  ))}
                  {fingerprint.data.voices.count > 20 && (
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                      +{fingerprint.data.voices.count - 20} more
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* SVG */}
          {fingerprint.data.svg && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  <CardTitle>SVG Rendering</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Supported</div>
                  <div className="font-semibold">{fingerprint.data.svg.supported ? 'Yes' : 'No'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Hash</div>
                  <code className="text-xs break-all">
                    {fingerprint.data.svg.hash.slice(0, 30)}...
                  </code>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Measurements</div>
                  <div className="font-semibold">{fingerprint.data.svg.data.length} values</div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Math */}
          {fingerprint.data.math && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-primary" />
                  <CardTitle>Math Runtime</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Hash</div>
                  <code className="text-xs break-all">
                    {fingerprint.data.math.hash.slice(0, 30)}...
                  </code>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">PI</div>
                  <code className="text-xs">{fingerprint.data.math.constants.PI}</code>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">E</div>
                  <code className="text-xs">{fingerprint.data.math.constants.E}</code>
                </div>
              </CardContent>
            </Card>
          )}

          {/* CSS */}
          {fingerprint.data.css && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  <CardTitle>CSS Styles</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Hash</div>
                  <code className="text-xs break-all">
                    {fingerprint.data.css.hash.slice(0, 30)}...
                  </code>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Properties</div>
                  <div className="font-semibold">{Object.keys(fingerprint.data.css.styles).length} computed</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">System Fonts</div>
                  <div className="font-semibold">{Object.keys(fingerprint.data.css.systemFonts).length} detected</div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TextMetrics */}
          {fingerprint.data.textMetrics && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Type className="h-5 w-5 text-primary" />
                  <CardTitle>Text Metrics</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Hash</div>
                  <code className="text-xs break-all">
                    {fingerprint.data.textMetrics.hash.slice(0, 30)}...
                  </code>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Measurements</div>
                  <div className="font-semibold">{fingerprint.data.textMetrics.data.length} values</div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Explore Individual Fingerprints */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-4">
            Explore Individual Fingerprints
          </h2>
          <p className="text-center text-muted-foreground mb-8">
            Test each fingerprinting technique individually with API documentation
          </p>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              // Graphics
              { type: 'canvas', icon: <Palette className="h-5 w-5" />, name: 'Canvas', category: 'Graphics' },
              { type: 'webgl', icon: <Monitor className="h-5 w-5" />, name: 'WebGL', category: 'Graphics' },
              { type: 'emoji-rendering', icon: <Palette className="h-5 w-5" />, name: 'Emoji Rendering', category: 'Graphics' },
              { type: 'svg-rendering', icon: <Palette className="h-5 w-5" />, name: 'SVG Rendering', category: 'Graphics' },
              { type: 'text-metrics', icon: <Type className="h-5 w-5" />, name: 'Text Metrics', category: 'Graphics' },

              // Hardware
              { type: 'screen', icon: <Monitor className="h-5 w-5" />, name: 'Screen', category: 'Hardware' },
              { type: 'screen-frame', icon: <Monitor className="h-5 w-5" />, name: 'Screen Frame', category: 'Hardware' },
              { type: 'screen-resolution', icon: <Monitor className="h-5 w-5" />, name: 'Screen Resolution', category: 'Hardware' },
              { type: 'color-depth', icon: <Monitor className="h-5 w-5" />, name: 'Color Depth', category: 'Hardware' },
              { type: 'color-gamut', icon: <Monitor className="h-5 w-5" />, name: 'Color Gamut', category: 'Hardware' },
              { type: 'hardware-concurrency', icon: <Cpu className="h-5 w-5" />, name: 'Hardware Concurrency', category: 'Hardware' },
              { type: 'device-memory', icon: <HardDrive className="h-5 w-5" />, name: 'Device Memory', category: 'Hardware' },
              { type: 'media-devices', icon: <Monitor className="h-5 w-5" />, name: 'Media Devices', category: 'Hardware' },
              { type: 'touch-support', icon: <Monitor className="h-5 w-5" />, name: 'Touch Support', category: 'Hardware' },
              { type: 'monochrome', icon: <Monitor className="h-5 w-5" />, name: 'Monochrome', category: 'Hardware' },
              { type: 'hdr', icon: <Monitor className="h-5 w-5" />, name: 'HDR Support', category: 'Hardware' },

              // Browser
              { type: 'navigator', icon: <Globe className="h-5 w-5" />, name: 'Navigator', category: 'Browser' },
              { type: 'vendor', icon: <Globe className="h-5 w-5" />, name: 'Browser Vendor', category: 'Browser' },
              { type: 'plugins', icon: <Globe className="h-5 w-5" />, name: 'Plugins', category: 'Browser' },
              { type: 'pdf-viewer', icon: <Globe className="h-5 w-5" />, name: 'PDF Viewer', category: 'Browser' },
              { type: 'cookies-enabled', icon: <Globe className="h-5 w-5" />, name: 'Cookies Enabled', category: 'Browser' },
              { type: 'indexed-db', icon: <Globe className="h-5 w-5" />, name: 'IndexedDB', category: 'Browser' },
              { type: 'local-storage', icon: <Globe className="h-5 w-5" />, name: 'Local Storage', category: 'Browser' },
              { type: 'session-storage', icon: <Globe className="h-5 w-5" />, name: 'Session Storage', category: 'Browser' },
              { type: 'open-database', icon: <Globe className="h-5 w-5" />, name: 'Open Database', category: 'Browser' },
              { type: 'css-styles', icon: <Palette className="h-5 w-5" />, name: 'CSS Styles', category: 'Browser' },
              { type: 'html-element', icon: <Globe className="h-5 w-5" />, name: 'HTML Element', category: 'Browser' },
              { type: 'dom-rect', icon: <Globe className="h-5 w-5" />, name: 'DOM Rect', category: 'Browser' },
              { type: 'mime-types', icon: <Type className="h-5 w-5" />, name: 'MIME Types', category: 'Browser' },
              { type: 'content-window', icon: <Globe className="h-5 w-5" />, name: 'Content Window', category: 'Browser' },
              { type: 'css-media', icon: <Palette className="h-5 w-5" />, name: 'CSS Media', category: 'Browser' },
              { type: 'vendor-flavors', icon: <Globe className="h-5 w-5" />, name: 'Vendor Flavors', category: 'Browser' },

              // System
              { type: 'fonts', icon: <Type className="h-5 w-5" />, name: 'Fonts', category: 'System' },
              { type: 'font-preferences', icon: <Type className="h-5 w-5" />, name: 'Font Preferences', category: 'System' },
              { type: 'timezone', icon: <Globe className="h-5 w-5" />, name: 'Timezone', category: 'System' },
              { type: 'languages', icon: <Languages className="h-5 w-5" />, name: 'Languages', category: 'System' },
              { type: 'platform', icon: <Monitor className="h-5 w-5" />, name: 'Platform', category: 'System' },
              { type: 'date-time-locale', icon: <Globe className="h-5 w-5" />, name: 'Date/Time Locale', category: 'System' },
              { type: 'architecture', icon: <Cpu className="h-5 w-5" />, name: 'CPU Architecture', category: 'System' },
              { type: 'cpu-class', icon: <Cpu className="h-5 w-5" />, name: 'CPU Class', category: 'System' },
              { type: 'os-cpu', icon: <Cpu className="h-5 w-5" />, name: 'OS CPU', category: 'System' },
              { type: 'math-precision', icon: <Monitor className="h-5 w-5" />, name: 'Math Precision', category: 'System' },
              { type: 'console-errors', icon: <Monitor className="h-5 w-5" />, name: 'Console Errors', category: 'System' },

              // Audio
              { type: 'audio', icon: <Monitor className="h-5 w-5" />, name: 'Audio', category: 'Audio' },
              { type: 'speech-voices', icon: <Type className="h-5 w-5" />, name: 'Speech Voices', category: 'Audio' },

              // Accessibility
              { type: 'reduced-motion', icon: <Shield className="h-5 w-5" />, name: 'Reduced Motion', category: 'Accessibility' },
              { type: 'reduced-transparency', icon: <Shield className="h-5 w-5" />, name: 'Reduced Transparency', category: 'Accessibility' },
              { type: 'inverted-colors', icon: <Eye className="h-5 w-5" />, name: 'Inverted Colors', category: 'Accessibility' },
              { type: 'forced-colors', icon: <Shield className="h-5 w-5" />, name: 'Forced Colors', category: 'Accessibility' },
              { type: 'contrast', icon: <Eye className="h-5 w-5" />, name: 'Contrast Preference', category: 'Accessibility' },

              // Privacy
              { type: 'anti-fingerprint', icon: <AlertCircle className="h-5 w-5" />, name: 'Anti-Fingerprint', category: 'Privacy' },
              { type: 'private-click-measurement', icon: <AlertCircle className="h-5 w-5" />, name: 'Private Click Measurement', category: 'Privacy' },
            ].map((item) => (
              <Link key={item.type} href={`/fingerprint/${item.type}`}>
                <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="text-primary">{item.icon}</div>
                      <div>
                        <div className="font-semibold mb-1">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{item.category}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            This fingerprint is generated in real-time from your browser.
            <br />
            <Link href="/docs" className="underline hover:text-foreground">
              Learn more
            </Link> about how browser fingerprinting works.
          </p>
        </div>
      </div>
    </div>
  );
}

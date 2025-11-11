'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { FingerprintResult } from '@creepjs/core';
import { Chrome, Shield, Zap, Check, X, AlertCircle, TrendingUp } from 'lucide-react';

interface BrowserComparisonProps {
  result: FingerprintResult;
}

interface BrowserProfile {
  name: string;
  icon: React.ReactNode;
  privacyScore: number;
  trackingProtection: 'none' | 'basic' | 'strict' | 'maximum';
  features: {
    webrtcLeak: boolean;
    canvasProtection: boolean;
    fontEnumeration: boolean;
    audioProtection: boolean;
    timezoneSpoof: boolean;
    userAgentRotation: boolean;
  };
  pros: string[];
  cons: string[];
  recommended: boolean;
  setup: string[];
}

export function BrowserComparison({ result }: BrowserComparisonProps) {
  const currentBrowserAnalysis = useMemo(() => {
    // Detect current browser type from user agent
    const ua = result.data.navigator?.userAgent || '';
    let browserType: 'chrome' | 'firefox' | 'safari' | 'brave' | 'tor' | 'unknown' = 'unknown';

    if (ua.includes('Brave')) browserType = 'brave';
    else if (ua.includes('Firefox')) browserType = 'firefox';
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browserType = 'safari';
    else if (ua.includes('Chrome')) browserType = 'chrome';

    // Analyze current protections
    const hasWebRTCLeak = result.data.webrtc && result.data.webrtc.candidates.ipv4.length > 0;
    const hasCanvasProtection = result.data.lies && result.data.lies.totalLies > 2;
    const uniqueFonts = result.data.fonts?.available?.length || 0;

    return {
      browserType,
      hasWebRTCLeak,
      hasCanvasProtection,
      uniqueFonts,
      privacyScore: calculatePrivacyScore(result),
    };
  }, [result]);

  const browserProfiles: BrowserProfile[] = [
    {
      name: 'Your Current Browser',
      icon: <Chrome className="h-6 w-6" />,
      privacyScore: currentBrowserAnalysis.privacyScore,
      trackingProtection: currentBrowserAnalysis.privacyScore >= 70 ? 'strict' : currentBrowserAnalysis.privacyScore >= 50 ? 'basic' : 'none',
      features: {
        webrtcLeak: !currentBrowserAnalysis.hasWebRTCLeak,
        canvasProtection: currentBrowserAnalysis.hasCanvasProtection,
        fontEnumeration: currentBrowserAnalysis.uniqueFonts < 20,
        audioProtection: !!result.data.audio,
        timezoneSpoof: false, // Hard to detect automatically
        userAgentRotation: false,
      },
      pros: ['Your current configuration', 'Familiar user experience'],
      cons: getDeficiencies(result, currentBrowserAnalysis),
      recommended: currentBrowserAnalysis.privacyScore >= 80,
      setup: ['This is your current browser', 'Review recommendations below to improve privacy'],
    },
    {
      name: 'Brave Browser (Recommended)',
      icon: <Shield className="h-6 w-6 text-orange-500" />,
      privacyScore: 85,
      trackingProtection: 'strict',
      features: {
        webrtcLeak: true,
        canvasProtection: true,
        fontEnumeration: true,
        audioProtection: true,
        timezoneSpoof: false,
        userAgentRotation: false,
      },
      pros: [
        'Built-in ad/tracker blocking',
        'WebRTC leak protection by default',
        'Canvas and fingerprinting protection',
        'Chromium-based (full compatibility)',
        'Crypto rewards (optional)',
      ],
      cons: ['Some sites may break with strict shields', 'Smaller market share than Chrome'],
      recommended: true,
      setup: [
        'Download from brave.com',
        'Enable "Shields" to Aggressive mode',
        'Settings → Privacy → WebRTC: Disable non-proxied UDP',
        'Install uBlock Origin for extra protection',
      ],
    },
    {
      name: 'Firefox + Privacy Extensions',
      icon: <Zap className="h-6 w-6 text-orange-600" />,
      privacyScore: 82,
      trackingProtection: 'strict',
      features: {
        webrtcLeak: true,
        canvasProtection: true,
        fontEnumeration: true,
        audioProtection: true,
        timezoneSpoof: false,
        userAgentRotation: false,
      },
      pros: [
        'Open source and community-driven',
        'Enhanced Tracking Protection',
        'about:config for advanced hardening',
        'Multi-Account Containers',
        'Strong extension ecosystem',
      ],
      cons: ['Requires manual configuration', 'Some compatibility issues', 'Performance vs Chrome'],
      recommended: true,
      setup: [
        'Download Firefox from mozilla.org',
        'Install: uBlock Origin, Privacy Badger, CanvasBlocker',
        'about:config → media.peerconnection.enabled = false',
        'about:config → privacy.resistFingerprinting = true',
        'Enable Enhanced Tracking Protection (Strict)',
      ],
    },
    {
      name: 'Tor Browser (Maximum Privacy)',
      icon: <Shield className="h-6 w-6 text-purple-600" />,
      privacyScore: 95,
      trackingProtection: 'maximum',
      features: {
        webrtcLeak: true,
        canvasProtection: true,
        fontEnumeration: true,
        audioProtection: true,
        timezoneSpoof: true,
        userAgentRotation: true,
      },
      pros: [
        'Maximum anonymity via Tor network',
        'All fingerprinting protections enabled',
        'IP address completely hidden',
        'Timezone and locale standardization',
        'No tracking possible',
      ],
      cons: [
        'Significantly slower browsing',
        'Many sites block Tor exit nodes',
        'CAPTCHAs on every site',
        'No persistent logins',
        'Limited functionality',
      ],
      recommended: false,
      setup: [
        'Download from torproject.org',
        'Never maximize window (breaks fingerprint resistance)',
        'Use "Safest" security level',
        'Never install additional extensions',
        'Only use for sensitive browsing',
      ],
    },
    {
      name: 'Safari (macOS/iOS)',
      icon: <Chrome className="h-6 w-6 text-blue-500" />,
      privacyScore: 75,
      trackingProtection: 'basic',
      features: {
        webrtcLeak: false,
        canvasProtection: true,
        fontEnumeration: false,
        audioProtection: false,
        timezoneSpoof: false,
        userAgentRotation: false,
      },
      pros: [
        'Intelligent Tracking Prevention (ITP)',
        'Native Apple ecosystem integration',
        'Good performance on Apple devices',
        'Privacy Report dashboard',
      ],
      cons: [
        'macOS/iOS only',
        'Limited extension support',
        'WebRTC leak protection not default',
        'Less configurable than Firefox',
      ],
      recommended: false,
      setup: [
        'Open Safari Preferences → Privacy',
        'Enable "Prevent cross-site tracking"',
        'Enable "Hide IP address from trackers"',
        'Install 1Blocker or AdGuard extension',
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Current Status Card */}
      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Current Browser Analysis
          </CardTitle>
          <CardDescription>
            Your browser has a privacy score of {currentBrowserAnalysis.privacyScore}/100
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Detected Browser</div>
                <div className="text-2xl font-bold capitalize">{currentBrowserAnalysis.browserType}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Privacy Level</div>
                <div
                  className={`text-2xl font-bold ${
                    currentBrowserAnalysis.privacyScore >= 80
                      ? 'text-green-600 dark:text-green-400'
                      : currentBrowserAnalysis.privacyScore >= 60
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {currentBrowserAnalysis.privacyScore >= 80
                    ? 'Good'
                    : currentBrowserAnalysis.privacyScore >= 60
                      ? 'Moderate'
                      : 'Poor'}
                </div>
              </div>
            </div>

            {currentBrowserAnalysis.privacyScore < 80 && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950/50 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1 text-sm">
                    <p className="font-medium text-yellow-900 dark:text-yellow-100">
                      Your privacy can be improved
                    </p>
                    <p className="text-yellow-700 dark:text-yellow-300">
                      Consider switching to a privacy-focused browser or enabling additional protections.
                      Review the recommendations below.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Browser Comparison Cards */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold">Recommended Browsers & Configurations</h3>
        <div className="grid gap-4">
          {browserProfiles.map((browser) => (
            <Card
              key={browser.name}
              className={browser.recommended ? 'border-2 border-green-500/50' : ''}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  {browser.icon}
                  <span>{browser.name}</span>
                  {browser.recommended && (
                    <span className="ml-auto text-xs px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-800">
                      RECOMMENDED
                    </span>
                  )}
                </CardTitle>
                <CardDescription className="flex items-center gap-4">
                  <span>Privacy Score: {browser.privacyScore}/100</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-muted">
                    {browser.trackingProtection.toUpperCase()}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Privacy Score Bar */}
                <div className="space-y-2">
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        browser.privacyScore >= 80
                          ? 'bg-green-500'
                          : browser.privacyScore >= 60
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                      }`}
                      style={{ width: `${browser.privacyScore}%` }}
                    />
                  </div>
                </div>

                {/* Feature Checklist */}
                <div className="grid md:grid-cols-2 gap-3">
                  <FeatureItem
                    enabled={browser.features.webrtcLeak}
                    label="WebRTC Leak Protection"
                  />
                  <FeatureItem
                    enabled={browser.features.canvasProtection}
                    label="Canvas Fingerprint Block"
                  />
                  <FeatureItem
                    enabled={browser.features.fontEnumeration}
                    label="Font Enumeration Block"
                  />
                  <FeatureItem
                    enabled={browser.features.audioProtection}
                    label="Audio Fingerprint Block"
                  />
                  <FeatureItem
                    enabled={browser.features.timezoneSpoof}
                    label="Timezone Spoofing"
                  />
                  <FeatureItem
                    enabled={browser.features.userAgentRotation}
                    label="User Agent Rotation"
                  />
                </div>

                {/* Pros & Cons */}
                <div className="grid md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <div className="font-semibold text-sm text-green-600 dark:text-green-400">
                      Pros:
                    </div>
                    <ul className="space-y-1 text-sm">
                      {browser.pros.map((pro, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <div className="font-semibold text-sm text-red-600 dark:text-red-400">
                      Cons:
                    </div>
                    <ul className="space-y-1 text-sm">
                      {browser.cons.map((con, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <X className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Setup Instructions */}
                <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                  <div className="font-semibold text-sm">Setup Instructions:</div>
                  <ol className="space-y-1 text-sm list-decimal list-inside">
                    {browser.setup.map((step, i) => (
                      <li key={i} className="text-muted-foreground">
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* General Recommendations */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            General Privacy Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Use a VPN</strong> - Hide your real IP address and encrypt traffic
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Install privacy extensions</strong> - uBlock Origin, Privacy Badger, Decentraleyes
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Disable WebRTC</strong> - Prevents IP address leaks through browser settings
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Use different browsers for different purposes</strong> - Work, personal, sensitive
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Clear cookies regularly</strong> - Or use containers/profiles to isolate tracking
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Keep software updated</strong> - Browser, OS, and security extensions
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FeatureItem({ enabled, label }: { enabled: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {enabled ? (
        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
      ) : (
        <X className="h-4 w-4 text-red-600 dark:text-red-400" />
      )}
      <span className={enabled ? '' : 'text-muted-foreground'}>{label}</span>
    </div>
  );
}

function calculatePrivacyScore(result: FingerprintResult): number {
  let score = 100;

  // WebRTC leak (-20 points)
  if (result.data.webrtc && result.data.webrtc.candidates.ipv4.length > 0) {
    score -= 20;
  }

  // Canvas fingerprinting not blocked (-15 points)
  if (result.data.canvas && (!result.data.lies || result.data.lies.totalLies < 2)) {
    score -= 15;
  }

  // Many unique fonts (-10 points)
  const uniqueFonts = result.data.fonts?.available?.length || 0;
  if (uniqueFonts > 30) {
    score -= 10;
  }

  // Audio fingerprinting enabled (-10 points)
  if (result.data.audio && result.data.audio.hash) {
    score -= 10;
  }

  // Timezone reveals location (-10 points)
  if (result.data.timezone && result.data.timezone.timezone && !result.data.timezone.timezone.includes('UTC')) {
    score -= 10;
  }

  // Low confidence suggests tampering (good) (+15 points)
  if (result.confidence < 0.7) {
    score += 15;
  }

  return Math.max(0, Math.min(100, score));
}

function getDeficiencies(result: FingerprintResult, analysis: any): string[] {
  const deficiencies: string[] = [];

  if (analysis.hasWebRTCLeak) {
    deficiencies.push('WebRTC leaks your local IP addresses');
  }

  if (!analysis.hasCanvasProtection) {
    deficiencies.push('Canvas fingerprinting not blocked');
  }

  if (analysis.uniqueFonts > 30) {
    deficiencies.push(`${analysis.uniqueFonts} unique fonts make you highly identifiable`);
  }

  if (result.data.audio && result.data.audio.hash) {
    deficiencies.push('Audio fingerprinting is active');
  }

  if (analysis.privacyScore < 70) {
    deficiencies.push('Overall privacy protection is weak');
  }

  return deficiencies.length > 0 ? deficiencies : ['No major deficiencies detected'];
}

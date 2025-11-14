'use client';

import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { FingerprintResult } from '@creepjs/core';
import {
  Shield,
  AlertTriangle,
  Info,
  Eye,
  Lock,
  MapPin,
  Monitor,
  Globe,
} from 'lucide-react';

interface PrivacyLeakageAssessmentProps {
  result: FingerprintResult;
}

interface PrivacyLeak {
  category: string;
  risk: 'low' | 'medium' | 'high';
  icon: React.ReactNode;
  leaks: Array<{
    name: string;
    value: string;
    sensitivity: 'low' | 'medium' | 'high';
    description: string;
  }>;
}

interface PrivacyScore {
  score: number;
  level: 'excellent' | 'good' | 'poor' | 'critical';
  message: string;
}

export function PrivacyLeakageAssessment({
  result,
}: PrivacyLeakageAssessmentProps) {
  const assessment = useMemo(() => {
    const leaks: PrivacyLeak[] = [];
    let totalRiskScore = 0;
    let riskCount = 0;

    // Location & Network Leaks
    const locationLeaks: PrivacyLeak['leaks'] = [];

    if (result.data.timezone?.timezone) {
      locationLeaks.push({
        name: 'Timezone',
        value: result.data.timezone.timezone,
        sensitivity: 'high',
        description:
          'Reveals your approximate geographical location (city/country level)',
      });
      totalRiskScore += 3;
      riskCount++;
    }

    if (result.data.timezone?.locale) {
      locationLeaks.push({
        name: 'System Locale',
        value: result.data.timezone.locale,
        sensitivity: 'medium',
        description: 'Indicates your language and regional settings',
      });
      totalRiskScore += 2;
      riskCount++;
    }

    if (result.data.webrtc && result.data.webrtc.candidates.ipv4.length > 0) {
      locationLeaks.push({
        name: 'Local IP Addresses',
        value: result.data.webrtc.candidates.ipv4.join(', '),
        sensitivity: 'high',
        description: 'WebRTC leak reveals your local network IP addresses',
      });
      totalRiskScore += 3;
      riskCount++;
    }

    if (locationLeaks.length > 0) {
      leaks.push({
        category: 'Location & Network',
        risk:
          totalRiskScore / riskCount >= 2.5
            ? 'high'
            : totalRiskScore / riskCount >= 1.5
              ? 'medium'
              : 'low',
        icon: <MapPin className="h-5 w-5" />,
        leaks: locationLeaks,
      });
    }

    // Device & Hardware Leaks
    const deviceLeaks: PrivacyLeak['leaks'] = [];
    totalRiskScore = 0;
    riskCount = 0;

    if (result.data.screen) {
      deviceLeaks.push({
        name: 'Screen Resolution',
        value: `${result.data.screen.width}×${result.data.screen.height}`,
        sensitivity: 'medium',
        description:
          'Identifies your display size and potentially device model',
      });
      totalRiskScore += 2;
      riskCount++;
    }

    if (result.data.webgl?.unmaskedRenderer) {
      deviceLeaks.push({
        name: 'GPU Information',
        value: result.data.webgl.unmaskedRenderer,
        sensitivity: 'high',
        description: 'Reveals your graphics card model and driver version',
      });
      totalRiskScore += 3;
      riskCount++;
    }

    if (result.data.hardwareConcurrency) {
      deviceLeaks.push({
        name: 'CPU Cores',
        value: String(result.data.hardwareConcurrency),
        sensitivity: 'medium',
        description: 'Indicates your processor capabilities',
      });
      totalRiskScore += 2;
      riskCount++;
    }

    if (result.data.deviceMemory) {
      deviceLeaks.push({
        name: 'Device Memory',
        value: `${result.data.deviceMemory}GB`,
        sensitivity: 'medium',
        description: 'Reveals your system RAM capacity',
      });
      totalRiskScore += 2;
      riskCount++;
    }

    if (result.data.audioBaseLatency) {
      deviceLeaks.push({
        name: 'Audio Base Latency',
        value:
          result.data.audioBaseLatency.baseLatency !== undefined
            ? `${result.data.audioBaseLatency.baseLatency.toFixed(4)}s`
            : 'Unknown',
        sensitivity: 'low',
        description: 'Indicates audio hardware capabilities',
      });
      totalRiskScore += 1;
      riskCount++;
    }

    if (deviceLeaks.length > 0) {
      leaks.push({
        category: 'Device & Hardware',
        risk:
          totalRiskScore / riskCount >= 2.5
            ? 'high'
            : totalRiskScore / riskCount >= 1.5
              ? 'medium'
              : 'low',
        icon: <Monitor className="h-5 w-5" />,
        leaks: deviceLeaks,
      });
    }

    // Browser & Software Leaks
    const browserLeaks: PrivacyLeak['leaks'] = [];
    totalRiskScore = 0;
    riskCount = 0;

    if (result.data.navigator?.userAgent) {
      browserLeaks.push({
        name: 'User Agent',
        value: result.data.navigator.userAgent,
        sensitivity: 'high',
        description: 'Complete browser, OS, and device identification string',
      });
      totalRiskScore += 3;
      riskCount++;
    }

    if (
      result.data.fonts?.available &&
      result.data.fonts.available.length > 0
    ) {
      browserLeaks.push({
        name: 'Installed Fonts',
        value: `${result.data.fonts.available.length} unique fonts`,
        sensitivity: 'high',
        description:
          'Font list is highly unique and tracks software installations',
      });
      totalRiskScore += 3;
      riskCount++;
    }

    if (
      result.data.domBlockers?.detected &&
      result.data.domBlockers.detected.length > 0
    ) {
      browserLeaks.push({
        name: 'Ad/Privacy Blockers',
        value: result.data.domBlockers.detected.join(', '),
        sensitivity: 'medium',
        description: 'Detected DOM mutations caused by blocker extensions',
      });
      totalRiskScore += 2;
      riskCount++;
    }

    if (result.data.languages && result.data.languages.length > 0) {
      browserLeaks.push({
        name: 'Language Preferences',
        value: result.data.languages.flat().join(', '),
        sensitivity: 'low',
        description: 'Shows your browser language settings',
      });
      totalRiskScore += 1;
      riskCount++;
    }

    if (browserLeaks.length > 0) {
      leaks.push({
        category: 'Browser & Software',
        risk:
          totalRiskScore / riskCount >= 2.5
            ? 'high'
            : totalRiskScore / riskCount >= 1.5
              ? 'medium'
              : 'low',
        icon: <Globe className="h-5 w-5" />,
        leaks: browserLeaks,
      });
    }

    // Tracking & Uniqueness Leaks
    const trackingLeaks: PrivacyLeak['leaks'] = [];
    totalRiskScore = 0;
    riskCount = 0;

    if (result.data.canvas?.hash) {
      trackingLeaks.push({
        name: 'Canvas Fingerprint',
        value: result.data.canvas.hash.substring(0, 16) + '...',
        sensitivity: 'high',
        description: 'Highly unique visual rendering signature for tracking',
      });
      totalRiskScore += 3;
      riskCount++;
    }

    const accessibilityLeaks: PrivacyLeak['leaks'] = [];
    if (result.data.contrast) {
      accessibilityLeaks.push({
        name: 'Contrast Preference',
        value: result.data.contrast,
        sensitivity: 'low',
        description: 'Indicates accessibility settings',
      });
    }
    if (result.data.forcedColors) {
      accessibilityLeaks.push({
        name: 'Forced Colors',
        value: result.data.forcedColors.active ? 'Enabled' : 'Disabled',
        sensitivity: 'low',
        description: 'Shows high-contrast mode usage',
      });
    }
    if (result.data.reducedMotion) {
      accessibilityLeaks.push({
        name: 'Reduced Motion',
        value: result.data.reducedMotion,
        sensitivity: 'low',
        description: 'Reveals motion preference',
      });
    }
    if (result.data.reducedTransparency) {
      accessibilityLeaks.push({
        name: 'Reduced Transparency',
        value: result.data.reducedTransparency,
        sensitivity: 'low',
        description: 'Indicates UI transparency preference',
      });
    }
    if (result.data.hdr) {
      accessibilityLeaks.push({
        name: 'HDR Capability',
        value: result.data.hdr,
        sensitivity: 'low',
        description: 'Shows display class (HDR vs SDR)',
      });
    }
    if (result.data.colorGamut) {
      accessibilityLeaks.push({
        name: 'Color Gamut',
        value: result.data.colorGamut.toUpperCase(),
        sensitivity: 'low',
        description: 'Highlights display color coverage',
      });
    }

    if (accessibilityLeaks.length > 0) {
      leaks.push({
        category: 'Accessibility & Preferences',
        risk: 'low',
        icon: <Eye className="h-5 w-5" />,
        leaks: accessibilityLeaks,
      });
    }

    if (result.data.audio?.hash) {
      trackingLeaks.push({
        name: 'Audio Fingerprint',
        value: result.data.audio.hash.substring(0, 16) + '...',
        sensitivity: 'high',
        description: 'Unique audio processing signature for tracking',
      });
      totalRiskScore += 3;
      riskCount++;
    }

    if (result.data.lies && result.data.lies.liesCount > 0) {
      trackingLeaks.push({
        name: 'Lie Detection',
        value: `${result.data.lies.liesCount} inconsistencies detected`,
        sensitivity: 'high',
        description: 'Indicates use of privacy tools or browser modifications',
      });
      totalRiskScore += 3;
      riskCount++;
    }

    if (trackingLeaks.length > 0) {
      leaks.push({
        category: 'Tracking & Uniqueness',
        risk:
          totalRiskScore / riskCount >= 2.5
            ? 'high'
            : totalRiskScore / riskCount >= 1.5
              ? 'medium'
              : 'low',
        icon: <Eye className="h-5 w-5" />,
        leaks: trackingLeaks,
      });
    }

    // Calculate overall privacy score
    const totalLeaks = leaks.reduce(
      (sum, category) => sum + category.leaks.length,
      0
    );
    const highSensitivityCount = leaks.reduce(
      (sum, category) =>
        sum + category.leaks.filter((l) => l.sensitivity === 'high').length,
      0
    );
    const mediumSensitivityCount = leaks.reduce(
      (sum, category) =>
        sum + category.leaks.filter((l) => l.sensitivity === 'medium').length,
      0
    );
    const lowSensitivityCount = leaks.reduce(
      (sum, category) =>
        sum + category.leaks.filter((l) => l.sensitivity === 'low').length,
      0
    );

    // More balanced scoring formula
    // Weight: high=10, medium=4, low=1
    const riskPoints =
      highSensitivityCount * 10 +
      mediumSensitivityCount * 4 +
      lowSensitivityCount * 1;

    // Calculate base score (0-100 scale)
    // Max expected risk: ~15 high + 10 medium + 10 low = ~200 risk points
    const baseScore = Math.max(0, Math.min(100, 100 - riskPoints / 2));

    let privacyScore: PrivacyScore;
    if (baseScore <= 25) {
      privacyScore = {
        score: Math.round(baseScore),
        level: 'critical',
        message:
          'Your browser leaks extensive personal information. Consider using privacy-focused browsers and VPNs.',
      };
    } else if (baseScore <= 50) {
      privacyScore = {
        score: Math.round(baseScore),
        level: 'poor',
        message:
          'Significant privacy leaks detected. Enable tracking protection and consider browser hardening.',
      };
    } else if (baseScore <= 75) {
      privacyScore = {
        score: Math.round(baseScore),
        level: 'good',
        message:
          'Moderate privacy protection. Some tracking is possible but limited.',
      };
    } else {
      privacyScore = {
        score: Math.round(baseScore),
        level: 'excellent',
        message:
          'Strong privacy protection detected. Your fingerprint reveals minimal personal information.',
      };
    }

    return { leaks, privacyScore };
  }, [result]);

  const { leaks, privacyScore } = assessment;

  const scoreColor =
    privacyScore.level === 'critical'
      ? 'text-red-600 dark:text-red-400'
      : privacyScore.level === 'poor'
        ? 'text-orange-600 dark:text-orange-400'
        : privacyScore.level === 'good'
          ? 'text-yellow-600 dark:text-yellow-400'
          : 'text-green-600 dark:text-green-400';

  const scoreBorder =
    privacyScore.level === 'critical'
      ? 'border-red-500/50 bg-red-500/5'
      : privacyScore.level === 'poor'
        ? 'border-orange-500/50 bg-orange-500/5'
        : privacyScore.level === 'good'
          ? 'border-yellow-500/50 bg-yellow-500/5'
          : 'border-green-500/50 bg-green-500/5';

  return (
    <div className="space-y-6">
      {/* Privacy Score Card */}
      <Card className={`border-2 ${scoreBorder}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Privacy Leakage Assessment
          </CardTitle>
          <CardDescription>
            Analysis of sensitive information exposed by your browser
            fingerprint
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Score Display */}
            <div className="space-y-2 text-center">
              <div className={`text-6xl font-bold ${scoreColor}`}>
                {privacyScore.score}/100
              </div>
              <div className="text-lg font-medium">
                Privacy Protection:{' '}
                <span className={scoreColor}>
                  {privacyScore.level.charAt(0).toUpperCase() +
                    privacyScore.level.slice(1)}
                </span>
              </div>
              <p className="text-muted-foreground mx-auto max-w-md text-sm">
                {privacyScore.message}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-background space-y-1 rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold">{leaks.length}</div>
                <div className="text-muted-foreground text-sm">
                  Leak Categories
                </div>
              </div>
              <div className="bg-background space-y-1 rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold">
                  {leaks.reduce((sum, cat) => sum + cat.leaks.length, 0)}
                </div>
                <div className="text-muted-foreground text-sm">Data Points</div>
              </div>
              <div className="bg-background space-y-1 rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {leaks.reduce(
                    (sum, cat) =>
                      sum +
                      cat.leaks.filter((l) => l.sensitivity === 'high').length,
                    0
                  )}
                </div>
                <div className="text-muted-foreground text-sm">High Risk</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leak Categories */}
      <div className="grid gap-6">
        {leaks.map((category) => (
          <Card key={category.category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {category.icon}
                {category.category}
                <span
                  className={`ml-auto rounded-full px-2 py-1 text-xs ${
                    category.risk === 'high'
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : category.risk === 'medium'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  }`}
                >
                  {category.risk.toUpperCase()} RISK
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {category.leaks.map((leak, index) => (
                  <div
                    key={index}
                    className={`rounded-lg border p-4 ${
                      leak.sensitivity === 'high'
                        ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50'
                        : leak.sensitivity === 'medium'
                          ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/50'
                          : 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex-shrink-0">
                        {leak.sensitivity === 'high' ? (
                          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                        ) : leak.sensitivity === 'medium' ? (
                          <Info className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        ) : (
                          <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-semibold">
                            {leak.name}
                          </div>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs ${
                              leak.sensitivity === 'high'
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                : leak.sensitivity === 'medium'
                                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                  : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            }`}
                          >
                            {leak.sensitivity}
                          </span>
                        </div>
                        <div className="text-muted-foreground truncate font-mono text-sm">
                          {leak.value}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {leak.description}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Privacy Recommendations */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Shield className="text-primary mt-0.5 h-5 w-5 flex-shrink-0" />
              <div className="space-y-2 text-sm">
                <p className="text-foreground font-medium">
                  Privacy Protection Recommendations:
                </p>
                <ul className="text-muted-foreground list-inside list-disc space-y-1">
                  <li>
                    Use privacy-focused browsers (Brave, Firefox with hardening,
                    Tor Browser)
                  </li>
                  <li>
                    Enable tracking protection and disable WebRTC in browser
                    settings
                  </li>
                  <li>Use VPN services to mask your IP address and location</li>
                  <li>
                    Regularly clear cookies and use incognito/private browsing
                    mode
                  </li>
                  <li>
                    Install privacy extensions (uBlock Origin, Privacy Badger,
                    CanvasBlocker)
                  </li>
                  <li>
                    Avoid installing uncommon fonts that make you more unique
                  </li>
                  <li>Use Tor Browser for maximum anonymity when needed</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

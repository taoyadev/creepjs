'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  collectFingerprint,
  collectorTabs,
  getCollectorsForTab,
  getCollectorLabel,
} from '@creepjs/core';
import type { CollectorProgressEvent, FingerprintResult } from '@creepjs/core';
import { Copy, Check, RefreshCw } from 'lucide-react';
import {
  FingerprintCollectorCard,
  DataRow,
  RiskBadge,
} from '@/components/FingerprintCollectorCard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { analytics } from '@/lib/analytics';
import {
  type BaselineResponse,
  fetchBaseline,
  formatBaselineInsight,
  getBaselineEstimate,
} from '@/lib/uniqueness-baseline';

const PanelSkeleton = ({ title }: { title: string }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <div className="bg-muted h-4 w-1/3 animate-pulse rounded" />
        <div className="bg-muted h-4 w-full animate-pulse rounded" />
        <div className="bg-muted h-4 w-5/6 animate-pulse rounded" />
        <div className="bg-muted h-24 w-full animate-pulse rounded" />
      </div>
    </CardContent>
  </Card>
);

const ConfidenceDashboard = dynamic(
  () =>
    import('@/components/ConfidenceDashboard').then(
      (mod) => mod.ConfidenceDashboard
    ),
  {
    ssr: false,
    loading: () => <PanelSkeleton title="Coverage Dashboard" />,
  }
);

const UniquenessAnalysis = dynamic(
  () =>
    import('@/components/UniquenessAnalysis').then(
      (mod) => mod.UniquenessAnalysis
    ),
  {
    ssr: false,
    loading: () => <PanelSkeleton title="Uniqueness Analysis" />,
  }
);

const PrivacyLeakageAssessment = dynamic(
  () =>
    import('@/components/PrivacyLeakageAssessment').then(
      (mod) => mod.PrivacyLeakageAssessment
    ),
  {
    ssr: false,
    loading: () => <PanelSkeleton title="Privacy Leakage Assessment" />,
  }
);

const BrowserComparison = dynamic(
  () =>
    import('@/components/BrowserComparison').then(
      (mod) => mod.BrowserComparison
    ),
  {
    ssr: false,
    loading: () => <PanelSkeleton title="Browser Comparison" />,
  }
);

const FingerprintHistory = dynamic(
  () =>
    import('@/components/FingerprintHistory').then(
      (mod) => mod.FingerprintHistory
    ),
  {
    ssr: false,
    loading: () => <PanelSkeleton title="Fingerprint History" />,
  }
);

const ExportReport = dynamic(
  () => import('@/components/ExportReport').then((mod) => mod.ExportReport),
  {
    ssr: false,
    loading: () => <PanelSkeleton title="Export Report" />,
  }
);

const mediaTabCollectors = getCollectorsForTab('media');
const networkTabCollectors = getCollectorsForTab('network');
const securityTabCollectors = getCollectorsForTab('security');
const accessibilityTabCollectors = getCollectorsForTab('accessibility');
const systemTabCollectors = getCollectorsForTab('system');
const graphicsTabCollectors = getCollectorsForTab('graphics');

interface CollectionProgress {
  current: number;
  total: number;
  currentCollector: string;
}

function scheduleIdle(callback: () => void) {
  if (
    typeof window !== 'undefined' &&
    typeof window.requestIdleCallback === 'function'
  ) {
    const idleId = window.requestIdleCallback(() => callback(), {
      timeout: 1200,
    });
    return () => window.cancelIdleCallback(idleId);
  }

  const timeoutId: ReturnType<typeof globalThis.setTimeout> =
    globalThis.setTimeout(callback, 180);
  return () => globalThis.clearTimeout(timeoutId);
}

function renderNetworkCollectorCard(
  key: string,
  fingerprint: FingerprintResult
) {
  switch (key) {
    case 'webrtc':
      if (!fingerprint.data.webrtc) return null;
      return (
        <FingerprintCollectorCard
          key={key}
          title="WebRTC"
          hash={fingerprint.data.webrtc.hash}
          timing={fingerprint.timings.webrtc}
          className="md:col-span-2"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <DataRow
                label="Supported"
                value={fingerprint.data.webrtc.supported ? 'Yes' : 'No'}
              />
              <DataRow
                label="STUN Supported"
                value={
                  fingerprint.data.webrtc.iceServers.stunSupported
                    ? 'Yes'
                    : 'No'
                }
              />
              <DataRow
                label="Media Devices"
                value={fingerprint.data.webrtc.mediaDevices ? 'Yes' : 'No'}
              />
              <DataRow
                label="getUserMedia"
                value={
                  fingerprint.data.webrtc.getUserMediaSupported ? 'Yes' : 'No'
                }
              />
              <DataRow
                label="Data Channel"
                value={
                  fingerprint.data.webrtc.dataChannelSupported ? 'Yes' : 'No'
                }
              />
            </div>
            <div className="space-y-1">
              <DataRow
                label="Local Candidates"
                value={fingerprint.data.webrtc.candidates.local.length}
              />
              <DataRow
                label="IPv4 Addresses"
                value={fingerprint.data.webrtc.candidates.ipv4.length}
              />
              <DataRow
                label="IPv6 Addresses"
                value={fingerprint.data.webrtc.candidates.ipv6.length}
              />
              <DataRow
                label="Public IPs"
                value={fingerprint.data.webrtc.candidates.public.length}
              />
              <DataRow
                label="Connection State"
                value={
                  fingerprint.data.webrtc.connection.connectionState || 'N/A'
                }
              />
            </div>
          </div>
          {fingerprint.data.webrtc.candidates.ipv4.length > 0 && (
            <div className="mt-2 border-t pt-2">
              <div className="text-muted-foreground mb-1 text-xs">
                Detected IPv4:
              </div>
              <div className="flex flex-wrap gap-2">
                {fingerprint.data.webrtc.candidates.ipv4.map((ip, i) => (
                  <code key={i} className="bg-muted rounded px-2 py-1 text-xs">
                    {ip}
                  </code>
                ))}
              </div>
            </div>
          )}
        </FingerprintCollectorCard>
      );
    case 'serviceWorker':
      if (!fingerprint.data.serviceWorker) return null;
      return (
        <FingerprintCollectorCard
          key={key}
          title="Service Worker"
          hash={fingerprint.data.serviceWorker.hash}
          timing={fingerprint.timings.serviceWorker}
        >
          <DataRow
            label="Supported"
            value={fingerprint.data.serviceWorker.supported ? 'Yes' : 'No'}
          />
          <DataRow
            label="Controller"
            value={fingerprint.data.serviceWorker.controller ? 'Yes' : 'No'}
          />
          <DataRow
            label="Ready"
            value={fingerprint.data.serviceWorker.ready ? 'Yes' : 'No'}
          />
          {fingerprint.data.serviceWorker.state && (
            <DataRow
              label="State"
              value={fingerprint.data.serviceWorker.state}
            />
          )}
        </FingerprintCollectorCard>
      );
    case 'mimeTypes':
      if (!fingerprint.data.mimeTypes) return null;
      return (
        <FingerprintCollectorCard
          key={key}
          title="MIME Types"
          hash={fingerprint.data.mimeTypes.hash}
          timing={fingerprint.timings.mimeTypes}
        >
          <DataRow
            label="Total Types"
            value={fingerprint.data.mimeTypes.count}
          />
        </FingerprintCollectorCard>
      );
    case 'contentWindow':
      if (!fingerprint.data.contentWindow) return null;
      return (
        <FingerprintCollectorCard
          key={key}
          title="Content Window"
          hash={fingerprint.data.contentWindow.hash}
          timing={fingerprint.timings.contentWindow}
        >
          <DataRow
            label="Window Props"
            value={fingerprint.data.contentWindow.windowPropsCount}
          />
          <DataRow
            label="Has Document"
            value={fingerprint.data.contentWindow.hasDocument ? 'Yes' : 'No'}
          />
          <DataRow
            label="Document Props"
            value={fingerprint.data.contentWindow.documentPropsCount}
          />
        </FingerprintCollectorCard>
      );
    case 'cssMedia':
      if (!fingerprint.data.cssMedia) return null;
      return (
        <FingerprintCollectorCard
          key={key}
          title="CSS Media Queries"
          hash={fingerprint.data.cssMedia.hash}
          timing={fingerprint.timings.cssMedia}
        >
          <DataRow
            label="Portrait"
            value={
              fingerprint.data.cssMedia.orientation.portrait ? 'Yes' : 'No'
            }
          />
          <DataRow
            label="Landscape"
            value={
              fingerprint.data.cssMedia.orientation.landscape ? 'Yes' : 'No'
            }
          />
        </FingerprintCollectorCard>
      );
    default:
      return null;
  }
}

function renderMediaCollectorCard(key: string, fingerprint: FingerprintResult) {
  switch (key) {
    case 'audio':
      if (!fingerprint.data.audio) return null;
      return (
        <FingerprintCollectorCard
          key={key}
          title="Audio"
          hash={fingerprint.data.audio.hash}
          timing={fingerprint.timings.audio}
        >
          <DataRow
            label="Sample Rate"
            value={`${fingerprint.data.audio.sampleRate}Hz`}
          />
          <DataRow label="State" value={fingerprint.data.audio.state} />
          <DataRow
            label="Max Channels"
            value={fingerprint.data.audio.maxChannelCount}
          />
          <DataRow
            label="Channel Count"
            value={fingerprint.data.audio.channelCount}
          />
        </FingerprintCollectorCard>
      );
    case 'media':
      if (!fingerprint.data.media) return null;
      return (
        <FingerprintCollectorCard
          key={key}
          title="Media Devices"
          hash={`${fingerprint.data.media.devices.length} devices`}
          timing={fingerprint.timings.media}
        >
          <DataRow
            label="Audio Input"
            value={fingerprint.data.media.deviceCount.audioInput}
          />
          <DataRow
            label="Audio Output"
            value={fingerprint.data.media.deviceCount.audioOutput}
          />
          <DataRow
            label="Video Input"
            value={fingerprint.data.media.deviceCount.videoInput}
          />
        </FingerprintCollectorCard>
      );
    case 'voices':
      if (!fingerprint.data.voices) return null;
      return (
        <FingerprintCollectorCard
          key={key}
          title="Speech Voices"
          hash={`${fingerprint.data.voices.count} voices`}
          timing={fingerprint.timings.voices}
          className="md:col-span-2"
        >
          {fingerprint.data.voices.defaultVoice && (
            <div className="mb-2">
              <DataRow
                label="Default Voice"
                value={fingerprint.data.voices.defaultVoice}
              />
            </div>
          )}
          <div className="text-muted-foreground mb-1 text-sm">
            Available Voices ({fingerprint.data.voices.count}):
          </div>
          <div className="max-h-48 space-y-2 overflow-y-auto">
            {fingerprint.data.voices.voices.map((voice, i) => (
              <div key={i} className="border-b pb-1 text-xs">
                <div className="font-medium">{voice.name}</div>
                <div className="text-muted-foreground">
                  {voice.lang} | {voice.localService ? 'Local' : 'Remote'}
                  {voice.default ? ' | Default' : ''}
                </div>
              </div>
            ))}
          </div>
        </FingerprintCollectorCard>
      );
    case 'clientRects':
      if (!fingerprint.data.clientRects) return null;
      return (
        <FingerprintCollectorCard
          key={key}
          title="Emoji Rendering"
          hash={fingerprint.data.clientRects.hash}
          timing={fingerprint.timings.clientRects}
        >
          <div className="text-muted-foreground mb-1 text-sm">
            Client Rects Data:
          </div>
          <code className="break-all text-xs">
            {fingerprint.data.clientRects.data.slice(0, 10).join(', ')}...
          </code>
        </FingerprintCollectorCard>
      );
    case 'domRect':
      if (!fingerprint.data.domRect) return null;
      return (
        <FingerprintCollectorCard
          key={key}
          title="DOM Rectangle"
          hash={fingerprint.data.domRect.hash}
          timing={fingerprint.timings.domRect}
        >
          <DataRow
            label="DOMRect Support"
            value={fingerprint.data.domRect.domRectSupport ? 'Yes' : 'No'}
          />
          <DataRow
            label="DOMRectReadOnly"
            value={
              fingerprint.data.domRect.domRectReadOnlySupport ? 'Yes' : 'No'
            }
          />
          <DataRow
            label="Range Rect"
            value={fingerprint.data.domRect.rangeRectSupport ? 'Yes' : 'No'}
          />
        </FingerprintCollectorCard>
      );
    default:
      return null;
  }
}

function renderSecurityCollectorCard(
  key: string,
  fingerprint: FingerprintResult
) {
  switch (key) {
    case 'lies':
      if (!fingerprint.data.lies) return null;
      return (
        <FingerprintCollectorCard
          key={key}
          title="Lies Detection"
          hash={fingerprint.data.lies.hash}
          timing={fingerprint.timings.lies}
          className="md:col-span-2"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <DataRow
                label="Lies Count"
                value={fingerprint.data.lies.liesCount}
              />
              <DataRow
                label="Trust Score"
                value={`${fingerprint.data.lies.trustScore}/100`}
              />
              <div className="mt-2">
                <div className="text-muted-foreground mb-1 text-xs">
                  Trust Level:
                </div>
                <div className="bg-muted h-2 w-full rounded-full">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      fingerprint.data.lies.trustScore >= 80
                        ? 'bg-green-500'
                        : fingerprint.data.lies.trustScore >= 60
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    }`}
                    style={{
                      width: `${fingerprint.data.lies.trustScore}%`,
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-1">
              {fingerprint.data.lies.inconsistencies.length > 0 ? (
                <>
                  <div className="text-muted-foreground mb-1 text-xs">
                    Inconsistencies Detected:
                  </div>
                  <div className="max-h-32 space-y-1 overflow-y-auto">
                    {fingerprint.data.lies.inconsistencies.map(
                      (inconsistency, i) => (
                        <div
                          key={i}
                          className="text-xs text-yellow-600 dark:text-yellow-400"
                        >
                          • {inconsistency}
                        </div>
                      )
                    )}
                  </div>
                </>
              ) : (
                <div className="text-xs text-green-600 dark:text-green-400">
                  ✓ No inconsistencies detected
                </div>
              )}
            </div>
          </div>
        </FingerprintCollectorCard>
      );
    case 'resistance':
      if (!fingerprint.data.resistance) return null;
      return (
        <FingerprintCollectorCard
          key={key}
          title="Anti-Fingerprinting Detection"
          timing={fingerprint.timings.resistance}
          className="md:col-span-2"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <DataRow
                label="Privacy Tool Detected"
                value={
                  fingerprint.data.resistance.privacyToolDetected ? (
                    <RiskBadge level="high" label="Detected" />
                  ) : (
                    <RiskBadge level="low" label="Not Detected" />
                  )
                }
              />
              <DataRow
                label="Total Detections"
                value={fingerprint.data.resistance.totalDetections}
                riskLevel={
                  fingerprint.data.resistance.totalDetections > 5
                    ? 'high'
                    : fingerprint.data.resistance.totalDetections > 2
                      ? 'medium'
                      : 'low'
                }
              />
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground mb-1 text-xs">
                Key Indicators:
              </div>
              <div className="space-y-1">
                {fingerprint.data.resistance.detections.webdriver && (
                  <div className="flex items-center gap-2">
                    <RiskBadge level="high" label="Webdriver" />
                  </div>
                )}
                {fingerprint.data.resistance.detections.headless && (
                  <div className="flex items-center gap-2">
                    <RiskBadge level="high" label="Headless Browser" />
                  </div>
                )}
                {fingerprint.data.resistance.detections.puppeteerDetected && (
                  <div className="flex items-center gap-2">
                    <RiskBadge level="high" label="Puppeteer" />
                  </div>
                )}
                {fingerprint.data.resistance.detections.seleniumDetected && (
                  <div className="flex items-center gap-2">
                    <RiskBadge level="high" label="Selenium" />
                  </div>
                )}
                {fingerprint.data.resistance.detections.phantomJSDetected && (
                  <div className="flex items-center gap-2">
                    <RiskBadge level="high" label="PhantomJS" />
                  </div>
                )}
                {fingerprint.data.resistance.totalDetections === 0 && (
                  <div className="flex items-center gap-2">
                    <RiskBadge level="low" label="No Automation Detected" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </FingerprintCollectorCard>
      );
    case 'timezone':
      if (!fingerprint.data.timezone) return null;
      return (
        <FingerprintCollectorCard
          key={key}
          title="Timezone"
          hash={fingerprint.data.timezone.timezone}
          timing={fingerprint.timings.timezone}
        >
          <DataRow
            label="Timezone"
            value={fingerprint.data.timezone.timezone}
          />
          <DataRow
            label="Offset"
            value={`${fingerprint.data.timezone.timezoneOffset} minutes`}
          />
          <DataRow label="Locale" value={fingerprint.data.timezone.locale} />
          {fingerprint.data.timezone.calendar && (
            <DataRow
              label="Calendar"
              value={fingerprint.data.timezone.calendar}
            />
          )}
          {fingerprint.data.timezone.numberingSystem && (
            <DataRow
              label="Numbering System"
              value={fingerprint.data.timezone.numberingSystem}
            />
          )}
          {fingerprint.data.timezone.currency && (
            <DataRow
              label="Currency"
              value={fingerprint.data.timezone.currency}
            />
          )}
        </FingerprintCollectorCard>
      );
    case 'consoleErrors':
      if (!fingerprint.data.consoleErrors) return null;
      return (
        <FingerprintCollectorCard
          key={key}
          title="Console Errors"
          hash={fingerprint.data.consoleErrors.hash}
          timing={fingerprint.timings.consoleErrors}
        >
          <DataRow
            label="Stack Depth"
            value={fingerprint.data.consoleErrors.stackDepth}
          />
          <DataRow
            label="Error Proto Props"
            value={fingerprint.data.consoleErrors.errorProtoProps}
          />
          <DataRow
            label="Console Methods"
            value={fingerprint.data.consoleErrors.consoleMethods.join(', ')}
          />
        </FingerprintCollectorCard>
      );
    default:
      return null;
  }
}

function renderAccessibilityCollectorCard(
  key: string,
  fingerprint: FingerprintResult
) {
  switch (key) {
    case 'accessibilityPreferences':
      if (
        !(
          fingerprint.data.colorGamut ||
          fingerprint.data.contrast ||
          fingerprint.data.forcedColors ||
          fingerprint.data.reducedMotion ||
          fingerprint.data.reducedTransparency ||
          fingerprint.data.hdr ||
          typeof fingerprint.data.monochrome === 'number'
        )
      ) {
        return null;
      }
      return (
        <FingerprintCollectorCard
          key={key}
          title="Accessibility & Preferences"
          className="md:col-span-2"
          timing={
            fingerprint.timings.colorGamut ??
            fingerprint.timings.contrast ??
            fingerprint.timings.forcedColors ??
            fingerprint.timings.reducedMotion ??
            fingerprint.timings.reducedTransparency ??
            fingerprint.timings.hdr ??
            fingerprint.timings.monochrome
          }
        >
          {fingerprint.data.colorGamut && (
            <DataRow
              label="Color Gamut"
              value={fingerprint.data.colorGamut.toUpperCase()}
            />
          )}
          {fingerprint.data.contrast && (
            <DataRow label="Contrast" value={fingerprint.data.contrast} />
          )}
          {typeof fingerprint.data.monochrome === 'number' && (
            <DataRow
              label="Monochrome Depth"
              value={fingerprint.data.monochrome}
            />
          )}
          {fingerprint.data.forcedColors && (
            <DataRow
              label="Forced Colors"
              value={
                fingerprint.data.forcedColors.active ? 'Enabled' : 'Disabled'
              }
            />
          )}
          {fingerprint.data.reducedMotion && (
            <DataRow
              label="Reduced Motion"
              value={fingerprint.data.reducedMotion}
            />
          )}
          {fingerprint.data.reducedTransparency && (
            <DataRow
              label="Reduced Transparency"
              value={fingerprint.data.reducedTransparency}
            />
          )}
          {fingerprint.data.hdr && (
            <DataRow
              label="Dynamic Range"
              value={fingerprint.data.hdr.toUpperCase()}
            />
          )}
        </FingerprintCollectorCard>
      );
    case 'domBlockers':
      if (!fingerprint.data.domBlockers) return null;
      return (
        <FingerprintCollectorCard
          key={key}
          title="Privacy / Ad Blockers"
          timing={fingerprint.timings.domBlockers}
        >
          {fingerprint.data.domBlockers.detected.length === 0 ? (
            <div className="text-muted-foreground text-sm">
              No DOM blocker signatures detected.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {fingerprint.data.domBlockers.detected.map((blocker) => (
                <span
                  key={blocker}
                  className="bg-muted rounded-full px-3 py-1 text-xs font-medium"
                >
                  {blocker}
                </span>
              ))}
            </div>
          )}
        </FingerprintCollectorCard>
      );
    case 'audioBaseLatency':
      if (!fingerprint.data.audioBaseLatency) return null;
      return (
        <FingerprintCollectorCard
          key={key}
          title="Audio Base Latency"
          timing={fingerprint.timings.audioBaseLatency}
        >
          <DataRow
            label="Supported"
            value={fingerprint.data.audioBaseLatency.supported ? 'Yes' : 'No'}
          />
          {fingerprint.data.audioBaseLatency.baseLatency !== undefined && (
            <DataRow
              label="Base Latency"
              value={`${fingerprint.data.audioBaseLatency.baseLatency.toFixed(4)}s`}
            />
          )}
          {fingerprint.data.audioBaseLatency.sampleRate && (
            <DataRow
              label="Sample Rate"
              value={`${fingerprint.data.audioBaseLatency.sampleRate}Hz`}
            />
          )}
        </FingerprintCollectorCard>
      );
    case 'applePay':
      if (!fingerprint.data.applePay) return null;
      return (
        <FingerprintCollectorCard
          key={key}
          title="Apple Pay Capability"
          timing={fingerprint.timings.applePay}
        >
          <DataRow
            label="API Available"
            value={fingerprint.data.applePay.isSupported ? 'Yes' : 'No'}
          />
          {fingerprint.data.applePay.canMakePayments !== undefined && (
            <DataRow
              label="Can Make Payments"
              value={fingerprint.data.applePay.canMakePayments ? 'Yes' : 'No'}
            />
          )}
          {fingerprint.data.applePay.supportedVersions && (
            <DataRow
              label="Supported Versions"
              value={fingerprint.data.applePay.supportedVersions.join(', ')}
            />
          )}
        </FingerprintCollectorCard>
      );
    default:
      return null;
  }
}

function renderSystemCollectorCard(
  key: string,
  fingerprint: FingerprintResult
) {
  switch (key) {
    case 'navigator':
      if (!fingerprint.data.navigator) return null;
      return (
        <FingerprintCollectorCard
          key={key}
          title="Navigator"
          timing={fingerprint.timings.navigator}
          className="md:col-span-2"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <DataRow
                label="Platform"
                value={fingerprint.data.navigator.platform}
              />
              <DataRow
                label="Language"
                value={fingerprint.data.navigator.language}
              />
              {fingerprint.data.languages && (
                <DataRow
                  label="Languages"
                  value={fingerprint.data.languages.flat().join(', ')}
                />
              )}
              {fingerprint.data.hardwareConcurrency && (
                <DataRow
                  label="Hardware Concurrency"
                  value={`${fingerprint.data.hardwareConcurrency} cores`}
                />
              )}
              {fingerprint.data.deviceMemory && (
                <DataRow
                  label="Device Memory"
                  value={`${fingerprint.data.deviceMemory}GB`}
                />
              )}
              {fingerprint.data.touchSupport?.maxTouchPoints !== undefined && (
                <DataRow
                  label="Max Touch Points"
                  value={String(fingerprint.data.touchSupport.maxTouchPoints)}
                />
              )}
            </div>
            <div className="space-y-1">
              <DataRow
                label="Cookie Enabled"
                value={fingerprint.data.navigator.cookieEnabled ? 'Yes' : 'No'}
              />
              <DataRow
                label="DNT"
                value={fingerprint.data.navigator.doNotTrack || 'null'}
              />
              <DataRow
                label="Online"
                value={fingerprint.data.navigator.onLine ? 'Yes' : 'No'}
              />
              {fingerprint.data.navigator.webdriver !== undefined && (
                <DataRow
                  label="Webdriver"
                  value={
                    fingerprint.data.navigator.webdriver ? (
                      <RiskBadge level="high" label="Detected" />
                    ) : (
                      <RiskBadge level="low" label="Not Detected" />
                    )
                  }
                />
              )}
              {fingerprint.data.pdfViewerEnabled !== undefined && (
                <DataRow
                  label="PDF Viewer"
                  value={fingerprint.data.pdfViewerEnabled ? 'Yes' : 'No'}
                />
              )}
            </div>
          </div>
        </FingerprintCollectorCard>
      );
    case 'screen':
      if (!fingerprint.data.screen) return null;
      return (
        <FingerprintCollectorCard
          key={key}
          title="Screen"
          timing={fingerprint.timings.screen}
        >
          <DataRow
            label="Resolution"
            value={`${fingerprint.data.screen.width} × ${fingerprint.data.screen.height}`}
          />
          <DataRow
            label="Available"
            value={`${fingerprint.data.screen.availWidth} × ${fingerprint.data.screen.availHeight}`}
          />
          <DataRow
            label="Color Depth"
            value={`${fingerprint.data.screen.colorDepth} bits`}
          />
          <DataRow
            label="Pixel Depth"
            value={`${fingerprint.data.screen.pixelDepth} bits`}
          />
          <DataRow
            label="Pixel Ratio"
            value={fingerprint.data.screen.devicePixelRatio}
          />
        </FingerprintCollectorCard>
      );
    case 'fonts':
      if (!fingerprint.data.fonts) return null;
      return (
        <FingerprintCollectorCard
          key={key}
          title="Fonts"
          hash={`${fingerprint.data.fonts.count} detected`}
          timing={fingerprint.timings.fonts}
          className="md:col-span-2"
        >
          <div className="text-muted-foreground mb-2 text-sm">
            Detected Fonts ({fingerprint.data.fonts.count}):
          </div>
          <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto">
            {fingerprint.data.fonts.available.map((font) => (
              <span key={font} className="bg-muted rounded px-2 py-1 text-xs">
                {font}
              </span>
            ))}
          </div>
        </FingerprintCollectorCard>
      );
    case 'math':
      if (!fingerprint.data.math) return null;
      return (
        <FingerprintCollectorCard
          key={key}
          title="Math Precision"
          hash={fingerprint.data.math.hash}
          timing={fingerprint.timings.math}
        >
          <div className="text-muted-foreground mb-1 text-sm">Constants:</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            {Object.entries(fingerprint.data.math.constants).map(
              ([name, value]) => (
                <div key={name} className="flex justify-between">
                  <span className="text-muted-foreground">{name}:</span>
                  <code>{value.toFixed(10)}</code>
                </div>
              )
            )}
          </div>
        </FingerprintCollectorCard>
      );
    case 'htmlElement':
      if (!fingerprint.data.htmlElement) return null;
      return (
        <FingerprintCollectorCard
          key={key}
          title="HTML Element"
          hash={fingerprint.data.htmlElement.hash}
          timing={fingerprint.timings.htmlElement}
        >
          <DataRow
            label="Prototype Props"
            value={fingerprint.data.htmlElement.prototypePropsCount}
          />
          <DataRow
            label="Shadow DOM"
            value={
              fingerprint.data.htmlElement.shadowDOMSupport
                ? 'Supported'
                : 'Not supported'
            }
          />
          <DataRow
            label="Custom Elements"
            value={
              fingerprint.data.htmlElement.customElementsSupport
                ? 'Supported'
                : 'Not supported'
            }
          />
        </FingerprintCollectorCard>
      );
    default:
      return null;
  }
}

function renderGraphicsCollectorCard(
  key: string,
  fingerprint: FingerprintResult
) {
  switch (key) {
    case 'canvas':
      if (!fingerprint.data.canvas) return null;
      return (
        <FingerprintCollectorCard
          key={key}
          title="Canvas 2d"
          hash={fingerprint.data.canvas.hash}
          timing={fingerprint.timings.canvas}
        >
          {fingerprint.data.canvas.dataURL && (
            <div className="space-y-2">
              <div className="text-muted-foreground text-sm">rendering:</div>
              <img
                src={fingerprint.data.canvas.dataURL}
                alt="Canvas fingerprint"
                className="w-full rounded border"
              />
            </div>
          )}
        </FingerprintCollectorCard>
      );
    case 'webgl':
      if (!fingerprint.data.webgl) return null;
      return (
        <FingerprintCollectorCard
          key={key}
          title="WebGL"
          hash={fingerprint.data.webgl.version}
          timing={fingerprint.timings.webgl}
        >
          <DataRow label="Vendor" value={fingerprint.data.webgl.vendor} />
          <DataRow label="Renderer" value={fingerprint.data.webgl.renderer} />
          {fingerprint.data.webgl.unmaskedVendor && (
            <DataRow
              label="Unmasked Vendor"
              value={fingerprint.data.webgl.unmaskedVendor}
            />
          )}
          {fingerprint.data.webgl.unmaskedRenderer && (
            <DataRow
              label="GPU"
              value={fingerprint.data.webgl.unmaskedRenderer}
            />
          )}
        </FingerprintCollectorCard>
      );
    case 'svg':
      if (!fingerprint.data.svg) return null;
      return (
        <FingerprintCollectorCard
          key={key}
          title="SVG Rendering"
          hash={fingerprint.data.svg.hash}
          timing={fingerprint.timings.svg}
        >
          <DataRow
            label="Supported"
            value={fingerprint.data.svg.supported ? 'Yes' : 'No'}
          />
        </FingerprintCollectorCard>
      );
    case 'css':
      if (!fingerprint.data.css) return null;
      return (
        <FingerprintCollectorCard
          key={key}
          title="CSS Styles"
          hash={fingerprint.data.css.hash}
          timing={fingerprint.timings.css}
          className="md:col-span-2"
        >
          <div className="text-muted-foreground mb-1 text-sm">
            Computed Styles:
          </div>
          <div className="max-h-48 overflow-y-auto">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              {Object.entries(fingerprint.data.css.styles)
                .slice(0, 20)
                .map(([name, value]) => (
                  <div key={name} className="flex justify-between">
                    <span className="text-muted-foreground truncate">
                      {name}:
                    </span>
                    <code className="truncate">{value}</code>
                  </div>
                ))}
            </div>
          </div>
        </FingerprintCollectorCard>
      );
    case 'textMetrics':
      if (!fingerprint.data.textMetrics) return null;
      return (
        <FingerprintCollectorCard
          key={key}
          title="Text Metrics"
          hash={fingerprint.data.textMetrics.hash}
          timing={fingerprint.timings.textMetrics}
        >
          <div className="text-muted-foreground mb-1 text-sm">
            Measurement Data:
          </div>
          <code className="break-all text-xs">
            {fingerprint.data.textMetrics.data.slice(0, 8).join(', ')}...
          </code>
        </FingerprintCollectorCard>
      );
    default:
      return null;
  }
}

export default function DemoPage() {
  const [fingerprint, setFingerprint] = useState<FingerprintResult | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [baseline, setBaseline] = useState<BaselineResponse | null>(null);
  const [progress, setProgress] = useState<CollectionProgress>({
    current: 0,
    total: 1,
    currentCollector: '',
  });

  const loadFingerprint = async () => {
    setLoading(true);
    setProgress({ current: 0, total: 1, currentCollector: 'Initializing...' });

    try {
      const updateProgress = (event: CollectorProgressEvent) => {
        setProgress((prev) => ({
          current:
            event.phase === 'finish'
              ? Math.max(prev.current, event.index + 1)
              : prev.current,
          total: event.total,
          currentCollector:
            event.phase === 'finish'
              ? `${getCollectorLabel(event.name)} complete`
              : getCollectorLabel(event.name),
        }));
      };

      const fp = await collectFingerprint({ onProgress: updateProgress });

      setProgress((prev) => ({
        ...prev,
        current: prev.total,
        currentCollector: 'Complete!',
      }));

      setFingerprint(fp);
      void fetchBaseline(fp).then((response) => {
        setBaseline(response);
      });
      analytics.pageView('/checker');
      analytics.track.fingerprintGenerated({
        confidence: fp.confidence,
        method: 'checker',
      });
      analytics.track.buttonClicked({
        buttonLabel: 'run_checker',
        section: 'checker',
      });
    } catch (error) {
      console.error('Error collecting fingerprint:', error);
      analytics.error(error instanceof Error ? error : String(error), {
        page: '/checker',
      });
    } finally {
      setTimeout(() => setLoading(false), 300); // Small delay for smooth transition
    }
  };

  useEffect(() => {
    const cancel = scheduleIdle(() => {
      void loadFingerprint();
    });

    return cancel;
  }, []);

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    analytics.track.fingerprintCopied();
  };

  if (loading) {
    const progressPercent = (progress.current / progress.total) * 100;

    return (
      <div className="from-background to-secondary flex min-h-screen items-center justify-center bg-gradient-to-b p-8">
        <Card className="w-full max-w-2xl">
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="space-y-2 text-center">
                <h2 className="text-2xl font-bold">
                  Collecting Browser Fingerprint
                </h2>
                <p className="text-muted-foreground">
                  Analyzing {progress.total} unique browser characteristics
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">
                    {progress.current} / {progress.total}
                  </span>
                </div>
                <div className="bg-muted h-3 w-full overflow-hidden rounded-full">
                  <div
                    className="from-primary to-primary/80 h-full bg-gradient-to-r transition-all duration-300 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Current Collector */}
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm">
                  <div className="bg-primary h-2 w-2 animate-pulse rounded-full" />
                  <span className="text-muted-foreground">
                    Currently collecting:
                  </span>
                  <span className="text-primary font-medium">
                    {progress.currentCollector}
                  </span>
                </div>
              </div>

              {/* Collecting Items Grid */}
              <div className="grid grid-cols-4 gap-2 pt-4">
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

  if (!fingerprint) {
    return (
      <div className="from-background to-secondary flex min-h-screen items-center justify-center bg-gradient-to-b">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="space-y-4 text-center">
              <div className="text-destructive text-xl">
                Failed to collect fingerprint
              </div>
              <Button onClick={() => void loadFingerprint()}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="from-background to-secondary min-h-screen bg-gradient-to-b">
      <div className="container mx-auto max-w-7xl space-y-6 p-4 md:space-y-8 md:p-8">
        {/* Refresh Button */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadFingerprint()}
            disabled={loading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
            />
            Refresh Fingerprint
          </Button>
        </div>
        {/* Summary Header */}
        <div className="space-y-2 text-center md:space-y-4">
          <h1 className="text-2xl font-bold md:text-4xl">
            Your Browser Fingerprint
          </h1>
          <p className="text-muted-foreground mx-auto max-w-4xl text-sm md:text-lg">
            Comprehensive device and browser fingerprinting analysis. This live
            demo collects 24+ unique characteristics from your browser to
            generate a stable, privacy-preserving identifier.
          </p>
        </div>

        {/* Fingerprint ID Card */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Fingerprint ID</span>
              <div className="flex items-center gap-3">
                <RiskBadge
                  level={
                    fingerprint.confidence >= 0.8
                      ? 'low'
                      : fingerprint.confidence >= 0.6
                        ? 'medium'
                        : 'high'
                  }
                  label={`Coverage: ${(fingerprint.confidence * 100).toFixed(1)}%`}
                />
                <span className="text-muted-foreground text-sm font-normal">
                  Total Time: {fingerprint.timings.total?.toFixed(2)}ms
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              <code className="flex-1 break-all font-mono text-lg font-bold">
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
          </CardContent>
        </Card>

        {/* Coverage Dashboard */}
        <ConfidenceDashboard result={fingerprint} />

        {/* Educational Introduction */}
        <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-blue-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-purple-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              What You're Seeing: Browser Fingerprinting in Action
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed md:text-base">
            <p>
              Browser fingerprinting is a technique that identifies your device
              by collecting unique characteristics from your web browser and
              system environment. Unlike cookies that can be easily deleted,
              these characteristics are inherent to your device configuration,
              making fingerprints more persistent and harder to manipulate.
            </p>
            <p>
              This demo page actively collects data from over 24 different
              browser APIs and features, including Canvas rendering patterns,
              WebGL graphics capabilities, installed fonts, audio stack
              properties, screen dimensions, timezone settings, and much more.
              Each characteristic contributes to your overall "fingerprint" - a
              unique identifier that can track your device across websites even
              without cookies.
            </p>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="bg-background/50 border-border rounded-lg border p-4">
                <div className="mb-2 font-semibold text-purple-500">
                  How It Works
                </div>
                <p className="text-muted-foreground text-xs">
                  Each browser has unique rendering behaviors, available
                  features, and system configurations. By combining dozens of
                  these small differences, we create a stable identifier. The
                  collected data is hashed using MurmurHash3 and encoded in
                  Base62 format to produce your Fingerprint ID.
                </p>
              </div>
              <div className="bg-background/50 border-border rounded-lg border p-4">
                <div className="mb-2 font-semibold text-blue-500">
                  Privacy Implications
                </div>
                <p className="text-muted-foreground text-xs">
                  While fingerprinting enables important use cases like fraud
                  detection and bot prevention, it also raises privacy concerns.
                  Modern privacy-focused browsers (Brave, Tor) implement
                  anti-fingerprinting measures to make users less identifiable.
                  This demo helps you understand what information your browser
                  exposes.
                </p>
              </div>
              <div className="bg-background/50 border-border rounded-lg border p-4">
                <div className="mb-2 font-semibold text-green-500">
                  What You Can Learn
                </div>
                <p className="text-muted-foreground text-xs">
                  Explore each collector below to see exactly what data is
                  gathered. The Coverage Score shows how many signals were
                  successfully collected, not how unique you are. Higher
                  coverage means more browser APIs responded without being
                  blocked, which gives the analyzer better context. Check the
                  tabs below for advanced analysis and privacy insights.
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3">
              <p className="flex items-start gap-2 text-xs">
                <svg
                  className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span>
                  <strong>Important:</strong> This demo runs entirely in your
                  browser. No fingerprint data is stored on our servers. All
                  processing happens client-side, and only the final hashed ID
                  is computed. Your raw browser characteristics never leave your
                  device.
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Uniqueness Analysis */}
        <UniquenessAnalysis result={fingerprint} />

        {/* Privacy Leakage Assessment */}
        <PrivacyLeakageAssessment result={fingerprint} />

        {/* Browser Comparison & Recommendations */}
        <BrowserComparison result={fingerprint} />

        {/* Fingerprint History */}
        <FingerprintHistory currentResult={fingerprint} />

        {/* Export Report */}
        <ExportReport result={fingerprint} />

        {/* Collectors Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            {collectorTabs.map((tab) => (
              <TabsTrigger key={tab.key} value={tab.key}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* All Tab - Show all collectors */}
          <TabsContent value="all" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Canvas */}
              {fingerprint.data.canvas && (
                <FingerprintCollectorCard
                  title="Canvas 2d"
                  hash={fingerprint.data.canvas.hash}
                  timing={fingerprint.timings.canvas}
                  insight={formatBaselineInsight(
                    getBaselineEstimate(baseline, 'canvas'),
                    baseline?.kAnonThreshold
                  )}
                >
                  {fingerprint.data.canvas.dataURL && (
                    <div className="space-y-2">
                      <div className="text-muted-foreground text-sm">
                        rendering:
                      </div>
                      <img
                        src={fingerprint.data.canvas.dataURL}
                        alt="Canvas fingerprint"
                        className="w-full rounded border"
                      />
                    </div>
                  )}
                </FingerprintCollectorCard>
              )}

              {/* WebGL */}
              {fingerprint.data.webgl && (
                <FingerprintCollectorCard
                  title="WebGL"
                  hash={fingerprint.data.webgl.version}
                  timing={fingerprint.timings.webgl}
                  insight={formatBaselineInsight(
                    getBaselineEstimate(baseline, 'webgl'),
                    baseline?.kAnonThreshold
                  )}
                >
                  <DataRow
                    label="Vendor"
                    value={fingerprint.data.webgl.vendor}
                  />
                  <DataRow
                    label="Renderer"
                    value={fingerprint.data.webgl.renderer}
                  />
                  {fingerprint.data.webgl.unmaskedVendor && (
                    <DataRow
                      label="Unmasked Vendor"
                      value={fingerprint.data.webgl.unmaskedVendor}
                    />
                  )}
                  {fingerprint.data.webgl.unmaskedRenderer && (
                    <DataRow
                      label="GPU"
                      value={fingerprint.data.webgl.unmaskedRenderer}
                    />
                  )}
                  <DataRow
                    label="Version"
                    value={fingerprint.data.webgl.version}
                  />
                  <DataRow
                    label="GLSL Version"
                    value={fingerprint.data.webgl.shadingLanguageVersion}
                  />
                </FingerprintCollectorCard>
              )}

              {/* Navigator */}
              {fingerprint.data.navigator && (
                <FingerprintCollectorCard
                  title="Navigator"
                  timing={fingerprint.timings.navigator}
                  className="md:col-span-2"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <DataRow
                        label="Platform"
                        value={fingerprint.data.navigator.platform}
                      />
                      <DataRow
                        label="Language"
                        value={fingerprint.data.navigator.language}
                      />
                      {fingerprint.data.languages && (
                        <DataRow
                          label="Languages"
                          value={
                            Array.isArray(fingerprint.data.languages)
                              ? fingerprint.data.languages.flat().join(', ')
                              : String(fingerprint.data.languages)
                          }
                        />
                      )}
                      {fingerprint.data.hardwareConcurrency && (
                        <DataRow
                          label="Hardware Concurrency"
                          value={`${fingerprint.data.hardwareConcurrency} cores`}
                        />
                      )}
                      {fingerprint.data.deviceMemory && (
                        <DataRow
                          label="Device Memory"
                          value={`${fingerprint.data.deviceMemory}GB`}
                        />
                      )}
                      {fingerprint.data.touchSupport?.maxTouchPoints !==
                        undefined && (
                        <DataRow
                          label="Max Touch Points"
                          value={String(
                            fingerprint.data.touchSupport.maxTouchPoints
                          )}
                        />
                      )}
                    </div>
                    <div className="space-y-1">
                      <DataRow
                        label="Cookie Enabled"
                        value={
                          fingerprint.data.navigator.cookieEnabled
                            ? 'Yes'
                            : 'No'
                        }
                      />
                      <DataRow
                        label="DNT"
                        value={fingerprint.data.navigator.doNotTrack || 'null'}
                      />
                      <DataRow
                        label="Online"
                        value={fingerprint.data.navigator.onLine ? 'Yes' : 'No'}
                      />
                      {fingerprint.data.navigator.webdriver !== undefined && (
                        <DataRow
                          label="Webdriver"
                          value={
                            fingerprint.data.navigator.webdriver ? (
                              <RiskBadge level="high" label="Detected" />
                            ) : (
                              <RiskBadge level="low" label="Not Detected" />
                            )
                          }
                        />
                      )}
                      {fingerprint.data.pdfViewerEnabled !== undefined && (
                        <DataRow
                          label="PDF Viewer"
                          value={
                            fingerprint.data.pdfViewerEnabled ? 'Yes' : 'No'
                          }
                        />
                      )}
                    </div>
                  </div>
                  <div className="mt-2 border-t pt-2">
                    <div className="text-muted-foreground mb-1 text-xs">
                      User Agent:
                    </div>
                    <code className="break-all text-xs">
                      {fingerprint.data.navigator.userAgent}
                    </code>
                  </div>
                </FingerprintCollectorCard>
              )}

              {/* Screen */}
              {fingerprint.data.screen && (
                <FingerprintCollectorCard
                  title="Screen"
                  timing={fingerprint.timings.screen}
                  insight={formatBaselineInsight(
                    getBaselineEstimate(baseline, 'screen'),
                    baseline?.kAnonThreshold
                  )}
                >
                  <DataRow
                    label="Resolution"
                    value={`${fingerprint.data.screen.width} × ${fingerprint.data.screen.height}`}
                  />
                  <DataRow
                    label="Available"
                    value={`${fingerprint.data.screen.availWidth} × ${fingerprint.data.screen.availHeight}`}
                  />
                  <DataRow
                    label="Color Depth"
                    value={`${fingerprint.data.screen.colorDepth} bits`}
                  />
                  <DataRow
                    label="Pixel Depth"
                    value={`${fingerprint.data.screen.pixelDepth} bits`}
                  />
                  <DataRow
                    label="Pixel Ratio"
                    value={fingerprint.data.screen.devicePixelRatio}
                  />
                </FingerprintCollectorCard>
              )}

              {/* Timezone */}
              {fingerprint.data.timezone && (
                <FingerprintCollectorCard
                  title="Timezone"
                  hash={fingerprint.data.timezone.timezone}
                  timing={fingerprint.timings.timezone}
                  insight={formatBaselineInsight(
                    getBaselineEstimate(baseline, 'timezone'),
                    baseline?.kAnonThreshold
                  )}
                >
                  <DataRow
                    label="Timezone"
                    value={fingerprint.data.timezone.timezone}
                  />
                  <DataRow
                    label="Offset"
                    value={`${fingerprint.data.timezone.timezoneOffset} minutes`}
                  />
                  <DataRow
                    label="Locale"
                    value={fingerprint.data.timezone.locale}
                  />
                  {fingerprint.data.timezone.calendar && (
                    <DataRow
                      label="Calendar"
                      value={fingerprint.data.timezone.calendar}
                    />
                  )}
                  {fingerprint.data.timezone.numberingSystem && (
                    <DataRow
                      label="Numbering System"
                      value={fingerprint.data.timezone.numberingSystem}
                    />
                  )}
                  {fingerprint.data.timezone.currency && (
                    <DataRow
                      label="Currency"
                      value={fingerprint.data.timezone.currency}
                    />
                  )}
                </FingerprintCollectorCard>
              )}

              {/* Fonts */}
              {fingerprint.data.fonts && (
                <FingerprintCollectorCard
                  title="Fonts"
                  hash={`${fingerprint.data.fonts.count} detected`}
                  timing={fingerprint.timings.fonts}
                  className="md:col-span-2"
                  insight={formatBaselineInsight(
                    getBaselineEstimate(baseline, 'fonts'),
                    baseline?.kAnonThreshold
                  )}
                >
                  <div className="text-muted-foreground mb-2 text-sm">
                    Detected Fonts ({fingerprint.data.fonts.count}):
                  </div>
                  <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto">
                    {fingerprint.data.fonts.available.map((font) => (
                      <span
                        key={font}
                        className="bg-muted rounded px-2 py-1 text-xs"
                      >
                        {font}
                      </span>
                    ))}
                  </div>
                </FingerprintCollectorCard>
              )}

              {/* Audio */}
              {fingerprint.data.audio && (
                <FingerprintCollectorCard
                  title="Audio"
                  hash={fingerprint.data.audio.hash}
                  timing={fingerprint.timings.audio}
                >
                  <DataRow
                    label="Sample Rate"
                    value={`${fingerprint.data.audio.sampleRate}Hz`}
                  />
                  <DataRow label="State" value={fingerprint.data.audio.state} />
                  <DataRow
                    label="Max Channels"
                    value={fingerprint.data.audio.maxChannelCount}
                  />
                  <DataRow
                    label="Channel Count"
                    value={fingerprint.data.audio.channelCount}
                  />
                  <DataRow
                    label="Channel Mode"
                    value={fingerprint.data.audio.channelCountMode}
                  />
                  <DataRow
                    label="Interpretation"
                    value={fingerprint.data.audio.channelInterpretation}
                  />
                </FingerprintCollectorCard>
              )}

              {/* Media Devices */}
              {fingerprint.data.media && (
                <FingerprintCollectorCard
                  title="Media Devices"
                  hash={`${fingerprint.data.media.devices.length} devices`}
                  timing={fingerprint.timings.media}
                >
                  <DataRow
                    label="Audio Input"
                    value={fingerprint.data.media.deviceCount.audioInput}
                  />
                  <DataRow
                    label="Audio Output"
                    value={fingerprint.data.media.deviceCount.audioOutput}
                  />
                  <DataRow
                    label="Video Input"
                    value={fingerprint.data.media.deviceCount.videoInput}
                  />
                  <div className="mt-2 border-t pt-2">
                    <div className="text-muted-foreground mb-1 text-xs">
                      Devices:
                    </div>
                    <div className="space-y-1">
                      {fingerprint.data.media.devices.map((device, i) => (
                        <div key={i} className="text-xs">
                          {device.kind}: {device.label || 'No label'}
                        </div>
                      ))}
                    </div>
                  </div>
                </FingerprintCollectorCard>
              )}

              {/* ClientRects (Emoji) */}
              {fingerprint.data.clientRects && (
                <FingerprintCollectorCard
                  title="Emoji Rendering"
                  hash={fingerprint.data.clientRects.hash}
                  timing={fingerprint.timings.clientRects}
                >
                  <div className="text-muted-foreground mb-1 text-sm">
                    Client Rects Data:
                  </div>
                  <code className="break-all text-xs">
                    {fingerprint.data.clientRects.data.slice(0, 10).join(', ')}
                    ...
                  </code>
                </FingerprintCollectorCard>
              )}

              {/* Voices */}
              {fingerprint.data.voices && (
                <FingerprintCollectorCard
                  title="Speech Voices"
                  hash={`${fingerprint.data.voices.count} voices`}
                  timing={fingerprint.timings.voices}
                  className="md:col-span-2"
                >
                  {fingerprint.data.voices.defaultVoice && (
                    <div className="mb-2">
                      <DataRow
                        label="Default Voice"
                        value={fingerprint.data.voices.defaultVoice}
                      />
                    </div>
                  )}
                  <div className="text-muted-foreground mb-1 text-sm">
                    Available Voices ({fingerprint.data.voices.count}):
                  </div>
                  <div className="max-h-48 space-y-2 overflow-y-auto">
                    {fingerprint.data.voices.voices.map((voice, i) => (
                      <div key={i} className="border-b pb-1 text-xs">
                        <div className="font-medium">{voice.name}</div>
                        <div className="text-muted-foreground">
                          {voice.lang} |{' '}
                          {voice.localService ? 'Local' : 'Remote'}
                          {voice.default ? ' | Default' : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                </FingerprintCollectorCard>
              )}

              {/* SVG */}
              {fingerprint.data.svg && (
                <FingerprintCollectorCard
                  title="SVG Rendering"
                  hash={fingerprint.data.svg.hash}
                  timing={fingerprint.timings.svg}
                >
                  <DataRow
                    label="Supported"
                    value={fingerprint.data.svg.supported ? 'Yes' : 'No'}
                  />
                  <div className="text-muted-foreground mt-2 text-sm">
                    SVG Data:
                  </div>
                  <code className="break-all text-xs">
                    {fingerprint.data.svg.data.slice(0, 10).join(', ')}...
                  </code>
                </FingerprintCollectorCard>
              )}

              {/* Math */}
              {fingerprint.data.math && (
                <FingerprintCollectorCard
                  title="Math Precision"
                  hash={fingerprint.data.math.hash}
                  timing={fingerprint.timings.math}
                >
                  <div className="text-muted-foreground mb-1 text-sm">
                    Constants:
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    {Object.entries(fingerprint.data.math.constants).map(
                      ([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground">{key}:</span>
                          <code>{value.toFixed(10)}</code>
                        </div>
                      )
                    )}
                  </div>
                </FingerprintCollectorCard>
              )}

              {/* CSS */}
              {fingerprint.data.css && (
                <FingerprintCollectorCard
                  title="CSS Styles"
                  hash={fingerprint.data.css.hash}
                  timing={fingerprint.timings.css}
                  className="md:col-span-2"
                >
                  <div className="text-muted-foreground mb-1 text-sm">
                    Computed Styles:
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      {Object.entries(fingerprint.data.css.styles)
                        .slice(0, 20)
                        .map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-muted-foreground truncate">
                              {key}:
                            </span>
                            <code className="truncate">{value}</code>
                          </div>
                        ))}
                    </div>
                  </div>
                </FingerprintCollectorCard>
              )}

              {/* TextMetrics */}
              {fingerprint.data.textMetrics && (
                <FingerprintCollectorCard
                  title="Text Metrics"
                  hash={fingerprint.data.textMetrics.hash}
                  timing={fingerprint.timings.textMetrics}
                >
                  <div className="text-muted-foreground mb-1 text-sm">
                    Measurement Data:
                  </div>
                  <code className="break-all text-xs">
                    {fingerprint.data.textMetrics.data.slice(0, 8).join(', ')}
                    ...
                  </code>
                </FingerprintCollectorCard>
              )}

              {/* HTMLElement */}
              {fingerprint.data.htmlElement && (
                <FingerprintCollectorCard
                  title="HTML Element"
                  hash={fingerprint.data.htmlElement.hash}
                  timing={fingerprint.timings.htmlElement}
                >
                  <DataRow
                    label="Prototype Props"
                    value={fingerprint.data.htmlElement.prototypePropsCount}
                  />
                  <DataRow
                    label="Shadow DOM"
                    value={
                      fingerprint.data.htmlElement.shadowDOMSupport
                        ? 'Supported'
                        : 'Not supported'
                    }
                  />
                  <DataRow
                    label="Custom Elements"
                    value={
                      fingerprint.data.htmlElement.customElementsSupport
                        ? 'Supported'
                        : 'Not supported'
                    }
                  />
                  <DataRow
                    label="Methods Count"
                    value={fingerprint.data.htmlElement.methods.length}
                  />
                </FingerprintCollectorCard>
              )}

              {/* Console Errors */}
              {fingerprint.data.consoleErrors && (
                <FingerprintCollectorCard
                  title="Console Errors"
                  hash={fingerprint.data.consoleErrors.hash}
                  timing={fingerprint.timings.consoleErrors}
                >
                  <DataRow
                    label="Stack Depth"
                    value={fingerprint.data.consoleErrors.stackDepth}
                  />
                  <DataRow
                    label="Error Proto Props"
                    value={fingerprint.data.consoleErrors.errorProtoProps}
                  />
                  <DataRow
                    label="Console Methods"
                    value={fingerprint.data.consoleErrors.consoleMethods.join(
                      ', '
                    )}
                  />
                </FingerprintCollectorCard>
              )}

              {/* DOMRect */}
              {fingerprint.data.domRect && (
                <FingerprintCollectorCard
                  title="DOM Rectangle"
                  hash={fingerprint.data.domRect.hash}
                  timing={fingerprint.timings.domRect}
                >
                  <DataRow
                    label="DOMRect Support"
                    value={
                      fingerprint.data.domRect.domRectSupport ? 'Yes' : 'No'
                    }
                  />
                  <DataRow
                    label="DOMRectReadOnly"
                    value={
                      fingerprint.data.domRect.domRectReadOnlySupport
                        ? 'Yes'
                        : 'No'
                    }
                  />
                  <DataRow
                    label="Range Rect"
                    value={
                      fingerprint.data.domRect.rangeRectSupport ? 'Yes' : 'No'
                    }
                  />
                  <div className="text-muted-foreground mt-2 text-sm">
                    Measurements:
                  </div>
                  <code className="break-all text-xs">
                    {fingerprint.data.domRect.measurements
                      .slice(0, 6)
                      .join(', ')}
                    ...
                  </code>
                </FingerprintCollectorCard>
              )}

              {/* MimeTypes */}
              {fingerprint.data.mimeTypes && (
                <FingerprintCollectorCard
                  title="MIME Types"
                  hash={fingerprint.data.mimeTypes.hash}
                  timing={fingerprint.timings.mimeTypes}
                >
                  <DataRow
                    label="Total Types"
                    value={fingerprint.data.mimeTypes.count}
                  />
                  <div className="text-muted-foreground mt-2 text-sm">
                    Supported MIME Types:
                  </div>
                  <div className="max-h-32 space-y-1 overflow-y-auto text-xs">
                    {fingerprint.data.mimeTypes.types.map((type, i) => (
                      <div key={i}>
                        {type.type} - {type.description}
                      </div>
                    ))}
                  </div>
                </FingerprintCollectorCard>
              )}

              {/* Resistance */}
              {fingerprint.data.resistance && (
                <FingerprintCollectorCard
                  title="Anti-Fingerprinting Detection"
                  timing={fingerprint.timings.resistance}
                  className="md:col-span-2"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <DataRow
                        label="Privacy Tool Detected"
                        value={
                          fingerprint.data.resistance.privacyToolDetected ? (
                            <RiskBadge level="high" label="Detected" />
                          ) : (
                            <RiskBadge level="low" label="Not Detected" />
                          )
                        }
                      />
                      <DataRow
                        label="Total Detections"
                        value={fingerprint.data.resistance.totalDetections}
                        riskLevel={
                          fingerprint.data.resistance.totalDetections > 5
                            ? 'high'
                            : fingerprint.data.resistance.totalDetections > 2
                              ? 'medium'
                              : 'low'
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="text-muted-foreground mb-1 text-xs">
                        Key Indicators:
                      </div>
                      <div className="space-y-1">
                        {fingerprint.data.resistance.detections.webdriver && (
                          <div className="flex items-center gap-2">
                            <RiskBadge level="high" label="Webdriver" />
                          </div>
                        )}
                        {fingerprint.data.resistance.detections.headless && (
                          <div className="flex items-center gap-2">
                            <RiskBadge level="high" label="Headless Browser" />
                          </div>
                        )}
                        {fingerprint.data.resistance.detections
                          .puppeteerDetected && (
                          <div className="flex items-center gap-2">
                            <RiskBadge level="high" label="Puppeteer" />
                          </div>
                        )}
                        {fingerprint.data.resistance.detections
                          .seleniumDetected && (
                          <div className="flex items-center gap-2">
                            <RiskBadge level="high" label="Selenium" />
                          </div>
                        )}
                        {fingerprint.data.resistance.detections
                          .phantomJSDetected && (
                          <div className="flex items-center gap-2">
                            <RiskBadge level="high" label="PhantomJS" />
                          </div>
                        )}
                        {fingerprint.data.resistance.totalDetections === 0 && (
                          <div className="flex items-center gap-2">
                            <RiskBadge
                              level="low"
                              label="No Automation Detected"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 border-t pt-2">
                    <div className="text-muted-foreground mb-1 text-sm">
                      All Detections:
                    </div>
                    <div className="grid max-h-48 grid-cols-2 gap-1 overflow-y-auto text-xs">
                      {Object.entries(
                        fingerprint.data.resistance.detections
                      ).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground">{key}:</span>
                          <span
                            className={
                              value
                                ? 'text-yellow-600 dark:text-yellow-400'
                                : 'text-green-600 dark:text-green-400'
                            }
                          >
                            {value ? 'Detected' : 'Clear'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </FingerprintCollectorCard>
              )}

              {/* ContentWindow */}
              {fingerprint.data.contentWindow && (
                <FingerprintCollectorCard
                  title="Content Window"
                  hash={fingerprint.data.contentWindow.hash}
                  timing={fingerprint.timings.contentWindow}
                >
                  <DataRow
                    label="Window Props"
                    value={fingerprint.data.contentWindow.windowPropsCount}
                  />
                  <DataRow
                    label="Has Document"
                    value={
                      fingerprint.data.contentWindow.hasDocument ? 'Yes' : 'No'
                    }
                  />
                  <DataRow
                    label="Document Props"
                    value={fingerprint.data.contentWindow.documentPropsCount}
                  />
                </FingerprintCollectorCard>
              )}

              {/* CSS Media */}
              {fingerprint.data.cssMedia && (
                <FingerprintCollectorCard
                  title="CSS Media Queries"
                  hash={fingerprint.data.cssMedia.hash}
                  timing={fingerprint.timings.cssMedia}
                >
                  <DataRow
                    label="Portrait"
                    value={
                      fingerprint.data.cssMedia.orientation.portrait
                        ? 'Yes'
                        : 'No'
                    }
                  />
                  <DataRow
                    label="Landscape"
                    value={
                      fingerprint.data.cssMedia.orientation.landscape
                        ? 'Yes'
                        : 'No'
                    }
                  />
                  <div className="text-muted-foreground mt-2 text-sm">
                    Media Queries:
                  </div>
                  <div className="grid max-h-32 grid-cols-2 gap-1 overflow-y-auto text-xs">
                    {Object.entries(
                      fingerprint.data.cssMedia.mediaQueryMatches
                    ).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-muted-foreground truncate">
                          {key}:
                        </span>
                        <span>{value ? 'Yes' : 'No'}</span>
                      </div>
                    ))}
                  </div>
                </FingerprintCollectorCard>
              )}

              {/* Accessibility Preferences */}
              {(fingerprint.data.colorGamut ||
                fingerprint.data.contrast ||
                fingerprint.data.forcedColors ||
                fingerprint.data.reducedMotion ||
                fingerprint.data.reducedTransparency ||
                fingerprint.data.hdr ||
                typeof fingerprint.data.monochrome === 'number') && (
                <FingerprintCollectorCard
                  title="Accessibility & Preferences"
                  className="md:col-span-2"
                  timing={
                    fingerprint.timings.colorGamut ??
                    fingerprint.timings.contrast ??
                    fingerprint.timings.forcedColors ??
                    fingerprint.timings.reducedMotion ??
                    fingerprint.timings.reducedTransparency ??
                    fingerprint.timings.hdr ??
                    fingerprint.timings.monochrome
                  }
                >
                  {fingerprint.data.colorGamut && (
                    <DataRow
                      label="Color Gamut"
                      value={fingerprint.data.colorGamut.toUpperCase()}
                    />
                  )}
                  {fingerprint.data.contrast && (
                    <DataRow
                      label="Contrast"
                      value={fingerprint.data.contrast}
                    />
                  )}
                  {typeof fingerprint.data.monochrome === 'number' && (
                    <DataRow
                      label="Monochrome Depth"
                      value={fingerprint.data.monochrome}
                    />
                  )}
                  {fingerprint.data.forcedColors && (
                    <DataRow
                      label="Forced Colors"
                      value={
                        fingerprint.data.forcedColors.active
                          ? 'Enabled'
                          : 'Disabled'
                      }
                    />
                  )}
                  {fingerprint.data.reducedMotion && (
                    <DataRow
                      label="Reduced Motion"
                      value={fingerprint.data.reducedMotion}
                    />
                  )}
                  {fingerprint.data.reducedTransparency && (
                    <DataRow
                      label="Reduced Transparency"
                      value={fingerprint.data.reducedTransparency}
                    />
                  )}
                  {fingerprint.data.hdr && (
                    <DataRow
                      label="Dynamic Range"
                      value={fingerprint.data.hdr.toUpperCase()}
                    />
                  )}
                </FingerprintCollectorCard>
              )}

              {/* DOM Blockers */}
              {fingerprint.data.domBlockers && (
                <FingerprintCollectorCard
                  title="Privacy / Ad Blockers"
                  timing={fingerprint.timings.domBlockers}
                  className="md:col-span-2"
                >
                  {fingerprint.data.domBlockers.detected.length === 0 ? (
                    <div className="text-muted-foreground text-sm">
                      No DOM blocker signatures detected.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {fingerprint.data.domBlockers.detected.map((blocker) => (
                        <span
                          key={blocker}
                          className="bg-muted rounded-full px-3 py-1 text-xs font-medium"
                        >
                          {blocker}
                        </span>
                      ))}
                    </div>
                  )}
                </FingerprintCollectorCard>
              )}

              {/* Audio Base Latency */}
              {fingerprint.data.audioBaseLatency && (
                <FingerprintCollectorCard
                  title="Audio Base Latency"
                  timing={fingerprint.timings.audioBaseLatency}
                >
                  <DataRow
                    label="Supported"
                    value={
                      fingerprint.data.audioBaseLatency.supported ? 'Yes' : 'No'
                    }
                  />
                  {fingerprint.data.audioBaseLatency.baseLatency !==
                    undefined && (
                    <DataRow
                      label="Base Latency"
                      value={`${fingerprint.data.audioBaseLatency.baseLatency.toFixed(4)}s`}
                    />
                  )}
                  {fingerprint.data.audioBaseLatency.outputLatency !==
                    undefined && (
                    <DataRow
                      label="Output Latency"
                      value={`${fingerprint.data.audioBaseLatency.outputLatency.toFixed(4)}s`}
                    />
                  )}
                  {fingerprint.data.audioBaseLatency.sampleRate && (
                    <DataRow
                      label="Sample Rate"
                      value={`${fingerprint.data.audioBaseLatency.sampleRate}Hz`}
                    />
                  )}
                </FingerprintCollectorCard>
              )}

              {/* Apple Pay */}
              {fingerprint.data.applePay && (
                <FingerprintCollectorCard
                  title="Apple Pay Capability"
                  timing={fingerprint.timings.applePay}
                >
                  <DataRow
                    label="API Available"
                    value={fingerprint.data.applePay.isSupported ? 'Yes' : 'No'}
                  />
                  {fingerprint.data.applePay.canMakePayments !== undefined && (
                    <DataRow
                      label="Can Make Payments"
                      value={
                        fingerprint.data.applePay.canMakePayments ? 'Yes' : 'No'
                      }
                    />
                  )}
                  {fingerprint.data.applePay.supportedVersions && (
                    <DataRow
                      label="Supported Versions"
                      value={fingerprint.data.applePay.supportedVersions.join(
                        ', '
                      )}
                    />
                  )}
                </FingerprintCollectorCard>
              )}

              {/* WebRTC */}
              {fingerprint.data.webrtc && (
                <FingerprintCollectorCard
                  title="WebRTC"
                  hash={fingerprint.data.webrtc.hash}
                  timing={fingerprint.timings.webrtc}
                  className="md:col-span-2"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <DataRow
                        label="Supported"
                        value={fingerprint.data.webrtc.supported ? 'Yes' : 'No'}
                      />
                      <DataRow
                        label="STUN Supported"
                        value={
                          fingerprint.data.webrtc.iceServers.stunSupported
                            ? 'Yes'
                            : 'No'
                        }
                      />
                      <DataRow
                        label="Media Devices"
                        value={
                          fingerprint.data.webrtc.mediaDevices ? 'Yes' : 'No'
                        }
                      />
                      <DataRow
                        label="getUserMedia"
                        value={
                          fingerprint.data.webrtc.getUserMediaSupported
                            ? 'Yes'
                            : 'No'
                        }
                      />
                      <DataRow
                        label="Data Channel"
                        value={
                          fingerprint.data.webrtc.dataChannelSupported
                            ? 'Yes'
                            : 'No'
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <DataRow
                        label="Local Candidates"
                        value={fingerprint.data.webrtc.candidates.local.length}
                      />
                      <DataRow
                        label="IPv4 Addresses"
                        value={fingerprint.data.webrtc.candidates.ipv4.length}
                      />
                      <DataRow
                        label="IPv6 Addresses"
                        value={fingerprint.data.webrtc.candidates.ipv6.length}
                      />
                      <DataRow
                        label="Public IPs"
                        value={fingerprint.data.webrtc.candidates.public.length}
                      />
                      <DataRow
                        label="Connection State"
                        value={
                          fingerprint.data.webrtc.connection.connectionState ||
                          'N/A'
                        }
                      />
                    </div>
                  </div>
                  {fingerprint.data.webrtc.candidates.ipv4.length > 0 && (
                    <div className="mt-2 border-t pt-2">
                      <div className="text-muted-foreground mb-1 text-xs">
                        Detected IPv4:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {fingerprint.data.webrtc.candidates.ipv4.map(
                          (ip, i) => (
                            <code
                              key={i}
                              className="bg-muted rounded px-2 py-1 text-xs"
                            >
                              {ip}
                            </code>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </FingerprintCollectorCard>
              )}

              {/* ServiceWorker */}
              {fingerprint.data.serviceWorker && (
                <FingerprintCollectorCard
                  title="ServiceWorker"
                  hash={fingerprint.data.serviceWorker.hash}
                  timing={fingerprint.timings.serviceWorker}
                >
                  <DataRow
                    label="Supported"
                    value={
                      fingerprint.data.serviceWorker.supported ? 'Yes' : 'No'
                    }
                  />
                  <DataRow
                    label="Controller"
                    value={
                      fingerprint.data.serviceWorker.controller ? 'Yes' : 'No'
                    }
                  />
                  <DataRow
                    label="Ready"
                    value={fingerprint.data.serviceWorker.ready ? 'Yes' : 'No'}
                  />
                  {fingerprint.data.serviceWorker.state && (
                    <DataRow
                      label="State"
                      value={fingerprint.data.serviceWorker.state}
                    />
                  )}
                  <div className="mt-2 border-t pt-2">
                    <div className="text-muted-foreground mb-1 text-xs">
                      Features:
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      {Object.entries(
                        fingerprint.data.serviceWorker.features
                      ).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground">{key}:</span>
                          <span>{value ? 'Yes' : 'No'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </FingerprintCollectorCard>
              )}

              {/* Lies Detection */}
              {fingerprint.data.lies && (
                <FingerprintCollectorCard
                  title="Lies Detection"
                  hash={fingerprint.data.lies.hash}
                  timing={fingerprint.timings.lies}
                  className="md:col-span-2"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <DataRow
                        label="Lies Count"
                        value={fingerprint.data.lies.liesCount}
                      />
                      <DataRow
                        label="Trust Score"
                        value={`${fingerprint.data.lies.trustScore}/100`}
                      />
                      <div className="mt-2">
                        <div className="text-muted-foreground mb-1 text-xs">
                          Trust Level:
                        </div>
                        <div className="bg-muted h-2 w-full rounded-full">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              fingerprint.data.lies.trustScore >= 80
                                ? 'bg-green-500'
                                : fingerprint.data.lies.trustScore >= 60
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                            }`}
                            style={{
                              width: `${fingerprint.data.lies.trustScore}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {fingerprint.data.lies.inconsistencies.length > 0 ? (
                        <>
                          <div className="text-muted-foreground mb-1 text-xs">
                            Inconsistencies Detected:
                          </div>
                          <div className="max-h-32 space-y-1 overflow-y-auto">
                            {fingerprint.data.lies.inconsistencies.map(
                              (inconsistency, i) => (
                                <div
                                  key={i}
                                  className="text-xs text-yellow-600 dark:text-yellow-400"
                                >
                                  • {inconsistency}
                                </div>
                              )
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="text-xs text-green-600 dark:text-green-400">
                          ✓ No inconsistencies detected
                        </div>
                      )}
                    </div>
                  </div>
                </FingerprintCollectorCard>
              )}
            </div>
          </TabsContent>

          {/* Graphics Tab */}
          <TabsContent value="graphics" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {graphicsTabCollectors.map((collector) =>
                renderGraphicsCollectorCard(collector.key, fingerprint)
              )}
            </div>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {systemTabCollectors.map((collector) =>
                renderSystemCollectorCard(collector.key, fingerprint)
              )}
            </div>
          </TabsContent>

          {/* Media Tab */}
          <TabsContent value="media" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {mediaTabCollectors.map((collector) =>
                renderMediaCollectorCard(collector.key, fingerprint)
              )}
            </div>
          </TabsContent>

          {/* Network Tab */}
          <TabsContent value="network" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {networkTabCollectors.map((collector) =>
                renderNetworkCollectorCard(collector.key, fingerprint)
              )}
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {securityTabCollectors.map((collector) =>
                renderSecurityCollectorCard(collector.key, fingerprint)
              )}
            </div>
          </TabsContent>

          {/* Accessibility Tab */}
          <TabsContent value="accessibility" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {accessibilityTabCollectors.map((collector) =>
                renderAccessibilityCollectorCard(collector.key, fingerprint)
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

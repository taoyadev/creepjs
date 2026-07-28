'use client';

import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/CopyButton';
import {
  collectorTabs,
  getCollectorsForTab,
  type CollectorTabKey,
} from '@creepjs/core';
import { RefreshCw } from 'lucide-react';
import {
  FingerprintCollectorCard,
  DataRow,
  RiskBadge,
} from '@/components/FingerprintCollectorCard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { analytics } from '@/lib/analytics';
import {
  formatBaselineInsight,
  getBaselineEstimate,
} from '@/lib/uniqueness-baseline';
import { ScanProgress } from '@/components/checker/ScanProgress';
import { SharedResultBanner } from '@/components/checker/SharedResultBanner';
import { useFingerprintScan } from '@/components/checker/hooks/useFingerprintScan';
import { useCheckerUrlState } from '@/components/checker/hooks/useCheckerUrlState';
import { useOwnIp } from '@/components/checker/hooks/useOwnIp';
import { NetworkTrustReport } from '@/components/checker/NetworkTrustReport';
import type { ExportReportProps } from '@/components/ExportReport';
import { renderAccessibilityCollectorCard } from '@/components/checker/cards/AccessibilityCards';
import { renderGraphicsCollectorCard } from '@/components/checker/cards/GraphicsCards';
import { renderMediaCollectorCard } from '@/components/checker/cards/MediaCards';
import { renderNetworkCollectorCard } from '@/components/checker/cards/NetworkCards';
import { renderSecurityCollectorCard } from '@/components/checker/cards/SecurityCards';
import { renderSystemCollectorCard } from '@/components/checker/cards/SystemCards';

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

const ExportReport = dynamic<ExportReportProps>(
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

export function CheckerApp() {
  const { fingerprint, baseline, progress, status, error, scan } =
    useFingerprintScan();
  const { tab, snapshot, setTab, buildSnapshotUrl } = useCheckerUrlState();
  const ownIp = useOwnIp();
  const loading = status === 'loading';

  if (status !== 'ready' || !fingerprint) {
    return (
      <div className="space-y-4">
        <SharedResultBanner snapshot={snapshot} />
        <ScanProgress
          status={status === 'error' ? 'error' : 'loading'}
          progress={progress}
          error={error}
          onRetry={() => void scan()}
        />
      </div>
    );
  }

  const shareUrl = buildSnapshotUrl({
    fingerprintId: fingerprint.fingerprintId,
    coverage: fingerprint.confidence * 100,
    baselineCount: baseline?.totalSamples ?? null,
  });

  return (
    <div className="animate-fade-in-up space-y-6 md:space-y-8">
        <SharedResultBanner
          snapshot={snapshot}
          currentFingerprintId={fingerprint.fingerprintId}
        />
        {/* Refresh Button */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void scan()}
            disabled={loading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
            />
            Refresh Fingerprint
          </Button>
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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <code className="flex-1 break-all font-mono text-lg font-bold">
                {fingerprint.fingerprintId}
              </code>
              <div className="flex items-center gap-2">
                <CopyButton
                  value={fingerprint.fingerprintId}
                  variant="outline"
                  size="icon"
                  ariaLabel="Copy fingerprint ID"
                  successMessage="Fingerprint ID copied"
                  onCopied={() => analytics.track.fingerprintCopied()}
                />
                <CopyButton
                  value={shareUrl}
                  label="Copy share link"
                  variant="outline"
                  disabled={!shareUrl}
                  successMessage="Snapshot link copied"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coverage Dashboard */}
        <ConfidenceDashboard result={fingerprint} baseline={baseline} />

        <NetworkTrustReport
          result={fingerprint}
          ownIp={ownIp}
          onRetryIp={() => void ownIp.refresh()}
        />

        {/* Uniqueness Analysis */}
        <UniquenessAnalysis baseline={baseline} />

        {/* Privacy Leakage Assessment */}
        <PrivacyLeakageAssessment result={fingerprint} />

        {/* Browser Comparison & Recommendations */}
        <BrowserComparison result={fingerprint} />

        {/* Fingerprint History */}
        <FingerprintHistory currentResult={fingerprint} />

        {/* Export Report */}
        <ExportReport
          result={fingerprint}
          ipSummary={ownIp.status === 'ready' ? ownIp.data : undefined}
        />

        {/* Collectors Tabs */}
        <Tabs
          value={tab}
          onValueChange={(value) => setTab(value as CollectorTabKey)}
          className="w-full"
        >
          <TabsList className="flex h-auto w-full justify-start overflow-x-auto">
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
                    baseline?.kAnonThreshold,
                    baseline?.totalSamples
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
                        width={200}
                        height={50}
                        className="h-auto w-full rounded border"
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
                    baseline?.kAnonThreshold,
                    baseline?.totalSamples
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
                    baseline?.kAnonThreshold,
                    baseline?.totalSamples
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
                    baseline?.kAnonThreshold,
                    baseline?.totalSamples
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
                    baseline?.kAnonThreshold,
                    baseline?.totalSamples
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
  );
}

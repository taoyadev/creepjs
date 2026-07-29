'use client';

import { useCallback, useEffect, useState } from 'react';
import { Check, Code, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface FingerprintPlaygroundProps {
  type: string;
  name: string;
}

interface ScanStep {
  name: string;
  status: 'pending' | 'scanning' | 'completed';
}

type CoreCollectors = typeof import('@creepjs/core');
type SignalCollector = () => unknown;

const COMMON_SCAN_STEPS = [
  'Initializing browser APIs',
  'Collecting data',
  'Analyzing results',
  'Generating fingerprint',
];

const TYPE_SCAN_STEPS: Record<string, string[]> = {
  canvas: [
    'Creating canvas context',
    'Rendering text patterns',
    'Drawing geometric shapes',
    'Extracting pixel data',
    'Hashing canvas output',
  ],
  webgl: [
    'Initializing WebGL context',
    'Querying GPU vendor',
    'Testing extensions',
    'Measuring rendering capabilities',
    'Analyzing shader precision',
  ],
  navigator: [
    'Reading user agent',
    'Checking platform info',
    'Analyzing language preferences',
    'Testing hardware capabilities',
    'Collecting system properties',
  ],
  audio: [
    'Creating audio context',
    'Generating oscillator signals',
    'Processing audio nodes',
    'Measuring output characteristics',
    'Computing audio fingerprint',
  ],
  fonts: [
    'Measuring baseline fonts',
    'Testing system fonts',
    'Checking custom fonts',
    'Analyzing render dimensions',
    'Building font signature',
  ],
  lies: [
    'Collecting all browser data',
    'Cross-referencing properties',
    'Detecting inconsistencies',
    'Analyzing tampering patterns',
    'Computing trust score',
  ],
  webrtc: [
    'Creating peer connection',
    'Gathering ICE candidates',
    'Inspecting exposed network signals',
    'Testing connection capabilities',
    'Summarizing network observations',
  ],
  'service-worker': [
    'Testing service worker support',
    'Checking feature availability',
    'Inspecting registration capabilities',
    'Testing cache support',
    'Summarizing worker observations',
  ],
};

export function getSignalCollector(
  type: string,
  collectors: CoreCollectors
): SignalCollector | undefined {
  const collectorMap: Record<string, SignalCollector> = {
    canvas: () => collectors.collectCanvasFingerprint(),
    webgl: () => collectors.collectWebGLFingerprint(),
    navigator: () => collectors.collectNavigatorFingerprint(),
    screen: () => collectors.collectScreenFingerprint(),
    fonts: () => collectors.collectFontsFingerprint(),
    timezone: () => collectors.collectTimezoneFingerprint(),
    audio: () => collectors.collectAudioFingerprint(),
    'media-devices': () => collectors.collectMediaDevicesFingerprint(),
    'emoji-rendering': () => collectors.collectClientRectsFingerprint(),
    'speech-voices': () => collectors.collectVoicesFingerprint(),
    'svg-rendering': () => collectors.collectSVGFingerprint(),
    'math-precision': () => collectors.collectMathFingerprint(),
    'css-styles': () => collectors.collectCSSFingerprint(),
    'text-metrics': () => collectors.collectTextMetricsFingerprint(),
    'html-element': () => collectors.collectHTMLElementFingerprint(),
    'console-errors': () => collectors.collectConsoleErrorsFingerprint(),
    'dom-rect': () => collectors.collectDomRectFingerprint(),
    'mime-types': () => collectors.collectMimeTypesFingerprint(),
    'anti-fingerprint': () => collectors.collectResistanceFingerprint(),
    'content-window': () => collectors.collectContentWindowFingerprint(),
    'css-media': () => collectors.collectCSSMediaFingerprint(),
    'screen-frame': () => collectors.collectScreenFrameFingerprint(),
    'screen-resolution': () => collectors.collectScreenResolution(),
    'color-depth': () => collectors.collectColorDepth(),
    'hardware-concurrency': () => collectors.collectHardwareConcurrency(),
    'device-memory': () => collectors.collectDeviceMemory(),
    languages: () => collectors.collectLanguages(),
    platform: () => collectors.collectPlatform(),
    vendor: () => collectors.collectVendor(),
    plugins: () => collectors.collectPlugins(),
    'touch-support': () => collectors.collectTouchSupport(),
    'pdf-viewer': () => collectors.collectPdfViewerEnabled(),
    'cookies-enabled': () => collectors.collectCookiesEnabled(),
    'color-gamut': () => collectors.collectColorGamutFingerprint(),
    'indexed-db': () => collectors.collectIndexedDBSupport(),
    'local-storage': () => collectors.collectLocalStorageSupport(),
    'session-storage': () => collectors.collectSessionStorageSupport(),
    'open-database': () => collectors.collectOpenDatabaseSupport(),
    'date-time-locale': () => collectors.collectDateTimeLocale(),
    architecture: () => collectors.collectArchitectureFingerprint(),
    'cpu-class': () => collectors.collectCpuClass(),
    'os-cpu': () => collectors.collectOsCpu(),
    'vendor-flavors': () => collectors.collectVendorFlavors(),
    'reduced-motion': () => collectors.collectReducedMotionPreference(),
    'reduced-transparency': () =>
      collectors.collectReducedTransparencyPreference(),
    'inverted-colors': () => collectors.collectInvertedColorsPreference(),
    monochrome: () => collectors.collectMonochromeDepth(),
    'forced-colors': () => collectors.collectForcedColorsFingerprint(),
    hdr: () => collectors.collectHDRStatus(),
    contrast: () => collectors.collectContrastPreference(),
    'private-click-measurement': () =>
      collectors.collectPrivateClickMeasurement(),
    'font-preferences': () => collectors.collectFontPreferencesFingerprint(),
    webrtc: () => collectors.collectWebRTCFingerprint(),
    'service-worker': () => collectors.collectServiceWorkerFingerprint(),
    lies: async () => {
      const fingerprint = await collectors.collectFingerprint();
      return collectors.collectLiesFingerprint(fingerprint.data);
    },
  };

  return collectorMap[type];
}

export default function FingerprintPlayground({
  type,
  name,
}: FingerprintPlaygroundProps) {
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scanSteps, setScanSteps] = useState<ScanStep[]>(() =>
    (TYPE_SCAN_STEPS[type] ?? COMMON_SCAN_STEPS).map((stepName) => ({
      name: stepName,
      status: 'pending',
    }))
  );
  const [progress, setProgress] = useState(0);

  const loadFingerprint = useCallback(async () => {
    setLoading(true);
    setError(null);
    setProgress(0);

    const steps = TYPE_SCAN_STEPS[type] ?? COMMON_SCAN_STEPS;
    setScanSteps(
      steps.map((stepName) => ({ name: stepName, status: 'pending' }))
    );

    try {
      const collectors = await import('@creepjs/core');

      for (let index = 0; index < steps.length; index += 1) {
        setScanSteps((current) =>
          current.map((step, stepIndex) =>
            stepIndex === index ? { ...step, status: 'scanning' } : step
          )
        );

        await new Promise((resolve) => setTimeout(resolve, 150));
        setProgress(((index + 1) / steps.length) * 100);

        if (index === steps.length - 1) {
          const collector = getSignalCollector(type, collectors);
          if (!collector) {
            throw new Error('Unsupported fingerprint collector');
          }
          setData(await collector());
        }

        setScanSteps((current) =>
          current.map((step, stepIndex) =>
            stepIndex === index ? { ...step, status: 'completed' } : step
          )
        );
      }
    } catch {
      setError('Failed to collect this signal. Please try again.');
    } finally {
      setLoading(false);
      setProgress(100);
    }
  }, [type]);

  useEffect(() => {
    void loadFingerprint();
  }, [loadFingerprint]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" aria-hidden="true" />
            Live signal
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadFingerprint()}
            disabled={loading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="min-h-[20rem]">
        {loading && (
          <div className="space-y-4 py-4" role="status" aria-live="polite">
            <div className="space-y-2">
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-foreground font-medium">
                  Analyzing your browser…
                </span>
                <span className="text-muted-foreground">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress label={`${name} scan progress`} value={progress} />
            </div>

            <div className="space-y-2">
              {scanSteps.map((step) => (
                <div
                  key={step.name}
                  className={`flex items-center gap-3 rounded-lg p-2 transition-colors ${
                    step.status === 'scanning'
                      ? 'bg-primary/10 text-primary'
                      : step.status === 'completed'
                        ? 'text-muted-foreground'
                        : 'text-muted-foreground/50'
                  }`}
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                    {step.status === 'completed' && (
                      <Check
                        className="h-4 w-4 text-green-600 dark:text-green-400"
                        aria-hidden="true"
                      />
                    )}
                    {step.status === 'scanning' && (
                      <span
                        className="border-primary h-3 w-3 animate-spin rounded-full border-2 border-t-transparent"
                        aria-hidden="true"
                      />
                    )}
                    {step.status === 'pending' && (
                      <span
                        className="bg-muted-foreground/30 h-2 w-2 rounded-full"
                        aria-hidden="true"
                      />
                    )}
                  </span>
                  <span
                    className={`text-sm ${
                      step.status === 'scanning' ? 'font-medium' : ''
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div
            className="bg-destructive/10 text-destructive rounded-lg p-4 text-sm"
            role="alert"
          >
            {error}
          </div>
        )}

        {!loading && !error && (
          <pre
            className="bg-muted max-w-full overflow-x-auto rounded-lg p-4 text-xs"
            tabIndex={0}
            aria-label={`${name} result`}
          >
            <code>
              {data === undefined
                ? 'This signal is not available in this browser.'
                : JSON.stringify(data, null, 2)}
            </code>
          </pre>
        )}
      </CardContent>
    </Card>
  );
}

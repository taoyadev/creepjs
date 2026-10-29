'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CopyButton } from '@/components/CopyButton';
import {
  changedSignalFields,
  signalFields,
  signalJson,
  signalState,
} from '@/lib/signal-result';

interface FingerprintPlaygroundProps {
  type: string;
  name: string;
}
type CoreCollectors = typeof import('@creepjs/core');
type SignalCollector = () => unknown;

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
      return fingerprint.data.lies;
    },
  };

  return collectorMap[type];
}

export default function FingerprintPlayground({
  type,
  name,
}: FingerprintPlaygroundProps) {
  const needsNetwork = type === 'webrtc' || type === 'lies';
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>(
    needsNetwork ? 'idle' : 'loading'
  );
  const [data, setData] = useState<unknown>(null);
  const [error, setError] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [phase, setPhase] = useState('Loading collector');
  const [baseline, setBaseline] = useState<string | null>(null);
  const run = useRef(0);
  const busy = useRef(false);

  const loadFingerprint = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    const current = ++run.current;
    const started = performance.now();
    let timer: ReturnType<typeof setTimeout> | undefined;
    setStatus('loading');
    setError('');
    setPhase('Loading collector');
    try {
      const result = await Promise.race([
        (async () => {
          const collectors = await import('@creepjs/core');
          if (current !== run.current) return undefined;
          setPhase('Reading browser signal');
          const collector = getSignalCollector(type, collectors);
          if (!collector) throw new Error('Unsupported collector');
          return collector();
        })(),
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => reject(new Error('timeout')), 15000);
        }),
      ]);
      if (current !== run.current) return;
      setData(result);
      setElapsed(Math.round(performance.now() - started));
      setStatus('ready');
    } catch (cause) {
      if (current !== run.current) return;
      setError(
        cause instanceof Error && cause.message === 'timeout'
          ? 'The signal did not finish within 15 seconds. Retry, or use another signal while this browser API is unavailable.'
          : 'This signal could not be collected. Keep your privacy settings and retry, or inspect another signal.'
      );
      setStatus('error');
    } finally {
      clearTimeout(timer);
      if (current === run.current) busy.current = false;
    }
  }, [type]);

  useEffect(() => {
    busy.current = false;
    setBaseline(null);
    if (!needsNetwork) void loadFingerprint();
    else setStatus('idle');
    return () => {
      run.current += 1;
      busy.current = false;
    };
  }, [loadFingerprint, needsNetwork]);

  const state = signalState(data, type);
  const json = signalJson(data);
  const fields = signalFields(data);
  const changes =
    baseline === null ? null : changedSignalFields(baseline, json);

  return (
    <Card aria-labelledby="live-signal-title" aria-busy={status === 'loading'}>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle as="h2" id="live-signal-title">
            Live signal
          </CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void loadFingerprint()}
            disabled={status === 'loading'}
          >
            {status === 'loading' ? (
              <Loader2
                className="mr-2 h-4 w-4 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
            )}
            {status === 'idle'
              ? 'Run signal check'
              : status === 'error'
                ? 'Retry signal check'
                : 'Run again'}
          </Button>
        </div>
        <p className="text-muted-foreground text-sm">
          {needsNetwork
            ? 'Runs only when you ask. This check contacts Google STUN servers, which can observe your IP. Results stay in this tab.'
            : 'Checks this browser automatically. Results stay in this tab; no account or upload required.'}
        </p>
      </CardHeader>
      <CardContent className="min-w-0 space-y-4">
        <p role="status" aria-live="polite" className="text-sm font-medium">
          {status === 'loading'
            ? `${phase}…`
            : status === 'idle'
              ? 'Ready to inspect this signal.'
              : status === 'error'
                ? 'Signal check failed.'
                : `${state === 'no-result' ? 'Signal unavailable' : state === 'empty' ? 'No items returned' : state === 'partial' ? 'Partial result' : 'Signal collected'} · ${elapsed} ms`}
        </p>
        {status === 'idle' && (
          <p className="text-muted-foreground text-sm">
            You will receive observed values, API availability, and a copyable
            JSON result. A single signal cannot identify a person.
          </p>
        )}
        {status === 'loading' && (
          <div
            aria-hidden="true"
            className="bg-muted h-24 animate-pulse rounded-lg"
          />
        )}
        {status === 'error' && (
          <p role="alert" className="text-destructive text-sm">
            {error}
          </p>
        )}
        {status === 'ready' && (
          <>
            {state !== 'success' && (
              <p className="bg-muted rounded-lg p-3 text-sm">
                {state === 'no-result'
                  ? 'The browser returned no usable signal, or explicitly reported this API as unsupported. This can reflect browser support or privacy settings; it does not establish safety or risk.'
                  : state === 'empty'
                    ? 'The browser exposed an empty list. This is a valid observation, not a failed request. Compare the method and limits alongside this result.'
                    : 'Some values were returned with an error or incomplete status. Use the available fields and inspect the JSON before comparing.'}
              </p>
            )}
            {fields.length > 0 && (
              <dl className="divide-y text-sm">
                {fields.slice(0, 8).map(([label, value]) => (
                  <div
                    key={label}
                    className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-4 py-2.5"
                  >
                    <dt className="text-muted-foreground capitalize">
                      {label}
                    </dt>
                    <dd className="break-words font-mono text-xs [overflow-wrap:anywhere]">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
            {changes !== null && (
              <p
                className="bg-primary/5 rounded-lg border p-3 text-sm"
                role="status"
              >
                {changes.length
                  ? `${changes.length} top-level field${changes.length === 1 ? '' : 's'} changed: ${changes.join(', ')}.`
                  : 'No values changed from your saved comparison.'}{' '}
                Timing alone is not part of this comparison.
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <CopyButton value={json} label="Copy JSON" variant="outline" />
              {state !== 'no-result' && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setBaseline(json)}
                >
                  Keep for comparison
                </Button>
              )}
              {baseline !== null && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setBaseline(null)}
                >
                  Clear comparison
                </Button>
              )}
            </div>
            <p className="text-muted-foreground text-xs leading-5">
              Keep a result, change one browser setting, then run again in this
              tab. Differences show changed observations, not stronger or weaker
              privacy. Image payloads are omitted from JSON.
            </p>
            <details className="rounded-lg border">
              <summary className="cursor-pointer px-4 py-3 text-sm font-medium">
                Inspect complete JSON
                {fields.length > 8 ? ` · ${fields.length} fields` : ''}
              </summary>
              <pre
                className="bg-muted max-h-80 max-w-full overflow-auto p-4 text-xs"
                tabIndex={0}
                aria-label={`${name} result`}
              >
                <code>{json}</code>
              </pre>
            </details>
          </>
        )}
      </CardContent>
    </Card>
  );
}

import type { FingerprintResult } from '@creepjs/core';
import {
  formatBaselineInsight,
  getBaselineEstimate,
  type BaselineResponse,
} from '@/lib/uniqueness-baseline';
import {
  DataRow,
  FingerprintCollectorCard,
  RiskBadge,
} from '@/components/FingerprintCollectorCard';

export function renderSystemCollectorCard(
  key: string,
  fingerprint: FingerprintResult,
  baseline?: BaselineResponse | null
) {
  switch (key) {
    case 'navigator':
      if (!fingerprint.data.navigator) return null;
      return (
        <FingerprintCollectorCard
          key={key}
          techniqueKey={key}
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
          <div className="mt-2 border-t pt-2">
            <div className="text-muted-foreground mb-1 text-xs">
              User Agent:
            </div>
            <code className="break-all text-xs">
              {fingerprint.data.navigator.userAgent}
            </code>
          </div>
        </FingerprintCollectorCard>
      );
    case 'screen':
      if (!fingerprint.data.screen) return null;
      return (
        <FingerprintCollectorCard
          key={key}
          techniqueKey={key}
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
      );
    case 'fonts':
      if (!fingerprint.data.fonts) return null;
      return (
        <FingerprintCollectorCard
          key={key}
          techniqueKey={key}
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
          techniqueKey={key}
          title="Math Precision"
          hash={fingerprint.data.math.hash}
          timing={fingerprint.timings.math}
        >
          <div className="text-muted-foreground mb-1 text-sm">Constants:</div>
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
      );
    case 'htmlElement':
      if (!fingerprint.data.htmlElement) return null;
      return (
        <FingerprintCollectorCard
          key={key}
          techniqueKey={key}
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
      );
    default:
      return null;
  }
}

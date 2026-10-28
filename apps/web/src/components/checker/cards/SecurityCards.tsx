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

export function renderSecurityCollectorCard(
  key: string,
  fingerprint: FingerprintResult,
  baseline?: BaselineResponse | null
) {
  switch (key) {
    case 'lies':
      if (!fingerprint.data.lies) return null;
      return (
        <FingerprintCollectorCard
          key={key}
          techniqueKey={key}
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
          techniqueKey={key}
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
          <div className="mt-2 border-t pt-2">
            <div className="text-muted-foreground mb-1 text-sm">
              All Detections:
            </div>
            <div className="grid max-h-48 grid-cols-2 gap-1 overflow-y-auto text-xs">
              {Object.entries(fingerprint.data.resistance.detections).map(
                ([key, value]) => (
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
                )
              )}
            </div>
          </div>
        </FingerprintCollectorCard>
      );
    case 'timezone':
      if (!fingerprint.data.timezone) return null;
      return (
        <FingerprintCollectorCard
          key={key}
          techniqueKey={key}
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
    case 'domBlockers':
      if (!fingerprint.data.domBlockers) return null;
      return (
        <FingerprintCollectorCard
          key={key}
          techniqueKey={key}
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
      );
    case 'consoleErrors':
      if (!fingerprint.data.consoleErrors) return null;
      return (
        <FingerprintCollectorCard
          key={key}
          techniqueKey={key}
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

import type { FingerprintResult } from '@creepjs/core';
import {
  DataRow,
  FingerprintCollectorCard,
} from '@/components/FingerprintCollectorCard';

export function renderAccessibilityCollectorCard(
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

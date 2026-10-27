import type { FingerprintResult } from '@creepjs/core';
import {
  DataRow,
  FingerprintCollectorCard,
} from '@/components/FingerprintCollectorCard';

export function renderMediaCollectorCard(
  key: string,
  fingerprint: FingerprintResult
) {
  switch (key) {
    case 'audio':
      if (!fingerprint.data.audio) return null;
      return (
        <FingerprintCollectorCard
          key={key}
          techniqueKey={key}
          title="Audio"
          hash={fingerprint.data.audio.hash}
          timing={fingerprint.timings.audio}
        >
          <DataRow label="Rendered Sum" value={fingerprint.data.audio.sum} />
        </FingerprintCollectorCard>
      );
    case 'media':
      if (!fingerprint.data.media) return null;
      return (
        <FingerprintCollectorCard
          key={key}
          techniqueKey={key}
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
            <div className="text-muted-foreground mb-1 text-xs">Devices:</div>
            <div className="space-y-1">
              {fingerprint.data.media.devices.map((device, i) => (
                <div key={i} className="text-xs">
                  {device.kind}: {device.label || 'No label'}
                </div>
              ))}
            </div>
          </div>
        </FingerprintCollectorCard>
      );
    case 'voices':
      if (!fingerprint.data.voices) return null;
      return (
        <FingerprintCollectorCard
          key={key}
          techniqueKey={key}
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
          techniqueKey={key}
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
      );
    case 'domRect':
      if (!fingerprint.data.domRect) return null;
      return (
        <FingerprintCollectorCard
          key={key}
          techniqueKey={key}
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
          <div className="text-muted-foreground mt-2 text-sm">
            Measurements:
          </div>
          <code className="break-all text-xs">
            {fingerprint.data.domRect.measurements.slice(0, 6).join(', ')}
            ...
          </code>
        </FingerprintCollectorCard>
      );
    default:
      return null;
  }
}

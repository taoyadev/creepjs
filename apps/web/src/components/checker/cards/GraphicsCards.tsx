import type { FingerprintResult } from '@creepjs/core';
import {
  DataRow,
  FingerprintCollectorCard,
} from '@/components/FingerprintCollectorCard';

export function renderGraphicsCollectorCard(
  key: string,
  fingerprint: FingerprintResult
) {
  switch (key) {
    case 'canvas':
      if (!fingerprint.data.canvas) return null;
      return (
        <FingerprintCollectorCard
          key={key}
          techniqueKey={key}
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
                width={200}
                height={50}
                className="h-auto w-full rounded border"
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
          techniqueKey={key}
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
          techniqueKey={key}
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
          techniqueKey={key}
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
          techniqueKey={key}
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

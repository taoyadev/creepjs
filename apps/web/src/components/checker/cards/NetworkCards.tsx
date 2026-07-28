import type { FingerprintResult } from '@creepjs/core';
import {
  DataRow,
  FingerprintCollectorCard,
} from '@/components/FingerprintCollectorCard';

export function renderNetworkCollectorCard(
  key: string,
  fingerprint: FingerprintResult
) {
  switch (key) {
    case 'webrtc':
      if (!fingerprint.data.webrtc) return null;
      return (
        <FingerprintCollectorCard
          key={key}
          techniqueKey={key}
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
          techniqueKey={key}
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
          techniqueKey={key}
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
          techniqueKey={key}
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
          techniqueKey={key}
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

/**
 * WebRTC Fingerprinting
 * Collects WebRTC-related information including ICE candidates and connection capabilities
 */

import type { WebRTCFingerprint } from '../types';

/**
 * Collect WebRTC fingerprint data
 */
export async function collectWebRTCFingerprint(): Promise<
  WebRTCFingerprint | undefined
> {
  try {
    // Check basic support
    const rtcPeerConnectionSupported = !!(
      window.RTCPeerConnection ||
      // @ts-expect-error - vendor prefixes
      window.webkitRTCPeerConnection ||
      // @ts-expect-error - vendor prefixes
      window.mozRTCPeerConnection
    );

    const getUserMediaSupported = !!(
      navigator.mediaDevices?.getUserMedia ||
      // @ts-expect-error - legacy API
      navigator.getUserMedia ||
      // @ts-expect-error - vendor prefixes
      navigator.webkitGetUserMedia ||
      // @ts-expect-error - vendor prefixes
      navigator.mozGetUserMedia
    );

    const mediaDevicesSupported = !!navigator.mediaDevices;

    if (!rtcPeerConnectionSupported) {
      return {
        hash: 'webrtc-not-supported',
        supported: false,
        iceServers: { stunSupported: false, turnSupported: false },
        candidates: { local: [], public: [], ipv4: [], ipv6: [] },
        connection: {},
        capabilities: { audio: [], video: [] },
        mediaDevices: mediaDevicesSupported,
        getUserMediaSupported,
        rtcPeerConnectionSupported: false,
        dataChannelSupported: false,
      };
    }

    // Get RTCPeerConnection constructor
    const RTCPeerConnectionCtor =
      window.RTCPeerConnection ||
      // @ts-expect-error - vendor prefixes
      window.webkitRTCPeerConnection ||
      // @ts-expect-error - vendor prefixes
      window.mozRTCPeerConnection;

    if (!RTCPeerConnectionCtor) {
      return {
        hash: 'webrtc-not-supported',
        supported: false,
        iceServers: { stunSupported: false, turnSupported: false },
        candidates: { local: [], public: [], ipv4: [], ipv6: [] },
        connection: {},
        capabilities: { audio: [], video: [] },
        mediaDevices: mediaDevicesSupported,
        getUserMediaSupported,
        rtcPeerConnectionSupported: false,
        dataChannelSupported: false,
      };
    }

    // Create peer connection with STUN server
    const pc = new RTCPeerConnectionCtor({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });

    const candidates: {
      local: string[];
      public: string[];
      ipv4: string[];
      ipv6: string[];
    } = {
      local: [],
      public: [],
      ipv4: [],
      ipv6: [],
    };

    // Create a data channel to trigger ICE gathering
    const dataChannelSupported = typeof pc.createDataChannel === 'function';
    if (dataChannelSupported) {
      pc.createDataChannel('fingerprint');
    }

    // Create offer to trigger ICE gathering
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    // Collect ICE candidates
    await new Promise<void>((resolve) => {
      const timeout = setTimeout(() => {
        resolve();
      }, 2000); // 2 second timeout

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const candidate = event.candidate.candidate;
          candidates.local.push(candidate);

          // Parse IP addresses
          const ipv4Regex = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/;
          const ipMatch = ipv4Regex.exec(candidate);
          if (ipMatch) {
            const ip = ipMatch[0];
            if (!ip.startsWith('0.') && !ip.startsWith('127.')) {
              candidates.ipv4.push(ip);

              // Check if public IP
              if (!isPrivateIP(ip)) {
                candidates.public.push(ip);
              }
            }
          }

          // Parse IPv6 addresses
          const ipv6Regex = /\b(?:[0-9a-f]{1,4}:){7}[0-9a-f]{1,4}\b/i;
          const ipv6Match = ipv6Regex.exec(candidate);
          if (ipv6Match) {
            candidates.ipv6.push(ipv6Match[0]);
          }
        } else {
          // ICE gathering complete
          clearTimeout(timeout);
          resolve();
        }
      };

      pc.onicegatheringstatechange = () => {
        if (pc.iceGatheringState === 'complete') {
          clearTimeout(timeout);
          resolve();
        }
      };
    });

    // Get connection state
    const connection = {
      connectionState: pc.connectionState,
      iceConnectionState: pc.iceConnectionState,
      iceGatheringState: pc.iceGatheringState,
      signalingState: pc.signalingState,
    };

    // Get codec capabilities
    const capabilities = {
      audio: [] as string[],
      video: [] as string[],
    };

    try {
      if (
        typeof RTCRtpSender !== 'undefined' &&
        typeof RTCRtpSender.getCapabilities === 'function'
      ) {
        const audioCapabilities = RTCRtpSender.getCapabilities('audio');
        if (audioCapabilities?.codecs) {
          capabilities.audio = audioCapabilities.codecs.map(
            (c) => `${c.mimeType}${c.sdpFmtpLine ? ` ${c.sdpFmtpLine}` : ''}`
          );
        }

        const videoCapabilities = RTCRtpSender.getCapabilities('video');
        if (videoCapabilities?.codecs) {
          capabilities.video = videoCapabilities.codecs.map(
            (c) => `${c.mimeType}${c.sdpFmtpLine ? ` ${c.sdpFmtpLine}` : ''}`
          );
        }
      }
    } catch (_capabilitiesError) {
      void _capabilitiesError;
      // Capabilities not supported
    }

    // Clean up
    pc.close();

    // Generate hash
    const dataString = JSON.stringify({
      candidates: candidates,
      connection: connection,
      capabilities: capabilities,
      supported: true,
    });
    const hash = await hashString(dataString);

    return {
      hash,
      supported: true,
      iceServers: {
        stunSupported: candidates.local.length > 0,
        turnSupported: false, // We don't test TURN servers
      },
      candidates: {
        local: [...new Set(candidates.local)],
        public: [...new Set(candidates.public)],
        ipv4: [...new Set(candidates.ipv4)],
        ipv6: [...new Set(candidates.ipv6)],
      },
      connection,
      capabilities,
      mediaDevices: mediaDevicesSupported,
      getUserMediaSupported,
      rtcPeerConnectionSupported: true,
      dataChannelSupported,
    };
  } catch (error) {
    console.error('WebRTC fingerprint collection failed:', error);
    return undefined;
  }
}

/**
 * Check if an IP address is private
 */
function isPrivateIP(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4) return false;

  const [p0, p1, p2, p3] = parts;
  if (
    p0 === undefined ||
    p1 === undefined ||
    p2 === undefined ||
    p3 === undefined
  )
    return false;

  // 10.0.0.0 - 10.255.255.255
  if (p0 === 10) return true;

  // 172.16.0.0 - 172.31.255.255
  if (p0 === 172 && p1 >= 16 && p1 <= 31) return true;

  // 192.168.0.0 - 192.168.255.255
  if (p0 === 192 && p1 === 168) return true;

  // 169.254.0.0 - 169.254.255.255 (link-local)
  if (p0 === 169 && p1 === 254) return true;

  return false;
}

/**
 * Simple hash function for string data
 */
async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

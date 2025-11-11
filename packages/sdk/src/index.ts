import type { FingerprintResult, CollectorSummary, CollectorTimings } from '@creepjs/core';
import { collectFingerprint } from '@creepjs/core';

export interface SDKConfig {
  token: string;
  endpoint?: string;
  cache?: boolean;
  cacheTtl?: number; // milliseconds
}

export interface SDKResponse {
  fingerprintId: string;
  timestamp: number;
  confidence: number;
  collectors?: Record<string, CollectorSummary>;
  timings?: CollectorTimings;
  cached?: boolean;
}

const CACHE_KEY = 'creepjs_fingerprint';
const DEFAULT_ENDPOINT = 'https://api.creepjs.org/v1/fingerprint';
const DEFAULT_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * CreepJS SDK Client
 */
export class CreepJS {
  private config: Required<SDKConfig>;

  constructor(config: SDKConfig) {
    this.config = {
      token: config.token,
      endpoint: config.endpoint || DEFAULT_ENDPOINT,
      cache: config.cache ?? true,
      cacheTtl: config.cacheTtl || DEFAULT_CACHE_TTL,
    };
  }

  /**
   * Get fingerprint from cache if available
   */
  private getCachedFingerprint(): SDKResponse | null {
    if (!this.config.cache || typeof localStorage === 'undefined') {
      return null;
    }

    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const data = JSON.parse(cached) as {
        fingerprint: SDKResponse;
        expiry: number;
      };

      if (Date.now() > data.expiry) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }

      return { ...data.fingerprint, cached: true };
    } catch {
      return null;
    }
  }

  /**
   * Cache fingerprint in localStorage
   */
  private cacheFingerprint(fingerprint: SDKResponse): void {
    if (!this.config.cache || typeof localStorage === 'undefined') {
      return;
    }

    try {
      const data = {
        fingerprint,
        expiry: Date.now() + this.config.cacheTtl,
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch {
      // Ignore cache errors
    }
  }

  /**
   * Send fingerprint to API
   */
  private async sendToAPI(
    fingerprintData: FingerprintResult
  ): Promise<SDKResponse> {
    const response = await fetch(this.config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Token': this.config.token,
      },
      body: JSON.stringify(fingerprintData),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const result = (await response.json()) as {
      fingerprintId: string;
      timestamp: number;
      confidence?: number;
      collectors?: Record<string, CollectorSummary>;
      timings?: CollectorTimings;
    };

    return {
      fingerprintId: result.fingerprintId,
      timestamp: result.timestamp,
      confidence: result.confidence ?? fingerprintData.confidence,
      collectors: result.collectors ?? fingerprintData.collectors,
      timings: result.timings ?? fingerprintData.timings,
      cached: false,
    };
  }

  /**
   * Get browser fingerprint
   */
  async getFingerprint(): Promise<SDKResponse> {
    // Check cache first
    const cached = this.getCachedFingerprint();
    if (cached) {
      return cached;
    }

    // Collect fingerprint data
    const fingerprintData = await collectFingerprint();

    // Send to API
    const response = await this.sendToAPI(fingerprintData);

    // Cache the result
    this.cacheFingerprint(response);

    return response;
  }

  /**
   * Clear cached fingerprint
   */
  clearCache(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(CACHE_KEY);
    }
  }
}

/**
 * Convenience function to get fingerprint
 */
export async function getFingerprint(
  config: SDKConfig
): Promise<SDKResponse> {
  const sdk = new CreepJS(config);
  return sdk.getFingerprint();
}

export default CreepJS;

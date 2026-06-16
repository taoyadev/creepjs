import type {
  FingerprintData,
  FingerprintResult,
  CollectorSummary,
  CollectorTimings,
  CollectorCoverage,
} from '@creepjs/core';

export interface SDKConfig {
  token: string;
  endpoint?: string;
  cache?: boolean;
  cacheTtl?: number; // milliseconds
  timeoutMs?: number;
  fullBundleUrl?: string;
}

export interface SDKResponse {
  fingerprintId: string;
  data: FingerprintData;
  timestamp: number;
  confidence: number;
  coverage: CollectorCoverage;
  collectors?: Record<string, CollectorSummary>;
  timings?: CollectorTimings;
  cached?: boolean;
}

export interface IpIntelligenceResponse {
  data: Record<string, unknown>;
  cached: boolean;
  highRisk: boolean;
  rateLimit: {
    limit: number | null;
    remaining: number | null;
    reset: number | null;
    tier: string | null;
  };
}

type CoreModule = {
  collectFingerprint: () => Promise<FingerprintResult>;
};

type GlobalWithCore = typeof globalThis & {
  __CREEPJS_CORE__?: CoreModule;
};

const CACHE_KEY = 'creepjs_fingerprint';
const DEFAULT_ENDPOINT = 'https://api.creepjs.org/v1/fingerprint';
const DEFAULT_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_FULL_ESM_SPECIFIER = './creepjs.full.esm.js';
const DEFAULT_FULL_BROWSER_FILENAME = 'sdk.full.js';

let coreModulePromise: Promise<CoreModule> | null = null;
const scriptSrcAtLoad =
  typeof document !== 'undefined' &&
  document.currentScript instanceof HTMLScriptElement
    ? document.currentScript.src
    : '';

export class CreepJSSDKError extends Error {
  readonly code:
    | 'core_load_failed'
    | 'api_error'
    | 'request_timeout'
    | 'invalid_response';
  readonly status?: number;

  constructor(
    code: CreepJSSDKError['code'],
    message: string,
    options?: { status?: number }
  ) {
    super(message);
    this.name = 'CreepJSSDKError';
    this.code = code;
    this.status = options?.status;
  }
}

function getGlobalCore(): CoreModule | null {
  return (globalThis as GlobalWithCore).__CREEPJS_CORE__ ?? null;
}

function getWindowLocationOrigin() {
  return typeof window !== 'undefined' ? window.location.origin : '';
}

function resolveFullBundleUrl(customUrl?: string) {
  if (customUrl) return customUrl;

  if (scriptSrcAtLoad) {
    return scriptSrcAtLoad.replace(
      /(creepjs\.umd\.js|sdk\.js)$/u,
      DEFAULT_FULL_BROWSER_FILENAME
    );
  }

  return `${getWindowLocationOrigin()}/${DEFAULT_FULL_BROWSER_FILENAME}`;
}

async function loadCoreFromScript(fullBundleUrl?: string): Promise<CoreModule> {
  const existing = getGlobalCore();
  if (existing) return existing;

  if (typeof document === 'undefined') {
    throw new CreepJSSDKError(
      'core_load_failed',
      'Browser bundle loader is unavailable outside the browser.'
    );
  }

  const src = resolveFullBundleUrl(fullBundleUrl);

  await new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[data-creepjs-full-sdk="true"][src="${src}"]`
    );

    if (existingScript) {
      if (existingScript.dataset.loaded === 'true') {
        resolve();
        return;
      }
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener(
        'error',
        () =>
          reject(
            new CreepJSSDKError(
              'core_load_failed',
              `Failed to load SDK full bundle from ${src}`
            )
          ),
        { once: true }
      );
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.dataset.creepjsFullSdk = 'true';
    script.addEventListener(
      'load',
      () => {
        script.dataset.loaded = 'true';
        resolve();
      },
      { once: true }
    );
    script.addEventListener(
      'error',
      () =>
        reject(
          new CreepJSSDKError(
            'core_load_failed',
            `Failed to load SDK full bundle from ${src}`
          )
        ),
      { once: true }
    );
    document.head.appendChild(script);
  });

  const loaded = getGlobalCore();
  if (!loaded) {
    throw new CreepJSSDKError(
      'core_load_failed',
      'SDK full bundle loaded but did not register collectFingerprint.'
    );
  }

  return loaded;
}

async function loadCoreFromModule(): Promise<CoreModule> {
  try {
    const mod = (await import(DEFAULT_FULL_ESM_SPECIFIER)) as CoreModule;
    return mod;
  } catch (error) {
    throw new CreepJSSDKError(
      'core_load_failed',
      error instanceof Error
        ? error.message
        : 'Failed to import the SDK full module.'
    );
  }
}

async function loadCoreModule(fullBundleUrl?: string): Promise<CoreModule> {
  const existing = getGlobalCore();
  if (existing) return existing;

  if (!coreModulePromise) {
    coreModulePromise =
      typeof window !== 'undefined'
        ? loadCoreFromScript(fullBundleUrl)
        : loadCoreFromModule();
  }

  try {
    const mod = await coreModulePromise;
    return mod;
  } catch (error) {
    coreModulePromise = null;
    throw error;
  }
}

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
      timeoutMs: config.timeoutMs || DEFAULT_TIMEOUT_MS,
      fullBundleUrl: config.fullBundleUrl || '',
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
        fingerprint: Omit<SDKResponse, 'coverage'> & {
          coverage?: CollectorCoverage;
        };
        expiry: number;
      };

      if (Date.now() > data.expiry || !data.fingerprint.data) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }

      return { ...this.ensureCoverage(data.fingerprint), cached: true };
    } catch (_error) {
      void _error;
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
        fingerprint: this.ensureCoverage(fingerprint),
        expiry: Date.now() + this.config.cacheTtl,
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (_error) {
      void _error;
    }
  }

  private async fetchWithTimeout(
    input: string,
    init: RequestInit = {}
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = globalThis.setTimeout(
      () => controller.abort(),
      this.config.timeoutMs
    );

    try {
      const response = await fetch(input, {
        ...init,
        signal: controller.signal,
      });
      return response;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new CreepJSSDKError(
          'request_timeout',
          `Request timed out after ${this.config.timeoutMs}ms`
        );
      }
      throw error;
    } finally {
      globalThis.clearTimeout(timeoutId);
    }
  }

  /**
   * Send fingerprint to API
   */
  private async sendToAPI(
    fingerprintData: FingerprintResult
  ): Promise<SDKResponse> {
    const response = await this.fetchWithTimeout(this.config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Token': this.config.token,
      },
      body: JSON.stringify(fingerprintData),
    });

    if (!response.ok) {
      throw new CreepJSSDKError(
        'api_error',
        `API error: ${response.status} ${response.statusText}`,
        { status: response.status }
      );
    }

    const result = (await response.json()) as {
      fingerprintId: string;
      data?: FingerprintData;
      timestamp: number;
      confidence?: number;
      coverage?: CollectorCoverage;
      collectors?: Record<string, CollectorSummary>;
      timings?: CollectorTimings;
    };

    if (!result.fingerprintId || !result.timestamp) {
      throw new CreepJSSDKError(
        'invalid_response',
        'Fingerprint API returned an invalid response payload.'
      );
    }

    return this.ensureCoverage({
      fingerprintId: result.fingerprintId,
      data: result.data ?? fingerprintData.data,
      timestamp: result.timestamp,
      confidence: result.confidence ?? fingerprintData.confidence,
      coverage: result.coverage ?? fingerprintData.coverage,
      collectors: result.collectors ?? fingerprintData.collectors,
      timings: result.timings ?? fingerprintData.timings,
      cached: false,
    });
  }

  /**
   * Get browser fingerprint
   */
  async getFingerprint(): Promise<SDKResponse> {
    const cached = this.getCachedFingerprint();
    if (cached) {
      return cached;
    }

    const core = await loadCoreModule(this.config.fullBundleUrl || undefined);
    const fingerprintData = await core.collectFingerprint();
    const response = await this.sendToAPI(fingerprintData);

    this.cacheFingerprint(response);

    return response;
  }

  async getIpIntelligence(ip: string): Promise<IpIntelligenceResponse> {
    const base = this.config.endpoint.replace(/\/v1\/fingerprint$/u, '');
    const response = await this.fetchWithTimeout(
      `${base}/v1/ip/${encodeURIComponent(ip)}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'X-API-Token': this.config.token,
        },
      }
    );

    if (!response.ok) {
      throw new CreepJSSDKError(
        'api_error',
        `API error: ${response.status} ${response.statusText}`,
        { status: response.status }
      );
    }

    return (await response.json()) as IpIntelligenceResponse;
  }

  /**
   * Clear cached fingerprint
   */
  clearCache(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(CACHE_KEY);
    }
  }

  private ensureCoverage(
    response: Omit<SDKResponse, 'coverage'> & { coverage?: CollectorCoverage }
  ): SDKResponse {
    return {
      ...response,
      coverage: response.coverage ?? {
        ratio: response.confidence,
        successful: 0,
        failed: 0,
        skipped: 0,
      },
    };
  }
}

/**
 * Convenience function to get fingerprint
 */
export async function getFingerprint(config: SDKConfig): Promise<SDKResponse> {
  const sdk = new CreepJS(config);
  return sdk.getFingerprint();
}

export async function getIpIntelligence(
  ip: string,
  config: SDKConfig
): Promise<IpIntelligenceResponse> {
  const sdk = new CreepJS(config);
  return sdk.getIpIntelligence(ip);
}

export default CreepJS;

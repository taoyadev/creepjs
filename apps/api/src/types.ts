export type Env = {
  Bindings: {
    TOKENS: KVNamespace;
    RATE_LIMIT: KVNamespace;
    IP_CACHE: KVNamespace;
    FP_STATS: KVNamespace;
    /** Atomic rolling-window counters; see durable/QuotaCounter.ts. */
    QUOTA: DurableObjectNamespace;
    ENVIRONMENT: string;
    CORS_ORIGIN: string;
    RATE_LIMIT_PER_DAY: string;
    IPBOT_API_ORIGIN: string;
    IPBOT_API_KEY: string;
    FP_STATS_K_ANON?: string;
    // Optional public /v1/ip/public limits (defaults applied in the route).
    PUBLIC_IP_DAILY_PER_IP?: string;
    PUBLIC_IP_DAILY_GLOBAL?: string;
    // Optional /my-ip paid risk-lookup limit per visitor (default 10/day).
    MYIP_RISK_DAILY_PER_IP?: string;
    // Optional /v1/stats/uniqueness limit per visitor (default 120/day).
    STATS_DAILY_PER_IP?: string;
  };
  Variables: {
    token: string;
    tokenData: TokenData;
    requestId: string;
  };
};

export interface TokenData {
  email: string;
  createdAt: number;
  usageCount: number;
}

export interface RateLimitData {
  count: number;
  resetAt: number;
}

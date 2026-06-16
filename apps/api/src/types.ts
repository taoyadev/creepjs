export type Env = {
  Bindings: {
    TOKENS: KVNamespace;
    RATE_LIMIT: KVNamespace;
    IP_CACHE: KVNamespace;
    FP_STATS: KVNamespace;
    ENVIRONMENT: string;
    CORS_ORIGIN: string;
    RATE_LIMIT_PER_DAY: string;
    IPBOT_API_ORIGIN: string;
    IPBOT_API_KEY: string;
    FP_STATS_K_ANON?: string;
    // Optional public /v1/ip/public limits (defaults applied in the route).
    PUBLIC_IP_DAILY_PER_IP?: string;
    PUBLIC_IP_DAILY_GLOBAL?: string;
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

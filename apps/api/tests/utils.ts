import type { Env, TokenData } from '../src/types';
import { QuotaCounter } from '../src/durable/QuotaCounter';
import { StatsCounter } from '../src/durable/StatsCounter';
import { reserveQuota } from '../src/utils/quota';

const NO_LIMIT = Number.MAX_SAFE_INTEGER;

type KVStoredValue = {
  value: string;
  metadata?: unknown;
  expiration?: number | null;
};

const jsonEncode = (value: unknown): string =>
  typeof value === 'string' ? value : JSON.stringify(value);

export const createMockKV = (
  initial: Record<string, string> = {}
): KVNamespace => {
  const store = new Map<string, KVStoredValue>();
  Object.entries(initial).forEach(([key, value]) => {
    store.set(key, { value });
  });

  return {
    async get(
      key: string,
      typeOrOptions?:
        | 'text'
        | 'json'
        | 'arrayBuffer'
        | 'stream'
        | { type: 'text' | 'json' | 'arrayBuffer' | 'stream' }
    ): Promise<any> {
      const entry = store.get(key);
      if (!entry) return null;

      const type =
        typeof typeOrOptions === 'string'
          ? typeOrOptions
          : (typeOrOptions?.type ?? 'text');

      if (type === 'json') {
        return JSON.parse(entry.value);
      }
      if (type === 'arrayBuffer') {
        return new TextEncoder().encode(entry.value).buffer;
      }
      if (type === 'stream') {
        const encoder = new TextEncoder();
        return new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode(entry.value));
            controller.close();
          },
        });
      }

      return entry.value;
    },
    async put(
      key: string,
      value: string,
      options?: { expiration?: number; expirationTtl?: number }
    ): Promise<void> {
      const expiration =
        options?.expiration ??
        (options?.expirationTtl
          ? Date.now() + options.expirationTtl * 1000
          : null);
      store.set(key, { value, expiration });
    },
    async delete(key: string): Promise<void> {
      store.delete(key);
    },
    async list(): Promise<{
      keys: Array<{ name: string; expiration?: number | null; metadata?: any }>;
      list_complete: boolean;
      cursor?: string;
    }> {
      return {
        keys: Array.from(store.entries()).map(([name, entry]) => ({
          name,
          expiration: entry.expiration ?? null,
          metadata: entry.metadata ?? null,
        })),
        list_complete: true,
      };
    },
  } as KVNamespace;
};

/**
 * Durable Object namespace backed by the real `QuotaCounter`, so the quota
 * tests exercise the shipped reservation logic rather than a second
 * implementation of it. One instance per name, matching `idFromName`.
 */
export const createMockQuotaNamespace = (): DurableObjectNamespace => {
  const instances = new Map<string, QuotaCounter>();

  const stateFor = (): DurableObjectState => {
    const storage = new Map<string, unknown>();
    return {
      storage: {
        get: async (key: string) => storage.get(key),
        put: async (key: string, value: unknown) => {
          storage.set(key, value);
        },
        deleteAll: async () => {
          storage.clear();
        },
        setAlarm: async () => {},
      },
      // The runtime serializes these; the tests are single-threaded.
      blockConcurrencyWhile: async <T>(fn: () => Promise<T>) => fn(),
    } as unknown as DurableObjectState;
  };

  return {
    idFromName: (name: string) => ({ name }) as unknown as DurableObjectId,
    get: (id: DurableObjectId) => {
      const key = (id as unknown as { name: string }).name;
      let instance = instances.get(key);
      if (!instance) {
        instance = new QuotaCounter(stateFor());
        instances.set(key, instance);
      }
      const target = instance;
      return {
        fetch: (input: RequestInfo, init?: RequestInit) =>
          target.fetch(new Request(input as string, init)),
      } as unknown as DurableObjectStub;
    },
  } as unknown as DurableObjectNamespace;
};

/**
 * Namespace backed by the real `StatsCounter`, seeding from `fpStats` the way
 * the deployed object seeds from the FP_STATS KV namespace.
 */
export const createMockStatsNamespace = (
  fpStats: KVNamespace
): DurableObjectNamespace => {
  const instances = new Map<string, StatsCounter>();

  const stateFor = (): DurableObjectState => {
    const storage = new Map<string, unknown>();
    return {
      storage: {
        get: async (keys: string[]) =>
          new Map(
            keys.filter((k) => storage.has(k)).map((k) => [k, storage.get(k)])
          ),
        put: async (entries: Record<string, unknown>) => {
          for (const [key, value] of Object.entries(entries)) {
            storage.set(key, value);
          }
        },
      },
      blockConcurrencyWhile: async <T>(fn: () => Promise<T>) => fn(),
    } as unknown as DurableObjectState;
  };

  return {
    idFromName: (name: string) => ({ name }) as unknown as DurableObjectId,
    get: (id: DurableObjectId) => {
      const key = (id as unknown as { name: string }).name;
      let instance = instances.get(key);
      if (!instance) {
        instance = new StatsCounter(stateFor(), { FP_STATS: fpStats });
        instances.set(key, instance);
      }
      const target = instance;
      return {
        fetch: (input: RequestInfo, init?: RequestInit) =>
          target.fetch(new Request(input as string, init)),
      } as unknown as DurableObjectStub;
    },
  } as unknown as DurableObjectNamespace;
};

export const createTestEnv = ({
  tokens,
  rateLimits,
  ipCache,
  fpStats,
  bindings,
}: {
  tokens?: Record<string, string>;
  rateLimits?: Record<string, string>;
  ipCache?: Record<string, string>;
  fpStats?: Record<string, string>;
  bindings?: Partial<Env['Bindings']>;
} = {}): Env['Bindings'] => {
  const fpStatsKV = createMockKV(fpStats);
  return {
    TOKENS: createMockKV(tokens),
    RATE_LIMIT: createMockKV(rateLimits),
    IP_CACHE: createMockKV(ipCache),
    FP_STATS: fpStatsKV,
    QUOTA: createMockQuotaNamespace(),
    STATS: createMockStatsNamespace(fpStatsKV),
    ENVIRONMENT: 'test',
    CORS_ORIGIN: '*',
    RATE_LIMIT_PER_DAY: '1000',
    IPBOT_API_ORIGIN: 'https://api.ipbot.test',
    IPBOT_API_KEY: 'ipb_test_key',
    ...bindings,
  };
};

/**
 * Put a counter at `count` used units. Quota lives in a Durable Object, so
 * seeding the RATE_LIMIT KV no longer sets up an exhausted limit.
 */
export const seedQuota = async (
  env: Env['Bindings'],
  key: string,
  count: number
): Promise<void> => {
  await reserveQuota(env, key, { cost: count, limit: NO_LIMIT });
};

/** Current used units for a counter, without consuming any. */
export const readQuotaCount = async (
  env: Env['Bindings'],
  key: string
): Promise<number> => {
  const { count } = await reserveQuota(env, key, { cost: 0, limit: NO_LIMIT });
  return count;
};

export const seedToken = (
  env: Env['Bindings'],
  token: string,
  data: TokenData
) => {
  const tokensKV = env.TOKENS;
  return tokensKV.put(token, jsonEncode(data));
};

/** Current value of a uniqueness-stats counter, without incrementing it. */
export const readStatsCount = async (
  env: Env['Bindings'],
  key: string
): Promise<number> => {
  const stub = env.STATS.get(env.STATS.idFromName('fpstats:v1'));
  const res = await stub.fetch('https://stats.internal/', {
    method: 'POST',
    body: JSON.stringify({ op: 'read', keys: [key] }),
  });
  return (await res.json<Record<string, number>>())[key] ?? 0;
};

/**
 * Parsed body in assertions. Tests check fields against literal expectations;
 * the route's own schema, not this type, is the contract.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type JsonBody = any;

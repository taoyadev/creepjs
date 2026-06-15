/**
 * Live smoke test for the IPbot service.
 *
 * Runs the real `lookupIP()` against the real API using a Map-backed KV stub,
 * so it exercises the exact request/caching/retry path the Worker uses.
 *
 * Credentials are read from the environment ONLY (never hardcoded):
 *   IPBOT_API_ORIGIN=https://api.ipbot.com \
 *   IPBOT_API_KEY=ipb_pro_xxx \
 *   npx tsx apps/api/scripts/verify-ipbot.ts [ip]
 */
import { lookupIP, type IpbotBindings } from '../src/services/ipbot';

// Minimal in-memory KV stub (only the methods lookupIP uses).
function createMemoryKV() {
  const store = new Map<string, string>();
  return {
    async get(key: string, type?: 'json' | 'text') {
      const raw = store.get(key);
      if (raw == null) return null;
      return type === 'json' ? JSON.parse(raw) : raw;
    },
    async put(key: string, value: string) {
      store.set(key, value);
    },
  } as unknown as IpbotBindings['IP_CACHE'];
}

async function main() {
  const ip = process.argv[2] ?? '8.8.8.8';
  const origin = process.env.IPBOT_API_ORIGIN;
  const apiKey = process.env.IPBOT_API_KEY;

  if (!origin || !apiKey) {
    console.error(
      'Missing IPBOT_API_ORIGIN or IPBOT_API_KEY in the environment. Aborting.'
    );
    process.exit(2);
  }

  const env: IpbotBindings = {
    IPBOT_API_ORIGIN: origin,
    IPBOT_API_KEY: apiKey,
    IP_CACHE: createMemoryKV(),
  };

  const first = await lookupIP(ip, env);
  const second = await lookupIP(ip, env); // should be a cache hit

  console.log('--- IPbot lookup result ---');
  console.log('ip:        ', first.data.ip);
  console.log(
    'location:  ',
    first.data.location?.city,
    first.data.location?.country_code
  );
  console.log('network:   ', first.data.network?.asn, first.data.network?.org);
  console.log(
    'risk_score:',
    first.data.score?.risk_score,
    '| band:',
    first.data.score?.band,
    '| verdict:',
    first.data.score?.verdict
  );
  console.log(
    'highRisk:  ',
    first.highRisk,
    '(=> cache TTL',
    first.highRisk ? '1h)' : '24h)'
  );
  console.log('rateLimit: ', JSON.stringify(first.rateLimit));
  console.log(
    'call #1 cached:',
    first.cached,
    '| call #2 cached:',
    second.cached
  );

  if (second.cached !== true) {
    console.error('FAIL: second call was not served from cache');
    process.exit(1);
  }
  console.log('OK');
}

main().catch((err) => {
  console.error('FAIL:', err instanceof Error ? err.message : err);
  process.exit(1);
});

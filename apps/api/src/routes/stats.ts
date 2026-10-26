import { Hono } from 'hono';
import type { Env } from '../types';
import { getUniquenessEstimates } from '../services/uniqueness';
import { intEnv, visitorQuotaKey } from '../utils/counters';
import { reserveQuota, resetInSeconds } from '../utils/quota';

const app = new Hono<Env>();

/** Each call reads the stats counters, so an unmetered caller amplifies cost. */
const STATS_DAILY_PER_IP_DEFAULT = 120;

app.get('/uniqueness', async (c) => {
  const limit = intEnv(c.env.STATS_DAILY_PER_IP, STATS_DAILY_PER_IP_DEFAULT);
  const key = await visitorQuotaKey(c, 'stats:ip');
  const reservation = await reserveQuota(c.env, key, { limit });

  if (!reservation.allowed) {
    const retryIn = resetInSeconds(reservation.resetAt);
    c.header('Retry-After', String(retryIn));
    return c.json(
      {
        error: `Daily limit reached (${limit}/day).`,
        limit,
        retryIn,
        status: 429,
      },
      429
    );
  }

  const result = await getUniquenessEstimates(
    c.req.url.split('?')[1] ?? '',
    c.env
  );
  return c.json(result);
});

export default app;

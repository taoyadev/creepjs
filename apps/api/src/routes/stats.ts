import { Hono } from 'hono';
import type { Env } from '../types';
import { getUniquenessEstimates } from '../services/uniqueness';

const app = new Hono<Env>();

app.get('/uniqueness', async (c) => {
  const result = await getUniquenessEstimates(
    c.req.url.split('?')[1] ?? '',
    c.env
  );
  return c.json(result);
});

export default app;

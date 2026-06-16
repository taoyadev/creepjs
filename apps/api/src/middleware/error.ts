import { createMiddleware } from 'hono/factory';
import type { Env } from '../types';
import { logError } from '../utils/logging';

export const errorMiddleware = createMiddleware<Env>(async (c, next) => {
  try {
    await next();
  } catch (error) {
    logError({
      msg: 'api.error',
      request_id: c.get('requestId') ?? null,
      path: c.req.path,
      method: c.req.method,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    });

    if (error instanceof Error) {
      return c.json(
        {
          error: 'Internal server error',
          details:
            c.env.ENVIRONMENT === 'development' ? error.message : undefined,
        },
        500
      );
    }

    return c.json({ error: 'Unknown error occurred' }, 500);
  }
});

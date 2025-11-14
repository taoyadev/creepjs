import { createMiddleware } from 'hono/factory';
import type { Env } from '../types';

export const errorMiddleware = createMiddleware<Env>(async (c, next) => {
  try {
    await next();
  } catch (error) {
    console.error('API Error:', error);

    if (error instanceof Error) {
      return c.json(
        {
          error: 'Internal server error',
          message:
            c.env.ENVIRONMENT === 'development' ? error.message : undefined,
        },
        500
      );
    }

    return c.json({ error: 'Unknown error occurred' }, 500);
  }
});

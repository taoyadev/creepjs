import type { ErrorHandler } from 'hono';
import type { Env } from '../types';
import { logError, pathForLog } from '../utils/logging';

/**
 * Registered with `app.onError`, not `app.use`: Hono's compose converts a
 * thrown handler error into a response before control returns to any
 * middleware, so a try/catch around `await next()` never sees it.
 */
export const errorHandler: ErrorHandler<Env> = (error, c) => {
  // HTTPException (and anything else carrying its own response) keeps its
  // status and body, matching Hono's default handler.
  if ('getResponse' in error) {
    const res = error.getResponse();
    return c.newResponse(res.body, res);
  }

  logError({
    msg: 'api.error',
    request_id: c.get('requestId') ?? null,
    path: pathForLog(c.req.path),
    method: c.req.method,
    error: error.message || 'Unknown error occurred',
  });

  return c.json(
    {
      error: 'Internal server error',
      details: c.env.ENVIRONMENT === 'development' ? error.message : undefined,
    },
    500
  );
};

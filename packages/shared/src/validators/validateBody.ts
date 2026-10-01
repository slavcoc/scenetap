import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { z } from 'zod';

/**
 * Express middleware that validates `req.body` against a Zod schema.
 *
 * On success, `req.body` is replaced with the parsed result (so `.default()`
 * values and coercions are applied downstream) and the request continues.
 * On failure, responds `400` with the Zod issues.
 *
 * Usage:
 * ```ts
 * app.post(
 *   '/users',
 *   validateBody(createUserSchema),
 *   (req: Request<{}, {}, CreateUserInput>, res: Response) => {
 *     // req.body is validated & typed as CreateUserInput
 *   },
 * );
 * ```
 */
export function validateBody<T extends z.ZodType>(schema: T): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: 'Invalid request body',
        issues: result.error.issues,
      });
      return;
    }
    req.body = result.data;
    next();
  };
}

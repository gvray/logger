import { LogMiddleware, LogContext } from '../types';

/**
 * Middleware that applies another middleware only when a condition holds.
 *
 * When `condition(ctx)` returns `true`, the wrapped `middleware` runs; the
 * log is always forwarded (via `next()`) regardless of the condition.
 *
 * @param condition - Predicate evaluated against each log context.
 * @param middleware - Middleware to apply when the condition is true.
 * @returns A {@link LogMiddleware} instance.
 *
 * @example
 * ```ts
 * logger.use(
 *   conditionalMiddleware(
 *     (ctx) => ctx.level >= LogLevel.ERROR,
 *     prefixMiddleware('🚨 ALERT'),
 *   ),
 * );
 * ```
 */
export function conditionalMiddleware(
  condition: (ctx: LogContext) => boolean,
  middleware: LogMiddleware
): LogMiddleware {
  return (ctx: LogContext, next: () => void) => {
    if (condition(ctx)) {
      middleware(ctx, next);
    } else {
      next();
    }
  };
}

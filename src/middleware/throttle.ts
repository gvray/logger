import { LogMiddleware, LogContext } from '../types';

/**
 * Options for {@link throttleMiddleware}.
 */
export interface ThrottleOptions {
  /** Maximum number of matching logs allowed within each `interval` window. */
  limit: number;
  /** Length of the throttle window in milliseconds. */
  interval: number;
}

/**
 * Middleware that rate-limits log output.
 *
 * Within each `interval` window, at most `limit` log entries sharing the same
 * level and first argument are forwarded; the rest are dropped. The counter
 * resets after the window elapses.
 *
 * @param options - Throttle configuration.
 * @returns A {@link LogMiddleware} instance.
 *
 * @example
 * ```ts
 * logger.use(throttleMiddleware({ limit: 2, interval: 1000 }));
 * for (let i = 0; i < 5; i++) logger.info('spam'); // only 2 output per second
 * ```
 */
export function throttleMiddleware(options: ThrottleOptions): LogMiddleware {
  const { limit, interval } = options;
  const counts = new Map<string, { count: number; resetAt: number }>();

  return (ctx: LogContext, next: () => void) => {
    const key = `${ctx.level}:${ctx.args[0]}`;
    const now = Date.now();
    const entry = counts.get(key);

    if (!entry || now >= entry.resetAt) {
      counts.set(key, { count: 1, resetAt: now + interval });
      next();
    } else if (entry.count < limit) {
      entry.count++;
      next();
    }
  };
}

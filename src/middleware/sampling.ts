import { LogMiddleware, LogContext } from '../types';

/**
 * Middleware that randomly samples log entries.
 *
 * Each log entry is forwarded with probability `rate`; the rest are dropped.
 * Useful for controlling cost on high-throughput logs.
 *
 * @param rate - Probability of keeping a log entry, in `[0, 1]`. `1` keeps
 *   everything, `0` drops everything.
 * @returns A {@link LogMiddleware} instance.
 *
 * @example
 * ```ts
 * logger.use(samplingMiddleware(0.1)); // keep ~10% of logs
 * ```
 */
export function samplingMiddleware(rate: number): LogMiddleware {
  return (_ctx: LogContext, next: () => void) => {
    if (Math.random() < rate) {
      next();
    }
  };
}

import { LogMiddleware, LogContext } from '../types';

/**
 * Middleware that serializes each log entry as a single JSON string.
 *
 * The resulting object contains `timestamp`, `level`, `namespace`, and
 * `message` (args joined into a single string). Useful when you want
 * structured, parseable output for debugging or for feeding into another
 * in-process tool. Recommended with `colors: false` to keep the payload clean.
 *
 * @returns A {@link LogMiddleware} instance.
 *
 * @example
 * ```ts
 * const logger = new Logger({ colors: false });
 * logger.use(jsonMiddleware());
 * logger.info('login', { userId: 123 });
 * // {"timestamp":"2026-...","level":"INFO","namespace":null,"message":"login {\"userId\":123}"}
 * ```
 */
export function jsonMiddleware(): LogMiddleware {
  return (ctx: LogContext, next: () => void) => {
    const logEntry = {
      timestamp: ctx.timestamp.toISOString(),
      level: ctx.levelName,
      namespace: ctx.namespace,
      message: ctx.args
        .map((arg) => (typeof arg === 'string' ? arg : JSON.stringify(arg)))
        .join(' '),
    };
    ctx.args = [JSON.stringify(logEntry)];
    next();
  };
}

import { LogMiddleware, LogContext } from '../types';

/**
 * Middleware that prepends a fixed prefix to every log message.
 *
 * @param prefix - The string inserted at the start of the log arguments.
 * @returns A {@link LogMiddleware} instance.
 *
 * @example
 * ```ts
 * logger.use(prefixMiddleware('[API]'));
 * logger.info('request received'); // [API] request received
 * ```
 */
export function prefixMiddleware(prefix: string): LogMiddleware {
  return (ctx: LogContext, next: () => void) => {
    ctx.args = [prefix, ...ctx.args];
    next();
  };
}

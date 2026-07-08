import { LogMiddleware, LogLevel, LogContext } from '../types';

/**
 * Middleware that ensures `Error` objects on ERROR and FATAL logs are
 * rendered with their full stack trace.
 *
 * On logs at {@link LogLevel.ERROR} or above, `Error` arguments are replaced
 * with their stack string so the trace is visible in the console output and
 * in listener `formattedMessage`. Lower levels are passed through unchanged.
 *
 * @returns A {@link LogMiddleware} instance.
 *
 * @example
 * ```ts
 * logger.use(errorStackMiddleware());
 * logger.error('failed', new Error('boom'));
 * ```
 */
export function errorStackMiddleware(): LogMiddleware {
  return (ctx: LogContext, next: () => void) => {
    if (ctx.level >= LogLevel.ERROR) {
      ctx.args = ctx.args.map((arg) => {
        if (arg instanceof Error) {
          return arg.stack || `${arg.name}: ${arg.message}`;
        }
        return arg;
      });
    }
    next();
  };
}

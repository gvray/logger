import { LogMiddleware, LogContext } from '../types';

/**
 * Middleware that appends a fixed suffix to every log message.
 *
 * @param suffix - The string appended to the log arguments.
 * @returns A {@link LogMiddleware} instance.
 *
 * @example
 * ```ts
 * logger.use(suffixMiddleware('✓'));
 * logger.info('task completed'); // task completed ✓
 * ```
 */
export function suffixMiddleware(suffix: string): LogMiddleware {
  return (ctx: LogContext, next: () => void) => {
    ctx.args = [...ctx.args, suffix];
    next();
  };
}

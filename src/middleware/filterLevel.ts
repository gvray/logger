import { LogMiddleware, LogLevel, LogContext } from '../types';

/**
 * Middleware that drops log entries below a minimum level.
 *
 * Unlike the logger's `level` option (which filters at output time), this
 * middleware filters within the pipeline, so later middleware and listeners
 * also never see the dropped entries.
 *
 * @param minLevel - Minimum level required for a log to proceed.
 * @returns A {@link LogMiddleware} instance.
 *
 * @example
 * ```ts
 * logger.use(filterLevel(LogLevel.WARNING));
 * logger.info('hidden');   // not output
 * logger.warn('visible');  // output
 * ```
 */
export function filterLevel(minLevel: LogLevel): LogMiddleware {
  return (ctx: LogContext, next: () => void) => {
    if (ctx.level >= minLevel) {
      next();
    }
  };
}

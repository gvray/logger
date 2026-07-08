import { LogMiddleware, LogContext } from '../types';

/**
 * Middleware that redacts sensitive data from string arguments.
 *
 * Each string argument is matched against the provided patterns; matches are
 * replaced with `[REDACTED]`. String patterns use literal substring
 * replacement; `RegExp` patterns use standard replacement.
 *
 * @param patterns - Strings (matched literally) and/or regexes to redact.
 * @returns A {@link LogMiddleware} instance.
 *
 * @example
 * ```ts
 * logger.use(redactMiddleware(['password', /\d{4}-\d{4}-\d{4}-\d{4}/]));
 * logger.info('card=1234-5678-9012-3456'); // card=[REDACTED]
 * ```
 */
export function redactMiddleware(patterns: (string | RegExp)[]): LogMiddleware {
  return (ctx: LogContext, next: () => void) => {
    ctx.args = ctx.args.map((arg) => {
      if (typeof arg === 'string') {
        let result = arg;
        for (const pattern of patterns) {
          if (typeof pattern === 'string') {
            result = result.split(pattern).join('[REDACTED]');
          } else {
            result = result.replace(pattern, '[REDACTED]');
          }
        }
        return result;
      }
      return arg;
    });
    next();
  };
}

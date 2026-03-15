import { LogMiddleware, LogContext } from '../types';

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

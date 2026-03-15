import { LogMiddleware, LogContext } from '../types';

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

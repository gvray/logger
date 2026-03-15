import { LogMiddleware, LogLevel, LogContext } from '../types';

export function filterLevel(minLevel: LogLevel): LogMiddleware {
  return (ctx: LogContext, next: () => void) => {
    if (ctx.level >= minLevel) {
      next();
    }
  };
}

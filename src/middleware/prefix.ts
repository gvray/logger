import { LogMiddleware, LogContext } from '../types';

export function prefixMiddleware(prefix: string): LogMiddleware {
  return (ctx: LogContext, next: () => void) => {
    ctx.args = [prefix, ...ctx.args];
    next();
  };
}

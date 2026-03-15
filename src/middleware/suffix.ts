import { LogMiddleware, LogContext } from '../types';

export function suffixMiddleware(suffix: string): LogMiddleware {
  return (ctx: LogContext, next: () => void) => {
    ctx.args = [...ctx.args, suffix];
    next();
  };
}

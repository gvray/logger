import { LogMiddleware, LogLevel, LogContext } from '../types';

export function errorStackMiddleware(): LogMiddleware {
  return (ctx: LogContext, next: () => void) => {
    if (ctx.level >= LogLevel.ERROR) {
      ctx.args = ctx.args.map((arg) => {
        if (arg instanceof Error) {
          return arg;
        }
        return arg;
      });
    }
    next();
  };
}

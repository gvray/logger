import { LogMiddleware, LogContext } from '../types';

export function jsonMiddleware(): LogMiddleware {
  return (ctx: LogContext, next: () => void) => {
    const logEntry = {
      timestamp: ctx.timestamp.toISOString(),
      level: ctx.levelName,
      namespace: ctx.namespace,
      message: ctx.args
        .map((arg) => (typeof arg === 'string' ? arg : JSON.stringify(arg)))
        .join(' '),
    };
    ctx.args = [JSON.stringify(logEntry)];
    next();
  };
}

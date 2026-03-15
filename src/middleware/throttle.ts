import { LogMiddleware, LogContext } from '../types';

export interface ThrottleOptions {
  limit: number;
  interval: number;
}

export function throttleMiddleware(options: ThrottleOptions): LogMiddleware {
  const { limit, interval } = options;
  const counts = new Map<string, { count: number; resetAt: number }>();

  return (ctx: LogContext, next: () => void) => {
    const key = `${ctx.level}:${ctx.args[0]}`;
    const now = Date.now();
    const entry = counts.get(key);

    if (!entry || now >= entry.resetAt) {
      counts.set(key, { count: 1, resetAt: now + interval });
      next();
    } else if (entry.count < limit) {
      entry.count++;
      next();
    }
  };
}

import { LogMiddleware, LogLevel, LogContext } from './types';

export function filterLevel(minLevel: LogLevel): LogMiddleware {
  return (ctx: LogContext, next: () => void) => {
    if (ctx.level >= minLevel) {
      next();
    }
  };
}

export function prefixMiddleware(prefix: string): LogMiddleware {
  return (ctx: LogContext, next: () => void) => {
    ctx.args = [prefix, ...ctx.args];
    next();
  };
}

export function suffixMiddleware(suffix: string): LogMiddleware {
  return (ctx: LogContext, next: () => void) => {
    ctx.args = [...ctx.args, suffix];
    next();
  };
}

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

export function samplingMiddleware(rate: number): LogMiddleware {
  return (_ctx: LogContext, next: () => void) => {
    if (Math.random() < rate) {
      next();
    }
  };
}

export interface BatchOptions {
  maxSize: number;
  maxWait: number;
  onFlush: (contexts: LogContext[]) => void;
}

export function batchMiddleware(options: BatchOptions): LogMiddleware {
  const { maxSize, maxWait, onFlush } = options;
  let batch: LogContext[] = [];
  let timer: ReturnType<typeof setTimeout> | null = null;

  const flush = () => {
    if (batch.length > 0) {
      onFlush([...batch]);
      batch = [];
    }
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  return (ctx: LogContext, next: () => void) => {
    batch.push(ctx);

    if (batch.length >= maxSize) {
      flush();
    } else if (!timer) {
      timer = setTimeout(flush, maxWait);
    }

    next();
  };
}

export function errorStackMiddleware(): LogMiddleware {
  return (ctx: LogContext, next: () => void) => {
    if (ctx.level >= LogLevel.ERROR) {
      ctx.args = ctx.args.map((arg) => {
        if (arg instanceof Error && arg.stack) {
          return arg.stack;
        }
        return arg;
      });
    }
    next();
  };
}

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
    ctx.formattedMessage = JSON.stringify(logEntry);
    next();
  };
}

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

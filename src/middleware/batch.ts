import { LogMiddleware, LogContext } from '../types';

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

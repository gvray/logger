import { LogMiddleware, LogContext } from '../types';

/**
 * Options for {@link batchMiddleware}.
 */
export interface BatchOptions {
  /** Number of log entries to collect before flushing. */
  maxSize: number;
  /** Maximum time in milliseconds to wait before flushing an incomplete batch. */
  maxWait: number;
  /** Callback invoked with the collected contexts when a batch flushes. */
  onFlush: (contexts: LogContext[]) => void;
}

/**
 * Middleware that collects log entries into batches and flushes them together.
 *
 * Each log is still forwarded to output (via `next()`) as it happens;
 * additionally, contexts are accumulated and passed to `onFlush` when either
 * `maxSize` is reached or `maxWait` milliseconds elapse since the first entry
 * of the batch. Useful for collecting entries for deferred in-process handling
 * (e.g., a debug summary or on-screen panel).
 *
 * @param options - Batch configuration, including the flush handler.
 * @returns A {@link LogMiddleware} instance.
 *
 * @example
 * ```ts
 * logger.use(
 *   batchMiddleware({
 *     maxSize: 10,
 *     maxWait: 5000,
 *     onFlush: (ctxs) => sendToServer(ctxs),
 *   }),
 * );
 * ```
 */
export function batchMiddleware(options: BatchOptions): LogMiddleware {
  const { maxSize, maxWait, onFlush } = options;
  let batch: LogContext[] = [];
  let timer: ReturnType<typeof setTimeout> | null = null;

  const flush = () => {
    if (batch.length > 0) {
      try {
        onFlush([...batch]);
      } catch {
        // Silently ignore flush-handler errors — otherwise a throwing
        // onFlush would crash the setTimeout callback (uncaught exception).
      }
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

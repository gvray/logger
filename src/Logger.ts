import {
  LogLevel,
  LogListener,
  LogMiddleware,
  LogOptions,
  LogContext,
  TimestampFormat,
} from './types';
import { isBrowser } from './utils';

/**
 * A lightweight, extensible logger with middleware, namespaces, and listeners.
 *
 * Emits to the console (ANSI-colored in Node, CSS-styled in browsers) and supports
 * a middleware pipeline for transforming logs before output, plus listeners
 * for side effects like error collection or analytics.
 *
 * @example
 * ```ts
 * import { Logger, LogLevel } from '@gvray/logger';
 *
 * const logger = new Logger({ level: LogLevel.DEBUG, timestamp: 'time' });
 * logger.info('Server started on port', 3000);
 * ```
 */
class Logger {
  private logLevel: LogLevel;
  private namespace: string | undefined;
  private colorsEnabled: boolean;
  private timestampFormat: TimestampFormat | false;
  private logListeners: LogListener[] = [];
  private middleware: LogMiddleware[] = [];

  /**
   * Create a new Logger instance.
   *
   * @param options - Configuration options. Omit for sensible defaults
   *   (level `DEBUG`, colors enabled, no namespace, no timestamp).
   */
  constructor(options: LogOptions = {}) {
    this.logLevel = options.level ?? LogLevel.DEBUG;
    this.namespace = options.namespace;
    this.colorsEnabled = options.colors ?? true;
    this.timestampFormat = options.timestamp === true ? 'iso' : options.timestamp || false;
  }

  private createContext(level: LogLevel, args: unknown[]): LogContext {
    const ctx: LogContext = {
      level,
      levelName: LogLevel[level],
      timestamp: new Date(),
      args,
    };
    if (this.namespace) {
      ctx.namespace = this.namespace;
    }
    return ctx;
  }

  private formatTimestamp(date: Date): string {
    if (!this.timestampFormat) return '';

    if (typeof this.timestampFormat === 'function') {
      return this.timestampFormat(date);
    }

    switch (this.timestampFormat) {
      case 'iso':
        return date.toISOString();
      case 'locale':
        return date.toLocaleString();
      case 'time':
        return date.toLocaleTimeString();
      case 'unix':
        return String(date.getTime());
      default:
        return date.toISOString();
    }
  }

  private static readonly LEVEL_ANSI: Record<LogLevel, string> = {
    [LogLevel.TRACE]: '\x1b[90m', // Gray
    [LogLevel.DEBUG]: '\x1b[34m', // Blue
    [LogLevel.INFO]: '\x1b[32m', // Green
    [LogLevel.WARNING]: '\x1b[33m', // Yellow
    [LogLevel.ERROR]: '\x1b[31m', // Red
    [LogLevel.FATAL]: '\x1b[35m', // Magenta
    [LogLevel.SILENT]: '',
  };

  private static readonly LEVEL_CSS: Record<LogLevel, string> = {
    [LogLevel.TRACE]: '#9b8ad6',
    [LogLevel.DEBUG]: '#1e90ff',
    [LogLevel.INFO]: '#32cd32',
    [LogLevel.WARNING]: '#ffa500',
    [LogLevel.ERROR]: '#ff4757',
    [LogLevel.FATAL]: '#d946ef',
    [LogLevel.SILENT]: '',
  };

  /** Build the bracketed prefix segments: timestamp, namespace, level. */
  private buildPrefixParts(ctx: LogContext): { text: string; isLevel: boolean }[] {
    const parts: { text: string; isLevel: boolean }[] = [];
    if (this.timestampFormat) {
      parts.push({ text: `[${this.formatTimestamp(ctx.timestamp)}]`, isLevel: false });
    }
    if (ctx.namespace) {
      parts.push({ text: `[${ctx.namespace}]`, isLevel: false });
    }
    parts.push({ text: `[${ctx.levelName}]`, isLevel: true });
    return parts;
  }

  private output(ctx: LogContext): void {
    try {
      if (!(ctx.level >= this.logLevel && ctx.level < LogLevel.SILENT)) return;

      const parts = this.buildPrefixParts(ctx);
      const plainPrefix = parts.map((p) => p.text).join(' ');

      let consoleArgs: unknown[];
      if (this.colorsEnabled && isBrowser()) {
        // Browser DevTools renders %c CSS, not ANSI escape codes.
        const format = parts.map((p) => `%c${p.text}`).join(' ') + '%c';
        const styles = [
          ...parts.map((p) => (p.isLevel ? `color:${Logger.LEVEL_CSS[ctx.level]}` : 'color:#888')),
          '', // reset appended args to the default style
        ];
        consoleArgs = [format, ...styles, ...ctx.args];
      } else if (this.colorsEnabled) {
        // Terminal: ANSI escape codes.
        const ansiPrefix = parts
          .map((p) => {
            const code = p.isLevel ? Logger.LEVEL_ANSI[ctx.level] : '\x1b[90m';
            return `${code}${p.text}\x1b[0m`;
          })
          .join(' ');
        consoleArgs = [ansiPrefix, ...ctx.args];
      } else {
        consoleArgs = [plainPrefix, ...ctx.args];
      }

      if (ctx.level >= LogLevel.ERROR) {
        console.error(...consoleArgs);
      } else if (ctx.level === LogLevel.WARNING) {
        console.warn(...consoleArgs);
      } else {
        console.log(...consoleArgs);
      }

      // Plain (unstyled) representation for listeners. Guard against
      // unserializable args (e.g. circular refs) so listeners still fire.
      try {
        ctx.formattedMessage = `${plainPrefix} ${ctx.args
          .map((arg) => (typeof arg === 'string' ? arg : JSON.stringify(arg)))
          .join(' ')}`;
      } catch {
        ctx.formattedMessage = `${plainPrefix} [unserializable args]`;
      }
      this.logListeners.forEach((listener) => {
        try {
          listener(ctx);
        } catch (err) {
          // Silently ignore listener errors to prevent breaking the application
        }
      });
    } catch (err) {
      // Fallback to native console if logger fails
      try {
        console.error('[Logger Error]', err);
      } catch {
        // If even console.error fails, silently ignore
      }
    }
  }

  private logWithMiddleware(level: LogLevel, args: unknown[]): void {
    try {
      const ctx = this.createContext(level, args);

      if (this.middleware.length === 0) {
        this.output(ctx);
        return;
      }

      let index = 0;
      const next = (): void => {
        if (index < this.middleware.length) {
          const middleware = this.middleware[index++];
          try {
            middleware(ctx, next);
          } catch (err) {
            // Skip failed middleware and continue to next
            next();
          }
        } else {
          this.output(ctx);
        }
      };

      next();
    } catch (err) {
      // Fallback to native console if logger completely fails
      try {
        console.log(...args);
      } catch {
        // Silently ignore if even fallback fails
      }
    }
  }

  /** Log at {@link LogLevel.TRACE}. */
  trace(...args: unknown[]): void {
    this.logWithMiddleware(LogLevel.TRACE, args);
  }

  /** Log at {@link LogLevel.DEBUG}. */
  debug(...args: unknown[]): void {
    this.logWithMiddleware(LogLevel.DEBUG, args);
  }

  /** Log at {@link LogLevel.INFO}. */
  info(...args: unknown[]): void {
    this.logWithMiddleware(LogLevel.INFO, args);
  }

  /** Log at {@link LogLevel.WARNING}. */
  warning(...args: unknown[]): void {
    this.logWithMiddleware(LogLevel.WARNING, args);
  }

  /** Alias for {@link warning}. */
  warn(...args: unknown[]): void {
    this.warning(...args);
  }

  /** Log at {@link LogLevel.ERROR}. */
  error(...args: unknown[]): void {
    this.logWithMiddleware(LogLevel.ERROR, args);
  }

  /** Log at {@link LogLevel.FATAL}. */
  fatal(...args: unknown[]): void {
    this.logWithMiddleware(LogLevel.FATAL, args);
  }

  /**
   * Register a middleware in the logging pipeline.
   *
   * Middleware run in registration order on every log call. Mutate `ctx.args`
   * and call `next()` to forward the log downstream.
   *
   * @returns `this`, for chaining.
   */
  use(middleware: LogMiddleware): this {
    this.middleware.push(middleware);
    return this;
  }

  /**
   * Create a child logger that inherits the parent's level, colors, timestamp
   * format, and a copy of its middleware. The child's namespace is appended to
   * the parent's using a `:` separator (e.g. `app` → `app:http`).
   *
   * @param namespace - Namespace segment for the child.
   * @returns A new child Logger.
   */
  child(namespace: string): Logger {
    const childOptions: LogOptions = {
      level: this.logLevel,
      namespace: this.namespace ? `${this.namespace}:${namespace}` : namespace,
      colors: this.colorsEnabled,
    };
    if (this.timestampFormat) {
      childOptions.timestamp = this.timestampFormat;
    }
    const child = new Logger(childOptions);
    child.middleware = [...this.middleware];
    return child;
  }

  /**
   * Set the minimum log level. Messages below this level are not output.
   *
   * @returns `this`, for chaining.
   */
  setLevel(level: LogLevel): this {
    this.logLevel = level;
    return this;
  }

  /**
   * Get the current minimum log level.
   */
  getLevel(): LogLevel {
    return this.logLevel;
  }

  /**
   * Enable ANSI color output.
   *
   * @returns `this`, for chaining.
   */
  enableColors(): this {
    this.colorsEnabled = true;
    return this;
  }

  /**
   * Disable ANSI color output.
   *
   * @returns `this`, for chaining.
   */
  disableColors(): this {
    this.colorsEnabled = false;
    return this;
  }

  /**
   * Set the timestamp format. Pass `true` for ISO, a string for a built-in
   * format, `false` to disable, or a function for custom formatting.
   *
   * @returns `this`, for chaining.
   */
  setTimestamp(format: TimestampFormat | boolean): this {
    this.timestampFormat = format === true ? 'iso' : format || false;
    return this;
  }

  /**
   * Add a listener invoked for every emitted log entry that passes the level
   * filter. Useful for in-process side effects like error collection,
   * statistics, or screen formatting.
   *
   * @returns `this`, for chaining.
   */
  addListener(listener: LogListener): this {
    this.logListeners.push(listener);
    return this;
  }

  /**
   * Remove a previously registered listener.
   *
   * @returns `this`, for chaining.
   */
  removeListener(listener: LogListener): this {
    this.logListeners = this.logListeners.filter((l) => l !== listener);
    return this;
  }

  /**
   * Disable all log output by setting the level to {@link LogLevel.SILENT}.
   * Listeners still receive entries whose level is `>= SILENT` (i.e. none,
   * since SILENT is the maximum).
   *
   * @returns `this`, for chaining.
   */
  silent(): this {
    this.logLevel = LogLevel.SILENT;
    return this;
  }
}

export default Logger;

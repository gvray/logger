import {
  LogLevel,
  LogListener,
  LogMiddleware,
  LogOptions,
  LogContext,
  TimestampFormat,
} from './types';

class Logger {
  private logLevel: LogLevel;
  private namespace: string | undefined;
  private colorsEnabled: boolean;
  private timestampFormat: TimestampFormat | false;
  private logListeners: LogListener[] = [];
  private middleware: LogMiddleware[] = [];

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

  private getColor(level: LogLevel): string {
    if (!this.colorsEnabled) return '';
    switch (level) {
      case LogLevel.TRACE:
        return '\x1b[90m'; // Gray
      case LogLevel.DEBUG:
        return '\x1b[34m'; // Blue
      case LogLevel.INFO:
        return '\x1b[32m'; // Green
      case LogLevel.WARNING:
        return '\x1b[33m'; // Yellow
      case LogLevel.ERROR:
        return '\x1b[31m'; // Red
      case LogLevel.FATAL:
        return '\x1b[35m'; // Magenta
      default:
        return '';
    }
  }

  private reset(): string {
    return this.colorsEnabled ? '\x1b[0m' : '';
  }

  private gray(text: string): string {
    return this.colorsEnabled ? `\x1b[90m${text}\x1b[0m` : text;
  }

  private formatPrefix(ctx: LogContext): string {
    try {
      const parts: string[] = [];

      if (this.timestampFormat) {
        parts.push(this.gray(`[${this.formatTimestamp(ctx.timestamp)}]`));
      }

      if (ctx.namespace) {
        parts.push(this.gray(`[${ctx.namespace}]`));
      }

      const color = this.getColor(ctx.level);
      parts.push(`${color}[${ctx.levelName}]${this.reset()}`);

      return parts.join(' ');
    } catch (err) {
      // Return simple prefix if formatting fails
      return `[${ctx.levelName}]`;
    }
  }

  private output(ctx: LogContext): void {
    try {
      if (ctx.level >= this.logLevel && ctx.level < LogLevel.SILENT) {
        const prefix = this.formatPrefix(ctx);
        const outputArgs = [prefix, ...ctx.args];

        if (ctx.level >= LogLevel.ERROR) {
          console.error(...outputArgs);
        } else if (ctx.level === LogLevel.WARNING) {
          console.warn(...outputArgs);
        } else {
          console.log(...outputArgs);
        }

        // For listeners, store simple string representation
        ctx.formattedMessage = `${prefix} ${ctx.args
          .map((arg) => (typeof arg === 'string' ? arg : JSON.stringify(arg)))
          .join(' ')}`;
        this.logListeners.forEach((listener) => {
          try {
            listener(ctx);
          } catch (err) {
            // Silently ignore listener errors to prevent breaking the application
          }
        });
      }
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

  trace(...args: unknown[]): void {
    this.logWithMiddleware(LogLevel.TRACE, args);
  }

  debug(...args: unknown[]): void {
    this.logWithMiddleware(LogLevel.DEBUG, args);
  }

  info(...args: unknown[]): void {
    this.logWithMiddleware(LogLevel.INFO, args);
  }

  warning(...args: unknown[]): void {
    this.logWithMiddleware(LogLevel.WARNING, args);
  }

  warn(...args: unknown[]): void {
    this.warning(...args);
  }

  error(...args: unknown[]): void {
    this.logWithMiddleware(LogLevel.ERROR, args);
  }

  fatal(...args: unknown[]): void {
    this.logWithMiddleware(LogLevel.FATAL, args);
  }

  use(middleware: LogMiddleware): this {
    this.middleware.push(middleware);
    return this;
  }

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

  setLevel(level: LogLevel): this {
    this.logLevel = level;
    return this;
  }

  getLevel(): LogLevel {
    return this.logLevel;
  }

  enableColors(): this {
    this.colorsEnabled = true;
    return this;
  }

  disableColors(): this {
    this.colorsEnabled = false;
    return this;
  }

  setTimestamp(format: TimestampFormat | boolean): this {
    this.timestampFormat = format === true ? 'iso' : format || false;
    return this;
  }

  addListener(listener: LogListener): this {
    this.logListeners.push(listener);
    return this;
  }

  removeListener(listener: LogListener): this {
    this.logListeners = this.logListeners.filter((l) => l !== listener);
    return this;
  }

  silent(): this {
    this.logLevel = LogLevel.SILENT;
    return this;
  }
}

export default Logger;

import {
  LogLevel,
  LogListener,
  LogMiddleware,
  LogOptions,
  LogContext,
  TimestampFormat,
} from './types';
import { formatArgs } from './utils';

class Logger {
  private logLevel: LogLevel;
  private namespace: string | undefined;
  private colorsEnabled: boolean;
  private timestampFormat: TimestampFormat | false;
  private depth: number;
  private maxArrayLength: number;
  private logListeners: LogListener[] = [];
  private middleware: LogMiddleware[] = [];

  constructor(options: LogOptions = {}) {
    this.logLevel = options.level ?? LogLevel.DEBUG;
    this.namespace = options.namespace;
    this.colorsEnabled = options.colors ?? true;
    this.timestampFormat = options.timestamp === true ? 'iso' : options.timestamp || false;
    this.depth = options.depth ?? 4;
    this.maxArrayLength = options.maxArrayLength ?? 100;
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

  private formatMessage(ctx: LogContext): string {
    const parts: string[] = [];

    if (this.timestampFormat) {
      parts.push(this.gray(`[${this.formatTimestamp(ctx.timestamp)}]`));
    }

    if (ctx.namespace) {
      parts.push(this.gray(`[${ctx.namespace}]`));
    }

    const color = this.getColor(ctx.level);
    parts.push(`${color}[${ctx.levelName}]${this.reset()}`);

    const formattedArgs = formatArgs(ctx.args, {
      depth: this.depth,
      maxArrayLength: this.maxArrayLength,
      colors: this.colorsEnabled,
    });
    parts.push(formattedArgs);

    return parts.join(' ');
  }

  private output(ctx: LogContext): void {
    if (ctx.level >= this.logLevel && ctx.level < LogLevel.SILENT) {
      const message = ctx.formattedMessage ?? this.formatMessage(ctx);

      if (ctx.level >= LogLevel.ERROR) {
        console.error(message);
      } else if (ctx.level === LogLevel.WARNING) {
        console.warn(message);
      } else {
        console.log(message);
      }

      this.logListeners.forEach((listener) => listener(ctx));
    }
  }

  private logWithMiddleware(level: LogLevel, args: unknown[]): void {
    const ctx = this.createContext(level, args);

    if (this.middleware.length === 0) {
      this.output(ctx);
      return;
    }

    let index = 0;
    const next = () => {
      if (index < this.middleware.length) {
        const mw = this.middleware[index++];
        try {
          mw(ctx, next);
        } catch (err) {
          console.error('Middleware error:', err);
        }
      } else {
        this.output(ctx);
      }
    };
    next();
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

  child(namespace: string, options: Partial<LogOptions> = {}): Logger {
    const childNamespace = this.namespace ? `${this.namespace}:${namespace}` : namespace;
    const childOptions: LogOptions = {
      level: options.level ?? this.logLevel,
      namespace: childNamespace,
      colors: options.colors ?? this.colorsEnabled,
      depth: options.depth ?? this.depth,
      maxArrayLength: options.maxArrayLength ?? this.maxArrayLength,
    };
    if (options.timestamp !== undefined) {
      childOptions.timestamp = options.timestamp;
    } else if (this.timestampFormat) {
      childOptions.timestamp = this.timestampFormat;
    }
    const child = new Logger(childOptions);
    child.middleware = [...this.middleware];
    child.logListeners = [...this.logListeners];
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

  setDepth(depth: number): this {
    this.depth = depth;
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

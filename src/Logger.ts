import { LogLevel, LogListener, LogMiddleware, LogOptions } from './types';

class Logger {
  private logLevel: LogLevel;
  private timestampEnabled: boolean;
  private logListeners: LogListener[] = [];
  private middleware: LogMiddleware[] = [];

  constructor(options: LogOptions = {}) {
    this.logLevel = options.level || LogLevel.DEBUG;
    this.timestampEnabled = options.timestamp || false;
  }

  private getCurrentTimestamp(): string {
    return new Date().toISOString();
  }

  private formatLogMessage(message: string, level: LogLevel): string {
    const logColor = this.getColor(level);
    const timestampStr = this.timestampEnabled
      ? `\x1b[90m[${this.getCurrentTimestamp()}] \x1b[0m`
      : '';
    const levelStr = `${logColor}[${LogLevel[level]}]: \x1b[0m`;
    return `${timestampStr}${levelStr}${message}`;
  }

  private log(message: string, level: LogLevel): void {
    if (level >= this.logLevel) {
      console.log(this.formatLogMessage(message, level));
      this.logListeners.forEach((listener) => listener(level, message));
    }
  }

  private getColor(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return '\x1b[34m'; // Blue color
      case LogLevel.INFO:
        return '\x1b[32m'; // Green color
      case LogLevel.WARNING:
        return '\x1b[33m'; // Yellow color
      case LogLevel.ERROR:
        return '\x1b[31m'; // Red color
      case LogLevel.TRACE:
        return '\x1b[36m'; // Cyan color
      case LogLevel.FATAL:
        return '\x1b[35m'; // Purple color
      default:
        return '\x1b[0m'; // Default color
    }
  }

  private logWithMiddleware(message: string, level: LogLevel): void {
    let currentIndex = 0;
    const next = (msg = message, lv = level) => {
      const nextMiddleware = this.middleware[currentIndex++];
      if (nextMiddleware) {
        nextMiddleware({ message, level }, next);
        if (currentIndex < this.middleware.length + 1) {
          const err = new Error(`${nextMiddleware.name} middleware missing next() call.`);
          err.name = 'logger-middleware';
          throw err;
        }
      } else {
        this.log(msg, lv);
      }
    };
    try {
      next();
    } catch (err: any) {
      if (err.name === 'logger-middleware') {
        console.warn(err.message);
        return;
      }
      console.error(err);
    }
  }

  debug(message: string): void {
    this.logWithMiddleware(message, LogLevel.DEBUG);
  }

  info(message: string): void {
    this.logWithMiddleware(message, LogLevel.INFO);
  }

  warning(message: string): void {
    this.logWithMiddleware(message, LogLevel.WARNING);
  }

  error(message: string): void {
    this.logWithMiddleware(message, LogLevel.ERROR);
  }

  trace(message: string): void {
    this.logWithMiddleware(message, LogLevel.TRACE);
  }

  fatal(message: string): void {
    this.logWithMiddleware(message, LogLevel.FATAL);
  }

  use(middleware: LogMiddleware) {
    this.middleware.push(middleware);
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  enableTimestamp(): void {
    this.timestampEnabled = true;
  }

  disableTimestamp(): void {
    this.timestampEnabled = false;
  }

  addLogListener(listener: LogListener): void {
    this.logListeners.push(listener);
  }

  removeLogListener(listener: LogListener): void {
    this.logListeners = this.logListeners.filter((l) => l !== listener);
  }
}

export default Logger;

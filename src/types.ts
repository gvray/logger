export enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARNING = 3,
  ERROR = 4,
  FATAL = 5,
  SILENT = 6,
}

export interface LogOptions {
  level?: LogLevel;
  namespace?: string;
  colors?: boolean;
  timestamp?: boolean | TimestampFormat;
  depth?: number;
  maxArrayLength?: number;
}

export type TimestampFormat = 'iso' | 'locale' | 'time' | 'unix' | ((date: Date) => string);

export interface LogContext {
  level: LogLevel;
  levelName: string;
  namespace?: string;
  timestamp: Date;
  args: unknown[];
  formattedMessage?: string;
}

export type LogListener = (ctx: LogContext) => void;

export type LogMiddleware = (ctx: LogContext, next: () => void) => void;

export interface LoggerColors {
  [LogLevel.TRACE]: string;
  [LogLevel.DEBUG]: string;
  [LogLevel.INFO]: string;
  [LogLevel.WARNING]: string;
  [LogLevel.ERROR]: string;
  [LogLevel.FATAL]: string;
}

export type Formatter = (ctx: LogContext) => string;

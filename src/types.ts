/**
 * Log severity levels, ordered from most verbose to most severe.
 *
 * Set as the logger's minimum `level` to suppress lower-severity output.
 * Use `SILENT` to disable all output.
 */
export enum LogLevel {
  /** Detailed tracing information, typically very high volume. */
  TRACE = 0,
  /** Debugging information useful during development. */
  DEBUG = 1,
  /** General informational messages about application progress. */
  INFO = 2,
  /** Potentially harmful situations that warrant attention. */
  WARNING = 3,
  /** Errors that are recoverable or affect a subset of functionality. */
  ERROR = 4,
  /** Severe errors that may abort the application. */
  FATAL = 5,
  /** Special level that disables all log output when used as the minimum level. */
  SILENT = 6,
}

/**
 * Configuration options passed to the {@link Logger} constructor.
 */
export interface LogOptions {
  /** Minimum log level. Messages below this level are not output. @default LogLevel.DEBUG */
  level?: LogLevel;
  /** Namespace prefix shown on every log line, e.g. `app:http`. */
  namespace?: string;
  /**
   * Whether to enable ANSI color escape codes in output. When omitted, the
   * logger auto-detects: enabled on an interactive terminal (TTY), disabled in
   * browsers and non-TTY streams (pipes/files) where ANSI codes would render
   * as garbage or pollute the output.
   */
  colors?: boolean;
  /**
   * Timestamp format for each log line.
   *
   * - `true` enables ISO format
   * - a string selects a built-in format (`'iso' | 'locale' | 'time' | 'unix'`)
   * - a function returns a custom formatted string
   */
  timestamp?: boolean | TimestampFormat;
}

/**
 * Built-in timestamp format options, or a custom formatter function.
 */
export type TimestampFormat =
  | 'iso' // 2026-01-17T00:00:00.000Z
  | 'locale' // 1/17/2026, 12:00:00 AM
  | 'time' // 12:00:00 AM
  | 'unix' // 1705449600000
  | ((date: Date) => string);

/**
 * The log context passed through the middleware pipeline and to listeners.
 *
 * Middleware may mutate `args` (and other fields) before calling `next()`;
 * listeners receive the context after all middleware has run, with
 * `formattedMessage` populated.
 */
export interface LogContext {
  /** Severity level of the log entry. */
  level: LogLevel;
  /** Human-readable level name, e.g. `INFO`, `WARNING`. */
  levelName: string;
  /** Namespace of the emitting logger, if one was set. */
  namespace?: string;
  /** When the log call was made. */
  timestamp: Date;
  /** Original arguments passed to the log method. */
  args: unknown[];
  /** Fully formatted message string, populated before listeners fire. */
  formattedMessage?: string;
}

/**
 * Listener invoked for every emitted log entry that passes the level filter.
 */
export type LogListener = (ctx: LogContext) => void;

/**
 * Middleware function in the logging pipeline.
 *
 * Receives the {@link LogContext} and a `next` callback. Mutate `ctx.args`
 * (or other fields) then call `next()` to continue the pipeline. Calling
 * `next()` is what forwards the log to output (and subsequent middleware).
 */
export type LogMiddleware = (ctx: LogContext, next: () => void) => void;

/**
 * Mapping from log level to its ANSI color escape code.
 */
export interface LoggerColors {
  [LogLevel.TRACE]: string;
  [LogLevel.DEBUG]: string;
  [LogLevel.INFO]: string;
  [LogLevel.WARNING]: string;
  [LogLevel.ERROR]: string;
  [LogLevel.FATAL]: string;
}

/**
 * Custom formatter that produces the entire log line string from a context.
 */
export type Formatter = (ctx: LogContext) => string;

# @gvray/logger

[![npm version](https://img.shields.io/npm/v/@gvray/logger.svg)](https://www.npmjs.com/package/@gvray/logger)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A lightweight, extensible logging library for Node.js and browsers with TypeScript support.

## Features

- **Multi-level logging** - TRACE, DEBUG, INFO, WARNING, ERROR, FATAL
- **Middleware system** - Extensible pipeline for log processing
- **Namespaces** - Hierarchical child loggers for modular applications
- **Deep inspection** - Configurable object/array depth for debugging
- **Colored output** - ANSI colors with toggle support
- **Multiple formats** - ISO, locale, unix timestamps or custom formatter
- **Zero dependencies** - Lightweight and fast

## Installation

```bash
npm install @gvray/logger
```

## Quick Start

```typescript
import { Logger, LogLevel } from '@gvray/logger';

const logger = new Logger({
  level: LogLevel.DEBUG,
  timestamp: 'time',
});

logger.info('Server started on port', 3000);
logger.debug('Config:', { env: 'production', debug: false });
logger.error('Connection failed:', new Error('timeout'));
```

## Usage

### Log Levels

```typescript
logger.trace('Detailed trace info');
logger.debug('Debug information');
logger.info('General information');
logger.warning('Warning message');
logger.error('Error occurred');
logger.fatal('Critical failure');
```

| Level   | Value | Color   | Use Case              |
| ------- | ----- | ------- | --------------------- |
| TRACE   | 0     | Gray    | Detailed debugging    |
| DEBUG   | 1     | Blue    | Development debugging |
| INFO    | 2     | Green   | General information   |
| WARNING | 3     | Yellow  | Potential issues      |
| ERROR   | 4     | Red     | Errors (recoverable)  |
| FATAL   | 5     | Magenta | Critical errors       |
| SILENT  | 6     | -       | Disable all output    |

### Namespaces

```typescript
const app = new Logger({ namespace: 'app' });
const db = app.child('db');
const http = app.child('http');

app.info('Started'); // [app] [INFO] Started
db.info('Connected'); // [app:db] [INFO] Connected
http.info('Listening'); // [app:http] [INFO] Listening
```

### Middleware

```typescript
import { Logger, prefixMiddleware, redactMiddleware } from '@gvray/logger';

const logger = new Logger();

// Add prefix
logger.use(prefixMiddleware('[API]'));

// Redact sensitive data
logger.use(redactMiddleware([/password=\w+/, 'secret-key']));

// Custom middleware
logger.use((ctx, next) => {
  ctx.args = ctx.args.map((arg) => (typeof arg === 'string' ? arg.toUpperCase() : arg));
  next();
});
```

### Built-in Middleware

| Middleware             | Description                         |
| ---------------------- | ----------------------------------- |
| `prefixMiddleware`     | Add prefix to messages              |
| `suffixMiddleware`     | Add suffix to messages              |
| `filterLevel`          | Filter by minimum level             |
| `jsonMiddleware`       | Output as JSON                      |
| `redactMiddleware`     | Redact patterns (strings or RegExp) |
| `errorStackMiddleware` | Include error stack traces          |
| `throttleMiddleware`   | Rate limit logs                     |
| `samplingMiddleware`   | Random sampling                     |
| `batchMiddleware`      | Batch logs before output            |

### Timestamp Formats

```typescript
new Logger({ timestamp: 'iso' }); // 2026-01-17T00:00:00.000Z
new Logger({ timestamp: 'locale' }); // 1/17/2026, 12:00:00 AM
new Logger({ timestamp: 'time' }); // 12:00:00 AM
new Logger({ timestamp: 'unix' }); // 1705449600000
new Logger({ timestamp: (d) => d.toISOString().slice(0, 10) }); // 2026-01-17
```

### Configuration

```typescript
const logger = new Logger({
  level: LogLevel.DEBUG, // Minimum log level
  namespace: 'myapp', // Logger namespace
  colors: true, // Enable ANSI colors
  timestamp: 'iso', // Timestamp format
  depth: 4, // Object inspection depth
  maxArrayLength: 100, // Max array items to display
});

// Chainable configuration
logger.setLevel(LogLevel.INFO).setTimestamp('time').disableColors();
```

### Listeners

```typescript
const logs: string[] = [];

logger.addListener((ctx) => {
  logs.push(`[${LogLevel[ctx.level]}] ${ctx.formattedMessage}`);
});

// Remove listener
logger.removeListener(listener);
```

## API Reference

### Constructor

```typescript
new Logger(options?: LogOptions)
```

### LogOptions

| Option           | Type              | Default | Description             |
| ---------------- | ----------------- | ------- | ----------------------- |
| `level`          | `LogLevel`        | `DEBUG` | Minimum log level       |
| `namespace`      | `string`          | -       | Logger namespace        |
| `colors`         | `boolean`         | `true`  | Enable ANSI colors      |
| `timestamp`      | `TimestampFormat` | -       | Timestamp format        |
| `depth`          | `number`          | `4`     | Object inspection depth |
| `maxArrayLength` | `number`          | `100`   | Max array items         |

### Methods

| Method                 | Returns    | Description                 |
| ---------------------- | ---------- | --------------------------- |
| `trace(...args)`       | `void`     | Log at TRACE level          |
| `debug(...args)`       | `void`     | Log at DEBUG level          |
| `info(...args)`        | `void`     | Log at INFO level           |
| `warning(...args)`     | `void`     | Log at WARNING level        |
| `error(...args)`       | `void`     | Log at ERROR level          |
| `fatal(...args)`       | `void`     | Log at FATAL level          |
| `setLevel(level)`      | `this`     | Set minimum log level       |
| `getLevel()`           | `LogLevel` | Get current log level       |
| `setTimestamp(format)` | `this`     | Set timestamp format        |
| `setDepth(depth)`      | `this`     | Set object inspection depth |
| `enableColors()`       | `this`     | Enable ANSI colors          |
| `disableColors()`      | `this`     | Disable ANSI colors         |
| `silent()`             | `this`     | Disable all output          |
| `use(middleware)`      | `this`     | Add middleware              |
| `child(namespace)`     | `Logger`   | Create child logger         |
| `addListener(fn)`      | `void`     | Add log listener            |
| `removeListener(fn)`   | `void`     | Remove log listener         |

## License

MIT

# @gvray/logger

[![npm version](https://img.shields.io/npm/v/@gvray/logger.svg)](https://www.npmjs.com/package/@gvray/logger)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A **development-time** logger for Node.js and browsers — colored console output, deep object inspection, a middleware pipeline, and hierarchical namespaces. Zero runtime dependencies, TypeScript-first.

> **Not for production log shipping.** This library is optimized for humans reading a console while developing (colors, pretty-printed objects, sync in-process listeners). To ship logs to a platform — with async batching, retry, sampling, and trace correlation — use [Pino](https://github.com/pinojs/pino) for logs or [Sentry](https://sentry.io) for errors.

## Documentation

Full documentation with live, runnable examples: **https://gvray.github.io/logger/**

- [Getting Started](https://gvray.github.io/logger/guide/getting-started)
- [Playground](https://gvray.github.io/logger/playground)
- [API Reference](https://gvray.github.io/logger/api)

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
  namespace: 'app',
});

logger.info('Server started on port', 3000);
logger.debug('Config:', { env: 'production', debug: false });
logger.error('Connection failed:', new Error('timeout'));

// Namespaces & child loggers
const db = logger.child('db');
db.info('Connected'); // [app:db] [INFO] Connected

// Middleware
import { prefixMiddleware, redactMiddleware } from '@gvray/logger';
logger.use(prefixMiddleware('[API]'));
logger.use(redactMiddleware(['password', /token/i]));
```

## Development

```bash
pnpm install
pnpm docs:dev      # docs site with live examples (HMR on src/)
pnpm build         # build the library to dist/
pnpm test          # run jest
```

## License

MIT

# Logger

Logging utility with different log levels with timestamp options.

## Usage

1. **Installation**

   Install the Logger package using npm:

   ```bash
   npm install @gvray/logger
   ```

   Install the Logger package using yarn:

   ```bash
   yarn add @gvray/logger
   ```

   Install the Logger package using pnpm:

   ```bash
   pnpm add @gvray/logger

   ```

2. **Import and Create Logger Instance**

   Import the Logger class and create an instance:

   ```typescript
   import { Logger, LogLevel } from '@gvray/logger';

   const logger = new Logger({ level: LogLevel.DEBUG, timestamp: true });
   ```

3. **Log Messages**

   Use the different log level methods to log messages:

   ```typescript
   logger.debug('This is a debug message.');
   logger.info('This is an info message.');
   logger.warning('This is a warning message.');
   logger.error('This is an error message.');
   logger.trace('This is a trace message.');
   logger.fatal('This is a fatal message.');
   ```

4. **Middleware**

   ```typescript
   import { Logger, LogLevel, LogMiddleware } from '@gvray/logger';

   const logger = new Logger({ level: LogLevel.DEBUG, timestamp: true });

   const customPrefixMiddleware: LogMiddleware = (ctx, next) => {
     ctx.message = `[CUSTOM PREFIX] ${ctx.message}`;
     next(ctx.message, ctx.level);
   };

   logger.use(customPrefixMiddleware);

   logger.info('This is an info message.'); // 输出: [CUSTOM PREFIX] [INFO]: This is an info message.
   ```

5. **Customization**

- Adjust log level:

  ```typescript
  logger.setLogLevel(LogLevel.INFO);
  ```

- Enable or disable timestamp:

  ```typescript
  logger.enableTimestamp();
  logger.disableTimestamp();
  ```

- Add or remove log listeners:

  ```typescript
  const customListener: LogListener = (level, message) => {
    // Your custom log listener logic
  };

  logger.addLogListener(customListener);
  logger.removeLogListener(customListener);
  ```

## Log Levels

- `DEBUG`: Detailed debugging information.
- `INFO`: General information about system operation.
- `WARNING`: Indicates a potential problem.
- `ERROR`: Indicates a more serious problem.
- `TRACE`: Very detailed tracing information.
- `FATAL`: A very severe error that may lead to application termination.

import {
  Logger,
  LogLevel,
  LogContext,
  prefixMiddleware,
  suffixMiddleware,
  filterLevel,
  jsonMiddleware,
  redactMiddleware,
  errorStackMiddleware,
} from '@/index';

describe('Logger', () => {
  let logSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Basic Logging', () => {
    it('logs trace messages with gray color', () => {
      const logger = new Logger({ level: LogLevel.TRACE });
      logger.trace('Trace message');
      expect(logSpy).toHaveBeenCalled();
      const args = logSpy.mock.calls[0];
      expect(args[0]).toContain('[TRACE]');
      expect(args[1]).toBe('Trace message');
    });

    it('logs debug messages with blue color', () => {
      const logger = new Logger({ level: LogLevel.DEBUG });
      logger.debug('Debug message');
      expect(logSpy).toHaveBeenCalled();
      expect(logSpy.mock.calls[0][0]).toContain('\x1b[34m[DEBUG]');
    });

    it('logs info messages with green color', () => {
      const logger = new Logger({ level: LogLevel.DEBUG });
      logger.info('Info message');
      expect(logSpy).toHaveBeenCalled();
      expect(logSpy.mock.calls[0][0]).toContain('\x1b[32m[INFO]');
    });

    it('logs warning messages with yellow color', () => {
      const logger = new Logger({ level: LogLevel.DEBUG });
      logger.warning('Warning message');
      expect(warnSpy).toHaveBeenCalled();
      expect(warnSpy.mock.calls[0][0]).toContain('\x1b[33m[WARNING]');
    });

    it('logs error messages with red color', () => {
      const logger = new Logger({ level: LogLevel.DEBUG });
      logger.error('Error message');
      expect(errorSpy).toHaveBeenCalled();
      expect(errorSpy.mock.calls[0][0]).toContain('\x1b[31m[ERROR]');
    });

    it('logs fatal messages with magenta color', () => {
      const logger = new Logger({ level: LogLevel.DEBUG });
      logger.fatal('Fatal message');
      expect(errorSpy).toHaveBeenCalled();
      expect(errorSpy.mock.calls[0][0]).toContain('\x1b[35m[FATAL]');
    });

    it('warn() is alias for warning()', () => {
      const logger = new Logger({ level: LogLevel.DEBUG });
      logger.warn('Warning');
      expect(warnSpy).toHaveBeenCalled();
    });
  });

  describe('Log Levels', () => {
    it('respects minimum log level', () => {
      const logger = new Logger({ level: LogLevel.WARNING });
      logger.debug('Should not appear');
      logger.info('Should not appear');
      logger.warning('Should appear');
      expect(logSpy).not.toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalledTimes(1);
    });

    it('setLevel() changes log level', () => {
      const logger = new Logger({ level: LogLevel.ERROR });
      logger.warning('Should not appear');
      expect(warnSpy).not.toHaveBeenCalled();

      logger.setLevel(LogLevel.WARNING);
      logger.warning('Should appear');
      expect(warnSpy).toHaveBeenCalledTimes(1);
    });

    it('getLevel() returns current level', () => {
      const logger = new Logger({ level: LogLevel.INFO });
      expect(logger.getLevel()).toBe(LogLevel.INFO);
    });

    it('silent() suppresses all logs', () => {
      const logger = new Logger({ level: LogLevel.TRACE });
      logger.silent();
      logger.trace('Silent');
      logger.debug('Silent');
      logger.info('Silent');
      logger.warning('Silent');
      logger.error('Silent');
      logger.fatal('Silent');
      expect(logSpy).not.toHaveBeenCalled();
      expect(warnSpy).not.toHaveBeenCalled();
      expect(errorSpy).not.toHaveBeenCalled();
    });
  });

  describe('Colors', () => {
    it('disableColors() removes ANSI codes', () => {
      const logger = new Logger({ level: LogLevel.DEBUG, colors: false });
      logger.info('No colors');
      const call = logSpy.mock.calls[0][0];
      expect(call).not.toContain('\x1b[');
    });

    it('enableColors() restores ANSI codes', () => {
      const logger = new Logger({ level: LogLevel.DEBUG, colors: false });
      logger.info('No colors');
      logger.enableColors();
      logger.info('With colors');
      const args = logSpy.mock.calls[1];
      expect(args[0]).toContain('\x1b[');
    });

    it('disableColors() method works', () => {
      const logger = new Logger({ level: LogLevel.DEBUG });
      logger.disableColors();
      logger.info('No colors');
      const args = logSpy.mock.calls[0];
      expect(args[0]).not.toContain('\x1b[32m');
    });
  });

  describe('Timestamps', () => {
    it('includes ISO timestamp when enabled', () => {
      const logger = new Logger({ level: LogLevel.DEBUG, timestamp: 'iso' });
      logger.info('With timestamp');
      const args = logSpy.mock.calls[0];
      expect(args[0]).toMatch(/\[\d{4}-\d{2}-\d{2}T/);
    });

    it('includes unix timestamp format', () => {
      const logger = new Logger({ level: LogLevel.DEBUG, timestamp: 'unix' });
      logger.info('Unix');
      const args = logSpy.mock.calls[0];
      expect(args[0]).toMatch(/\[\d{13}\]/);
    });

    it('supports custom timestamp formatter', () => {
      const logger = new Logger({
        level: LogLevel.DEBUG,
        timestamp: (d) => `CUSTOM-${d.getFullYear()}`,
      });
      logger.info('Custom');
      const args = logSpy.mock.calls[0];
      expect(args[0]).toContain('CUSTOM-');
    });

    it('setTimestamp() changes format', () => {
      const logger = new Logger({ level: LogLevel.DEBUG });
      logger.setTimestamp('unix');
      logger.info('Unix');
      const args = logSpy.mock.calls[0];
      expect(args[0]).toMatch(/\[\d{13}\]/);
    });
  });

  describe('Namespaces', () => {
    it('includes namespace in output', () => {
      const logger = new Logger({ level: LogLevel.DEBUG, namespace: 'app' });
      logger.info('Namespaced');
      const args = logSpy.mock.calls[0];
      expect(args[0]).toContain('[app]');
    });

    it('child() creates nested namespace', () => {
      const parent = new Logger({ level: LogLevel.DEBUG, namespace: 'app' });
      const child = parent.child('database');
      child.info('Child log');
      const args = logSpy.mock.calls[0];
      expect(args[0]).toContain('[app:database]');
    });

    it('child() inherits parent settings', () => {
      const parent = new Logger({
        level: LogLevel.WARNING,
        timestamp: 'iso',
        colors: false,
      });
      const child = parent.child('child');
      child.info('Should not appear');
      child.warning('Should appear');
      expect(warnSpy).toHaveBeenCalledTimes(1);
      const call = warnSpy.mock.calls[0][0];
      expect(call).not.toContain('\x1b[');
      expect(call).toMatch(/\[\d{4}-\d{2}-\d{2}T/);
    });

    it('deeply nested namespaces work', () => {
      const root = new Logger({ level: LogLevel.DEBUG, namespace: 'app' });
      const http = root.child('http');
      const auth = http.child('auth');
      auth.info('Deep');
      const args = logSpy.mock.calls[0];
      expect(args[0]).toContain('[app:http:auth]');
    });
  });

  describe('Object Inspection', () => {
    it('logs objects with deep inspection', () => {
      const logger = new Logger({ level: LogLevel.DEBUG, colors: false });
      const obj = { a: 1, b: { c: 2 } };
      logger.info('Object:', obj);
      const args = logSpy.mock.calls[0];
      expect(args[1]).toBe('Object:');
      expect(args[2]).toEqual(obj);
    });

    it('logs arrays', () => {
      const logger = new Logger({ level: LogLevel.DEBUG, colors: false });
      logger.info('Array:', [1, 2, 3]);
      const args = logSpy.mock.calls[0];
      expect(args[1]).toBe('Array:');
      expect(args[2]).toEqual([1, 2, 3]);
    });

    it('logs multiple arguments', () => {
      const logger = new Logger({ level: LogLevel.DEBUG });
      logger.info('First', 'Second', 123);
      const args = logSpy.mock.calls[0];
      expect(args[1]).toBe('First');
      expect(args[2]).toBe('Second');
      expect(args[3]).toBe(123);
    });

    it('logs deep nested objects', () => {
      const logger = new Logger({ level: LogLevel.DEBUG });
      const deep = { a: { b: { c: { d: 1 } } } };
      logger.info(deep);
      const args = logSpy.mock.calls[0];
      expect(args[1]).toEqual(deep);
    });
  });

  describe('Listeners', () => {
    it('addListener() receives log context', () => {
      const logger = new Logger({ level: LogLevel.DEBUG });
      const listener = jest.fn();
      logger.addListener(listener);
      logger.info('Test');
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          level: LogLevel.INFO,
          levelName: 'INFO',
          args: ['Test'],
        })
      );
    });

    it('removeListener() stops receiving logs', () => {
      const logger = new Logger({ level: LogLevel.DEBUG });
      const listener = jest.fn();
      logger.addListener(listener);
      logger.info('First');
      logger.removeListener(listener);
      logger.info('Second');
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('listener receives timestamp', () => {
      const logger = new Logger({ level: LogLevel.DEBUG });
      let ctx: LogContext | undefined;
      logger.addListener((c) => {
        ctx = c;
      });
      logger.info('Test');
      expect(ctx?.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('Middleware', () => {
    it('use() adds middleware', () => {
      const logger = new Logger({ level: LogLevel.DEBUG });
      const middleware = jest.fn((ctx, next) => next());
      logger.use(middleware);
      logger.info('Test');
      expect(middleware).toHaveBeenCalled();
    });

    it('middleware can modify context', () => {
      const logger = new Logger({ level: LogLevel.DEBUG });
      logger.use((ctx, next) => {
        ctx.args = ['Modified'];
        next();
      });
      logger.info('Original');
      const args = logSpy.mock.calls[0];
      expect(args[1]).toBe('Modified');
    });

    it('middleware chain executes in order', () => {
      const logger = new Logger({ level: LogLevel.DEBUG });
      const order: number[] = [];
      logger.use((ctx, next) => {
        order.push(1);
        next();
      });
      logger.use((ctx, next) => {
        order.push(2);
        next();
      });
      logger.info('Test');
      expect(order).toEqual([1, 2]);
    });

    it('middleware can stop propagation', () => {
      const logger = new Logger({ level: LogLevel.DEBUG });
      logger.use(() => {
        // Don't call next()
      });
      logger.info('Should not appear');
      expect(logSpy).not.toHaveBeenCalled();
    });

    it('child inherits middleware', () => {
      const parent = new Logger({ level: LogLevel.DEBUG });
      const middleware = jest.fn((ctx, next) => next());
      parent.use(middleware);
      const child = parent.child('child');
      child.info('Test');
      expect(middleware).toHaveBeenCalled();
    });
  });

  describe('Built-in Middleware', () => {
    it('prefixMiddleware adds prefix', () => {
      const logger = new Logger({ level: LogLevel.DEBUG });
      logger.use(prefixMiddleware('[PREFIX]'));
      logger.info('Message');
      const args = logSpy.mock.calls[0];
      expect(args[1]).toBe('[PREFIX]');
      expect(args[2]).toBe('Message');
    });

    it('suffixMiddleware adds suffix', () => {
      const logger = new Logger({ level: LogLevel.DEBUG });
      logger.use(suffixMiddleware('[SUFFIX]'));
      logger.info('Message');
      const args = logSpy.mock.calls[0];
      expect(args[1]).toBe('Message');
      expect(args[2]).toBe('[SUFFIX]');
    });

    it('filterLevel middleware filters by level', () => {
      const logger = new Logger({ level: LogLevel.DEBUG });
      logger.use(filterLevel(LogLevel.WARNING));
      logger.debug('Should not appear');
      logger.warning('Should appear');
      expect(logSpy).not.toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalledTimes(1);
    });

    it('jsonMiddleware outputs JSON', () => {
      const logger = new Logger({ level: LogLevel.DEBUG, colors: false });
      logger.use(jsonMiddleware());
      logger.info('JSON test');
      const args = logSpy.mock.calls[0];
      const jsonStr = args[1];
      const parsed = JSON.parse(jsonStr);
      expect(parsed).toHaveProperty('timestamp');
      expect(parsed).toHaveProperty('level', 'INFO');
      expect(parsed).toHaveProperty('message');
    });

    it('redactMiddleware redacts patterns', () => {
      const logger = new Logger({ level: LogLevel.DEBUG });
      logger.use(redactMiddleware(['secret', /\d{4}/]));
      logger.info('Password: secret, Code: 1234');
      const args = logSpy.mock.calls[0];
      const message = args[1];
      expect(message).toContain('[REDACTED]');
      expect(message).not.toContain('secret');
      expect(message).not.toContain('1234');
    });

    it('errorStackMiddleware includes stack traces', () => {
      const logger = new Logger({ level: LogLevel.DEBUG });
      logger.use(errorStackMiddleware());
      const error = new Error('Test error');
      logger.error(error);
      const args = errorSpy.mock.calls[0];
      expect(args[1]).toBeInstanceOf(Error);
      expect(args[1].message).toBe('Test error');
    });
  });

  describe('Chaining API', () => {
    it('methods return this for chaining', () => {
      const logger = new Logger({ level: LogLevel.DEBUG });
      const result = logger.setLevel(LogLevel.INFO).enableColors().setTimestamp('iso');
      expect(result).toBe(logger);
    });

    it('use() returns this for chaining', () => {
      const logger = new Logger({ level: LogLevel.DEBUG });
      const result = logger.use((ctx, next) => next()).use((ctx, next) => next());
      expect(result).toBe(logger);
    });
  });
});

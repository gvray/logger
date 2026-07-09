import { Logger, LogLevel, prefixMiddleware } from '../index';
import type { LogContext } from '../types';

interface Entry {
  level: string;
  text: string;
}

// Mirrors the capture pattern used by the docs <Demo> component: a Logger
// subclass that auto-attaches a listener, and an overridden child() that
// re-attaches the listener to children so output from child loggers (and
// their children) is captured too.
function makeCapturingLogger(capture: (ctx: LogContext) => void) {
  class CapturingLogger extends Logger {
    constructor(opts?: ConstructorParameters<typeof Logger>[0]) {
      super(opts);
      this.addListener(capture);
    }
    child(namespace: string) {
      const child = super.child(namespace);
      Object.setPrototypeOf(child, CapturingLogger.prototype);
      child.addListener(capture);
      return child as Logger;
    }
  }
  return CapturingLogger;
}

const joinArgs = (args: unknown[]): string =>
  args.map((a) => (typeof a === 'object' && a !== null ? JSON.stringify(a) : String(a))).join(' ');

describe('listener capture through child loggers', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'debug').mockImplementation(() => {});
    jest.spyOn(console, 'info').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('captures root logger output via the auto-attached listener', () => {
    const logs: Entry[] = [];
    const CapturingLogger = makeCapturingLogger((ctx) =>
      logs.push({ level: ctx.levelName, text: joinArgs(ctx.args) })
    );

    const logger = new CapturingLogger({ level: LogLevel.DEBUG, timestamp: 'time' });
    logger.info('hello', { x: 1 });

    expect(logs).toHaveLength(1);
    expect(logs[0].level).toBe('INFO');
    expect(logs[0].text).toContain('hello');
  });

  it('captures child logger output via the overridden child()', () => {
    const logs: Entry[] = [];
    const CapturingLogger = makeCapturingLogger((ctx) =>
      logs.push({ level: ctx.levelName, text: joinArgs(ctx.args) })
    );

    const logger = new CapturingLogger({ level: LogLevel.DEBUG });
    const api = logger.child('api');
    api.info('request received');

    expect(logs).toHaveLength(1);
    expect(logs[0].text).toContain('request received');
  });

  it('captures grandchild output (setPrototypeOf propagation)', () => {
    const logs: Entry[] = [];
    const CapturingLogger = makeCapturingLogger((ctx) =>
      logs.push({ level: ctx.levelName, text: joinArgs(ctx.args) })
    );

    const logger = new CapturingLogger({ level: LogLevel.DEBUG });
    logger.child('api').child('auth').info('nested child works');

    expect(logs).toHaveLength(1);
    expect(logs[0].text).toContain('nested child works');
  });

  it('captures async logs emitted after the call returns', (done) => {
    const logs: Entry[] = [];
    const CapturingLogger = makeCapturingLogger((ctx) =>
      logs.push({ level: ctx.levelName, text: joinArgs(ctx.args) })
    );

    const logger = new CapturingLogger({ level: LogLevel.DEBUG });
    setTimeout(() => {
      logger.warn('async log');
      expect(logs).toHaveLength(1);
      expect(logs[0].text).toContain('async log');
      done();
    }, 10);
  });

  it('still runs middleware on captured loggers', () => {
    const logs: Entry[] = [];
    const CapturingLogger = makeCapturingLogger((ctx) =>
      logs.push({ level: ctx.levelName, text: joinArgs(ctx.args) })
    );

    const logger = new CapturingLogger({ level: LogLevel.DEBUG });
    logger.use(prefixMiddleware('[API]'));
    logger.info('request');

    expect(logs).toHaveLength(1);
    expect(logs[0].text).toContain('[API]');
    expect(logs[0].text).toContain('request');
  });
});

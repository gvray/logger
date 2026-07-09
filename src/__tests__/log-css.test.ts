import { Logger, LogLevel } from '@/index';

// No isBrowser mock — jsdom reports as a browser, so this exercises the
// CSS %c output path (the ANSI path is covered in log.test.ts).

describe('browser CSS output', () => {
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

  it('styles the level tag with %c CSS and resets for args', () => {
    new Logger({ level: LogLevel.DEBUG }).info('hello');
    const [format, color, reset, ...rest] = logSpy.mock.calls[0];
    expect(format).toBe('%c[INFO]%c');
    expect(color).toBe('color:#32cd32');
    expect(reset).toBe('');
    expect(rest).toEqual(['hello']);
  });

  it('uses the correct CSS color per level', () => {
    const logger = new Logger({ level: LogLevel.TRACE });
    logger.trace('t'); // log call 0
    logger.debug('d'); // log call 1
    logger.info('i'); // log call 2
    logger.warning('w'); // warn call 0
    logger.error('e'); // error call 0
    logger.fatal('f'); // error call 1

    expect(logSpy.mock.calls[0][1]).toBe('color:#9b8ad6'); // TRACE
    expect(logSpy.mock.calls[1][1]).toBe('color:#1e90ff'); // DEBUG
    expect(logSpy.mock.calls[2][1]).toBe('color:#32cd32'); // INFO
    expect(warnSpy.mock.calls[0][1]).toBe('color:#ffa500'); // WARNING
    expect(errorSpy.mock.calls[0][1]).toBe('color:#ff4757'); // ERROR
    expect(errorSpy.mock.calls[1][1]).toBe('color:#d946ef'); // FATAL
  });

  it('grays timestamp and namespace, colors the level', () => {
    const logger = new Logger({
      level: LogLevel.DEBUG,
      timestamp: 'time',
      namespace: 'api',
    });
    logger.info('msg');
    const call = logSpy.mock.calls[0];
    expect(call[0]).toContain('%c[api] %c[INFO]%c');
    expect(call[1]).toBe('color:#888'); // timestamp (gray)
    expect(call[2]).toBe('color:#888'); // namespace (gray)
    expect(call[3]).toBe('color:#32cd32'); // level
    expect(call[4]).toBe(''); // reset
    expect(call[5]).toBe('msg'); // appended arg
  });

  it('keeps object args as separate console args (interactive in DevTools)', () => {
    const obj = { id: 1 };
    new Logger({ level: LogLevel.DEBUG }).info('user', obj);
    const call = logSpy.mock.calls[0];
    // format, styles..., then args appended as-is
    expect(call[call.length - 2]).toBe('user');
    expect(call[call.length - 1]).toBe(obj);
  });

  it('outputs plain text (no %c) when colors is false', () => {
    new Logger({ level: LogLevel.DEBUG, colors: false }).info('hello');
    const call = logSpy.mock.calls[0];
    expect(call[0]).toBe('[INFO]');
    expect(call[1]).toBe('hello');
  });

  it('populates formattedMessage with plain (unstyled) text', () => {
    const logger = new Logger({
      level: LogLevel.DEBUG,
      timestamp: 'time',
      namespace: 'api',
    });
    const captured: string[] = [];
    logger.addListener((ctx) => captured.push(ctx.formattedMessage!));
    logger.info('hello', { id: 1 });
    expect(captured[0]).toMatch(/^\[.*\] \[api\] \[INFO\] hello {"id":1}$/);
    expect(captured[0]).not.toContain('\x1b');
    expect(captured[0]).not.toContain('%c');
  });
});

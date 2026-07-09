import { Logger, LogLevel, errorStackMiddleware } from '../index';
import type { LogContext } from '../types';

describe('errorStackMiddleware', () => {
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

  const capture = (): { ctxs: LogContext[]; logger: Logger } => {
    const ctxs: LogContext[] = [];
    const logger = new Logger({ level: LogLevel.DEBUG });
    logger.use(errorStackMiddleware());
    logger.addListener((ctx) => ctxs.push(ctx));
    return { ctxs, logger };
  };

  it('replaces Error args with their stack at ERROR level', () => {
    const { ctxs, logger } = capture();
    const err = new Error('boom');
    logger.error('failed', err);

    expect(ctxs).toHaveLength(1);
    expect(ctxs[0].args[0]).toBe('failed');
    expect(ctxs[0].args[1]).toBe(err.stack);
  });

  it('replaces Error args with their stack at FATAL level', () => {
    const { ctxs, logger } = capture();
    const err = new Error('crash');
    logger.fatal('critical', err);

    expect(ctxs[0].args[1]).toBe(err.stack);
  });

  it('does not modify Error args below ERROR level', () => {
    const { ctxs, logger } = capture();
    const err = new Error('boom');
    logger.warn('warning', err);

    expect(ctxs[0].args[1]).toBe(err);
  });

  it('leaves non-Error args untouched', () => {
    const { ctxs, logger } = capture();
    logger.error('msg', { x: 1 }, 'string', 42);

    expect(ctxs[0].args).toEqual(['msg', { x: 1 }, 'string', 42]);
  });

  it('falls back to name:message when the Error has no stack', () => {
    const { ctxs, logger } = capture();
    const err = new Error('no stack here');
    err.stack = '';
    logger.error('failed', err);

    expect(ctxs[0].args[1]).toBe('Error: no stack here');
  });
});

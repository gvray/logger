import {
  LogLevel,
  prefixMiddleware,
  suffixMiddleware,
  redactMiddleware,
  filterLevel,
  jsonMiddleware,
  conditionalMiddleware,
  samplingMiddleware,
  throttleMiddleware,
  batchMiddleware,
} from '@/index';
import type { LogContext, LogMiddleware } from '@/types';

function makeCtx(args: unknown[] = [], level: LogLevel = LogLevel.INFO): LogContext {
  return {
    level,
    levelName: LogLevel[level] as string,
    timestamp: new Date('2026-01-01T00:00:00.000Z'),
    args,
  };
}

const nextTracker = () => {
  let count = 0;
  const next = () => {
    count++;
  };
  return { next, count: () => count };
};

describe('prefixMiddleware', () => {
  it('prepends the prefix and forwards', () => {
    const ctx = makeCtx(['request']);
    const { next, count } = nextTracker();
    prefixMiddleware('[API]')(ctx, next);
    expect(ctx.args).toEqual(['[API]', 'request']);
    expect(count()).toBe(1);
  });
});

describe('suffixMiddleware', () => {
  it('appends the suffix and forwards', () => {
    const ctx = makeCtx(['done']);
    const { next, count } = nextTracker();
    suffixMiddleware('✓')(ctx, next);
    expect(ctx.args).toEqual(['done', '✓']);
    expect(count()).toBe(1);
  });
});

describe('redactMiddleware', () => {
  it('redacts literal substring matches', () => {
    const ctx = makeCtx(['user password=password123 logged in']);
    redactMiddleware(['password123'])(ctx, () => {});
    expect(ctx.args[0]).toContain('[REDACTED]');
    expect(ctx.args[0]).not.toContain('password123');
  });

  it('redacts regex matches', () => {
    const ctx = makeCtx(['card=1234-5678-9012-3456']);
    redactMiddleware([/\d{4}-\d{4}-\d{4}-\d{4}/])(ctx, () => {});
    expect(ctx.args[0]).toBe('card=[REDACTED]');
  });

  it('applies multiple patterns in order', () => {
    const ctx = makeCtx(['pw=password123 token=tok123']);
    redactMiddleware(['password123', /token=\w+/])(ctx, () => {});
    expect(ctx.args[0]).toBe('pw=[REDACTED] [REDACTED]');
  });

  it('leaves non-string args untouched', () => {
    const obj = { a: 1 };
    const ctx = makeCtx([obj, 42]);
    redactMiddleware(['x'])(ctx, () => {});
    expect(ctx.args[0]).toBe(obj);
    expect(ctx.args[1]).toBe(42);
  });

  it('forwards via next', () => {
    const ctx = makeCtx(['x']);
    const { next, count } = nextTracker();
    redactMiddleware(['y'])(ctx, next);
    expect(count()).toBe(1);
  });
});

describe('filterLevel', () => {
  it('forwards logs above the minimum', () => {
    const { next, count } = nextTracker();
    filterLevel(LogLevel.WARNING)(makeCtx(['x'], LogLevel.ERROR), next);
    expect(count()).toBe(1);
  });

  it('forwards logs at exactly the minimum', () => {
    const { next, count } = nextTracker();
    filterLevel(LogLevel.WARNING)(makeCtx(['x'], LogLevel.WARNING), next);
    expect(count()).toBe(1);
  });

  it('drops logs below the minimum', () => {
    const { next, count } = nextTracker();
    filterLevel(LogLevel.WARNING)(makeCtx(['x'], LogLevel.DEBUG), next);
    expect(count()).toBe(0);
  });
});

describe('jsonMiddleware', () => {
  it('serializes the entry as a JSON string with level, message, timestamp', () => {
    const ctx = makeCtx(['login', { userId: 123 }]);
    jsonMiddleware()(ctx, () => {});
    const parsed = JSON.parse(ctx.args[0] as string);
    expect(parsed.level).toBe('INFO');
    expect(parsed.timestamp).toBe('2026-01-01T00:00:00.000Z');
    expect(parsed.message).toBe('login {"userId":123}');
    expect(parsed.namespace).toBeUndefined();
  });

  it('includes namespace when present', () => {
    const ctx = makeCtx(['x']);
    ctx.namespace = 'api';
    jsonMiddleware()(ctx, () => {});
    expect(JSON.parse(ctx.args[0] as string).namespace).toBe('api');
  });

  it('forwards via next', () => {
    const ctx = makeCtx(['x']);
    const { next, count } = nextTracker();
    jsonMiddleware()(ctx, next);
    expect(count()).toBe(1);
  });
});

describe('conditionalMiddleware', () => {
  it('runs the wrapped middleware when condition is true', () => {
    const ctx = makeCtx(['x']);
    let mwCalled = 0;
    let nextCalled = 0;
    const inner: LogMiddleware = (_c, next) => {
      mwCalled++;
      next();
    };
    conditionalMiddleware(() => true, inner)(ctx, () => {
      nextCalled++;
    });
    expect(mwCalled).toBe(1);
    expect(nextCalled).toBe(1);
  });

  it('skips the middleware but still forwards when condition is false', () => {
    const ctx = makeCtx(['x']);
    let mwCalled = 0;
    let nextCalled = 0;
    const inner: LogMiddleware = () => {
      mwCalled++;
    };
    conditionalMiddleware(() => false, inner)(ctx, () => {
      nextCalled++;
    });
    expect(mwCalled).toBe(0);
    expect(nextCalled).toBe(1);
  });

  it('passes the context to the condition predicate', () => {
    const ctx = makeCtx(['x'], LogLevel.ERROR);
    let received: LogContext | undefined;
    conditionalMiddleware(
      (c) => {
        received = c;
        return false;
      },
      () => {}
    )(ctx, () => {});
    expect(received).toBe(ctx);
  });
});

describe('samplingMiddleware', () => {
  afterEach(() => jest.restoreAllMocks());

  it('forwards all logs when rate is 1', () => {
    const { next, count } = nextTracker();
    const mw = samplingMiddleware(1);
    for (let i = 0; i < 10; i++) mw(makeCtx(['x']), next);
    expect(count()).toBe(10);
  });

  it('drops all logs when rate is 0', () => {
    const { next, count } = nextTracker();
    const mw = samplingMiddleware(0);
    for (let i = 0; i < 10; i++) mw(makeCtx(['x']), next);
    expect(count()).toBe(0);
  });

  it('forwards when random < rate, drops otherwise', () => {
    const { next, count } = nextTracker();
    jest.spyOn(Math, 'random').mockReturnValue(0.4);
    samplingMiddleware(0.5)(makeCtx(['x']), next); // 0.4 < 0.5 → forward
    expect(count()).toBe(1);
    jest.spyOn(Math, 'random').mockReturnValue(0.6);
    samplingMiddleware(0.5)(makeCtx(['x']), next); // 0.6 >= 0.5 → drop
    expect(count()).toBe(1);
  });
});

describe('throttleMiddleware', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('allows up to limit calls per window then blocks', () => {
    const mw = throttleMiddleware({ limit: 2, interval: 1000 });
    const { next, count } = nextTracker();
    const ctx = makeCtx(['msg']);
    mw(ctx, next);
    mw(ctx, next);
    mw(ctx, next); // over limit
    expect(count()).toBe(2);
  });

  it('resets after the interval elapses', () => {
    const mw = throttleMiddleware({ limit: 2, interval: 1000 });
    const { next, count } = nextTracker();
    const ctx = makeCtx(['msg']);
    mw(ctx, next);
    mw(ctx, next);
    jest.advanceTimersByTime(1001);
    mw(ctx, next); // window reset
    expect(count()).toBe(3);
  });

  it('tracks keys independently by level and first arg', () => {
    const mw = throttleMiddleware({ limit: 1, interval: 1000 });
    const { next, count } = nextTracker();
    mw(makeCtx(['a'], LogLevel.INFO), next); // key INFO:a
    mw(makeCtx(['b'], LogLevel.INFO), next); // key INFO:b (different first arg)
    mw(makeCtx(['a'], LogLevel.ERROR), next); // key ERROR:a (different level)
    expect(count()).toBe(3);
  });

  it('blocks the same key after limit until reset', () => {
    const mw = throttleMiddleware({ limit: 1, interval: 1000 });
    const { next, count } = nextTracker();
    mw(makeCtx(['same'], LogLevel.INFO), next); // 1
    mw(makeCtx(['same'], LogLevel.INFO), next); // blocked
    expect(count()).toBe(1);
  });
});

describe('batchMiddleware', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('flushes when the batch reaches maxSize', () => {
    const flushed: LogContext[][] = [];
    const mw = batchMiddleware({
      maxSize: 2,
      maxWait: 5000,
      onFlush: (c) => flushed.push(c),
    });
    mw(makeCtx(['a']), () => {});
    expect(flushed).toHaveLength(0);
    mw(makeCtx(['b']), () => {}); // triggers flush
    expect(flushed).toHaveLength(1);
    expect(flushed[0]).toHaveLength(2);
  });

  it('flushes after maxWait when the batch stays incomplete', () => {
    const flushed: LogContext[][] = [];
    const mw = batchMiddleware({
      maxSize: 10,
      maxWait: 1000,
      onFlush: (c) => flushed.push(c),
    });
    mw(makeCtx(['a']), () => {});
    jest.advanceTimersByTime(1001);
    expect(flushed).toHaveLength(1);
    expect(flushed[0][0].args[0]).toBe('a');
  });

  it('forwards each log immediately via next', () => {
    const { next, count } = nextTracker();
    const mw = batchMiddleware({ maxSize: 10, maxWait: 1000, onFlush: () => {} });
    mw(makeCtx(['a']), next);
    mw(makeCtx(['b']), next);
    expect(count()).toBe(2);
  });

  it('does not re-flush an empty batch on a stale timer', () => {
    const flushed: LogContext[][] = [];
    const mw = batchMiddleware({
      maxSize: 10,
      maxWait: 1000,
      onFlush: (c) => flushed.push(c),
    });
    mw(makeCtx(['a']), () => {});
    jest.advanceTimersByTime(1001); // flush + clear timer
    jest.advanceTimersByTime(1001); // no new flush
    expect(flushed).toHaveLength(1);
  });

  it('keeps a single timer across the whole batch', () => {
    const flushed: LogContext[][] = [];
    const mw = batchMiddleware({
      maxSize: 10,
      maxWait: 1000,
      onFlush: (c) => flushed.push(c),
    });
    mw(makeCtx(['a']), () => {}); // t=0, set timer at t=1000
    jest.advanceTimersByTime(500);
    mw(makeCtx(['b']), () => {}); // timer already set, do not reset
    jest.advanceTimersByTime(500); // t=1000 → flush
    expect(flushed).toHaveLength(1);
    expect(flushed[0]).toHaveLength(2);
  });

  it('survives a throwing onFlush on the maxSize path', () => {
    const mw = batchMiddleware({
      maxSize: 1,
      maxWait: 5000,
      onFlush: () => {
        throw new Error('boom');
      },
    });
    expect(() => mw(makeCtx(['a']), () => {})).not.toThrow();
  });

  it('survives a throwing onFlush on the timer path', () => {
    const mw = batchMiddleware({
      maxSize: 10,
      maxWait: 1000,
      onFlush: () => {
        throw new Error('boom');
      },
    });
    mw(makeCtx(['a']), () => {});
    expect(() => jest.advanceTimersByTime(1001)).not.toThrow();
  });
});

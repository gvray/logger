import { formatArgs, isNodeEnv, isBrowser, supportsColor } from '@/index';

describe('formatArgs', () => {
  it('returns empty string for no args', () => {
    expect(formatArgs([])).toBe('');
  });

  it('returns a lone string arg unchanged', () => {
    expect(formatArgs(['hello'])).toBe('hello');
  });

  it('joins multiple args with spaces', () => {
    expect(formatArgs(['a', 'b', 'c'])).toBe('a b c');
  });

  it('passes non-string args to inspectValue', () => {
    expect(formatArgs(['count', 42, true])).toBe('count 42 true');
  });

  describe('primitive inspection', () => {
    it('inspects null and undefined', () => {
      expect(formatArgs([null])).toBe('null');
      expect(formatArgs([undefined])).toBe('undefined');
    });

    it('inspects numbers', () => {
      expect(formatArgs([42])).toBe('42');
    });

    it('inspects booleans', () => {
      expect(formatArgs([true])).toBe('true');
      expect(formatArgs([false])).toBe('false');
    });

    it('inspects bigint with the n suffix', () => {
      expect(formatArgs([10n])).toBe('10n');
    });

    it('inspects symbols', () => {
      expect(formatArgs([Symbol('x')])).toBe('Symbol(x)');
    });
  });

  describe('special object inspection', () => {
    it('inspects functions by name', () => {
      // eslint-disable-next-line prefer-arrow-callback
      const fn = function namedFn() {
        return 1;
      };
      expect(formatArgs([fn])).toBe('[Function: namedFn]');
      expect(formatArgs([() => 1])).toBe('[Function: anonymous]');
    });

    it('inspects Date as ISO string', () => {
      expect(formatArgs([new Date('2026-01-01T00:00:00.000Z')])).toBe('2026-01-01T00:00:00.000Z');
    });

    it('inspects RegExp', () => {
      expect(formatArgs([/foo/gi])).toBe('/foo/gi');
    });

    it('inspects Error with its stack', () => {
      const err = new Error('boom');
      expect(formatArgs([err])).toBe(err.stack);
    });
  });

  describe('array inspection', () => {
    it('inspects empty arrays as []', () => {
      expect(formatArgs([[]])).toBe('[]');
    });

    it('inspects short arrays inline', () => {
      expect(formatArgs([[1, 2]])).toBe('[ 1, 2 ]');
    });

    it('formats long nested arrays across multiple lines', () => {
      const out = formatArgs([{ arr: [1, 2, 3, 4] }]);
      expect(out).toContain('\n');
    });

    it('truncates arrays exceeding maxArrayLength', () => {
      const out = formatArgs([Array.from({ length: 5 }, (_, i) => i)], {
        maxArrayLength: 2,
      });
      expect(out).toContain('... 3 more items');
    });
  });

  describe('object inspection', () => {
    it('inspects empty objects as {}', () => {
      expect(formatArgs([{}])).toBe('{}');
    });

    it('inspects objects inline', () => {
      expect(formatArgs([{ a: 1 }])).toBe('{ a: 1 }');
    });

    it('prefixes with the constructor name when not Object', () => {
      class Custom {
        x = 1;
      }
      expect(formatArgs([new Custom()])).toContain('Custom ');
    });

    it('truncates objects exceeding maxArrayLength', () => {
      const obj: Record<string, number> = {};
      for (let i = 0; i < 5; i++) obj[`k${i}`] = i;
      const out = formatArgs([obj], { maxArrayLength: 2 });
      expect(out).toContain('... 3 more properties');
    });

    it('formats long nested objects across multiple lines', () => {
      const out = formatArgs([{ inner: { a: 1, b: 2, c: 3 } }]);
      expect(out).toContain('\n');
    });
  });

  describe('options', () => {
    it('respects the depth limit by rendering [Object]', () => {
      const deep = { a: { b: { c: { d: { e: 1 } } } } };
      expect(formatArgs([deep], { depth: 2 })).toContain('[Object]');
    });

    it('emits ANSI color codes when colors is true', () => {
      expect(formatArgs([42], { colors: true })).toMatch(/\x1b\[33m42\x1b\[0m/);
    });

    it('does not emit ANSI codes when colors is false', () => {
      expect(formatArgs([42], { colors: false })).toBe('42');
    });
  });
});

describe('environment helpers', () => {
  // Jest runs under the jsdom environment, where both Node globals and a
  // browser-like `window` are present.
  it('isNodeEnv detects the Node runtime', () => {
    expect(isNodeEnv()).toBe(true);
  });

  it('isBrowser detects a window global', () => {
    expect(isBrowser()).toBe(true);
  });

  it('supportsColor is true in a browser-like environment (CSS %c)', () => {
    expect(supportsColor()).toBe(true);
  });
});

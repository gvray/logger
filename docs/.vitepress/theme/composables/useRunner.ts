import { ref } from 'vue';
import * as Gvray from '@gvray/logger';

export interface LogEntry {
  level: string;
  text: string;
}

function formatArg(arg: unknown): string {
  if (arg === null) return 'null';
  if (arg === undefined) return 'undefined';
  if (arg instanceof Error) return arg.stack || `${arg.name}: ${arg.message}`;
  if (typeof arg === 'object') {
    try {
      return JSON.stringify(arg, null, 2);
    } catch {
      return String(arg);
    }
  }
  return String(arg);
}

function joinArgs(args: unknown[]): string {
  return args.map(formatArg).join(' ');
}

// Strip `import ... from '@gvray/logger'` lines so the snippet reads as real
// module code, while the runner injects the exports as bare identifiers.
export function stripImports(code: string): string {
  return code.replace(/^\s*import\s+[^;]*?from\s+['"]@gvray\/logger['"];?\s*$/gm, '');
}

// Subclass Logger so every instance (and every child, via the overridden
// child()) auto-attaches a listener that captures clean args — no ANSI,
// works for sync and async (setTimeout) logs alike.
function makeCapturingLogger(capture: (ctx: Gvray.LogContext) => void) {
  class DemoLogger extends Gvray.Logger {
    constructor(opts?: ConstructorParameters<typeof Gvray.Logger>[0]) {
      super(opts);
      this.addListener(capture);
    }
    child(namespace: string) {
      const child = super.child(namespace);
      Object.setPrototypeOf(child, DemoLogger.prototype);
      child.addListener(capture);
      return child as Gvray.Logger;
    }
  }
  return DemoLogger;
}

export function useRunner() {
  const logs = ref<LogEntry[]>([]);
  const error = ref<string | null>(null);

  function run(code: string) {
    logs.value = [];
    error.value = null;

    const capture = (ctx: Gvray.LogContext) => {
      logs.value.push({ level: ctx.levelName, text: joinArgs(ctx.args) });
    };
    const DemoLogger = makeCapturingLogger(capture);

    const sandboxConsole = {
      log: (...a: unknown[]) => logs.value.push({ level: 'LOG', text: joinArgs(a) }),
      info: (...a: unknown[]) => logs.value.push({ level: 'INFO', text: joinArgs(a) }),
      warn: (...a: unknown[]) => logs.value.push({ level: 'WARN', text: joinArgs(a) }),
      error: (...a: unknown[]) => logs.value.push({ level: 'ERROR', text: joinArgs(a) }),
      debug: (...a: unknown[]) => logs.value.push({ level: 'DEBUG', text: joinArgs(a) }),
      trace: (...a: unknown[]) => logs.value.push({ level: 'TRACE', text: joinArgs(a) }),
    };

    try {
      const fn = new Function(
        'console',
        'Logger',
        'LogLevel',
        'prefixMiddleware',
        'suffixMiddleware',
        'redactMiddleware',
        'filterLevel',
        'jsonMiddleware',
        'throttleMiddleware',
        'samplingMiddleware',
        'batchMiddleware',
        'errorStackMiddleware',
        'conditionalMiddleware',
        stripImports(code)
      );
      fn(
        sandboxConsole,
        DemoLogger,
        Gvray.LogLevel,
        Gvray.prefixMiddleware,
        Gvray.suffixMiddleware,
        Gvray.redactMiddleware,
        Gvray.filterLevel,
        Gvray.jsonMiddleware,
        Gvray.throttleMiddleware,
        Gvray.samplingMiddleware,
        Gvray.batchMiddleware,
        Gvray.errorStackMiddleware,
        Gvray.conditionalMiddleware
      );
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.stack || e.message : String(e);
    }
  }

  return { logs, error, run };
}

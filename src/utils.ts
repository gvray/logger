export interface FormatOptions {
  depth?: number;
  maxArrayLength?: number;
  colors?: boolean;
}

const isNode = typeof process !== 'undefined' && process.versions?.node;

function inspectValue(value: unknown, options: FormatOptions, currentDepth: number): string {
  const { depth = 4, maxArrayLength = 100, colors = false } = options;

  if (currentDepth > depth) {
    return colors ? '\x1b[36m[Object]\x1b[0m' : '[Object]';
  }

  if (value === null) {
    return colors ? '\x1b[1mnull\x1b[0m' : 'null';
  }

  if (value === undefined) {
    return colors ? '\x1b[90mundefined\x1b[0m' : 'undefined';
  }

  if (typeof value === 'string') {
    return colors ? `\x1b[32m'${value}'\x1b[0m` : `'${value}'`;
  }

  if (typeof value === 'number') {
    return colors ? `\x1b[33m${value}\x1b[0m` : String(value);
  }

  if (typeof value === 'boolean') {
    return colors ? `\x1b[33m${value}\x1b[0m` : String(value);
  }

  if (typeof value === 'bigint') {
    return colors ? `\x1b[33m${value}n\x1b[0m` : `${value}n`;
  }

  if (typeof value === 'symbol') {
    return colors ? `\x1b[32m${value.toString()}\x1b[0m` : value.toString();
  }

  if (typeof value === 'function') {
    const name = value.name || 'anonymous';
    return colors ? `\x1b[36m[Function: ${name}]\x1b[0m` : `[Function: ${name}]`;
  }

  if (value instanceof Date) {
    return colors ? `\x1b[35m${value.toISOString()}\x1b[0m` : value.toISOString();
  }

  if (value instanceof RegExp) {
    return colors ? `\x1b[31m${value.toString()}\x1b[0m` : value.toString();
  }

  if (value instanceof Error) {
    const stack = value.stack || `${value.name}: ${value.message}`;
    return colors ? `\x1b[31m${stack}\x1b[0m` : stack;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    const items = value
      .slice(0, maxArrayLength)
      .map((v) => inspectValue(v, options, currentDepth + 1));
    if (value.length > maxArrayLength) {
      items.push(`... ${value.length - maxArrayLength} more items`);
    }
    if (currentDepth > 0 && items.length > 3) {
      return `[\n  ${items.join(',\n  ')}\n]`;
    }
    return `[ ${items.join(', ')} ]`;
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return '{}';

    const props = entries.slice(0, maxArrayLength).map(([k, v]) => {
      const keyStr = colors ? `\x1b[0m${k}\x1b[0m` : k;
      return `${keyStr}: ${inspectValue(v, options, currentDepth + 1)}`;
    });

    if (entries.length > maxArrayLength) {
      props.push(`... ${entries.length - maxArrayLength} more properties`);
    }

    const constructor = (value as object).constructor?.name;
    const prefix = constructor && constructor !== 'Object' ? `${constructor} ` : '';

    if (currentDepth > 0 && props.length > 2) {
      return `${prefix}{\n  ${props.join(',\n  ')}\n}`;
    }
    return `${prefix}{ ${props.join(', ')} }`;
  }

  return String(value);
}

export function formatArgs(args: unknown[], options: FormatOptions = {}): string {
  if (args.length === 0) return '';

  if (args.length === 1 && typeof args[0] === 'string') {
    return args[0];
  }

  return args
    .map((arg) => {
      if (typeof arg === 'string') {
        return arg;
      }
      return inspectValue(arg, options, 0);
    })
    .join(' ');
}

export function isNodeEnv(): boolean {
  return isNode;
}

export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function supportsColor(): boolean {
  if (isBrowser()) {
    return true;
  }
  if (isNode) {
    return process.stdout?.isTTY ?? false;
  }
  return false;
}

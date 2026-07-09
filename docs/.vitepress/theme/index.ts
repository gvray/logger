import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import Demo from './components/Demo.vue';
import Playground from './components/Playground.vue';

const ANSI = /\x1b\[[0-9;]*m/g;

function patchConsole() {
  if (typeof window === 'undefined') return;
  const methods = ['log', 'info', 'warn', 'error', 'debug', 'trace'] as const;
  for (const m of methods) {
    const orig = console[m].bind(console);
    (console as Record<string, unknown>)[m] = (...args: unknown[]) => {
      orig(...args.map((a) => (typeof a === 'string' ? a.replace(ANSI, '') : a)));
    };
  }
}

let patched = false;

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('Demo', Demo);
    app.component('Playground', Playground);
    if (!patched) {
      patched = true;
      patchConsole();
    }
  },
} satisfies Theme;

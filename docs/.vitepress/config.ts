import { defineConfig } from 'vitepress';

export default defineConfig({
  base: '/logger/',
  title: '@gvray/logger',
  description: 'A development-time logger for Node.js and browsers',
  cleanUrls: true,
  rewrites: {
    // TypeDoc emits the module overview as api/README.md; serve it at /api/.
    'api/README.md': 'api/index.md',
  },
  themeConfig: {
    siteTitle: '@gvray/logger',
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Playground', link: '/playground' },
      { text: 'API', link: '/api/' },
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Advanced', link: '/guide/advanced' },
          { text: 'Real World', link: '/guide/real-world' },
          { text: 'Middleware', link: '/guide/middleware' },
        ],
      },
      {
        text: 'Reference',
        items: [
          { text: 'API Reference', link: '/api/' },
          { text: 'Playground', link: '/playground' },
        ],
      },
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/gvray/logger' }],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © Gavin Ray',
    },
  },
  vite: {
    resolve: {
      alias: {
        '@gvray/logger': new URL('../../src/index.ts', import.meta.url).pathname,
      },
    },
  },
});

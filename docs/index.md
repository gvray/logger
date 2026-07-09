---
layout: home

hero:
  name: '@gvray/logger'
  text: Logging Library
  tagline: A development-time logger for Node.js and browsers — colors, deep inspection, middleware, and namespaces.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: Playground
      link: /playground

features:
  - title: Multi-level logging
    details: TRACE, DEBUG, INFO, WARNING, ERROR, FATAL, plus SILENT to disable all output.
  - title: Middleware system
    details: Extensible pipeline — prefix, redact, filter, JSON, throttle, sampling, batch, error stack.
  - title: Hierarchical namespaces
    details: Child loggers inherit config and middleware, with arbitrarily deep namespace nesting.
  - title: Multiple timestamp formats
    details: ISO, locale, time, unix, or a custom formatter function.
  - title: Listeners
    details: Subscribe to every log event for in-process error collection or statistics.
  - title: Zero dependencies
    details: Lightweight — ~14KB minified, ~3KB gzipped. TypeScript-first with full type exports.
---

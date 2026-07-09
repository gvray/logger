# Getting Started

`@gvray/logger` 是一个轻量、可扩展的日志库，支持 Node.js 和浏览器，TypeScript 优先。

::: tip 实时示例
下方所有示例都是**可运行的**——页面内即可查看输出，点击 Re-run 重新执行。修改 `src/` 源码后，文档会自动热更新，立刻看到效果。
:::

## 安装

```bash
npm install @gvray/logger
```

## 快速开始

```typescript
import { Logger, LogLevel } from '@gvray/logger';

const logger = new Logger({
  level: LogLevel.DEBUG,
  timestamp: 'time',
});

logger.info('Server started on port', 3000);
logger.debug('Config:', { env: 'production', debug: false });
logger.error('Connection failed:', new Error('timeout'));
```

## 日志级别

支持 6 种日志级别，从最详细的 TRACE 到最严重的 FATAL。

<script setup>
import logLevels from '../snippets/gs-log-levels.js?raw';
import multiArgs from '../snippets/gs-multi-args.js?raw';
import timestamps from '../snippets/gs-timestamps.js?raw';
import levelFilter from '../snippets/gs-level-filter.js?raw';
import namespaces from '../snippets/gs-namespaces.js?raw';
import childLoggers from '../snippets/gs-child-loggers.js?raw';
import middleware from '../snippets/gs-middleware.js?raw';
import chaining from '../snippets/gs-chaining.js?raw';
</script>

<Demo :code="logLevels" />

## 多参数输出

像原生 `console` 一样传递多个参数，对象可在控制台中交互展开。

<Demo :code="multiArgs" />

## 时间戳格式

支持 ISO、本地、时间、Unix 毫秒，或自定义格式化函数。

<Demo :code="timestamps" />

## 日志级别过滤

设置最低日志级别，过滤不需要的日志。

<Demo :code="levelFilter" />

## 命名空间

为不同模块创建独立的日志实例。

<Demo :code="namespaces" />

## 子 Logger

从父 Logger 继承配置，创建层级化日志。

<Demo :code="childLoggers" />

## 中间件

使用中间件扩展日志功能——前缀、脱敏等。

<Demo :code="middleware" />

## 链式调用

流畅的 API 设计，支持链式配置。

<Demo :code="chaining" />

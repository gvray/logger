# Advanced Features

更深入的用法：深度命名空间、自定义中间件、监听器、动态配置。

<script setup>
import deepNesting from '../snippets/adv-deep-nesting.js?raw';
import customMiddleware from '../snippets/adv-custom-middleware.js?raw';
import middlewareChain from '../snippets/adv-middleware-chain.js?raw';
import listener from '../snippets/adv-listener.js?raw';
import errorCollection from '../snippets/adv-error-collection.js?raw';
import dynamicConfig from '../snippets/adv-dynamic-config.js?raw';
</script>

## 深度嵌套命名空间

支持任意深度的命名空间嵌套，适合大型模块化应用。

<Demo :code="deepNesting" />

## 自定义中间件

编写自己的日志处理逻辑。中间件接收 `ctx`（日志上下文）和 `next`（下一个中间件），按洋葱模型执行。

<Demo :code="customMiddleware" />

## 中间件链

多个中间件按注册顺序执行，可以组合出复杂的处理管道。

<Demo :code="middlewareChain" />

## 监听器

监听所有日志事件，实现统计、收集等自定义处理。监听器接收完整的 `LogContext`，包含 `level`、`args`、`namespace`、`timestamp`、`formattedMessage`。

<Demo :code="listener" />

## 错误收集

收集错误日志便于本地排查。监听器中可按 `ctx.level` 过滤。

<Demo :code="errorCollection" />

## 动态配置

运行时修改日志行为——切换级别、时间戳、颜色等。所有 setter 方法都返回 `this`，支持链式调用。

<Demo :code="dynamicConfig" />

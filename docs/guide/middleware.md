# Built-in Middleware

`@gvray/logger` 内置多种实用中间件，开箱即用。所有中间件通过 `logger.use(middleware)` 添加，按注册顺序执行。

<script setup>
import prefixSuffix from '../snippets/mw-prefix-suffix.js?raw';
import redact from '../snippets/mw-redact.js?raw';
import json from '../snippets/mw-json.js?raw';
import throttle from '../snippets/mw-throttle.js?raw';
import sampling from '../snippets/mw-sampling.js?raw';
import errorStack from '../snippets/mw-error-stack.js?raw';
import batch from '../snippets/mw-batch.js?raw';
import filterLevel from '../snippets/mw-filter-level.js?raw';
</script>

## prefixMiddleware / suffixMiddleware

给每条日志添加前缀或后缀。前缀支持字符串或返回字符串的函数。

<Demo :code="prefixSuffix" />

## redactMiddleware

自动脱敏敏感信息。匹配字符串或正则，命中后替换为 `[REDACTED]`。

<Demo :code="redact" />

## jsonMiddleware

将日志输出为结构化 JSON，便于调试或喂给其他进程内工具解析。建议配合 `colors: false` 使用以保持 payload 干净。

<Demo :code="json" />

## filterLevel

在中间件层再次过滤日志级别。即使 Logger 的 `level` 设为 TRACE，也能用 `filterLevel` 在管道中拦截。

<Demo :code="filterLevel" />

## throttleMiddleware

限流：在指定时间窗口内最多输出 N 条日志，防止日志洪泛。

<Demo :code="throttle" />

## samplingMiddleware

随机采样：按概率保留日志，适合高吞吐场景下的成本控制。

<Demo :code="sampling" />

## errorStackMiddleware

自动展开 `Error` 对象的堆栈信息，便于调试。

<Demo :code="errorStack" />

## batchMiddleware

批量收集日志，达到阈值或刷新间隔后统一输出。

<Demo :code="batch" />

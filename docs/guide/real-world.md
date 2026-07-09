# Real-World Examples

模拟真实项目中的日志使用场景。这些示例展示如何在生产环境中使用 `@gvray/logger`。

<script setup>
import apiRequest from '../snippets/rw-api-request.js?raw';
import errorHandling from '../snippets/rw-error-handling.js?raw';
import performance from '../snippets/rw-performance.js?raw';
import securityAudit from '../snippets/rw-security-audit.js?raw';
</script>

## API 请求日志

记录 API 请求的完整生命周期：请求参数、响应时间、状态码。使用子 Logger 区分模块，中间件添加请求 ID。

::: tip 异步输出
这些示例使用了 `setTimeout` 模拟异步请求。输出会在延迟后出现在 Console 面板中。
:::

<Demo :code="apiRequest" />

## 错误处理与调试

捕获和记录应用错误，包括堆栈信息、上下文数据。配合 `errorStackMiddleware` 自动展开错误堆栈。

<Demo :code="errorHandling" />

## 性能监控

记录关键操作的性能指标。超过阈值（如 500ms）时自动提升到 WARNING 级别。

<Demo :code="performance" />

## 安全审计

记录安全相关事件：登录尝试、权限检查、可疑活动。配合 `redactMiddleware` 自动脱敏敏感字段。

<Demo :code="securityAudit" />

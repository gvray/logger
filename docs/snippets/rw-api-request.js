import { Logger, LogLevel, prefixMiddleware } from '@gvray/logger';

const logger = new Logger({ level: LogLevel.DEBUG, timestamp: 'time' });
const api = logger.child('api');

let requestId = 1000;
// 给每条 API 日志加请求 ID
api.use((ctx, next) => {
  ctx.args = [`[REQ-${requestId++}]`, ...ctx.args];
  next();
});

api.info('GET /users', { params: { page: 1, limit: 10 } });

// 模拟异步请求
const start = performance.now();
setTimeout(() => {
  const duration = Math.round(performance.now() - start);
  api.info('GET /users completed', { status: 200, duration: `${duration}ms`, records: 42 });
}, 80);

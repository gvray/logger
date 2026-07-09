import { Logger, LogLevel, prefixMiddleware } from '@gvray/logger';

const logger = new Logger({ level: LogLevel.DEBUG, timestamp: 'time' });

// 多个中间件按顺序执行
logger.use(prefixMiddleware('[API]'));
logger.use((ctx, next) => {
  ctx.args = [...ctx.args, '(processed)'];
  next();
});

logger.info('Request received');
logger.debug('Processing data');

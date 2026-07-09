import { Logger, LogLevel, batchMiddleware } from '@gvray/logger';

const logger = new Logger({ level: LogLevel.DEBUG, timestamp: 'time' });
// 每 3 条日志触发一次批量刷新
logger.use(
  batchMiddleware({
    maxSize: 3,
    maxWait: 2000,
    onFlush: (contexts) => {
      console.log(`📦 Flushed batch of ${contexts.length} logs`);
    },
  }),
);

console.log('发送 5 条日志，每 3 条触发一次批量刷新:');
logger.info('Log 1');
logger.info('Log 2');
logger.info('Log 3'); // 触发刷新
logger.info('Log 4');
logger.info('Log 5');

// 剩余未满 3 条的会在 maxWait 后刷新
setTimeout(() => {
  console.log('(剩余日志已刷新)');
}, 2100);

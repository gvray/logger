import { Logger, LogLevel, throttleMiddleware } from '@gvray/logger';

const logger = new Logger({ level: LogLevel.DEBUG, timestamp: 'time' });
// 1 秒内最多输出 2 条
logger.use(throttleMiddleware({ limit: 2, interval: 1000 }));

console.log('发送 5 条日志，但只有前 2 条会输出（1 秒内限流）:');
for (let i = 1; i <= 5; i++) {
  logger.info(`Message ${i}`);
}

setTimeout(() => {
  console.log('1 秒后可以再次输出:');
  logger.info('After throttle period');
}, 1100);

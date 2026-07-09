import { Logger, LogLevel, samplingMiddleware } from '@gvray/logger';

const logger = new Logger({ level: LogLevel.DEBUG, timestamp: 'time' });
// 只随机采样约 50% 的日志
logger.use(samplingMiddleware(0.5));

console.log('发送 10 条日志，约 50% 会被输出:');
for (let i = 1; i <= 10; i++) {
  logger.info(`Sampled message ${i}`);
}

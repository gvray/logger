import { Logger, LogLevel } from '@gvray/logger';

const logger = new Logger({ level: LogLevel.DEBUG, timestamp: 'time' });
const errors = [];

// 监听器：收集错误日志，便于本地排查
logger.addListener((ctx) => {
  if (ctx.level >= LogLevel.ERROR) {
    errors.push({
      level: ctx.levelName,
      message: ctx.formattedMessage,
      timestamp: ctx.timestamp,
    });
  }
});

logger.info('Normal operation');
logger.error('Database connection failed');
logger.fatal('System crash');

console.log('收集的错误:', errors);
console.log('可以在本地进一步排查这些错误');

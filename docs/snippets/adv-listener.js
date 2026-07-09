import { Logger, LogLevel } from '@gvray/logger';

const logger = new Logger({ level: LogLevel.DEBUG, timestamp: 'time' });
const stats = { TRACE: 0, DEBUG: 0, INFO: 0, WARNING: 0, ERROR: 0, FATAL: 0 };

// 监听器：统计各级别日志数量
logger.addListener((ctx) => {
  stats[ctx.levelName]++;
});

logger.trace('Trace 1');
logger.debug('Debug 1');
logger.debug('Debug 2');
logger.info('Info 1');
logger.info('Info 2');
logger.info('Info 3');
logger.warning('Warning 1');
logger.error('Error 1');

console.log('日志统计:', stats);

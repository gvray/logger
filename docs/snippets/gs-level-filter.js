import { Logger, LogLevel } from '@gvray/logger';

// 只显示 WARNING 及以上级别
const logger = new Logger({ level: LogLevel.WARNING, timestamp: 'time' });

logger.trace('不会显示');
logger.debug('不会显示');
logger.info('不会显示');
logger.warning('会显示');
logger.error('会显示');
logger.fatal('会显示');

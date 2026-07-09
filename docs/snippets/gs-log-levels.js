import { Logger, LogLevel } from '@gvray/logger';

const logger = new Logger({ level: LogLevel.TRACE, timestamp: 'time' });

logger.trace('TRACE - 最详细的追踪信息');
logger.debug('DEBUG - 调试信息');
logger.info('INFO - 一般信息');
logger.warning('WARNING - 警告信息');
logger.error('ERROR - 错误信息');
logger.fatal('FATAL - 致命错误');

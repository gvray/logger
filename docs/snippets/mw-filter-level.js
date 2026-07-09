import { Logger, LogLevel, filterLevel } from '@gvray/logger';

// 即使 logger 的级别是 TRACE，filterLevel 中间件也能在中间件层再过滤一次
const logger = new Logger({ level: LogLevel.TRACE, timestamp: 'time' });
logger.use(filterLevel(LogLevel.WARNING));

logger.trace('不会显示');
logger.debug('不会显示');
logger.info('不会显示');
logger.warning('会显示（>= WARNING）');
logger.error('会显示');
logger.fatal('会显示');

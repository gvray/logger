import { Logger, LogLevel, prefixMiddleware, suffixMiddleware } from '@gvray/logger';

const logger = new Logger({ level: LogLevel.DEBUG, timestamp: 'time' });
logger.use(prefixMiddleware('[SYSTEM]'));
logger.use(suffixMiddleware('✓'));

logger.info('Task completed');
logger.debug('Processing finished');
logger.warning('Slow query detected');

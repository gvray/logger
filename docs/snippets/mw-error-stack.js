import { Logger, LogLevel, errorStackMiddleware } from '@gvray/logger';

const logger = new Logger({ level: LogLevel.DEBUG, timestamp: 'time' });
logger.use(errorStackMiddleware());

const error = new Error('Something went wrong');
error.code = 'RUNTIME_ERROR';

logger.error('Error occurred:', error);
logger.fatal('Critical failure:', new Error('Database connection lost'));

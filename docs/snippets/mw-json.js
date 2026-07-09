import { Logger, LogLevel, jsonMiddleware } from '@gvray/logger';

// colors: false 让 JSON 输出更干净（避免 ANSI 转义码混入）
const logger = new Logger({ level: LogLevel.DEBUG, colors: false });
logger.use(jsonMiddleware());

logger.info('Structured log entry', { userId: 123, action: 'login' });
logger.error('Error occurred', { code: 500, message: 'Internal error' });

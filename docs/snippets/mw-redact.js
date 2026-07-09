import { Logger, LogLevel, redactMiddleware } from '@gvray/logger';

const logger = new Logger({ level: LogLevel.DEBUG });
logger.use(
  redactMiddleware([
    'password123',
    'secret-key',
    /\d{4}-\d{4}-\d{4}-\d{4}/, // 信用卡号
    /\w+@\w+\.\w+/, // 邮箱
  ]),
);

logger.info('User login: password=password123');
logger.info('API Key: secret-key');
logger.info('Card: 1234-5678-9012-3456');
logger.info('Email: user@example.com');

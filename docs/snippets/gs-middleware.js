import { Logger, LogLevel, prefixMiddleware, redactMiddleware } from '@gvray/logger';

// Prefix 中间件：给每条日志加前缀
const logger = new Logger({ level: LogLevel.DEBUG, timestamp: 'time' });
logger.use(prefixMiddleware('[API]'));
logger.info('Request received');
logger.debug('Processing data');
logger.info('Response sent');

// Redact 中间件：自动脱敏敏感信息
const secure = new Logger({ level: LogLevel.DEBUG });
secure.use(
  redactMiddleware([
    'password123',
    'secret-key',
    /\d{4}-\d{4}-\d{4}-\d{4}/, // 信用卡号
    /\w+@\w+\.\w+/, // 邮箱
  ]),
);
secure.info('Login attempt: password=password123');
secure.info('API Key: secret-key');
secure.info('Card: 1234-5678-9012-3456');
secure.info('Email: user@example.com');

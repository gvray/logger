import { Logger, LogLevel, redactMiddleware } from '@gvray/logger';

const logger = new Logger({ level: LogLevel.DEBUG, timestamp: 'time' });
const audit = logger.child('audit');

// 自动脱敏 password / token / secret / key 字段
audit.use(
  redactMiddleware([/password/i, /token/i, /secret/i, /key/i]),
);

audit.info('Login successful', {
  username: 'john.doe',
  ip: '192.168.1.100',
  mfa: true,
});

audit.warning('Login failed', {
  username: 'admin',
  password: 'secret123', // 会被脱敏
  ip: '192.168.1.100',
  reason: 'invalid_credentials',
  attempts: 3,
});

audit.error('Suspicious activity detected', {
  user: 'unknown',
  ip: '123.45.67.89',
  action: 'multiple_failed_logins',
  count: 10,
});

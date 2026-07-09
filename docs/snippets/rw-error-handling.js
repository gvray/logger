import { Logger, LogLevel, errorStackMiddleware } from '@gvray/logger';

const logger = new Logger({ level: LogLevel.DEBUG, timestamp: 'time' });
const errorLogger = logger.child('error');
errorLogger.use(errorStackMiddleware());

try {
  // 模拟一个会抛错的操作
  const user = null;
  // @ts-ignore - intentionally accessing null to trigger an error
  const name = user.name;
} catch (err) {
  errorLogger.error('Runtime error in component', err, {
    component: 'UserProfile',
    props: { userId: null },
  });
}

errorLogger.warning('Form validation error', new Error('Email is required'), {
  field: 'email',
});

errorLogger.fatal('Critical system error', new Error('Database connection lost'), {
  service: 'database',
  uptime: '2h 34m',
});

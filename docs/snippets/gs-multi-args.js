import { Logger, LogLevel } from '@gvray/logger';

const logger = new Logger({ level: LogLevel.DEBUG, timestamp: 'time' });

const user = {
  id: 1,
  name: 'John Doe',
  role: 'admin',
  settings: { theme: 'dark', notifications: { email: true, push: false } },
};

logger.info('User logged in:', user);
logger.info('Multiple args:', 'string', 123, true, { key: 'value' }, [1, 2, 3]);
logger.debug('Complex object:', user, { timestamp: Date.now() });

import { Logger, LogLevel } from '@gvray/logger';

const apiLogger = new Logger({ namespace: 'api', level: LogLevel.DEBUG, timestamp: 'time' });
const dbLogger = new Logger({ namespace: 'database', level: LogLevel.DEBUG, timestamp: 'time' });
const cacheLogger = new Logger({ namespace: 'cache', level: LogLevel.DEBUG, timestamp: 'time' });

apiLogger.info('Request received: GET /users');
dbLogger.info('Query executed: SELECT * FROM users');
cacheLogger.debug('Cache hit for key: user:123');
apiLogger.info('Response sent: 200 OK');

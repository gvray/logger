import { Logger, LogLevel } from '@gvray/logger';

const app = new Logger({ namespace: 'app', level: LogLevel.DEBUG, timestamp: 'time' });
const http = app.child('http');
const auth = http.child('auth');
const jwt = auth.child('jwt');

app.info('Application started');
http.info('HTTP server listening on port 3000');
auth.debug('Processing authentication request');
jwt.debug('JWT token generated');
jwt.info('Token validated successfully');

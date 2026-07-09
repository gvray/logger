import { Logger, LogLevel } from '@gvray/logger';

const app = new Logger({ namespace: 'app', level: LogLevel.DEBUG, timestamp: 'time' });
const http = app.child('http');
const auth = http.child('auth');
const jwt = auth.child('jwt');
const oauth = auth.child('oauth');

app.info('Root logger');
http.info('HTTP module loaded');
auth.debug('Auth middleware initialized');
jwt.debug('JWT token generated');
oauth.debug('OAuth2 flow started');

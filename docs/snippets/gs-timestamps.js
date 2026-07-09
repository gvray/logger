import { Logger } from '@gvray/logger';

new Logger({ timestamp: 'iso' }).info('ISO 格式时间戳');
new Logger({ timestamp: 'locale' }).info('本地格式时间戳');
new Logger({ timestamp: 'time' }).info('仅时间');
new Logger({ timestamp: 'unix' }).info('Unix 毫秒时间戳');

// 自定义格式
new Logger({
  timestamp: (date) => `[${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}]`,
}).info('自定义格式时间戳');

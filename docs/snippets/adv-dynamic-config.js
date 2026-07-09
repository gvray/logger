import { Logger, LogLevel } from '@gvray/logger';

// 根据环境自动调整配置（这里模拟开发环境）
const isDev = true;
const logger = new Logger({
  level: isDev ? LogLevel.DEBUG : LogLevel.WARNING,
  timestamp: isDev ? 'time' : 'iso',
  colors: isDev,
});

logger.debug('Development debug info');
logger.info('Application info');
logger.warning('Warning message');

// 运行时动态修改
console.log('切换到 WARNING 级别:');
logger.setLevel(LogLevel.WARNING);
logger.debug('This will NOT show');
logger.info('This will NOT show either');
logger.warning('Only warnings and above now');

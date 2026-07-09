import { Logger, LogLevel } from '@gvray/logger';

const logger = new Logger()
  .setLevel(LogLevel.DEBUG)
  .setTimestamp('time')
  .enableColors();

logger.info('Logger configured via chaining!');
logger.debug('Deep object:', { a: { b: { c: { d: 1 } } } });

// 动态修改配置
logger.setLevel(LogLevel.WARNING);
logger.info('This will NOT show');
logger.warning('Only warnings and above now');

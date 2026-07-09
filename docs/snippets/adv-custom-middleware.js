import { Logger, LogLevel } from '@gvray/logger';

const logger = new Logger({ level: LogLevel.DEBUG, timestamp: 'time' });

// 自定义中间件：给每条日志加一个自定义前缀
logger.use((ctx, next) => {
  ctx.args = ['[CUSTOM]', ...ctx.args];
  next();
});

// 条件中间件：只对 ERROR 及以上级别加告警标记
logger.use((ctx, next) => {
  if (ctx.level >= LogLevel.ERROR) {
    ctx.args = ['🚨 ALERT:', ...ctx.args];
  }
  next();
});

logger.info('Normal info message');
logger.error('This is an error!');
logger.fatal('Critical failure!');

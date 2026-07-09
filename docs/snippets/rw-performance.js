import { Logger, LogLevel } from '@gvray/logger';

const logger = new Logger({ level: LogLevel.DEBUG, timestamp: 'time' });
const perf = logger.child('performance');

function measure(label, delay) {
  perf.info(`${label} starting...`);
  const start = performance.now();
  setTimeout(() => {
    const duration = performance.now() - start;
    const logLevel = duration > 500 ? 'warning' : 'info';
    perf[logLevel](`${label} completed`, {
      duration: `${duration.toFixed(2)}ms`,
      threshold: '500ms',
      status: duration > 500 ? 'SLOW' : 'OK',
    });
  }, delay);
}

measure('fast operation', 30);
measure('normal operation', 250);
measure('slow operation', 600);

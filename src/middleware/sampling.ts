import { LogMiddleware, LogContext } from '../types';

export function samplingMiddleware(rate: number): LogMiddleware {
  return (_ctx: LogContext, next: () => void) => {
    if (Math.random() < rate) {
      next();
    }
  };
}

const { Logger, LogLevel } = require('./dist/gvray-logger.cjs.js');

console.log('=== 测试 Logger 错误处理机制 ===\n');

// 测试 1: 中间件抛出错误
console.log('1. 测试中间件错误（不应中断程序）:');
const logger1 = new Logger({ level: LogLevel.DEBUG });
logger1.use((ctx, next) => {
  throw new Error('Middleware error!');
});
logger1.info('这条日志应该能正常输出（跳过失败的中间件）');
console.log('✅ 程序继续运行\n');

// 测试 2: 监听器抛出错误
console.log('2. 测试监听器错误（不应中断程序）:');
const logger2 = new Logger({ level: LogLevel.DEBUG });
logger2.addListener(() => {
  throw new Error('Listener error!');
});
logger2.info('这条日志应该能正常输出（忽略失败的监听器）');
console.log('✅ 程序继续运行\n');

// 测试 3: 多个中间件，其中一个失败
console.log('3. 测试中间件链（一个失败，其他继续）:');
const logger3 = new Logger({ level: LogLevel.DEBUG });
let executed = [];
logger3.use((ctx, next) => {
  executed.push('middleware-1');
  next();
});
logger3.use((ctx, next) => {
  executed.push('middleware-2-error');
  throw new Error('Second middleware fails');
});
logger3.use((ctx, next) => {
  executed.push('middleware-3');
  next();
});
logger3.info('测试中间件链');
console.log('执行的中间件:', executed);
console.log('✅ 程序继续运行\n');

// 测试 4: 异常参数
console.log('4. 测试异常参数:');
const logger4 = new Logger({ level: LogLevel.DEBUG });
const circular = { a: 1 };
circular.self = circular; // 循环引用

logger4.info('循环引用对象:', circular);
logger4.info('undefined:', undefined);
logger4.info('null:', null);
logger4.info('Symbol:', Symbol('test'));
console.log('✅ 程序继续运行\n');

// 测试 5: 自定义时间戳函数抛出错误
console.log('5. 测试时间戳格式化错误:');
const logger5 = new Logger({
  level: LogLevel.DEBUG,
  timestamp: () => {
    throw new Error('Timestamp formatter error');
  }
});
logger5.info('时间戳格式化失败，应该降级到简单前缀');
console.log('✅ 程序继续运行\n');

// 测试 6: 正常流程验证
console.log('6. 验证正常流程仍然工作:');
const logger6 = new Logger({
  level: LogLevel.DEBUG,
  timestamp: 'time',
  namespace: 'test'
});
logger6.info('正常日志输出');
logger6.debug('调试信息');
logger6.warning('警告信息');
logger6.error('错误信息');
console.log('✅ 所有正常功能正常工作\n');

console.log('=== 所有错误处理测试通过 ✅ ===');
console.log('Logger 不会因为内部错误而中断用户程序');

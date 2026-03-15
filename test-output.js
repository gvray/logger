const { Logger, LogLevel } = require('./dist/gvray-logger.cjs.js');

console.log('=== 测试原生输出行为 ===\n');

const logger = new Logger({
  level: LogLevel.DEBUG,
  timestamp: 'time',
});

// 测试多参数
console.log('1. 多个参数测试:');
logger.info('用户', { id: 1, name: 'John' }, [1, 2, 3]);

console.log('\n2. 对象展开测试:');
const user = {
  id: 1,
  name: 'John Doe',
  settings: {
    theme: 'dark',
    notifications: { email: true, push: false }
  }
};
logger.warn('用户数据:', user);

console.log('\n3. 嵌套对象测试:');
logger.debug('复杂对象:', { a: { b: { c: { d: 1 } } } });

console.log('\n4. Error 对象测试:');
logger.error('错误:', new Error('测试错误'));

console.log('\n5. 原生 console 对比:');
console.log('[原生]', '用户', { id: 1, name: 'John' }, [1, 2, 3]);

const ora = require('ora');
const chalk = require('chalk');
const spinner = ora('正在执行任务...').start();

// 在这里执行你的异步任务
setTimeout(() => {
    spinner.succeed(chalk.green('任务完成！'));
    // spinner.fail(chalk.red('任务失败..'))
}, 2000);
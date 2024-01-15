const Client = require('ssh2-sftp-client'); // 用了连接服务器进行文件or文件夹相关操作
const ora = require('ora'); // 用来实现loading加载效果
const fs = require('fs');

// 因为ssh2-sftp-client需要连接远程服务器，所以我们需要告知这个包，连服务器的ip端口用户名密码
const config = {
  host: '111.222.333.444',
  port: '22',
  username: 'Admin',
  password: 'xxxyyyzzz111222333444',
  // 当然也可以使用私有Key
  // privateKey: fs.readFileSync('/path/to/private/key.pem').toString()
};

async function uploadLocalFolder(localFolderPath, remoteFolderPath) {
  const spinner = ora('发布脚本开始执行--->').start(); // 开始加载...
  const sftp = new Client(); // 实例化用于调用其自带的方法
  try {
    spinner.text = '连接服务器...'
    await sftp.connect(config); // 使用上述配置连接远程服务器
    spinner.text = '连接服务器成功'
    spinner.text = '旧的dist文件夹删除...'
    await sftp.rmdir(remoteFolderPath, true); // 把旧的dist删除掉
    spinner.text = '旧的dist文件夹删除成功'
    spinner.text = '新的dist文件夹上传...'
    await sftp.uploadDir(localFolderPath, remoteFolderPath); // 新的dist删除掉
    spinner.text = '新的dist文件夹上传成功'
    // throw new Error('错错错错错.......') // 模拟报错
  } catch (err) {
    console.error(err)
  } finally {
    await sftp.end();
    spinner.info('脚本执行完毕');
  }
}

// 使用示例
uploadLocalFolder('./dist', 'C:/test/dist');
const path = require('path');
const fs = require('fs');
const Client = require('ssh2-sftp-client');

const ora = require('ora');
let spinner = null // 加载实例

const config = {
  host: '666.777.888.999',
  port: '7527',
  username: 'root',
  password: 'passwordForLunix',
};

let totalFileCount = 0 // 本地dist文件夹中总文件数量
let num = 0 // 已成功上传到远端服务器上的文件数量

// 统计本地dist文件夹中有多少个文件（用于计算文件上传进度）
function foldFileCount(folderPath) {
  let count = 0;
  const files = fs.readdirSync(folderPath); // 读取文件夹
  for (const file of files) { // 遍历
    const filePath = path.join(folderPath, file);
    const stats = fs.statSync(filePath);
    if (stats.isFile()) { // 文件就+1
      count = count + 1
    } else if (stats.isDirectory()) { // 文件夹就递归加
      count = count + foldFileCount(filePath);
    }
  }
  return count;
}

// 把本地打包好的dist递归上传到远端服务器
async function uploadFilesToRemote(localFolderPath, remoteFolderPath, sftp) {
  const files = fs.readdirSync(localFolderPath); // 读取文件夹
  for (const file of files) { // 遍历
    let localFilePath = path.join(localFolderPath, file); // 拼接路径
    let remoteFilePath = path.join(remoteFolderPath, file); // 拼接路径
    remoteFilePath = remoteFilePath.replace(/\\/g, '/'); // 针对于lunix服务器，需要做正反斜杠的转换
    const stats = fs.statSync(localFilePath); // 获取文件夹文件信息
    if (stats.isFile()) { // 是文件
      await sftp.put(localFilePath, remoteFilePath); // 把文件丢到远端服务器
      num = num + 1 // 完成数量加1
      let progress = ((num / totalFileCount) * 100).toFixed(2) + '%' // 算一下进度
      spinner.text = '当前上传进度为:' + progress // loading
    } else if (stats.isDirectory()) { // 是文件夹
      await sftp.mkdir(remoteFilePath, true); // 给远端服务器创建文件夹
      await uploadFilesToRemote(localFilePath, remoteFilePath, sftp); // 递归调用
    }
  }
}

// 主程序
async function main() {
  const localFolderPath = './dist'; // 本地dist文件夹路径
  const remoteFolderPath = '/var/www/test/dist'; // 远程lunix的dist文件夹路径
  totalFileCount = foldFileCount(localFolderPath) // 统计打包好的dist文件夹中文件的数量
  if (!totalFileCount) return // dist是空文件夹就不操作
  const sftp = new Client(); // 实例化sftp可调用其方法
  try {
    console.log('连接服务器');
    await sftp.connect(config);
    console.log('服务器连接成功');
    console.log('删除旧的dist文件夹');
    await sftp.rmdir(remoteFolderPath, true)
    console.log('删除旧的dist文件夹成功');
    console.log('新建新的dist文件夹');
    await sftp.mkdir(remoteFolderPath, true)
    console.log('新建新的dist文件夹成功');
    spinner = ora('自动化脚本执行开始').start(); // loading...
    await uploadFilesToRemote(localFolderPath, remoteFolderPath, sftp); // 耗时操作，递归上传文件
  } catch (err) {
    console.log(err);
  } finally {
    sftp.end();
    spinner.info('自动化脚本执行结束')
  }
}

// 执行脚本
main();
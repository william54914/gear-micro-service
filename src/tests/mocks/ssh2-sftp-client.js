/**
 * Mock for ssh2-sftp-client library
 */

class SftpClient {
  constructor() {
    this.connected = false;
  }

  connect(config) {
    this.connected = true;
    return Promise.resolve();
  }

  list(path) {
    return Promise.resolve([
      { name: 'test.csv', type: '-', size: 1024, modifyTime: new Date() }
    ]);
  }

  get(remotePath, localPath) {
    return Promise.resolve(Buffer.from('mock,csv,data'));
  }

  put(data, remotePath) {
    return Promise.resolve();
  }

  end() {
    this.connected = false;
    return Promise.resolve();
  }
}

module.exports = SftpClient; 
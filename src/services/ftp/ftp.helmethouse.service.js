const FtpService = require('./ftp.service');

class FtpHelmethouseService {
  constructor() {
    this.config = {
      host: "ftp.helmethouse.com",
      user: "ftpinv",
      password: "hhrules",
      port: 21,
      secure: false,
      basePath: "."
    }
    this.ftp = new FtpService();
  }

  async connect() {
    await this.ftp.connect(this.config);
  }

  async disconnect() {
    await this.ftp.disconnect();
  }

  async downloadFile(remotePath, localPath) {
    await this.ftp.downloadFile(this.config, remotePath, localPath);
  }

  async listFiles() {
    return await this.ftp.listFiles(this.config, this.config.basePath);
  }
}

module.exports = new FtpHelmethouseService();
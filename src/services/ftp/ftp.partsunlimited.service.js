const SftpService = require('./sftp.service');

class FtpPartsUnlimitedService {
  constructor() {
    this.config = {
      host: "scftp.solidcommerce.com",
      user: "2025@solid.com",
      password: "solid1234!",
      port: 22,
      basePath: "PartsUnlimited"
    }
    this.ftp = new SftpService();
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

module.exports = new FtpPartsUnlimitedService();
const Client = require('ssh2-sftp-client');
const config = require('../../config/env');

class SftpService {
  constructor(sftpConfig = null) {
    this.client = new Client();
    
    // If config is provided, validate it has required fields
    if (sftpConfig) {
      this.validateSftpConfig(sftpConfig);
      this.config = sftpConfig;
    }
  }

  validateSftpConfig(sftpConfig) {
    const required = ['host', 'user', 'password'];
    const missing = required.filter(field => !sftpConfig[field]);
    if (missing.length > 0) {
      throw new Error(`Missing required SFTP configuration fields: ${missing.join(', ')}`);
    }
    
    if (sftpConfig.port && !Number.isInteger(parseInt(sftpConfig.port))) {
      throw new Error('SFTP port must be a valid number');
    }
  }

  async connect(config) {
    try {
      await this.client.connect({
        host: config.host,
        port: config.port,
        username: config.user,
        password: config.password
      });
      console.log('SFTP Connected successfully');
    } catch (error) {
      console.error('SFTP Connection error:', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      await this.client.end();
      console.log('SFTP Disconnected successfully');
    } catch (error) {
      console.error('SFTP Disconnection error:', error);
      throw error;
    }
  }

  async downloadFile(config, remotePath, localPath) {
    try {
      await this.connect(config);
      await this.client.fastGet(remotePath, localPath);
      console.log(`File downloaded successfully: ${remotePath}`);
    } catch (error) {
      console.error('SFTP Download error:', error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }

  async listFiles(config, remotePath = '.') {
    try {
      await this.connect(config);
      const list = await this.client.list(remotePath);
      return list.map(item => ({
        name: item.name,
        type: item.type,
        size: item.size,
        date: item.modifyTime
      }));
    } catch (error) {
      console.error('SFTP List error:', error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }
}

module.exports = SftpService; 
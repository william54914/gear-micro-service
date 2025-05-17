const { Client } = require('basic-ftp');
const config = require('../../config/env');

class FtpService {
  constructor(ftpConfig = null) {
    // If config is provided, validate it has required fields
    if (ftpConfig) {
      this.validateFtpConfig(ftpConfig);
      this.config = ftpConfig;
    }
  }

  validateFtpConfig(ftpConfig) {
    const required = ['host', 'user', 'password'];
    const missing = required.filter(field => !ftpConfig[field]);
    if (missing.length > 0) {
      throw new Error(`Missing required FTP configuration fields: ${missing.join(', ')}`);
    }
    
    if (ftpConfig.port && !Number.isInteger(parseInt(ftpConfig.port))) {
      throw new Error('FTP port must be a valid number');
    }
  }

  async connect(config) {
    const client = new Client();
    
    try {
      await client.access({
        host: config.host,
        user: config.user,
        password: config.password,
        secure: config.secure
      });
      
      return client;
    } catch (err) {
      console.error('FTP Connection error:', err);
      throw err;
    }
  }

  async listFiles(config, remotePath = '.') {
    let client;
    try {
      client = await this.connect(config);
      const list = await client.list(remotePath);
      
      return list.map(item => ({
        name: item.name,
        type: item.type === 2 ? 'directory' : 'file',
        size: item.size,
        date: new Date(item.date)
      }));
    } catch (err) {
      console.error('FTP List error:', err);
      throw err;
    } finally {
      if (client) {
        await client.close();
      }
    }
  }

  async downloadFile(config, remotePath, localPath) {
    let client;
    try {
      client = await this.connect(config);
      await client.downloadTo(localPath, remotePath);
    } catch (err) {
      console.error('FTP Download error:', err);
      throw err;
    } finally {
      if (client) {
        await client.close();
      }
    }
  }

  async uploadFile(config, localPath, remotePath) {
    let client;
    try {
      client = await this.connect(config);
      await client.uploadFrom(localPath, remotePath);
    } catch (err) {
      console.error('FTP Upload error:', err);
      throw err;
    } finally {
      if (client) {
        await client.close();
      }
    }
  }

  async deleteFile(config, remotePath) {
    let client;
    try {
      client = await this.connect(config);
      await client.remove(remotePath);
    } catch (err) {
      console.error('FTP Delete error:', err);
      throw err;
    } finally {
      if (client) {
        await client.close();
      }
    }
  }

  async createDirectory(config, remotePath) {
    let client;
    try {
      client = await this.connect(config);
      await client.ensureDir(remotePath);
    } catch (err) {
      console.error('FTP Create directory error:', err);
      throw err;
    } finally {
      if (client) {
        await client.close();
      }
    }
  }

  async removeDirectory(config, remotePath) {
    let client;
    try {
      client = await this.connect(config);
      await client.removeDir(remotePath);
    } catch (err) {
      console.error('FTP Remove directory error:', err);
      throw err;
    } finally {
      if (client) {
        await client.close();
      }
    }
  }
}

module.exports = FtpService;

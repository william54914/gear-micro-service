const Client = require('ftp');
const config = require('../../config/env');

class FtpService {
  constructor(ftpConfig = null) {
    this.client = new Client();
    
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

  async connect (config) {
    try {
      console.log(config);
      await this.client.connect(config);
      console.log('FTP Connected successfully');
    } catch (error) {
      console.error('FTP Connection error:', error);
      throw error;
    }
  }

  async disconnect () {
    try {
      await this.client.end();
      console.log('FTP Disconnected successfully');
    } catch (error) {
      console.error('FTP Disconnection error:', error);
      throw error;
    }
  }

  async uploadFile (config, localPath, remotePath) {
    try {
      await this.connect(config);
      await this.client.put(localPath, remotePath);
      console.log(`File uploaded successfully: ${ remotePath }`);
    } catch (error) {
      console.error('FTP Upload error:', error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }

  async downloadFile (config, remotePath, localPath) {
    try {
      await this.connect(config);
      await this.client.get(remotePath, localPath);
      console.log(`File downloaded successfully: ${ remotePath }`);
    } catch (error) {
      console.error('FTP Download error:', error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }

  async listFiles (config, remotePath = '.') {
    try {
      await this.connect(config);
      const list = await this.client.list(remotePath);
      console.log('Raw FTP list result:', list);
      if (!Array.isArray(list)) {
        console.error('FTP listFiles: list is not an array:', list);
        return [];
      }
      return list.map(item => ({
        name: item.name,
        type: item.type,
        size: item.size,
        date: item.date
      }));
    } catch (error) {
      console.error('FTP List error:', error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }

  async deleteFile (config, remotePath) {
    try {
      await this.connect(config);
      await this.client.delete(remotePath);
      console.log(`File deleted successfully: ${ remotePath }`);
    } catch (error) {
      console.error('FTP Delete error:', error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }

  async createDirectory (config, remotePath) {
    try {
      await this.connect(config);
      await this.client.mkdir(remotePath);
      console.log(`Directory created successfully: ${ remotePath }`);
    } catch (error) {
      console.error('FTP Create directory error:', error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }

  async removeDirectory (config, remotePath) {
    try {
      await this.connect(config);
      await this.client.rmdir(remotePath);
      console.log(`Directory removed successfully: ${ remotePath }`);
    } catch (error) {
      console.error('FTP Remove directory error:', error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }
}

module.exports = FtpService;

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
    client.ftp.verbose = true; // Enable verbose logging
    
    try {
      console.log('Connecting to FTP with config:', {
        host: config.host,
        user: config.user,
        secure: config.secure
      });
      
      await client.access({
        host: config.host,
        user: config.user,
        password: config.password,
        secure: config.secure
      });
      
      console.log('FTP Connected successfully');
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
      console.log('Listing files in directory:', remotePath);
      
      const list = await client.list(remotePath);
      console.log('Raw list response:', list);
      
      const files = list.map(item => ({
        name: item.name,
        type: item.type === 2 ? 'directory' : 'file',
        size: item.size,
        date: new Date(item.date)
      }));
      
      console.log('Processed files:', files);
      return files;
    } catch (err) {
      console.error('FTP List error:', err);
      throw err;
    } finally {
      if (client) {
        await client.close();
        console.log('FTP Disconnected successfully');
      }
    }
  }

  async downloadFile(config, remotePath, localPath) {
    let client;
    try {
      client = await this.connect(config);
      console.log(`Downloading file: ${remotePath} to ${localPath}`);
      
      await client.downloadTo(localPath, remotePath);
      console.log(`File downloaded successfully: ${remotePath}`);
    } catch (err) {
      console.error('FTP Download error:', err);
      throw err;
    } finally {
      if (client) {
        await client.close();
        console.log('FTP Disconnected successfully');
      }
    }
  }

  async uploadFile(config, localPath, remotePath) {
    let client;
    try {
      client = await this.connect(config);
      await client.uploadFrom(localPath, remotePath);
      console.log(`File uploaded successfully: ${remotePath}`);
    } catch (err) {
      console.error('FTP Upload error:', err);
      throw err;
    } finally {
      if (client) {
        await client.close();
        console.log('FTP Disconnected successfully');
      }
    }
  }

  async deleteFile(config, remotePath) {
    let client;
    try {
      client = await this.connect(config);
      await client.remove(remotePath);
      console.log(`File deleted successfully: ${remotePath}`);
    } catch (err) {
      console.error('FTP Delete error:', err);
      throw err;
    } finally {
      if (client) {
        await client.close();
        console.log('FTP Disconnected successfully');
      }
    }
  }

  async createDirectory(config, remotePath) {
    let client;
    try {
      client = await this.connect(config);
      await client.ensureDir(remotePath);
      console.log(`Directory created successfully: ${remotePath}`);
    } catch (err) {
      console.error('FTP Create directory error:', err);
      throw err;
    } finally {
      if (client) {
        await client.close();
        console.log('FTP Disconnected successfully');
      }
    }
  }

  async removeDirectory(config, remotePath) {
    let client;
    try {
      client = await this.connect(config);
      await client.removeDir(remotePath);
      console.log(`Directory removed successfully: ${remotePath}`);
    } catch (err) {
      console.error('FTP Remove directory error:', err);
      throw err;
    } finally {
      if (client) {
        await client.close();
        console.log('FTP Disconnected successfully');
      }
    }
  }
}

module.exports = FtpService;

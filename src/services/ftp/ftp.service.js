const ftp = require('basic-ftp');
require('dotenv').config();

class FtpService {
  constructor () {
    this.client = new ftp.Client();
    this.client.ftp.verbose = true;

    // Set default timeout
    this.client.ftp.timeout = 30000;
  }

  async connect (config) {
    try {
      console.log(config);
      await this.client.access({
        host: config.host,
        port: config.port || 21, // Default to standard FTP port if not specified
        user: config.user,
        password: config.password,
        secure: config.secure || false
      });
      console.log('FTP Connected successfully');
    } catch (error) {
      console.error('FTP Connection error:', error);
      throw error;
    }
  }

  async disconnect () {
    try {
      await this.client.close();
      console.log('FTP Disconnected successfully');
    } catch (error) {
      console.error('FTP Disconnection error:', error);
      throw error;
    }
  }

  async uploadFile (config, localPath, remotePath) {
    try {
      await this.connect(config);
      await this.client.uploadFrom(localPath, remotePath);
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
      await this.client.downloadTo(localPath, remotePath);
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
      await this.client.remove(remotePath);
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
      await this.client.ensureDir(remotePath);
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
      await this.client.removeDir(remotePath);
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

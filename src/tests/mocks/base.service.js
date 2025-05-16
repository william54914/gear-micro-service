/**
 * Mock for BaseService used in tests
 */
class BaseService {
  constructor(serviceName) {
    // Set up mock configurations for various services
    this.config = {
      onedrive: {
        clientId: 'mock-client-id',
        clientSecret: 'mock-client-secret',
        tenantId: 'mock-tenant-id',
        userEmail: 'mock-user@example.com'
      },
      amazon: {
        region: 'us-east-1',
        awsAccessKeyId: 'mock-access-key',
        awsSecretAccessKey: 'mock-secret-key',
        clientId: 'mock-client-id',
        clientSecret: 'mock-client-secret',
        refreshToken: 'mock-refresh-token'
      },
      ls2: {
        host: 'mock-ftp-host',
        user: 'mock-ftp-user',
        password: 'mock-ftp-pass',
        port: 21
      }
    };
    
    this.serviceName = serviceName;
  }
  
  success(data, message = '') {
    return data;
  }
  
  error(message, code = 500) {
    throw new Error(message);
  }
  
  validateConfig() {
    return true;
  }
}

module.exports = BaseService; 
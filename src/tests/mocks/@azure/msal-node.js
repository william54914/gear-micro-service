/**
 * Mock for @azure/msal-node library
 */

class ConfidentialClientApplication {
  constructor(config) {
    this.config = config;
  }

  acquireTokenByClientCredential(options) {
    return Promise.resolve({
      accessToken: 'mock-access-token',
      expiresOn: new Date(Date.now() + 3600000)
    });
  }
}

module.exports = {
  ConfidentialClientApplication
}; 
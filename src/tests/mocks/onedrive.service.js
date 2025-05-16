/**
 * Mock for OneDrive service used in tests
 */

const BaseService = require('../../services/base.service');

class OneDriveService extends BaseService {
  constructor() {
    super('onedrive');
    
    // Mock configuration is now set by BaseService
    this.userEmail = this.config.onedrive.userEmail;
    this.token = 'mock-access-token';
    
    this.msalClient = {
      acquireTokenByClientCredential: jest.fn().mockResolvedValue({
        accessToken: 'mock-access-token',
        expiresOn: new Date(Date.now() + 3600000)
      })
    };
  }
  
  // Mock API methods
  getToken = jest.fn().mockResolvedValue('mock-access-token');
  
  makeGraphRequest = jest.fn().mockImplementation((endpoint) => {
    if (endpoint.includes('children')) {
      return Promise.resolve({
        value: [
          {
            id: 'folder-1',
            name: 'Inventory Management',
            folder: { childCount: 3 }
          },
          {
            id: 'file-1',
            name: 'test.csv',
            size: 1024,
            lastModifiedDateTime: new Date().toISOString()
          }
        ]
      });
    }
    return Promise.resolve({});
  });
  
  listRootFolders = jest.fn().mockResolvedValue([
    {
      id: 'folder-1',
      name: 'Inventory Management',
      type: 'folder'
    }
  ]);
  
  listFilesInFolder = jest.fn().mockResolvedValue([
    {
      id: 'file-1',
      name: 'test.csv',
      size: 1024,
      type: 'file',
      webUrl: 'https://example.com/test.csv',
      modifiedDateTime: new Date().toISOString()
    }
  ]);
  
  getFileContent = jest.fn().mockResolvedValue('mock,csv,data');
  
  findFolderByPath = jest.fn().mockResolvedValue({
    id: 'folder-2',
    name: 'Restock Products'
  });
  
  findFileInFolder = jest.fn().mockResolvedValue({
    id: 'file-1',
    name: 'test.csv',
    size: 1024,
    type: 'file',
    webUrl: 'https://example.com/test.csv',
    modifiedDateTime: new Date().toISOString()
  });
  
  findFileByName = jest.fn().mockResolvedValue({
    id: 'file-1',
    name: 'test.csv',
    size: 1024,
    type: 'file',
    webUrl: 'https://example.com/test.csv',
    modifiedDateTime: new Date().toISOString()
  });
  
  findFileByPath = jest.fn().mockResolvedValue({
    id: 'file-1',
    name: 'test.csv',
    size: 1024,
    type: 'file',
    webUrl: 'https://example.com/test.csv',
    modifiedDateTime: new Date().toISOString()
  });
  
  // Helper method to mock success response
  success(data, message = '') {
    return data;
  }
}

// Export the class, not an instance
module.exports = OneDriveService; 
const BaseService = require('./base.service');
const config = require('../config/env');

// Only require these in non-test environment
let msal;
let Client;
let isomorphicFetch;
if (process.env.NODE_ENV !== 'test') {
  msal = require('@azure/msal-node');
  Client = require('@microsoft/microsoft-graph-client').Client;
  isomorphicFetch = require('isomorphic-fetch');
}

class OneDriveService extends BaseService {
  constructor() {
    super('onedrive');

    // Skip configuration in test environment
    if (process.env.NODE_ENV === 'test') {
      this.config = {
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        tenantId: 'test-tenant-id',
        scopes: ['https://graph.microsoft.com/.default']
      };
      this.msalClient = {
        acquireTokenByClientCredential: () => Promise.resolve({ accessToken: 'test-token' })
      };
      this.graphClient = {
        api: () => ({
          get: () => Promise.resolve({ value: [] }),
          put: () => Promise.resolve({}),
          delete: () => Promise.resolve()
        })
      };
      return;
    }

    this.msalClient = new msal.ConfidentialClientApplication({
      auth: {
        clientId: config.onedrive.clientId,
        authority: `https://login.microsoftonline.com/${config.onedrive.tenantId}`,
        clientSecret: config.onedrive.clientSecret
      }
    });

    this.config = {
      scopes: ['https://graph.microsoft.com/.default']
    };

    this.userEmail = this.config.onedrive.userEmail;
    this.token = null;
  }

  async getToken() {
    if (this.token) return this.token;

    try {
      const result = await this.msalClient.acquireTokenByClientCredential({
        scopes: ["https://graph.microsoft.com/.default"]
      });

      this.token = result.accessToken;
      return this.token;
    } catch (error) {
      console.error('Authentication failed:', error.message);
      throw error;
    }
  }

  async makeGraphRequest(endpoint, method = 'GET', data = null) {
    const token = await this.getToken();
    const headers = {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    };

    try {
      const response = await isomorphicFetch({
        method,
        url: `https://graph.microsoft.com/v1.0${endpoint}`,
        headers,
        data
      });
      return response.json();
    } catch (error) {
      console.error('Graph API request failed:', error.message);
      throw error;
    }
  }

  async listRootFolders() {
    try {
      const items = await this.makeGraphRequest(
        `/users/${this.userEmail}/drive/root/children`
      );

      const folders = items.value.map(item => ({
        name: item.name,
        type: item.folder ? 'folder' : 'file',
        id: item.id
      }));

      return this.success(folders, 'Root folders retrieved successfully');
    } catch (error) {
      console.error('Failed to list folders:', error.message);
      throw error;
    }
  }

  async listFilesInFolder(folderId) {
    try {
      const items = await this.makeGraphRequest(
        `/users/${this.userEmail}/drive/items/${folderId}/children`
      );

      const files = items.value.map(item => ({
        name: item.name,
        id: item.id,
        size: item.size,
        webUrl: item.webUrl,
        modifiedDateTime: item.lastModifiedDateTime,
        type: item.folder ? 'folder' : 'file'
      }));

      return this.success(files, 'Folder contents retrieved successfully');
    } catch (error) {
      console.error('Failed to list files in folder:', error.message);
      throw error;
    }
  }

  async getFileContent(fileId) {
    try {
      // Get the download URL for the file
      const fileInfo = await this.makeGraphRequest(
        `/users/${this.userEmail}/drive/items/${fileId}`
      );
      
      // Download the file content
      const token = await this.getToken();
      const response = await isomorphicFetch({
        method: 'GET',
        url: fileInfo['@microsoft.graph.downloadUrl'],
        headers: {
          "Authorization": `Bearer ${token}`
        },
        responseType: 'text'
      });

      return response.text();
    } catch (error) {
      console.error('Failed to get file content:', error.message);
      throw error;
    }
  }

  async findFolderByPath(folderPath) {
    try {
      // Split the path into segments
      const pathSegments = folderPath.split('/').filter(segment => segment);
      console.log('Looking for path segments:', pathSegments);
      
      if (pathSegments.length === 0) {
        // If no segments, return the root folder
        const rootInfo = await this.makeGraphRequest(
          `/users/${this.userEmail}/drive/root`
        );
        return { id: rootInfo.id, name: rootInfo.name };
      }

      // Start at the root
      let currentFolderId = 'root';
      let currentFolder = null;

      // Navigate through the path segments
      for (const segment of pathSegments) {
        console.log(`Looking for folder segment: ${segment}`);
        // Get the items in the current folder
        const endpoint = currentFolderId === 'root'
          ? `/users/${this.userEmail}/drive/root/children`
          : `/users/${this.userEmail}/drive/items/${currentFolderId}/children`;
        
        console.log('Making request to endpoint:', endpoint);
        const response = await this.makeGraphRequest(endpoint);
        console.log('Found items:', response.value.map(item => ({ name: item.name, type: item.folder ? 'folder' : 'file' })));
        
        // Find the folder matching the current segment
        const folder = response.value.find(
          item => item.name.toLowerCase() === segment.toLowerCase() && item.folder
        );

        if (!folder) {
          throw new Error(`Folder '${segment}' not found in path '${folderPath}'. Available folders: ${response.value.filter(item => item.folder).map(item => item.name).join(', ')}`);
        }

        currentFolderId = folder.id;
        currentFolder = folder;
        console.log(`Found folder: ${folder.name} (${folder.id})`);
      }

      return { id: currentFolderId, name: currentFolder.name };
    } catch (error) {
      console.error(`Failed to find folder by path '${folderPath}':`, error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', JSON.stringify(error.response.data, null, 2));
      }
      throw error;
    }
  }

  async findFileInFolder(folderId, fileName) {
    try {
      const files = await this.listFilesInFolder(folderId);
      const file = files.find(file => file.name.toLowerCase() === fileName.toLowerCase());
      
      if (!file) {
        throw new Error(`File '${fileName}' not found in folder`);
      }

      return file;
    } catch (error) {
      console.error('Failed to find file in folder:', error.message);
      throw error;
    }
  }

  async findFileByName(folderName, fileName) {
    try {
      // First find the folder ID
      const rootItems = await this.listRootFolders();
      const folder = rootItems.find(item => item.name.toLowerCase() === folderName.toLowerCase());
      
      if (!folder) {
        throw new Error(`Folder '${folderName}' not found`);
      }

      // Then find the file in that folder
      const files = await this.listFilesInFolder(folder.id);
      const file = files.find(file => file.name.toLowerCase() === fileName.toLowerCase());
      
      if (!file) {
        throw new Error(`File '${fileName}' not found in folder '${folderName}'`);
      }

      return file;
    } catch (error) {
      console.error('Failed to find file by name:', error.message);
      throw error;
    }
  }

  async findFileByPath(folderPath, fileName) {
    try {
      // Find the folder first
      const folder = await this.findFolderByPath(folderPath);
      
      // Then find the file in that folder
      const file = await this.findFileInFolder(folder.id, fileName);
      
      return file;
    } catch (error) {
      console.error(`Failed to find file '${fileName}' in path '${folderPath}':`, error.message);
      throw error;
    }
  }
}

module.exports = OneDriveService;
require('dotenv').config();
const BaseService = require('./base.service');
const config = require('../config/env');
const fetch = require('isomorphic-fetch');
const msal = require('@azure/msal-node');
const Client = require('@microsoft/microsoft-graph-client').Client;

// Only require these in non-test environment
let msalClient;
let graphClient;

class OneDriveService extends BaseService {
  constructor() {
    super('onedrive');

    // Log environment variables for debugging
    console.log('OneDrive Environment Variables:');
    console.log('ONEDRIVE_CLIENT_ID:', process.env.ONEDRIVE_CLIENT_ID);
    console.log('ONEDRIVE_CLIENT_SECRET:', process.env.ONEDRIVE_CLIENT_SECRET?.substring(0, 5) + '...');
    console.log('ONEDRIVE_TENANT_ID:', process.env.ONEDRIVE_TENANT_ID);
    console.log('ONEDRIVE_USER_EMAIL:', process.env.ONEDRIVE_USER_EMAIL);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('FORCE_ONEDRIVE_REAL:', process.env.FORCE_ONEDRIVE_REAL);

    // Skip configuration in test environment unless FORCE_ONEDRIVE_REAL is set
    if (process.env.NODE_ENV === 'test' && !process.env.FORCE_ONEDRIVE_REAL) {
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

    // Use environment variables directly instead of config
    this.config = {
      clientId: process.env.ONEDRIVE_CLIENT_ID,
      clientSecret: process.env.ONEDRIVE_CLIENT_SECRET,
      tenantId: process.env.ONEDRIVE_TENANT_ID,
      userEmail: process.env.ONEDRIVE_USER_EMAIL,
      scopes: ['https://graph.microsoft.com/.default']
    };

    // Initialize MSAL client with environment variables
    this.msalClient = new msal.ConfidentialClientApplication({
      auth: {
        clientId: this.config.clientId,
        authority: `https://login.microsoftonline.com/${this.config.tenantId}`,
        clientSecret: this.config.clientSecret
      }
    });

    this.userEmail = this.config.userEmail;
    this.token = null;

    // Log the final configuration
    console.log('Final OneDrive Configuration:');
    console.log('Client ID:', this.config.clientId);
    console.log('Tenant ID:', this.config.tenantId);
    console.log('User Email:', this.config.userEmail);
  }

  async getToken() {
    if (this.token) return this.token;

    try {
      const result = await this.msalClient.acquireTokenByClientCredential({
        scopes: ["https://graph.microsoft.com/.default"]
      });
      console.log('MSAL acquireToken result:', JSON.stringify(result, null, 2));
      console.log('MSAL token:', result.accessToken);
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
      const response = await fetch(`https://graph.microsoft.com/v1.0${endpoint}`, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined
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
      console.log('API response for root folders:', JSON.stringify(items, null, 2));
      if (!items || !Array.isArray(items.value)) {
        throw new Error('API response missing or malformed: ' + JSON.stringify(items));
      }
      const folders = items.value.map(item => ({
        name: item.name,
        type: item.folder ? 'folder' : 'file',
        id: item.id
      }));
      return folders;
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
      console.log('API response for files in folder:', JSON.stringify(items, null, 2));
      if (!items || !Array.isArray(items.value)) {
        throw new Error('API response missing or malformed: ' + JSON.stringify(items));
      }
      const files = items.value.map(item => ({
        name: item.name,
        id: item.id,
        size: item.size,
        webUrl: item.webUrl,
        modifiedDateTime: item.lastModifiedDateTime,
        type: item.folder ? 'folder' : 'file'
      }));
      return files;
    } catch (error) {
      console.error('Failed to list files in folder:', error.message);
      throw error;
    }
  }

  async getFileContent(fileId) {
    try {
      console.log('\nGetting file content for file ID:', fileId);
      
      // Get the download URL for the file
      const fileInfo = await this.makeGraphRequest(
        `/users/${this.userEmail}/drive/items/${fileId}`
      );
      console.log('File info response:', JSON.stringify(fileInfo, null, 2));
      
      const downloadUrl = fileInfo['@microsoft.graph.downloadUrl'];
      if (!downloadUrl) {
        throw new Error('Download URL not found in file info response');
      }
      
      console.log('Download URL found:', downloadUrl);
      
      // Download the file content
      const response = await fetch(downloadUrl);

      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
      }

      // Log response headers
      console.log('Response headers:', Object.fromEntries([...response.headers.entries()]));
      
      const content = await response.text();
      console.log('File content downloaded successfully');
      console.log('Content length:', content.length);
      console.log('Content type:', typeof content);
      console.log('First 500 characters:', content.substring(0, 500));
      console.log('Content encoding:', response.headers.get('content-encoding'));
      console.log('Content type:', response.headers.get('content-type'));
      
      // Check for common CSV issues
      const lines = content.split('\n');
      console.log('Number of lines:', lines.length);
      console.log('First line (headers):', lines[0]);
      if (lines.length > 1) {
        console.log('Second line (first data row):', lines[1]);
      }
      
      // Check for BOM
      if (content.charCodeAt(0) === 0xFEFF) {
        console.log('BOM detected at start of file');
      }
      
      // Check for different line endings
      const crlfCount = (content.match(/\r\n/g) || []).length;
      const lfCount = (content.match(/[^\r]\n/g) || []).length;
      console.log('CRLF line endings:', crlfCount);
      console.log('LF line endings:', lfCount);
      
      return content;
    } catch (error) {
      console.error('Failed to get file content:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', JSON.stringify(error.response.data, null, 2));
      }
      throw error;
    }
  }

  async findFolderByPath(folderPath) {
    try {
      // Split the path into segments and clean them
      const pathSegments = folderPath
        .split('/')
        .map(segment => segment.trim())
        .filter(segment => segment);
      
      console.log('\nLooking for path segments:', pathSegments);
      
      if (pathSegments.length === 0) {
        // If no segments, return the root folder
        const rootInfo = await this.makeGraphRequest(
          `/users/${this.userEmail}/drive/root`
        );
        return { id: rootInfo.id, name: rootInfo.name };
      }

      // Build the path for the Graph API
      const graphPath = pathSegments.join('/');
      console.log('Looking for folder at path:', graphPath);
      
      try {
        // Try to get the folder directly by path first
        const response = await this.makeGraphRequest(
          `/users/${this.userEmail}/drive/root:/${graphPath}`
        );
        
        if (response && response.id) {
          console.log('Found folder directly:', response.name);
          return { id: response.id, name: response.name };
        }
      } catch (error) {
        console.log('Could not find folder directly, falling back to navigation...');
      }

      // Fall back to navigating the path segment by segment
      let currentFolderId = 'root';
      let currentFolder = null;

      for (const segment of pathSegments) {
        console.log(`\nLooking for folder segment: "${segment}"`);
        const endpoint = currentFolderId === 'root'
          ? `/users/${this.userEmail}/drive/root/children`
          : `/users/${this.userEmail}/drive/items/${currentFolderId}/children`;
        
        console.log('Making request to endpoint:', endpoint);
        const response = await this.makeGraphRequest(endpoint);
        
        // Find the folder matching the current segment (case-insensitive)
        const folder = response.value.find(
          item => item.name.toLowerCase() === segment.toLowerCase() && item.folder
        );

        if (!folder) {
          console.log('\nAvailable folders in this level:');
          response.value
            .filter(item => item.folder)
            .forEach(item => console.log(`- "${item.name}" (exact name)`));
          throw new Error(`Folder '${segment}' not found in path '${folderPath}'. Available folders: ${response.value.filter(item => item.folder).map(item => item.name).join(', ')}`);
        }

        currentFolderId = folder.id;
        currentFolder = folder;
        console.log(`Found folder: "${folder.name}" (${folder.id})`);
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
      const response = await this.makeGraphRequest(
        `/users/${this.userEmail}/drive/items/${folderId}/children`
      );
      console.log('Looking for file:', fileName);
      console.log('Available files:', response.value.map(f => ({ 
        name: f.name, 
        type: f.folder ? 'folder' : 'file',
        exactName: f.name  // Added for case sensitivity debugging
      })));
      
      const file = response.value.find(file => file.name.toLowerCase() === fileName.toLowerCase() && !file.folder);
      
      if (!file) {
        throw new Error(`File '${fileName}' not found in folder. Available files: ${response.value.filter(f => !f.folder).map(f => `"${f.name}"`).join(', ')}`);
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
const msal = require('@azure/msal-node');
const axios = require('axios');
require('dotenv').config();

class OneDriveClient {
  constructor () {
    this.config = {
      clientId: process.env.ONEDRIVE_CLIENT_ID,
      clientSecret: process.env.ONEDRIVE_CLIENT_SECRET,
      tenantId: process.env.ONEDRIVE_TENANT_ID,
      userEmail: process.env.ONEDRIVE_USER_EMAIL
    };

    this.msalClient = new msal.ConfidentialClientApplication({
      auth: {
        clientId: this.config.clientId,
        authority: `https://login.microsoftonline.com/${this.config.tenantId}`,
        clientSecret: this.config.clientSecret
      }
    });

    this.token = null;
  }

  async getToken () {
    if (this.token) return this.token;

    try {
      const result = await this.msalClient.acquireTokenByClientCredential({
        scopes: [ "https://graph.microsoft.com/.default" ]
      });

      this.token = result.accessToken;
      return this.token;
    } catch (error) {
      console.error('Authentication failed:', error.message);
      throw error;
    }
  }

  async makeGraphRequest (endpoint, method = 'GET', data = null) {
    const token = await this.getToken();
    const headers = {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    };

    try {
      const response = await axios({
        method,
        url: `https://graph.microsoft.com/v1.0${endpoint}`,
        headers,
        data
      });
      return response.data;
    } catch (error) {
      console.error('Graph API request failed:', error.message);
      throw error;
    }
  }

  async listRootFolders() {
    try {
      const items = await this.makeGraphRequest(
        `/users/${this.config.userEmail}/drive/root/children`
      );

      return items.value.map(item => ({
        name: item.name,
        type: item.folder ? 'folder' : 'file',
        id: item.id
      }));
    } catch (error) {
      console.error('Failed to list folders:', error.message);
      throw error;
    }
  }

  async listFilesInFolder(folderId) {
    try {
      const items = await this.makeGraphRequest(
        `/users/${this.config.userEmail}/drive/items/${folderId}/children`
      );

      return items.value.map(item => ({
        name: item.name,
        id: item.id,
        size: item.size,
        webUrl: item.webUrl,
        modifiedDateTime: item.lastModifiedDateTime,
        type: item.folder ? 'folder' : 'file'
      }));
    } catch (error) {
      console.error('Failed to list files in folder:', error.message);
      throw error;
    }
  }

  async getFileContent(fileId) {
    try {
      // Get the download URL for the file
      const fileInfo = await this.makeGraphRequest(
        `/users/${this.config.userEmail}/drive/items/${fileId}`
      );
      
      // Download the file content
      const token = await this.getToken();
      const response = await axios({
        method: 'GET',
        url: fileInfo['@microsoft.graph.downloadUrl'],
        headers: {
          "Authorization": `Bearer ${token}`
        },
        responseType: 'text'
      });

      return response.data;
    } catch (error) {
      console.error('Failed to get file content:', error.message);
      throw error;
    }
  }

  async findFolderByPath(folderPath) {
    try {
      // Split the path into segments
      const pathSegments = folderPath.split('/').filter(segment => segment);
      
      if (pathSegments.length === 0) {
        // If no segments, return the root folder
        const rootInfo = await this.makeGraphRequest(
          `/users/${this.config.userEmail}/drive/root`
        );
        return { id: rootInfo.id, name: rootInfo.name };
      }

      // Start at the root
      let currentFolderId = 'root';
      let currentFolder = null;

      // Navigate through the path segments
      for (const segment of pathSegments) {
        // Get the items in the current folder
        const endpoint = currentFolderId === 'root' 
          ? `/users/${this.config.userEmail}/drive/root/children`
          : `/users/${this.config.userEmail}/drive/items/${currentFolderId}/children`;
        
        const response = await this.makeGraphRequest(endpoint);
        
        // Find the folder matching the current segment
        const folder = response.value.find(
          item => item.name.toLowerCase() === segment.toLowerCase() && item.folder
        );

        if (!folder) {
          throw new Error(`Folder '${segment}' not found in path '${folderPath}'`);
        }

        currentFolderId = folder.id;
        currentFolder = folder;
      }

      return { id: currentFolderId, name: currentFolder.name };
    } catch (error) {
      console.error(`Failed to find folder by path '${folderPath}':`, error.message);
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

module.exports = OneDriveClient;
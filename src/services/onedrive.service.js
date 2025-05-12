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
}

module.exports = OneDriveClient;
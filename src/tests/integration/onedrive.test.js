const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const onedriveService = require('../../services/onedrive.service');

async function testOneDriveConnection() {
  try {
    console.log('Testing OneDrive connection and file access...');
    
    // Test authentication
    const isAuthenticated = await onedriveService.authenticate();
    console.log('Authentication status:', isAuthenticated ? 'SUCCESS' : 'FAILED');
    
    if (!isAuthenticated) {
      return { success: false, error: 'Failed to authenticate with OneDrive' };
    }

    // Test file listing
    const files = await onedriveService.listFiles('Inventory Management');
    console.log('Files in Inventory Management:', files);

    // Test specific file access
    const testFile = 'restock_products.csv';
    const fileContent = await onedriveService.getFile(`Inventory Management/${testFile}`);
    
    if (fileContent) {
      console.log(`Successfully accessed ${testFile}`);
      return { success: true, message: 'OneDrive connection and file access successful' };
    } else {
      return { success: false, error: `Failed to access ${testFile}` };
    }
  } catch (error) {
    console.error('OneDrive test error:', error);
    return { success: false, error: error.message };
  }
}

// Run the test if this file is run directly
if (require.main === module) {
  testOneDriveConnection();
}

module.exports = testOneDriveConnection; 
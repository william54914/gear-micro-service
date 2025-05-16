const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const amazonService = require('../../services/amazon.service');
const amazonDbService = require('../../services/amazonDb.service');

async function testAmazonImport() {
  try {
    console.log('Starting Amazon import test...');
    const amazonResponse = await amazonService.getAllListings();
    
    if (amazonResponse.success && amazonResponse.data) {
      const result = await amazonDbService.saveListings(amazonResponse.data);
      console.log('Amazon import completed successfully:', result);
      return { success: true, data: result };
    } else {
      console.error('Failed to fetch Amazon listings:', amazonResponse);
      return { success: false, error: 'Failed to fetch listings' };
    }
  } catch (error) {
    console.error('Error during Amazon import:', error);
    return { success: false, error: error.message };
  }
}

// Run the test if this file is run directly
if (require.main === module) {
  testAmazonImport();
}

module.exports = testAmazonImport; 
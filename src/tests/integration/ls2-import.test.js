const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const ls2Service = require('../../services/ftp/ftp.ls2.service');

async function testLs2Import() {
  try {
    console.log('Testing LS2 import process...');
    const result = await ls2Service.importFile('FlynCycle Inventory.csv');
    
    console.log('LS2 import completed:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('LS2 import error:', error);
    return { success: false, error: error.message };
  }
}

// Run the test if this file is run directly
if (require.main === module) {
  testLs2Import();
}

module.exports = testLs2Import; 
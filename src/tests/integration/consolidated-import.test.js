const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

// Debug environment variables
console.log('Environment variables loaded:');
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);

const amazonService = require('../../services/amazon.service');
const amazonDbService = require('../../services/amazonDb.service');
const RestockImporter = require('../../services/importers/restock.importer');
const ls2Service = require('../../services/ftp/ftp.ls2.service');

async function runConsolidatedTest() {
  try {
    console.log('Starting consolidated test imports...');
    let results = {
      amazon: { success: false, error: null },
      restock: { success: false, error: null },
      ls2: { success: false, error: null }
    };

    // 1. Test Amazon import
    console.log('\n1. Testing Amazon import...');
    try {
      const amazonResponse = await amazonService.getAllListings();
      if (amazonResponse.success && amazonResponse.data) {
        const result = await amazonDbService.saveListings(amazonResponse.data);
        console.log('Amazon import test completed:', result);
        results.amazon = { success: true, data: result };
      } else {
        console.error('Failed to fetch Amazon listings:', amazonResponse);
        results.amazon.error = 'Failed to fetch listings';
      }
    } catch (error) {
      console.error('Error during Amazon import test:', error);
      results.amazon.error = error.message;
    }

    // 2. Test Restock import
    console.log('\n2. Testing Restock import...');
    try {
      const restockImporter = new RestockImporter();
      const result = await restockImporter.import();
      console.log('Restock import test completed:', result);
      results.restock = { success: true, data: result };
    } catch (error) {
      console.error('Error during Restock import test:', error);
      results.restock.error = error.message;
    }

    // 3. Test LS2 import
    console.log('\n3. Testing LS2 import...');
    try {
      const result = await ls2Service.importFile('FlynCycle Inventory.csv');
      console.log('LS2 import test completed:', result);
      results.ls2 = { success: true, data: result };
    } catch (error) {
      console.error('Error during LS2 import test:', error);
      results.ls2.error = error.message;
    }

    // Print final summary
    console.log('\nTest Results Summary:');
    console.log('-------------------');
    console.log('Amazon Import:', results.amazon.success ? 'SUCCESS' : `FAILED - ${results.amazon.error}`);
    console.log('Restock Import:', results.restock.success ? 'SUCCESS' : `FAILED - ${results.restock.error}`);
    console.log('LS2 Import:', results.ls2.success ? 'SUCCESS' : `FAILED - ${results.ls2.error}`);

    // Check if all imports were successful
    const allSuccessful = Object.values(results).every(r => r.success);
    console.log('\nOverall Test Status:', allSuccessful ? 'SUCCESS' : 'FAILED');

    return results;
  } catch (error) {
    console.error('Fatal error during consolidated test:', error);
    throw error;
  }
}

// Run the test if this file is run directly
if (require.main === module) {
  runConsolidatedTest();
}

module.exports = runConsolidatedTest; 
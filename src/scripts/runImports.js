const path = require('path');
const config = require('../config/env');

// Initialize configuration
const initializeConfig = require('../config/init');
initializeConfig();

// Import services after config is initialized
const AmazonService = require('../services/amazon.service');
const LS2Service = require('../services/ls2.service');
const amazonDbService = require('../services/amazonDb.service');
const RestockImporter = require('../services/importers/restock.importer');

async function runImports() {
  try {
    console.log('Starting imports...');
    console.log('Current directory:', process.cwd());
    console.log('Script directory:', __dirname);
    console.log('Looking for .env in:', path.resolve(process.cwd(), '.env'));

    // Debug: Print environment variables
    console.log('\nEnvironment variables:');
    console.log('AMAZON_CLIENT_ID:', process.env.AMAZON_CLIENT_ID ? 'Set' : 'Not set');
    console.log('AMAZON_CLIENT_SECRET:', process.env.AMAZON_CLIENT_SECRET ? 'Set' : 'Not set');
    console.log('AMAZON_REFRESH_TOKEN:', process.env.AMAZON_REFRESH_TOKEN ? 'Set' : 'Not set');
    console.log('ONEDRIVE_CLIENT_ID:', process.env.ONEDRIVE_CLIENT_ID ? 'Set' : 'Not set');
    console.log('ONEDRIVE_CLIENT_SECRET:', process.env.ONEDRIVE_CLIENT_SECRET ? 'Set' : 'Not set');
    console.log('DB_NAME:', process.env.DB_NAME ? 'Set' : 'Not set');
    console.log('DB_USER:', process.env.DB_USER ? 'Set' : 'Not set');

    // Services will validate their own configs when instantiated
    const amazonService = new AmazonService();
    const ls2Service = new LS2Service();
    const restockImporter = new RestockImporter();
    
    console.log('\nStarting all imports in parallel...');
    
    // Run your imports
    const results = await Promise.allSettled([
      amazonService.runImport().then(result => ({ source: 'Amazon', result })),
      ls2Service.runImport().then(result => ({ source: 'LS2', result })),
      restockImporter.import().then(result => ({ source: 'Restock', result }))
    ]);
    
    // Process results
    console.log('\nImport results:');
    results.forEach(result => {
      if (result.status === 'fulfilled') {
        console.log(`✅ ${result.value.source} import completed successfully`);
        console.log(`   Details:`, JSON.stringify(result.value.result, null, 2));
      } else {
        console.error(`❌ ${result.reason?.source || 'Unknown'} import failed:`, result.reason);
      }
    });
    
    console.log('\nAll import processes completed');
  } catch (error) {
    console.error('Import initialization failed:', error);
    process.exit(1);
  }
}

runImports(); 
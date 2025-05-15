const sequelize = require('../config/database');

/**
 * Script to clear all data from restock tables
 * This will delete all records but keep the table structures intact
 */
(async () => {
  try {
    console.log('Starting cleanup of restock tables...');
    
    // Check if --confirm flag is provided
    if (!process.argv.includes('--confirm')) {
      console.log('\nWARNING: This will permanently delete ALL data from the following tables:');
      console.log('- restock_vitals');
      console.log('- restock_info');
      console.log('- restock_cost');
      console.log('\nTo continue, run this script with the --confirm flag');
      process.exit(0);
    }
    
    // Use transaction to ensure data consistency
    await sequelize.transaction(async (transaction) => {
      // Delete records in reverse order of dependencies
      console.log('Deleting records from restock_cost...');
      const costResult = await sequelize.query('DELETE FROM restock_cost', { 
        transaction 
      });
      
      console.log('Deleting records from restock_info...');
      const infoResult = await sequelize.query('DELETE FROM restock_info', { 
        transaction 
      });
      
      console.log('Deleting records from restock_vitals...');
      const vitalsResult = await sequelize.query('DELETE FROM restock_vitals', { 
        transaction 
      });
      
      // Get the counts from the results
      console.log(`Deleted ${costResult[1]} records from restock_cost`);
      console.log(`Deleted ${infoResult[1]} records from restock_info`);
      console.log(`Deleted ${vitalsResult[1]} records from restock_vitals`);
    });
    
    console.log('All restock data has been cleared successfully');
    
    // Reset sequences if needed
    await sequelize.query('ALTER SEQUENCE restock_vitals_id_seq RESTART WITH 1');
    await sequelize.query('ALTER SEQUENCE restock_info_id_seq RESTART WITH 1');
    await sequelize.query('ALTER SEQUENCE restock_cost_id_seq RESTART WITH 1');
    
    console.log('ID sequences have been reset');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing restock data:', error);
    process.exit(1);
  }
})(); 
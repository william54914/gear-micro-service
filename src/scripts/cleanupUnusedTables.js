const sequelize = require('../config/database');
const { QueryTypes } = require('@sequelize/core');

const tablesToKeep = [
  // Amazon tables
  'amazon_vitals',
  'amazon_info',
  'amazon_price',
  'amazon_quantity',
  'amazon_zshop',
  // Restock tables
  'restock_vitals',
  'restock_info',
  'restock_cost',
  // System tables
  'sequelizemeta', // Migration tracking table
  'users' // Keep the users table
];

(async () => {
  try {
    let tables = [];
    
    try {
      const result = await sequelize.query(
        "SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'",
        { type: QueryTypes.SELECT }
      );
      tables = result.map(row => row.tablename);
    } catch (error) {
      console.error('Error listing tables:', error.message);
      process.exit(1);
    }

    console.log('All tables in database:', tables);
    
    // Find tables to delete
    const tablesToDelete = tables.filter(table => !tablesToKeep.includes(table));
    console.log('Tables to delete:', tablesToDelete);
    
    if (tablesToDelete.length === 0) {
      console.log('No tables to delete.');
      process.exit(0);
    }
    
    // Confirmation prompt
    console.log('\nWARNING: This will permanently delete the following tables and all their data:');
    console.log(tablesToDelete.join(', '));
    console.log('\nTo continue, run this script with the --confirm flag');
    
    if (!process.argv.includes('--confirm')) {
      console.log('Operation cancelled. No tables were deleted.');
      process.exit(0);
    }
    
    // Delete tables
    for (const table of tablesToDelete) {
      try {
        console.log(`Dropping table: ${table}`);
        await sequelize.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
        console.log(`Successfully dropped table: ${table}`);
      } catch (error) {
        console.error(`Error dropping table ${table}:`, error.message);
      }
    }
    
    console.log('Cleanup completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
})(); 
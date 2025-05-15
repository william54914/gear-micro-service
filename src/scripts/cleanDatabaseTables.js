const sequelize = require('../config/database');
const fs = require('fs');
const path = require('path');

// Get all model files
const modelDir = path.join(__dirname, '../models');
const modelFiles = fs.readdirSync(modelDir)
  .filter(file => file !== 'index.js' && file.endsWith('.js'))
  .map(file => file.replace('.js', ''));

console.log('Found model files:', modelFiles);

// Define tables to keep based on models
const getTableNameFromModel = (modelName) => {
  // Common naming conventions - adjust as needed for your project
  if (modelName.startsWith('Amazon')) {
    return `amazon_${modelName.substring(6).toLowerCase()}`;
  } else if (modelName.startsWith('Restock')) {
    return `restock_${modelName.substring(7).toLowerCase()}`;
  } else if (modelName === 'User') {
    return 'users';
  }
  return modelName.toLowerCase();
};

const tablesToKeep = [
  ...modelFiles.map(model => getTableNameFromModel(model)),
  'sequelizeMeta', // Keep migration metadata table (lowercase)
  'SequelizeMeta' // Keep migration metadata table (uppercase)
];

console.log('Tables to keep based on models:', tablesToKeep);

(async () => {
  try {
    // Get all tables in the database
    const result = await sequelize.query(
      "SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'",
      { type: sequelize.QueryTypes.SELECT }
    );
    const allTables = result.map(row => row.tablename);
    
    console.log('All tables in database:', allTables);
    
    // Find tables to delete
    const tablesToDelete = allTables.filter(table => !tablesToKeep.includes(table));
    console.log('Tables to delete (no matching model):', tablesToDelete);
    
    if (tablesToDelete.length === 0) {
      console.log('No tables to delete. Database is already clean.');
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
    
    // Drop tables
    for (const table of tablesToDelete) {
      try {
        console.log(`Dropping table: ${table}`);
        await sequelize.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
        console.log(`Successfully dropped table: ${table}`);
      } catch (error) {
        console.error(`Error dropping table ${table}:`, error.message);
      }
    }
    
    console.log('Database cleanup completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
})(); 
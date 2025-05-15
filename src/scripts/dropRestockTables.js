const sequelize = require('../config/database');

const tablesToDrop = [
  'restock_item_images',
  'restock_item_tags',
  'restock_items',
  'restock_supplier_info',
  'restock_tags'
];

(async () => {
  try {
    console.log('Starting to drop existing restock tables...');

    // Check if --confirm flag is provided
    if (!process.argv.includes('--confirm')) {
      console.log('\nWARNING: This will permanently delete the following tables and all their data:');
      console.log(tablesToDrop.join(', '));
      console.log('\nTo continue, run this script with the --confirm flag');
      process.exit(0);
    }

    // Drop tables in correct order to avoid FK constraints
    for (const table of tablesToDrop) {
      try {
        console.log(`Dropping table: ${table}`);
        await sequelize.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
        console.log(`Successfully dropped table: ${table}`);
      } catch (error) {
        console.error(`Error dropping table ${table}:`, error.message);
      }
    }

    console.log('Completed dropping restock tables.');
    process.exit(0);
  } catch (error) {
    console.error('Error during table cleanup:', error);
    process.exit(1);
  }
})(); 
const sequelize = require('../config/database');
const path = require('path');
const { Umzug, SequelizeStorage } = require('umzug');

const tablesToDrop = [
  'restock_item_images',
  'restock_item_tags',
  'restock_items',
  'restock_supplier_info',
  'restock_tags'
];

// Set up Umzug migrator
const umzug = new Umzug({
  migrations: { 
    glob: path.join(__dirname, '../migrations/20240610_create_restock_tables.js'),
    resolve: ({ name, path, context }) => {
      const migration = require(path);
      return {
        name,
        up: async () => migration.up(context.queryInterface, context.sequelize),
        down: async () => migration.down(context.queryInterface, context.sequelize),
      };
    },
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

(async () => {
  try {
    console.log('Starting restock tables rebuild process...');

    // Check if --confirm flag is provided
    if (!process.argv.includes('--confirm')) {
      console.log('\nWARNING: This will permanently delete the following tables and all their data:');
      console.log(tablesToDrop.join(', '));
      console.log('\nThis will also create new restock_vitals, restock_info, and restock_cost tables.');
      console.log('\nTo continue, run this script with the --confirm flag');
      process.exit(0);
    }

    // Drop existing restock tables
    console.log('Dropping existing restock tables...');
    for (const table of tablesToDrop) {
      try {
        console.log(`Dropping table: ${table}`);
        await sequelize.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
        console.log(`Successfully dropped table: ${table}`);
      } catch (error) {
        console.error(`Error dropping table ${table}:`, error.message);
      }
    }
    
    console.log('Completed dropping old restock tables.');

    // Run migration to create new tables
    console.log('\nStarting migration to create new restock tables...');
    const migrations = await umzug.up();
    console.log('Migration completed successfully');
    console.log('Migration applied:', migrations.map(m => m.name).join(', '));

    console.log('\nRestock tables rebuild process completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error during rebuild process:', error);
    process.exit(1);
  }
})(); 
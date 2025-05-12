const sequelize = require('../config/database');
const { Umzug, SequelizeStorage } = require('umzug');
const path = require('path');

const umzug = new Umzug({
  migrations: { 
    glob: path.join(__dirname, '../migrations/*.js'),
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

// Run migrations
(async () => {
  try {
    console.log('Starting database migrations...');
    const migrations = await umzug.up();
    console.log('Migrations completed successfully');
    console.log('Migrations applied:', migrations.map(m => m.name).join(', '));
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
})(); 
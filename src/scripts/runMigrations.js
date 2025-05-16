const path = require('path');
const { Sequelize } = require('sequelize');
const { Umzug, SequelizeStorage } = require('umzug');
const sequelize = require('../config/database');

async function runMigrations() {
  try {
    console.log('Starting migrations...');

    const umzug = new Umzug({
      migrations: {
        glob: 'src/migrations/*.js',
        resolve: ({ name, path, context }) => {
          const migration = require(path);
          return {
            name,
            up: async () => migration.up(context, Sequelize),
            down: async () => migration.down(context, Sequelize),
          };
        },
      },
      context: sequelize.getQueryInterface(),
      storage: new SequelizeStorage({ sequelize }),
      logger: console,
    });

    // Make sure we're connected to the database
    await sequelize.authenticate();
    console.log('Database connection established.');

    console.log('Running pending migrations...');
    const migrations = await umzug.up();
    
    console.log('Migrations completed successfully.');
    console.log('Applied migrations:', migrations.map(m => m.name));

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Error running migrations:', error);
    if (sequelize) {
      await sequelize.close();
    }
    process.exit(1);
  }
}

runMigrations(); 
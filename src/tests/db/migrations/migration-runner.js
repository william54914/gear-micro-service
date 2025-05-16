const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../../.env') });
const { Umzug, SequelizeStorage } = require('umzug');
const sequelize = require('../../../config/database');

class MigrationRunner {
  constructor() {
    this.umzug = new Umzug({
      migrations: {
        glob: path.join(__dirname, './**/*.js'),
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
  }

  async runPending() {
    try {
      console.log('Running pending migrations...');
      const pending = await this.umzug.pending();
      
      if (pending.length === 0) {
        console.log('No pending migrations found.');
        return { success: true, message: 'No pending migrations' };
      }

      console.log('Pending migrations:', pending.map(m => m.name).join(', '));
      const migrations = await this.umzug.up();
      
      console.log('Successfully ran migrations:', migrations.map(m => m.name).join(', '));
      return { 
        success: true, 
        message: 'Migrations completed successfully',
        migrations: migrations.map(m => m.name)
      };
    } catch (error) {
      console.error('Error running migrations:', error);
      return { success: false, error: error.message };
    }
  }

  async rollback(steps = 1) {
    try {
      console.log(`Rolling back ${steps} migration(s)...`);
      const migrations = await this.umzug.down({ step: steps });
      
      console.log('Successfully rolled back migrations:', migrations.map(m => m.name).join(', '));
      return { 
        success: true, 
        message: 'Rollback completed successfully',
        migrations: migrations.map(m => m.name)
      };
    } catch (error) {
      console.error('Error rolling back migrations:', error);
      return { success: false, error: error.message };
    }
  }

  async listMigrations() {
    try {
      const [executed, pending] = await Promise.all([
        this.umzug.executed(),
        this.umzug.pending()
      ]);

      return {
        success: true,
        data: {
          executed: executed.map(m => m.name),
          pending: pending.map(m => m.name)
        }
      };
    } catch (error) {
      console.error('Error listing migrations:', error);
      return { success: false, error: error.message };
    }
  }
}

// Run if called directly
if (require.main === module) {
  const runner = new MigrationRunner();
  const command = process.argv[2];
  const steps = parseInt(process.argv[3]) || 1;

  switch (command) {
    case 'up':
      runner.runPending();
      break;
    case 'down':
      runner.rollback(steps);
      break;
    case 'list':
      runner.listMigrations().then(result => {
        if (result.success) {
          console.log('\nExecuted migrations:', result.data.executed.join('\n  '));
          console.log('\nPending migrations:', result.data.pending.join('\n  '));
        }
      });
      break;
    default:
      console.log('Usage: node migration-runner.js [up|down|list] [steps]');
      process.exit(1);
  }
}

module.exports = MigrationRunner; 
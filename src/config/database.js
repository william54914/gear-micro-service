const { Sequelize } = require('sequelize');
const config = require('./env');

// Skip validation in test environment
if (process.env.NODE_ENV !== 'test') {
  // Validate database environment variables
  if (!config.database.name || !config.database.user || !config.database.password) {
    throw new Error('Missing required database configuration');
  }
}

const sequelize = process.env.NODE_ENV === 'test' 
  ? new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false
    })
  : new Sequelize({
      database: config.database.name,
      username: config.database.user,
      password: config.database.password,
      host: config.database.host || 'localhost',
      port: config.database.port || 5432,
      dialect: config.database.dialect || 'postgres',
      logging: config.database.logging || false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    });

module.exports = sequelize;
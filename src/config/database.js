const { Sequelize } = require('@sequelize/core');
const { PostgresDialect } = require('@sequelize/postgres');
require('dotenv').config();

const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: PostgresDialect,
  logging: false
});

module.exports = sequelize;
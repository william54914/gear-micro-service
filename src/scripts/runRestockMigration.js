const sequelize = require('../config/database');
const { DataTypes } = require('@sequelize/core');

// Create tables directly without using migrations
(async () => {
  try {
    console.log('Creating restock tables directly...');
    
    // Create restock_vitals table
    console.log('Creating restock_vitals table...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS restock_vitals (
        id SERIAL PRIMARY KEY,
        sku VARCHAR(255) NOT NULL UNIQUE,
        fnsku VARCHAR(255),
        product_name VARCHAR(255),
        asin VARCHAR(255),
        status VARCHAR(255),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    console.log('restock_vitals table created successfully');

    // Create restock_info table
    console.log('Creating restock_info table...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS restock_info (
        id SERIAL PRIMARY KEY,
        sku VARCHAR(255) NOT NULL UNIQUE,
        msku VARCHAR(255),
        supplier VARCHAR(255),
        upc VARCHAR(255),
        pan VARCHAR(255),
        tag1 VARCHAR(255),
        tag2 VARCHAR(255),
        tag3 VARCHAR(255),
        tag4 VARCHAR(255),
        tag5 VARCHAR(255),
        tag6 VARCHAR(255),
        tag7 VARCHAR(255),
        tag8 VARCHAR(255),
        tag9 VARCHAR(255),
        tag10 VARCHAR(255),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_restock_info_vitals
          FOREIGN KEY (sku)
          REFERENCES restock_vitals(sku)
          ON UPDATE CASCADE
          ON DELETE CASCADE
      )
    `);
    console.log('restock_info table created successfully');

    // Create restock_cost table
    console.log('Creating restock_cost table...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS restock_cost (
        id SERIAL PRIMARY KEY,
        sku VARCHAR(255) NOT NULL UNIQUE,
        cost DECIMAL(10,2),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_restock_cost_vitals
          FOREIGN KEY (sku)
          REFERENCES restock_vitals(sku)
          ON UPDATE CASCADE
          ON DELETE CASCADE
      )
    `);
    console.log('restock_cost table created successfully');

    console.log('All restock tables created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating tables:', error);
    process.exit(1);
  }
})(); 
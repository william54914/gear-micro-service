const sequelize = require('../config/database');
const { QueryTypes } = require('@sequelize/core');

async function checkSchema() {
  try {
    console.log('Checking Amazon tables schema...');
    
    // Check amazon_vitals schema
    const vitalsColumns = await sequelize.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'amazon_vitals'
      ORDER BY ordinal_position
    `, { type: QueryTypes.SELECT });
    
    console.log('Amazon Vitals columns:');
    vitalsColumns.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type}`);
    });
    
    // Check amazon_info schema
    const infoColumns = await sequelize.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'amazon_info'
      ORDER BY ordinal_position
    `, { type: QueryTypes.SELECT });
    
    console.log('\nAmazon Info columns:');
    infoColumns.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type}`);
    });
    
    // Get sample data
    const vitalsData = await sequelize.query(`
      SELECT * FROM amazon_vitals LIMIT 3
    `, { type: QueryTypes.SELECT });
    
    console.log('\nAmazon Vitals sample data:');
    vitalsData.forEach((record, index) => {
      console.log(`\nRecord ${index + 1}:`);
      Object.entries(record).forEach(([key, value]) => {
        console.log(`- ${key}: ${value || '(empty)'}`);
      });
    });
    
    const infoData = await sequelize.query(`
      SELECT * FROM amazon_info LIMIT 3
    `, { type: QueryTypes.SELECT });
    
    console.log('\nAmazon Info sample data:');
    infoData.forEach((record, index) => {
      console.log(`\nRecord ${index + 1}:`);
      Object.entries(record).forEach(([key, value]) => {
        console.log(`- ${key}: ${value || '(empty)'}`);
      });
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking schema:', error);
    process.exit(1);
  }
}

checkSchema(); 
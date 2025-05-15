// Simple script to check database tables
const sequelize = require('../config/database');
const { QueryTypes } = require('@sequelize/core');

async function simpleCheck() {
  try {
    console.log('Starting simple database check...');
    
    // Check restock records
    const [restockCount] = await sequelize.query(
      'SELECT COUNT(*) as count FROM restock_vitals',
      { type: QueryTypes.SELECT }
    );
    
    console.log(`Restock records: ${restockCount.count}`);
    
    // Check Amazon records
    const [amazonCount] = await sequelize.query(
      'SELECT COUNT(*) as count FROM amazon_vitals',
      { type: QueryTypes.SELECT }
    );
    
    console.log(`Amazon records: ${amazonCount.count}`);
    
    // Get restock status counts
    const restockStatuses = await sequelize.query(
      'SELECT status, COUNT(*) as count FROM restock_vitals GROUP BY status',
      { type: QueryTypes.SELECT }
    );
    
    console.log('Restock status breakdown:');
    restockStatuses.forEach(row => {
      console.log(`- ${row.status}: ${row.count}`);
    });
    
    // Get Amazon status counts
    const amazonStatuses = await sequelize.query(
      'SELECT status, COUNT(*) as count FROM amazon_vitals GROUP BY status',
      { type: QueryTypes.SELECT }
    );
    
    console.log('Amazon status breakdown:');
    amazonStatuses.forEach(row => {
      console.log(`- ${row.status}: ${row.count}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking database:', error);
    process.exit(1);
  }
}

simpleCheck(); 
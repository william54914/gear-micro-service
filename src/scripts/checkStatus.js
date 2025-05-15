const sequelize = require('../config/database');
const { QueryTypes } = require('@sequelize/core');

async function checkStatus() {
  try {
    console.log('Checking status counts...');
    
    // Get status counts for restock items
    const restockStatusCounts = await sequelize.query(
      'SELECT status, COUNT(*) as count FROM restock_vitals GROUP BY status',
      { type: QueryTypes.SELECT }
    );
    
    console.log('Restock Status Counts:');
    console.log(restockStatusCounts);
    
    // Get status counts for Amazon items
    const amazonStatusCounts = await sequelize.query(
      'SELECT status, COUNT(*) as count FROM amazon_vitals GROUP BY status',
      { type: QueryTypes.SELECT }
    );
    
    console.log('\nAmazon Status Counts:');
    console.log(amazonStatusCounts);
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking status:', error);
    process.exit(1);
  }
}

checkStatus(); 
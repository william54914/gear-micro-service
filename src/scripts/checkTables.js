const { 
  AmazonVitals, 
  AmazonInfo, 
  AmazonPrice, 
  AmazonQuantity,
  AmazonZShop,
  RestockVitals,
  RestockInfo,
  RestockCost
} = require('../models');
const sequelize = require('../config/database');
const { QueryTypes } = require('@sequelize/core');

async function checkTables() {
  try {
    console.log('Checking record counts in all tables...');
    
    // Amazon tables
    const amazonVitalsCount = await AmazonVitals.count();
    const amazonInfoCount = await AmazonInfo.count();
    const amazonPriceCount = await AmazonPrice.count();
    const amazonQuantityCount = await AmazonQuantity.count();
    const amazonZShopCount = await AmazonZShop.count();
    
    console.log('Amazon Tables:');
    console.log(`- AmazonVitals: ${amazonVitalsCount}`);
    console.log(`- AmazonInfo: ${amazonInfoCount}`);
    console.log(`- AmazonPrice: ${amazonPriceCount}`);
    console.log(`- AmazonQuantity: ${amazonQuantityCount}`);
    console.log(`- AmazonZShop: ${amazonZShopCount}`);
    
    // Restock tables
    const restockVitalsCount = await RestockVitals.count();
    const restockInfoCount = await RestockInfo.count();
    const restockCostCount = await RestockCost.count();
    
    console.log('Restock Tables:');
    console.log(`- RestockVitals: ${restockVitalsCount}`);
    console.log(`- RestockInfo: ${restockInfoCount}`);
    console.log(`- RestockCost: ${restockCostCount}`);
    
    // Status counts
    const amazonStatusCounts = await sequelize.query(
      'SELECT status, COUNT(*) as count FROM amazon_vitals GROUP BY status',
      { type: QueryTypes.SELECT }
    );
    
    const restockStatusCounts = await sequelize.query(
      'SELECT status, COUNT(*) as count FROM restock_vitals GROUP BY status',
      { type: QueryTypes.SELECT }
    );
    
    console.log('\nAmazon Status Counts:');
    console.log(amazonStatusCounts);
    
    console.log('\nRestock Status Counts:');
    console.log(restockStatusCounts);
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking tables:', error);
    process.exit(1);
  }
}

checkTables(); 
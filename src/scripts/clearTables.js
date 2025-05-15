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

async function clearTables() {
  try {
    console.log('Starting to clear all tables...');
    
    await sequelize.transaction(async (transaction) => {
      // Clear Amazon tables
      await AmazonVitals.truncate({ cascade: true, transaction });
      await AmazonInfo.truncate({ cascade: true, transaction });
      await AmazonPrice.truncate({ cascade: true, transaction });
      await AmazonQuantity.truncate({ cascade: true, transaction });
      await AmazonZShop.truncate({ cascade: true, transaction });
      
      console.log('Amazon tables cleared successfully');
      
      // Clear Restock tables
      await RestockVitals.truncate({ cascade: true, transaction });
      await RestockInfo.truncate({ cascade: true, transaction });
      await RestockCost.truncate({ cascade: true, transaction });
      
      console.log('Restock tables cleared successfully');
    });
    
    console.log('All tables cleared successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing tables:', error);
    process.exit(1);
  }
}

clearTables(); 
const { 
  AmazonVitals, 
  AmazonInfo, 
  AmazonPrice, 
  AmazonQuantity,
  AmazonZShop
} = require('../models');
const sequelize = require('../config/database');

async function clearAmazonTables() {
  try {
    console.log('Starting to clear Amazon tables...');
    
    await sequelize.transaction(async (transaction) => {
      // Clear Amazon tables
      await AmazonVitals.truncate({ cascade: true, transaction });
      await AmazonInfo.truncate({ cascade: true, transaction });
      await AmazonPrice.truncate({ cascade: true, transaction });
      await AmazonQuantity.truncate({ cascade: true, transaction });
      await AmazonZShop.truncate({ cascade: true, transaction });
      
      console.log('Amazon tables cleared successfully');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error clearing Amazon tables:', error);
    process.exit(1);
  }
}

clearAmazonTables(); 
const sequelize = require('../config/database');
const { QueryTypes } = require('@sequelize/core');

async function checkAmazonFields() {
  try {
    console.log('Checking Amazon product ID mapping...');
    
    // Get sample records to see ID mappings with correct column names
    const amazonSamples = await sequelize.query(`
      SELECT 
        av.seller_sku, 
        av.asin, 
        ai.product_id,
        ai.asin1
      FROM amazon_vitals av
      JOIN amazon_info ai ON av.seller_sku = ai.seller_sku
      LIMIT 10
    `, { type: QueryTypes.SELECT });
    
    console.log('Amazon ID mapping samples:');
    amazonSamples.forEach((record, index) => {
      console.log(`\nRecord ${index + 1}:`);
      console.log(`- seller_sku: ${record.seller_sku}`);
      console.log(`- asin in vitals: ${record.asin || '(empty)'}`);
      console.log(`- product_id in info: ${record.product_id || '(empty)'}`);
      console.log(`- asin1 in info: ${record.asin1 || '(empty)'}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking Amazon fields:', error);
    process.exit(1);
  }
}

checkAmazonFields(); 
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../../.env') });
const { Pool } = require('pg');

async function validateAmazonFields() {
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    console.log('Starting Amazon fields validation...');
    const client = await pool.connect();

    try {
      // Check required fields in amazon_listings
      const listingFields = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'amazon_listings'
        ORDER BY ordinal_position;
      `);

      console.log('\nAmazon Listings Fields:');
      listingFields.rows.forEach(field => {
        console.log(`${field.column_name}: ${field.data_type} ${field.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });

      // Check for missing required fields
      const { rows: missingRequired } = await client.query(`
        SELECT COUNT(*) as count
        FROM amazon_listings
        WHERE sku IS NULL 
           OR asin IS NULL 
           OR product_name IS NULL;
      `);

      console.log(`\nRecords with missing required fields: ${missingRequired[0].count}`);

      // Check for invalid prices
      const { rows: invalidPrices } = await client.query(`
        SELECT COUNT(*) as count
        FROM amazon_listings
        WHERE price < 0 OR business_price < 0;
      `);

      console.log(`Records with invalid prices: ${invalidPrices[0].count}`);

      // Check for duplicate SKUs
      const { rows: duplicates } = await client.query(`
        SELECT sku, COUNT(*) as count
        FROM amazon_listings
        GROUP BY sku
        HAVING COUNT(*) > 1;
      `);

      if (duplicates.length > 0) {
        console.log('\nDuplicate SKUs found:');
        duplicates.forEach(dup => {
          console.log(`SKU: ${dup.sku}, Count: ${dup.count}`);
        });
      } else {
        console.log('\nNo duplicate SKUs found');
      }

      return {
        success: true,
        data: {
          fields: listingFields.rows,
          missingRequired: missingRequired[0].count,
          invalidPrices: invalidPrices[0].count,
          duplicates: duplicates
        }
      };
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Amazon fields validation error:', error);
    return { success: false, error: error.message };
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  validateAmazonFields();
}

module.exports = validateAmazonFields; 
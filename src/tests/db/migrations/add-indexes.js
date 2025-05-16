const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../../.env') });
const { Pool } = require('pg');

async function addIndexes() {
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    console.log('Starting index creation...');
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Add indexes for vendor products
      console.log('Adding indexes for vendor_products...');
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_vendor_products_vendor_id ON vendor_products(vendor_id);
        CREATE INDEX IF NOT EXISTS idx_vendor_products_product_id ON vendor_products(product_id);
        CREATE INDEX IF NOT EXISTS idx_vendor_products_vendor_sku ON vendor_products(vendor_sku);
      `);

      // Add indexes for amazon listings
      console.log('Adding indexes for amazon_listings...');
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_amazon_listings_sku ON amazon_listings(sku);
        CREATE INDEX IF NOT EXISTS idx_amazon_listings_asin ON amazon_listings(asin);
      `);

      // Add indexes for inventory tables
      console.log('Adding indexes for inventory tables...');
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_vendor_inventory_product_id ON vendor_inventory(vendor_product_id);
        CREATE INDEX IF NOT EXISTS idx_amazon_inventory_listing_id ON amazon_inventory(listing_id);
      `);

      // Add indexes for pricing tables
      console.log('Adding indexes for pricing tables...');
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_vendor_pricing_product_id ON vendor_pricing(vendor_product_id);
        CREATE INDEX IF NOT EXISTS idx_amazon_pricing_listing_id ON amazon_pricing(listing_id);
      `);

      // Add indexes for user tables
      console.log('Adding indexes for user tables...');
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_permissions_role_id ON user_permissions(role_id);
      `);

      await client.query('COMMIT');
      console.log('Index creation completed successfully');
      return { success: true, message: 'Indexes created successfully' };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Index creation error:', error);
    return { success: false, error: error.message };
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  addIndexes();
}

module.exports = addIndexes; 
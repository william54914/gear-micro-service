const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../../.env') });
const { Pool } = require('pg');

async function updateAllStatuses() {
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    console.log('Starting status update for all records...');
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Update vendor statuses based on their products
      console.log('\nUpdating vendor statuses...');
      const { rowCount: vendorUpdates } = await client.query(`
        UPDATE vendors v
        SET active = EXISTS (
          SELECT 1 
          FROM vendor_products vp 
          WHERE vp.vendor_id = v.vendor_id 
          AND vp.active = true
        );
      `);
      console.log(`Updated ${vendorUpdates} vendor statuses`);

      // Update product statuses based on vendor products
      console.log('\nUpdating product statuses...');
      const { rowCount: productUpdates } = await client.query(`
        UPDATE products p
        SET active = EXISTS (
          SELECT 1 
          FROM vendor_products vp 
          WHERE vp.product_id = p.product_id 
          AND vp.active = true
        );
      `);
      console.log(`Updated ${productUpdates} product statuses`);

      // Update brand statuses based on active products
      console.log('\nUpdating brand statuses...');
      const { rowCount: brandUpdates } = await client.query(`
        UPDATE brands b
        SET active = EXISTS (
          SELECT 1 
          FROM products p 
          WHERE p.brand_id = b.brand_id 
          AND p.active = true
        );
      `);
      console.log(`Updated ${brandUpdates} brand statuses`);

      // Update vendor product statuses based on inventory
      console.log('\nUpdating vendor product statuses...');
      const { rowCount: vpUpdates } = await client.query(`
        UPDATE vendor_products vp
        SET active = EXISTS (
          SELECT 1 
          FROM vendor_inventory vi 
          WHERE vi.vendor_product_id = vp.vendor_product_id 
          AND vi.quantity > 0
        );
      `);
      console.log(`Updated ${vpUpdates} vendor product statuses`);

      // Get summary of active records
      const { rows: [summary] } = await client.query(`
        SELECT
          (SELECT COUNT(*) FROM vendors WHERE active = true) as active_vendors,
          (SELECT COUNT(*) FROM products WHERE active = true) as active_products,
          (SELECT COUNT(*) FROM brands WHERE active = true) as active_brands,
          (SELECT COUNT(*) FROM vendor_products WHERE active = true) as active_vendor_products;
      `);

      console.log('\nActive Records Summary:');
      console.log('- Vendors:', summary.active_vendors);
      console.log('- Products:', summary.active_products);
      console.log('- Brands:', summary.active_brands);
      console.log('- Vendor Products:', summary.active_vendor_products);

      await client.query('COMMIT');
      console.log('\nStatus updates completed successfully');

      return {
        success: true,
        data: {
          vendorUpdates,
          productUpdates,
          brandUpdates,
          vpUpdates,
          summary
        }
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Status update error:', error);
    return { success: false, error: error.message };
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  updateAllStatuses();
}

module.exports = updateAllStatuses; 
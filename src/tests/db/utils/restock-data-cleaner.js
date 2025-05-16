const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../../.env') });
const { Pool } = require('pg');

async function cleanRestockData() {
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    console.log('Starting Restock data cleanup...');
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get vendor_id for Restock
      const { rows: [restock] } = await client.query(
        'SELECT vendor_id FROM vendors WHERE vendor_name = $1',
        ['Restock']
      );

      if (!restock) {
        throw new Error('Restock vendor not found');
      }

      // Clean vendor-related tables for Restock products
      const vendorTables = [
        'vendor_dimensions',
        'vendor_distributor_info',
        'vendor_images',
        'vendor_attributes',
        'vendor_pricing',
        'vendor_inventory',
        'vendor_products'
      ];

      for (const table of vendorTables) {
        const { rowCount } = await client.query(
          `DELETE FROM ${table} 
           WHERE vendor_product_id IN (
             SELECT vendor_product_id 
             FROM vendor_products 
             WHERE vendor_id = $1
           )`,
          [restock.vendor_id]
        );
        console.log(`Cleaned ${rowCount} records from ${table}`);
      }

      // Clean products that are only associated with Restock
      const { rowCount: productsDeleted } = await client.query(`
        DELETE FROM products
        WHERE product_id IN (
          SELECT p.product_id
          FROM products p
          LEFT JOIN vendor_products vp ON p.product_id = vp.product_id
          GROUP BY p.product_id
          HAVING COUNT(vp.vendor_product_id) = 0
        )`);
      console.log(`Cleaned ${productsDeleted} orphaned products`);

      await client.query('COMMIT');
      console.log('Restock data cleanup completed successfully');
      return { success: true, message: 'Restock data cleanup completed successfully' };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Restock data cleanup error:', error);
    return { success: false, error: error.message };
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  cleanRestockData();
}

module.exports = cleanRestockData; 
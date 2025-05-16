const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../../.env') });
const { Pool } = require('pg');

async function dropRestockTables() {
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    console.log('Starting Restock tables drop...');
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

      // Drop related data in the correct order
      const tables = [
        'vendor_dimensions',
        'vendor_distributor_info',
        'vendor_images',
        'vendor_attributes',
        'vendor_pricing',
        'vendor_inventory',
        'vendor_products'
      ];

      for (const table of tables) {
        const { rowCount } = await client.query(`
          DELETE FROM ${table}
          WHERE vendor_product_id IN (
            SELECT vendor_product_id
            FROM vendor_products
            WHERE vendor_id = $1
          )
        `, [restock.vendor_id]);
        console.log(`Deleted ${rowCount} records from ${table}`);
      }

      // Delete the Restock vendor
      const { rowCount } = await client.query(
        'DELETE FROM vendors WHERE vendor_id = $1',
        [restock.vendor_id]
      );
      console.log(`Deleted Restock vendor: ${rowCount} record`);

      await client.query('COMMIT');
      console.log('Restock tables drop completed successfully');
      return { success: true, message: 'Restock tables dropped successfully' };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Restock tables drop error:', error);
    return { success: false, error: error.message };
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  dropRestockTables();
}

module.exports = dropRestockTables; 
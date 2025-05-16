const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../../.env') });
const { Pool } = require('pg');

async function cleanAmazonTables() {
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    console.log('Starting Amazon tables cleanup...');
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Clean Amazon-specific tables in the correct order
      const tables = [
        'amazon_dimensions',
        'amazon_categories',
        'amazon_shipping',
        'amazon_fees',
        'amazon_pricing',
        'amazon_inventory',
        'amazon_listings'
      ];

      for (const table of tables) {
        const { rowCount } = await client.query(`DELETE FROM ${table}`);
        console.log(`Cleaned ${rowCount} records from ${table}`);
      }

      await client.query('COMMIT');
      console.log('Amazon tables cleanup completed successfully');
      return { success: true, message: 'Amazon tables cleanup completed successfully' };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Amazon tables cleanup error:', error);
    return { success: false, error: error.message };
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  cleanAmazonTables();
}

module.exports = cleanAmazonTables; 
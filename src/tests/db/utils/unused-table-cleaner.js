const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../../.env') });
const { Pool } = require('pg');

async function cleanupUnusedTables() {
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    console.log('Starting unused tables cleanup...');
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get all tables in the database
      const { rows: tables } = await client.query(`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY tablename;
      `);

      // Tables that should be kept
      const coreTables = [
        'vendors',
        'brands',
        'products',
        'vendor_products',
        'vendor_inventory',
        'vendor_pricing',
        'vendor_attributes',
        'vendor_images',
        'vendor_dimensions',
        'vendor_distributor_info',
        'amazon_listings',
        'amazon_inventory',
        'amazon_pricing',
        'amazon_fees',
        'amazon_shipping',
        'amazon_categories',
        'amazon_dimensions',
        'users',
        'user_roles',
        'user_permissions',
        'schema_migrations'
      ];

      // Find unused tables
      const unusedTables = tables
        .map(t => t.tablename)
        .filter(table => !coreTables.includes(table) && !table.startsWith('pg_'));

      if (unusedTables.length === 0) {
        console.log('No unused tables found');
        return { success: true, message: 'No unused tables found' };
      }

      // Drop unused tables in reverse order to handle dependencies
      for (const table of unusedTables.reverse()) {
        // Get row count before dropping
        const { rows: [{ count }] } = await client.query(
          `SELECT COUNT(*) as count FROM "${table}"`
        );

        // Drop the table
        await client.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
        console.log(`Dropped table ${table} (had ${count} records)`);
      }

      await client.query('COMMIT');
      console.log('Unused tables cleanup completed successfully');
      return { 
        success: true, 
        message: 'Unused tables cleanup completed successfully',
        droppedTables: unusedTables
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Unused tables cleanup error:', error);
    return { success: false, error: error.message };
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  cleanupUnusedTables();
}

module.exports = cleanupUnusedTables; 
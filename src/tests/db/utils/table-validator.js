const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../../.env') });
const { Pool } = require('pg');

async function validateTables() {
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    console.log('Starting database table validation...');
    const client = await pool.connect();

    try {
      // Check if all required tables exist
      const requiredTables = [
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
        'user_permissions'
      ];

      const { rows: existingTables } = await client.query(`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        AND tablename NOT LIKE 'pg_%';
      `);

      const existingTableNames = existingTables.map(t => t.tablename);
      const missingTables = requiredTables.filter(t => !existingTableNames.includes(t));

      if (missingTables.length > 0) {
        console.log('Missing required tables:', missingTables.join(', '));
      }

      // Check table row counts
      console.log('\nTable row counts:');
      for (const table of existingTableNames) {
        const { rows: [{ count }] } = await client.query(`
          SELECT COUNT(*) as count FROM "${table}";
        `);
        console.log(`${table}: ${count} rows`);
      }

      // Check foreign key constraints
      const { rows: foreignKeys } = await client.query(`
        SELECT
          tc.table_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY';
      `);

      // Check for orphaned foreign key references
      console.log('\nChecking foreign key constraints:');
      for (const fk of foreignKeys) {
        const { rows: [{ violations }] } = await client.query(`
          SELECT COUNT(*) as violations
          FROM "${fk.table_name}" t1
          LEFT JOIN "${fk.foreign_table_name}" t2
            ON t1."${fk.column_name}" = t2."${fk.foreign_column_name}"
          WHERE t1."${fk.column_name}" IS NOT NULL
            AND t2."${fk.foreign_column_name}" IS NULL;
        `);

        if (violations > 0) {
          console.log(`Found ${violations} orphaned references in ${fk.table_name}.${fk.column_name}`);
        }
      }

      return {
        success: true,
        data: {
          existingTables: existingTableNames,
          missingTables,
          foreignKeys
        }
      };
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Table validation error:', error);
    return { success: false, error: error.message };
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  validateTables();
}

module.exports = validateTables; 
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../../.env') });
const { Pool } = require('pg');

async function cleanTables() {
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    console.log('Starting database tables cleanup...');
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

      // Clean tables in reverse order to handle foreign key constraints
      const reversedTables = tables.map(t => t.tablename).reverse();

      for (const table of reversedTables) {
        // Skip system tables and migration tables
        if (table.startsWith('pg_') || table === 'schema_migrations') {
          continue;
        }

        // Get row count before cleaning
        const { rows: [{ count: beforeCount }] } = await client.query(
          `SELECT COUNT(*) as count FROM "${table}"`
        );

        // Delete inactive records if table has active column
        const { rows: columns } = await client.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = $1 
          AND column_name = 'active';
        `, [table]);

        if (columns.length > 0) {
          const { rowCount } = await client.query(`
            DELETE FROM "${table}"
            WHERE active = false;
          `);
          console.log(`Cleaned ${rowCount} inactive records from ${table}`);
        }

        // Get row count after cleaning
        const { rows: [{ count: afterCount }] } = await client.query(
          `SELECT COUNT(*) as count FROM "${table}"`
        );

        console.log(`Table ${table}: ${beforeCount} records before, ${afterCount} records after cleaning`);
      }

      await client.query('COMMIT');
      console.log('Database tables cleanup completed successfully');
      return { success: true, message: 'Database tables cleanup completed successfully' };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database tables cleanup error:', error);
    return { success: false, error: error.message };
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  cleanTables();
}

module.exports = cleanTables; 
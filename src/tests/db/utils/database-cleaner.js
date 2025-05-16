const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../../.env') });
const { Pool } = require('pg');

async function cleanDatabaseTables() {
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    console.log('Starting database cleanup...');
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

      // Clean each table
      for (const table of tables) {
        const tableName = table.tablename;
        
        // Get row count
        const { rows: countResult } = await client.query(`
          SELECT COUNT(*) as count FROM "${tableName}";
        `);
        const rowCount = parseInt(countResult[0].count);

        // Get active records count if table has active column
        const { rows: columns } = await client.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = $1 
          AND column_name = 'active';
        `, [tableName]);

        if (columns.length > 0) {
          const { rows: activeCount } = await client.query(`
            SELECT COUNT(*) as count 
            FROM "${tableName}" 
            WHERE active = true;
          `);
          console.log(`Table ${tableName}: ${rowCount} total rows, ${activeCount[0].count} active`);
        } else {
          console.log(`Table ${tableName}: ${rowCount} total rows`);
        }

        // Clean inactive records if applicable
        if (columns.length > 0) {
          const { rowCount: deleted } = await client.query(`
            DELETE FROM "${tableName}"
            WHERE active = false;
          `);
          if (deleted > 0) {
            console.log(`Cleaned ${deleted} inactive records from ${tableName}`);
          }
        }
      }

      await client.query('COMMIT');
      console.log('Database cleanup completed successfully');
      return { success: true, message: 'Database cleanup completed successfully' };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database cleanup error:', error);
    return { success: false, error: error.message };
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  cleanDatabaseTables();
}

module.exports = cleanDatabaseTables; 
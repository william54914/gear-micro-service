const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../../.env') });
const fs = require('fs').promises;
const { Pool } = require('pg');

async function truncateTables() {
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    console.log('Reading truncate SQL script...');
    const sqlPath = path.join(__dirname, '../sql/truncate_tables.sql');
    const sqlContent = await fs.readFile(sqlPath, 'utf8');

    console.log('Executing truncate operations...');
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      const statements = sqlContent.split(';').filter(stmt => stmt.trim());
      
      for (const statement of statements) {
        if (statement.trim()) {
          await client.query(statement);
          console.log('Executed:', statement.trim().split('\n')[0]);
        }
      }
      
      await client.query('COMMIT');
      console.log('All tables truncated successfully');
      return { success: true, message: 'All tables truncated successfully' };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error truncating tables:', error);
    return { success: false, error: error.message };
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  truncateTables();
}

module.exports = truncateTables; 
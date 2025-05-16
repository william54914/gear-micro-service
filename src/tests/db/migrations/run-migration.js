const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../../.env') });
const fs = require('fs').promises;
const { Pool } = require('pg');

async function runMigration(migrationFile) {
  if (!migrationFile) {
    throw new Error('Migration file path is required');
  }

  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    console.log(`Reading migration file: ${migrationFile}`);
    const sqlPath = path.join(__dirname, '../sql', migrationFile);
    const sqlContent = await fs.readFile(sqlPath, 'utf8');

    console.log('Executing migration...');
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
      console.log('Migration completed successfully');
      return { success: true, message: 'Migration completed successfully' };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Migration error:', error);
    return { success: false, error: error.message };
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  const migrationFile = process.argv[2];
  if (!migrationFile) {
    console.error('Please provide a migration file name');
    process.exit(1);
  }
  runMigration(migrationFile);
}

module.exports = runMigration; 
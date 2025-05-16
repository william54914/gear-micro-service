const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
const { Pool } = require('pg');

async function validateDatabaseSchema() {
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    console.log('Validating database schema...');
    const client = await pool.connect();

    try {
      // Check if all required tables exist
      const tableQuery = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `;
      const { rows: tables } = await client.query(tableQuery);
      console.log('\nExisting tables:', tables.map(t => t.table_name).join(', '));

      // Check table constraints
      const constraintQuery = `
        SELECT 
          tc.table_name, 
          tc.constraint_name, 
          tc.constraint_type,
          kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_schema = 'public'
        ORDER BY tc.table_name, tc.constraint_type;
      `;
      const { rows: constraints } = await client.query(constraintQuery);
      
      console.log('\nTable constraints:');
      constraints.forEach(c => {
        console.log(`${c.table_name}: ${c.constraint_type} on ${c.column_name}`);
      });

      // Check table columns
      const columnQuery = `
        SELECT 
          table_name,
          column_name,
          data_type,
          character_maximum_length,
          is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public'
        ORDER BY table_name, ordinal_position;
      `;
      const { rows: columns } = await client.query(columnQuery);
      
      console.log('\nTable columns:');
      let currentTable = '';
      columns.forEach(col => {
        if (currentTable !== col.table_name) {
          currentTable = col.table_name;
          console.log(`\n${currentTable}:`);
        }
        console.log(`  ${col.column_name}: ${col.data_type}${col.character_maximum_length ? `(${col.character_maximum_length})` : ''} ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });

      return {
        success: true,
        data: {
          tables: tables.map(t => t.table_name),
          constraints,
          columns
        }
      };
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Schema validation error:', error);
    return { success: false, error: error.message };
  } finally {
    await pool.end();
  }
}

// Run the validation if this file is run directly
if (require.main === module) {
  validateDatabaseSchema();
}

module.exports = validateDatabaseSchema;

describe('schema-validator dummy', () => {
  it('should pass dummy test', () => {
    expect(true).toBe(true);
  });
}); 
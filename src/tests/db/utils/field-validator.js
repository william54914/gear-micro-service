const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../../.env') });
const { Pool } = require('pg');

async function validateFields() {
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    console.log('Starting database field validation...');
    const client = await pool.connect();

    try {
      // Get all tables in the database
      const { rows: tables } = await client.query(`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        AND tablename NOT LIKE 'pg_%'
        ORDER BY tablename;
      `);

      let validationResults = {};

      for (const { tablename } of tables) {
        console.log(`\nValidating fields for table: ${tablename}`);

        // Get column information
        const { rows: columns } = await client.query(`
          SELECT 
            column_name,
            data_type,
            character_maximum_length,
            is_nullable,
            column_default
          FROM information_schema.columns
          WHERE table_name = $1
          ORDER BY ordinal_position;
        `, [tablename]);

        console.log('Columns:', columns.map(c => `${c.column_name} (${c.data_type})`).join(', '));

        // Check for null values in non-nullable columns
        const nullableChecks = columns
          .filter(c => c.is_nullable === 'NO' && c.column_default === null)
          .map(c => `${c.column_name} IS NULL`);

        if (nullableChecks.length > 0) {
          const { rows: nullViolations } = await client.query(`
            SELECT COUNT(*) as count
            FROM "${tablename}"
            WHERE ${nullableChecks.join(' OR ')};
          `);
          console.log(`Found ${nullViolations[0].count} null violations in non-nullable columns`);
        }

        // Check for invalid numeric values
        const numericColumns = columns
          .filter(c => ['integer', 'numeric', 'decimal'].includes(c.data_type));

        for (const col of numericColumns) {
          const { rows: invalidNumbers } = await client.query(`
            SELECT COUNT(*) as count
            FROM "${tablename}"
            WHERE ${col.column_name} < 0
            AND ${col.column_name} IS NOT NULL;
          `);
          if (invalidNumbers[0].count > 0) {
            console.log(`Found ${invalidNumbers[0].count} negative values in ${col.column_name}`);
          }
        }

        // Check for oversized varchar values
        const varcharColumns = columns
          .filter(c => c.data_type === 'character varying' && c.character_maximum_length);

        for (const col of varcharColumns) {
          const { rows: oversizedValues } = await client.query(`
            SELECT COUNT(*) as count
            FROM "${tablename}"
            WHERE LENGTH(${col.column_name}) > ${col.character_maximum_length}
            AND ${col.column_name} IS NOT NULL;
          `);
          if (oversizedValues[0].count > 0) {
            console.log(`Found ${oversizedValues[0].count} oversized values in ${col.column_name}`);
          }
        }

        validationResults[tablename] = {
          columns: columns.map(c => ({
            name: c.column_name,
            type: c.data_type,
            nullable: c.is_nullable === 'YES',
            maxLength: c.character_maximum_length
          }))
        };
      }

      return {
        success: true,
        data: validationResults
      };
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Field validation error:', error);
    return { success: false, error: error.message };
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  validateFields();
}

module.exports = validateFields; 
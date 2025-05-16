const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../../.env') });
const { Pool } = require('pg');

async function renamePanToEan() {
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    console.log('Starting PAN to EAN column rename...');
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Check if PAN column exists
      const { rows: columns } = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'vendor_products' 
        AND column_name = 'pan';
      `);

      if (columns.length === 0) {
        console.log('PAN column does not exist, skipping migration');
        return { success: true, message: 'No migration needed' };
      }

      // Create EAN column if it doesn't exist
      await client.query(`
        ALTER TABLE vendor_products 
        ADD COLUMN IF NOT EXISTS ean VARCHAR(13);
      `);

      // Copy data from PAN to EAN
      await client.query(`
        UPDATE vendor_products 
        SET ean = pan 
        WHERE pan IS NOT NULL;
      `);

      // Drop PAN column
      await client.query(`
        ALTER TABLE vendor_products 
        DROP COLUMN pan;
      `);

      // Add index on EAN
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_vendor_products_ean 
        ON vendor_products(ean);
      `);

      await client.query('COMMIT');
      console.log('PAN to EAN migration completed successfully');
      return { success: true, message: 'Migration completed successfully' };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('PAN to EAN migration error:', error);
    return { success: false, error: error.message };
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  renamePanToEan();
}

module.exports = renamePanToEan; 
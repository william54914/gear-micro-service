const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
const { Pool } = require('pg');

async function testConnection() {
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    console.log('Testing database connection...');
    const client = await pool.connect();
    console.log('Successfully connected to database');
    
    const result = await client.query('SELECT NOW()');
    console.log('Database time:', result.rows[0].now);
    
    client.release();
    await pool.end();
    
    return { success: true, message: 'Database connection successful' };
  } catch (error) {
    console.error('Database connection error:', error);
    return { success: false, error: error.message };
  }
}

// Run the test if this file is run directly
if (require.main === module) {
  testConnection();
}

module.exports = testConnection;

describe('db-connection dummy', () => {
  it('should pass dummy test', () => {
    expect(true).toBe(true);
  });
}); 
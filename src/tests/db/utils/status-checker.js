const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../../.env') });
const { Pool } = require('pg');

async function checkDatabaseStatus() {
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    console.log('Starting database status check...');
    const client = await pool.connect();

    try {
      // Check database connection and version
      const { rows: [version] } = await client.query('SELECT version();');
      console.log('Database version:', version.version);

      // Check database size
      const { rows: [dbSize] } = await client.query(`
        SELECT pg_size_pretty(pg_database_size($1)) as size;
      `, [process.env.DB_NAME]);
      console.log('Database size:', dbSize.size);

      // Check active connections
      const { rows: [connections] } = await client.query(`
        SELECT count(*) as count 
        FROM pg_stat_activity 
        WHERE datname = $1;
      `, [process.env.DB_NAME]);
      console.log('Active connections:', connections.count);

      // Check table statistics
      const { rows: tableStats } = await client.query(`
        SELECT 
          schemaname,
          relname as table_name,
          n_live_tup as row_count,
          n_dead_tup as dead_tuples,
          last_vacuum,
          last_autovacuum,
          last_analyze,
          last_autoanalyze
        FROM pg_stat_user_tables
        WHERE schemaname = 'public'
        ORDER BY n_live_tup DESC;
      `);

      console.log('\nTable Statistics:');
      tableStats.forEach(stat => {
        console.log(`\n${stat.table_name}:`);
        console.log(`- Rows: ${stat.row_count}`);
        console.log(`- Dead tuples: ${stat.dead_tuples}`);
        console.log(`- Last vacuum: ${stat.last_vacuum || stat.last_autovacuum || 'never'}`);
        console.log(`- Last analyze: ${stat.last_analyze || stat.last_autoanalyze || 'never'}`);
      });

      // Check index statistics
      const { rows: indexStats } = await client.query(`
        SELECT 
          schemaname,
          tablename,
          indexname,
          idx_scan as number_of_scans,
          idx_tup_read as tuples_read,
          idx_tup_fetch as tuples_fetched
        FROM pg_stat_user_indexes
        WHERE schemaname = 'public'
        ORDER BY idx_scan DESC;
      `);

      console.log('\nIndex Usage Statistics:');
      indexStats.forEach(stat => {
        console.log(`\n${stat.tablename}.${stat.indexname}:`);
        console.log(`- Scans: ${stat.number_of_scans}`);
        console.log(`- Tuples read: ${stat.tuples_read}`);
        console.log(`- Tuples fetched: ${stat.tuples_fetched}`);
      });

      return {
        success: true,
        data: {
          version: version.version,
          size: dbSize.size,
          connections: connections.count,
          tableStats,
          indexStats
        }
      };
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database status check error:', error);
    return { success: false, error: error.message };
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  checkDatabaseStatus();
}

module.exports = checkDatabaseStatus; 
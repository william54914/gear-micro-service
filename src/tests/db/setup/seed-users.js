const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../../.env') });
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

async function seedUsers() {
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    console.log('Starting user seeding...');
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Create default roles if they don't exist
      const roles = ['admin', 'manager', 'user'];
      for (const role of roles) {
        await client.query(`
          INSERT INTO user_roles (role_name)
          VALUES ($1)
          ON CONFLICT (role_name) DO NOTHING;
        `, [role]);
      }

      // Create test users
      const users = [
        {
          username: 'admin',
          email: 'admin@gearhubone.com',
          password: 'admin123',
          role: 'admin'
        },
        {
          username: 'manager',
          email: 'manager@gearhubone.com',
          password: 'manager123',
          role: 'manager'
        },
        {
          username: 'user',
          email: 'user@gearhubone.com',
          password: 'user123',
          role: 'user'
        }
      ];

      for (const user of users) {
        // Hash password
        const passwordHash = await bcrypt.hash(user.password, 10);

        // Insert user
        const { rows: [newUser] } = await client.query(`
          INSERT INTO users (username, email, password_hash, active)
          VALUES ($1, $2, $3, true)
          ON CONFLICT (username) DO UPDATE
          SET email = EXCLUDED.email,
              password_hash = EXCLUDED.password_hash
          RETURNING user_id;
        `, [user.username, user.email, passwordHash]);

        // Get role_id
        const { rows: [role] } = await client.query(`
          SELECT role_id FROM user_roles WHERE role_name = $1;
        `, [user.role]);

        // Assign role to user
        await client.query(`
          INSERT INTO user_permissions (user_id, role_id)
          VALUES ($1, $2)
          ON CONFLICT (user_id, role_id) DO NOTHING;
        `, [newUser.user_id, role.role_id]);

        console.log(`Created/Updated user: ${user.username} with role: ${user.role}`);
      }

      await client.query('COMMIT');
      console.log('User seeding completed successfully');
      return { success: true, message: 'Users seeded successfully' };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('User seeding error:', error);
    return { success: false, error: error.message };
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  seedUsers();
}

module.exports = seedUsers; 
const sequelize = require('../config/database');
const { DataTypes } = require('@sequelize/core');
const bcrypt = require('bcrypt');

async function setupUserTable() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connected to database successfully');

    const queryInterface = sequelize.getQueryInterface();
    
    // Check if users table exists
    const tables = await queryInterface.showAllTables();
    const usersTableExists = tables.includes('users');

    if (usersTableExists) {
      console.log('Users table exists, dropping it...');
      await queryInterface.dropTable('users');
    }

    console.log('Creating users table...');
    // Create users table with new structure
    await queryInterface.createTable('users', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
      },
      password_hash: {
        type: DataTypes.STRING,
        allowNull: false
      },
      first_name: {
        type: DataTypes.STRING,
        allowNull: true
      },
      last_name: {
        type: DataTypes.STRING,
        allowNull: true
      },
      date_of_birth: {
        type: DataTypes.DATE,
        allowNull: true
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'user'
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
    console.log('Users table created successfully');

    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash('isgay', saltRounds);
    
    console.log('Seeding admin user...');
    // Insert admin user
    await queryInterface.bulkInsert('users', [{
      username: 'will',
      password_hash: passwordHash,
      first_name: 'Will',
      last_name: 'Larson',
      date_of_birth: new Date('1987-08-17'),
      email: 'will@example.com',
      is_active: true,
      role: 'admin',
      created_at: new Date(),
      updated_at: new Date()
    }]);
    
    console.log('Admin user created successfully');
    console.log('User table setup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up user table:', error);
    process.exit(1);
  }
}

// Run the setup
setupUserTable(); 
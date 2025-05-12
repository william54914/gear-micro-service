const { DataTypes } = require('@sequelize/core');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if users table exists
    const tables = await queryInterface.showAllTables();
    const usersTableExists = tables.includes('users');

    if (usersTableExists) {
      // Drop existing users table (in a production environment, you'd want to migrate data instead)
      await queryInterface.dropTable('users');
    }

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
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    });
  },

  async down(queryInterface, Sequelize) {
    // Reverting back would be complex in a real scenario, but for simplicity:
    await queryInterface.dropTable('users');
    
    // Create original users table structure
    await queryInterface.createTable('users', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });
  }
}; 
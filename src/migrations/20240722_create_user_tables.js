const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create user_roles table first since it's referenced by users and user_permissions
    await queryInterface.createTable('user_roles', {
      role_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      role_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    });

    // Create users table
    await queryInterface.createTable('users', {
      user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      password_hash: {
        type: DataTypes.STRING,
        allowNull: false
      },
      first_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      last_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      role: {
        type: DataTypes.ENUM('admin', 'manager', 'user'),
        allowNull: false,
        defaultValue: 'user'
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      last_login_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      password_reset_token: {
        type: DataTypes.STRING,
        allowNull: true
      },
      password_reset_expires: {
        type: DataTypes.DATE,
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    });

    // Create user_permissions table (junction table for many-to-many relationship)
    await queryInterface.createTable('user_permissions', {
      permission_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'user_roles',
          key: 'role_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    });

    // Add unique constraint to prevent duplicate user-role combinations
    await queryInterface.addConstraint('user_permissions', {
      fields: ['user_id', 'role_id'],
      type: 'unique',
      name: 'unique_user_role'
    });

    // Insert default roles
    await queryInterface.bulkInsert('user_roles', [
      {
        role_name: 'admin',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        role_name: 'manager',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        role_name: 'user',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Add indexes
    await queryInterface.addIndex('users', ['email']);
    await queryInterface.addIndex('users', ['username']);
    await queryInterface.addIndex('user_roles', ['role_name']);
    await queryInterface.addIndex('user_permissions', ['user_id', 'role_id'], {
      unique: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Drop tables in reverse order to handle foreign key constraints
    await queryInterface.dropTable('user_permissions');
    await queryInterface.dropTable('users');
    await queryInterface.dropTable('user_roles');
  }
}; 
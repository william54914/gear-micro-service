const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const BaseModel = require('./base.model');
const sequelize = require('../config/database');

class User extends BaseModel {
  static get attributes() {
    return {
      userId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'user_id'
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      passwordHash: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'password_hash'
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'created_at'
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'updated_at'
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'first_name',
        validate: {
          notEmpty: true
        }
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'last_name',
        validate: {
          notEmpty: true
        }
      },
      role: {
        type: DataTypes.ENUM('admin', 'manager', 'user'),
        allowNull: false,
        defaultValue: 'user',
        validate: {
          isIn: [['admin', 'manager', 'user']]
        }
      },
      lastLoginAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'last_login_at'
      },
      passwordResetToken: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'password_reset_token'
      },
      passwordResetExpires: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'password_reset_expires'
      }
    };
  }

  static get hooks() {
    return {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      }
    };
  }

  /**
   * Compare password
   * @param {string} candidatePassword - Password to compare
   * @returns {Promise<boolean>} Whether password matches
   */
  async comparePassword(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  }

  /**
   * Generate password reset token
   * @returns {string} Reset token
   */
  generatePasswordResetToken() {
    const token = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = token;
    this.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour
    return token;
  }

  /**
   * Update last login
   */
  async updateLastLogin() {
    this.lastLoginAt = new Date();
    await this.save();
  }

  /**
   * Check if user has role
   * @param {string|string[]} roles - Role(s) to check
   * @returns {boolean} Whether user has role
   */
  hasRole(roles) {
    if (Array.isArray(roles)) {
      return roles.includes(this.role);
    }
    return this.role === roles;
  }

  /**
   * Get full name
   * @returns {string} Full name
   */
  getFullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  /**
   * Remove sensitive fields for JSON response
   */
  toJSON() {
    const values = { ...this.get() };
    delete values.password;
    delete values.passwordResetToken;
    delete values.passwordResetExpires;
    return values;
  }

  static associate(models) {
    this.belongsToMany(models.UserRole, {
      through: models.UserPermission,
      foreignKey: 'userId',
      as: 'roles'
    });
  }
}

// Initialize the model
User.init(User.attributes, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  hooks: User.hooks
});

module.exports = User; 
const { DataTypes } = require('sequelize');
const BaseModel = require('./base.model');
const sequelize = require('../config/database');

class UserPermission extends BaseModel {
  static get attributes() {
    return {
      permissionId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'permission_id'
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id',
        references: {
          model: 'users',
          key: 'user_id'
        }
      },
      roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'role_id',
        references: {
          model: 'user_roles',
          key: 'role_id'
        }
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
      }
    };
  }

  static associate(models) {
    this.belongsTo(models.User, {
      foreignKey: 'userId'
    });
    this.belongsTo(models.UserRole, {
      foreignKey: 'roleId'
    });
  }
}

UserPermission.init(UserPermission.attributes, {
  sequelize,
  modelName: 'UserPermission',
  tableName: 'user_permissions',
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'role_id']
    }
  ]
});

module.exports = UserPermission; 
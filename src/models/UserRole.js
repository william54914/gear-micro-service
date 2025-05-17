const { DataTypes } = require('sequelize');
const BaseModel = require('./base.model');
const sequelize = require('../config/database');

class UserRole extends BaseModel {
  static get attributes() {
    return {
      roleId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'role_id'
      },
      roleName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: 'role_name'
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
    this.belongsToMany(models.User, {
      through: models.UserPermission,
      foreignKey: 'roleId',
      as: 'users'
    });
  }
}

UserRole.init(UserRole.attributes, {
  sequelize,
  modelName: 'UserRole',
  tableName: 'user_roles'
});

module.exports = UserRole; 
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class RestockCost extends Model {}

RestockCost.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sku: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: 'Product SKU'
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Product cost'
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
}, {
  sequelize,
  modelName: 'RestockCost',
  tableName: 'restock_cost',
  timestamps: true,
  underscored: true
});

module.exports = RestockCost; 
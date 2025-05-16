const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class RestockVitals extends Model {}

RestockVitals.init({
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
  fnsku: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Fulfillment Network SKU'
  },
  product_name: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Product name'
  },
  asin: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Amazon Standard Identification Number'
  },
  status: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Product status'
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
  modelName: 'RestockVitals',
  tableName: 'restock_vitals',
  timestamps: true,
  underscored: true
});

module.exports = RestockVitals; 
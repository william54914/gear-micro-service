const { Model, DataTypes } = require('@sequelize/core');
const sequelize = require('../config/database');

class AmazonVitals extends Model {}

AmazonVitals.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sku: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'seller_sku',
    comment: 'Amazon Seller SKU'
  },
  fnsku: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Fulfillment Network SKU'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'item_name',
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
    comment: 'Listing status (Active, Inactive, etc.)'
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
  modelName: 'AmazonVitals',
  tableName: 'amazon_vitals',
  timestamps: true,
  underscored: true
});

module.exports = AmazonVitals; 
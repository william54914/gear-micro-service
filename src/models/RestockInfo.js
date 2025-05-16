const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class RestockInfo extends Model {}

RestockInfo.init({
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
  msku: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Merchant SKU'
  },
  supplier: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Supplier name'
  },
  upc: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Universal Product Code'
  },
  ean: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'European Article Number'
  },
  tag1: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Tag 1'
  },
  tag2: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Tag 2'
  },
  tag3: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Tag 3'
  },
  tag4: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Tag 4'
  },
  tag5: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Tag 5'
  },
  tag6: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Tag 6'
  },
  tag7: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Tag 7'
  },
  tag8: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Tag 8'
  },
  tag9: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Tag 9'
  },
  tag10: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Tag 10'
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
  modelName: 'RestockInfo',
  tableName: 'restock_info',
  timestamps: true,
  underscored: true
});

module.exports = RestockInfo; 
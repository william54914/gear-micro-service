const { Model, DataTypes } = require('@sequelize/core');
const sequelize = require('../config/database');

class AmazonQuantity extends Model {}

AmazonQuantity.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sku: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'seller_sku',
    comment: 'Amazon Seller SKU (foreign key to AmazonVitals)'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Current quantity available'
  },
  pendingQuantity: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'pending_quantity',
    comment: 'Quantity pending processing'
  },
  addDelete: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'add_delete',
    comment: 'Add/delete status'
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
  modelName: 'AmazonQuantity',
  tableName: 'amazon_quantity',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['seller_sku'],
      unique: true
    }
  ]
});

module.exports = AmazonQuantity; 
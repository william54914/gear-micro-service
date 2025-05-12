const { Model, DataTypes } = require('@sequelize/core');
const sequelize = require('../config/database');

class AmazonPrice extends Model {}

AmazonPrice.init({
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
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Current listing price'
  },
  bidForFeaturedPlacement: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'bid_for_featured_placement',
    comment: 'Bid amount for featured placement'
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
  modelName: 'AmazonPrice',
  tableName: 'amazon_price',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['seller_sku'],
      unique: true
    }
  ]
});

module.exports = AmazonPrice; 
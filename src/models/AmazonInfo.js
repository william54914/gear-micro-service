const { Model, DataTypes } = require('@sequelize/core');
const sequelize = require('../config/database');

class AmazonInfo extends Model {}

AmazonInfo.init({
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
  listingId: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'listing_id',
    comment: 'Amazon listing ID'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'item_description',
    comment: 'Product description'
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'image_url',
    comment: 'Product image URL'
  },
  isMarketplace: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    field: 'is_marketplace',
    comment: 'Whether the item is sold on the marketplace'
  },
  productIdType: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'product_id_type',
    comment: 'Type of product ID (1=ASIN, 2=ISBN, etc.)'
  },
  itemNote: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'item_note',
    comment: 'Notes about the item'
  },
  itemCondition: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'item_condition',
    comment: 'Condition of the item (11=New, etc.)'
  },
  openDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'open_date',
    comment: 'Date when the listing was opened'
  },
  asin1: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Primary ASIN'
  },
  asin2: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Secondary ASIN'
  },
  asin3: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Tertiary ASIN'
  },
  productId: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'product_id',
    comment: 'Product ID (usually same as ASIN)'
  },
  fulfillmentChannel: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'fulfillment_channel',
    comment: 'Fulfillment channel (AMAZON_NA, MERCHANT, etc.)'
  },
  merchantShippingGroup: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'merchant_shipping_group',
    comment: 'Merchant shipping group'
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
  modelName: 'AmazonInfo',
  tableName: 'amazon_info',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['seller_sku'],
      unique: true
    }
  ]
});

module.exports = AmazonInfo; 
const { Model, DataTypes } = require('@sequelize/core');
const sequelize = require('../config/database');

class AmazonZShop extends Model {}

AmazonZShop.init({
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
  zshopShippingFee: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'zshop_shipping_fee',
    comment: 'zShop shipping fee'
  },
  zshopCategory1: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'zshop_category1',
    comment: 'zShop category'
  },
  zshopBrowsePath: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'zshop_browse_path',
    comment: 'zShop browse path'
  },
  zshopStorefrontFeature: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'zshop_storefront_feature',
    comment: 'zShop storefront feature'
  },
  zshopBoldface: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'zshop_boldface',
    comment: 'zShop boldface setting'
  },
  willShipInternationally: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'will_ship_internationally',
    comment: 'Whether the item will ship internationally'
  },
  expeditedShipping: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'expedited_shipping',
    comment: 'Expedited shipping availability'
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
  modelName: 'AmazonZShop',
  tableName: 'amazon_zshop',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['seller_sku'],
      unique: true
    }
  ]
});

module.exports = AmazonZShop; 
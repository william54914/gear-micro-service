const { DataTypes } = require('sequelize');
const BaseModel = require('./base.model');
const sequelize = require('../config/database');

class AmazonInfo extends BaseModel {
  static get attributes() {
    return {
      sku: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        unique: true
      },
      listingId: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'listing_id'
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'image_url',
        validate: {
          isUrl: true
        }
      },
      isMarketplace: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_marketplace'
      },
      productIdType: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'product_id_type'
      },
      itemNote: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'item_note'
      },
      itemCondition: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'item_condition'
      },
      openDate: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'open_date'
      },
      asin1: {
        type: DataTypes.STRING,
        allowNull: true
      },
      asin2: {
        type: DataTypes.STRING,
        allowNull: true
      },
      asin3: {
        type: DataTypes.STRING,
        allowNull: true
      },
      productId: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'product_id'
      },
      fulfillmentChannel: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'fulfillment_channel'
      },
      merchantShippingGroup: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'merchant_shipping_group'
      },
      brand: {
        type: DataTypes.STRING,
        allowNull: true
      },
      manufacturer: {
        type: DataTypes.STRING,
        allowNull: true
      },
      condition: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'New'
      },
      category: {
        type: DataTypes.STRING,
        allowNull: true
      },
      subcategory: {
        type: DataTypes.STRING,
        allowNull: true
      },
      bulletPoint1: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'bullet_point_1'
      },
      bulletPoint2: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'bullet_point_2'
      },
      bulletPoint3: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'bullet_point_3'
      },
      bulletPoint4: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'bullet_point_4'
      },
      bulletPoint5: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'bullet_point_5'
      },
      searchTerms: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'search_terms'
      },
      imageUrls: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'image_urls'
      }
    };
  }

  static associate(models) {
    this.belongsTo(models.AmazonVitals, {
      foreignKey: 'sku',
      targetKey: 'sku'
    });
  }
}

// Initialize the model
AmazonInfo.init(AmazonInfo.attributes, {
  sequelize,
  modelName: 'AmazonInfo',
  tableName: 'amazon_info'
});

module.exports = AmazonInfo; 
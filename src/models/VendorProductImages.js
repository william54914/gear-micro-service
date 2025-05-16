const { DataTypes } = require('sequelize');
const BaseModel = require('./base.model');
const sequelize = require('../config/database');

class VendorProductImages extends BaseModel {
  static get attributes() {
    return {
      imageId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'image_id'
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'product_id'
      },
      imageUrl: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'image_url'
      },
      imageType: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: 'image_type'
      },
      isPrimary: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_primary'
      },
      sortOrder: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        field: 'sort_order'
      }
    };
  }

  static associate(models) {
    // Define associations
    this.belongsTo(models.VendorProduct, {
      foreignKey: 'productId',
      as: 'product'
    });
  }
}

// Initialize the model
VendorProductImages.init(VendorProductImages.attributes, {
  sequelize,
  modelName: 'VendorProductImages',
  tableName: 'vendor_product_images'
});

module.exports = VendorProductImages; 
const { DataTypes } = require('sequelize');
const BaseModel = require('./base.model');
const sequelize = require('../config/database');

class VendorProductDimensions extends BaseModel {
  static get attributes() {
    return {
      dimensionId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'dimension_id'
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'product_id'
      },
      weight: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      weightUnit: {
        type: DataTypes.STRING(5),
        allowNull: true,
        defaultValue: 'lbs',
        field: 'weight_unit'
      },
      length: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      width: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      height: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      dimensionUnit: {
        type: DataTypes.STRING(5),
        allowNull: true,
        defaultValue: 'in',
        field: 'dimension_unit'
      },
      packageWeight: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'package_weight'
      },
      packageLength: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'package_length'
      },
      packageWidth: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'package_width'
      },
      packageHeight: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'package_height'
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
VendorProductDimensions.init(VendorProductDimensions.attributes, {
  sequelize,
  modelName: 'VendorProductDimensions',
  tableName: 'vendor_product_dimensions'
});

module.exports = VendorProductDimensions; 
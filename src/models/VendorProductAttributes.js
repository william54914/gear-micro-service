const { DataTypes } = require('sequelize');
const BaseModel = require('./base.model');
const sequelize = require('../config/database');

class VendorProductAttributes extends BaseModel {
  static get attributes() {
    return {
      attributeId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'attribute_id'
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'product_id'
      },
      attribute1: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'attribute_1'
      },
      attribute2: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'attribute_2'
      },
      attribute3: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'attribute_3'
      },
      attribute4: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'attribute_4'
      },
      attribute5: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'attribute_5'
      },
      attribute6: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'attribute_6'
      },
      color: {
        type: DataTypes.STRING(30),
        allowNull: true
      },
      gender: {
        type: DataTypes.STRING(10),
        allowNull: true
      },
      size: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      warranty: {
        type: DataTypes.STRING(100),
        allowNull: true
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
VendorProductAttributes.init(VendorProductAttributes.attributes, {
  sequelize,
  modelName: 'VendorProductAttributes',
  tableName: 'vendor_product_attributes'
});

module.exports = VendorProductAttributes; 
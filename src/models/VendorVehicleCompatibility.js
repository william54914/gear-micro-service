const { DataTypes } = require('sequelize');
const BaseModel = require('./base.model');
const sequelize = require('../config/database');

class VendorVehicleCompatibility extends BaseModel {
  static get attributes() {
    return {
      compatibilityId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'compatibility_id'
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'product_id'
      },
      make: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      model: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      year: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      trim: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      submodel: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      engine: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      notes: {
        type: DataTypes.TEXT,
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
VendorVehicleCompatibility.init(VendorVehicleCompatibility.attributes, {
  sequelize,
  modelName: 'VendorVehicleCompatibility',
  tableName: 'vendor_vehicle_compatibility'
});

module.exports = VendorVehicleCompatibility; 
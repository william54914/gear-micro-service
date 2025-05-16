const { DataTypes } = require('sequelize');
const BaseModel = require('./base.model');
const sequelize = require('../config/database');

class VendorDistributorInfo extends BaseModel {
  static get attributes() {
    return {
      distributorInfoId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'distributor_info_id'
      },
      distributorPart: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: 'distributor_part'
      },
      manufacturerPart: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: 'manufacturer_part'
      },
      vendorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'vendor_id',
        references: {
          model: 'vendors',
          key: 'vendor_id'
        }
      },
      cost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      inventoryEast: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        field: 'inventory_east'
      },
      inventoryWest: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        field: 'inventory_west'
      },
      inventoryMidwest: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        field: 'inventory_midwest'
      },
      totalInventory: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        field: 'total_inventory'
      },
      shippingCost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'shipping_cost'
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    };
  }

  static associate(models) {
    // Define associations
    this.belongsTo(models.Vendor, {
      foreignKey: 'vendorId',
      targetKey: 'vendorId',
      as: 'vendor'
    });
    
    this.belongsTo(models.VendorProduct, {
      foreignKey: 'manufacturerPart',
      targetKey: 'mfgPart',
      as: 'product'
    });
  }
}

// Initialize the model
VendorDistributorInfo.init(VendorDistributorInfo.attributes, {
  sequelize,
  modelName: 'VendorDistributorInfo',
  tableName: 'vendor_distributor_info',
  underscored: true,
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

module.exports = VendorDistributorInfo; 
const { DataTypes } = require('sequelize');
const BaseModel = require('./base.model');
const sequelize = require('../config/database');

class VendorProduct extends BaseModel {
  static get attributes() {
    return {
      vendorProductId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'vendor_product_id'
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
      brandId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'brand_id',
        references: {
          model: 'vendor_brands',
          key: 'brand_id'
        }
      },
      vendorSku: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'vendor_sku',
        validate: {
          notEmpty: true
        }
      },
      mfgPart: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'mfg_part'
      },
      vendorProductName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'vendor_product_name',
        validate: {
          notEmpty: true
        }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      msrp: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
          min: 0
        }
      },
      mapPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'map_price',
        validate: {
          min: 0
        }
      },
      cost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
          min: 0
        }
      },
      weight: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
          min: 0
        }
      },
      upc: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: [12, 14]
        }
      }
    };
  }

  static associate(models) {
    this.belongsTo(models.Vendor, {
      foreignKey: 'vendorId',
      as: 'vendor'
    });

    this.belongsTo(models.VendorBrand, {
      foreignKey: 'brandId',
      as: 'brand'
    });

    this.hasMany(models.VendorProductAttributes, {
      foreignKey: 'vendorProductId',
      as: 'attributes'
    });

    this.hasMany(models.VendorProductImages, {
      foreignKey: 'vendorProductId',
      as: 'images'
    });

    this.hasOne(models.VendorProductDimensions, {
      foreignKey: 'vendorProductId',
      as: 'dimensions'
    });

    this.hasMany(models.VendorVehicleCompatibility, {
      foreignKey: 'vendorProductId',
      as: 'compatibility'
    });
  }

  /**
   * Get profit margin
   * @returns {number} Profit margin percentage
   */
  getProfitMargin() {
    if (!this.msrp || !this.cost) return 0;
    return ((this.msrp - this.cost) / this.msrp) * 100;
  }

  /**
   * Check if product is MAP compliant
   * @param {number} price - Price to check
   * @returns {boolean} Whether price is MAP compliant
   */
  isMapCompliant(price) {
    if (!this.mapPrice) return true;
    return price >= this.mapPrice;
  }
}

// Initialize the model
VendorProduct.init(VendorProduct.attributes, {
  sequelize,
  modelName: 'VendorProduct',
  tableName: 'vendor_products'
});

module.exports = VendorProduct; 
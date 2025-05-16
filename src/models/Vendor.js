const { DataTypes } = require('sequelize');
const BaseModel = require('./base.model');
const sequelize = require('../config/database');

class Vendor extends BaseModel {
  static get attributes() {
    return {
      vendorId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'vendor_id'
      },
      vendorName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: 'vendor_name',
        validate: {
          notEmpty: true
        }
      },
      vendorCode: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: 'vendor_code',
        validate: {
          notEmpty: true,
          len: [2, 10]
        }
      },
      website: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isUrl: true
        }
      },
      contactEmail: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'contact_email',
        validate: {
          isEmail: true
        }
      },
      contactPhone: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'contact_phone'
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    };
  }

  static associate(models) {
    this.hasMany(models.VendorBrand, {
      foreignKey: 'vendorId',
      as: 'brands'
    });

    this.hasMany(models.VendorProduct, {
      foreignKey: 'vendorId',
      as: 'products'
    });

    this.hasOne(models.VendorDistributorInfo, {
      foreignKey: 'vendorId',
      as: 'distributorInfo'
    });
  }

  /**
   * Get active products count
   * @returns {Promise<number>} Number of active products
   */
  async getActiveProductsCount() {
    return this.getProducts({
      where: { active: true }
    }).then(products => products.length);
  }

  /**
   * Get active brands count
   * @returns {Promise<number>} Number of active brands
   */
  async getActiveBrandsCount() {
    return this.getBrands({
      where: { active: true }
    }).then(brands => brands.length);
  }
}

// Initialize the model
Vendor.init(Vendor.attributes, {
  sequelize,
  modelName: 'Vendor',
  tableName: 'vendors'
});

module.exports = Vendor; 
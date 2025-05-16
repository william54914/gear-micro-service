const { DataTypes } = require('sequelize');
const BaseModel = require('./base.model');
const sequelize = require('../config/database');

class VendorBrand extends BaseModel {
  static get attributes() {
    return {
      brandId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'brand_id'
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
      brandName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'brand_name',
        validate: {
          notEmpty: true
        }
      },
      brandCode: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'brand_code',
        validate: {
          notEmpty: true,
          len: [2, 10]
        }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      website: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isUrl: true
        }
      },
      logoUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'logo_url',
        validate: {
          isUrl: true
        }
      },
      countryOfOrigin: {
        type: DataTypes.STRING(2),
        allowNull: true,
        field: 'country_of_origin',
        validate: {
          len: [2, 2],
          isUppercase: true
        }
      },
      priority: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
          max: 100
        }
      }
    };
  }

  static associate(models) {
    this.belongsTo(models.Vendor, {
      foreignKey: 'vendorId',
      as: 'vendor'
    });

    this.hasMany(models.VendorProduct, {
      foreignKey: 'brandId',
      as: 'products'
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
   * Get brand statistics
   * @returns {Promise<object>} Brand statistics
   */
  async getStatistics() {
    const products = await this.getProducts({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('*')), 'total'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN active = true THEN 1 END')), 'active'],
        [sequelize.fn('AVG', sequelize.col('msrp')), 'avgMsrp'],
        [sequelize.fn('MIN', sequelize.col('msrp')), 'minMsrp'],
        [sequelize.fn('MAX', sequelize.col('msrp')), 'maxMsrp']
      ],
      raw: true
    });

    return {
      totalProducts: parseInt(products[0].total),
      activeProducts: parseInt(products[0].active),
      averageMsrp: parseFloat(products[0].avgMsrp) || 0,
      minMsrp: parseFloat(products[0].minMsrp) || 0,
      maxMsrp: parseFloat(products[0].maxMsrp) || 0
    };
  }

  /**
   * Get brand full name (includes vendor name)
   * @returns {Promise<string>} Full brand name
   */
  async getFullName() {
    const vendor = await this.getVendor();
    return `${vendor.vendorName} - ${this.brandName}`;
  }
}

// Initialize the model
VendorBrand.init(VendorBrand.attributes, {
  sequelize,
  modelName: 'VendorBrand',
  tableName: 'vendor_brands'
});

module.exports = VendorBrand; 
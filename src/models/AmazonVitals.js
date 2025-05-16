const { DataTypes } = require('sequelize');
const BaseModel = require('./base.model');
const sequelize = require('../config/database');

class AmazonVitals extends BaseModel {
  static get attributes() {
    return {
      sku: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        unique: true
      },
      fnsku: {
        type: DataTypes.STRING,
        allowNull: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      asin: {
        type: DataTypes.STRING,
        allowNull: false
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Active',
        validate: {
          isIn: [['Active', 'Inactive']]
        }
      }
    };
  }

  static associate(models) {
    this.hasOne(models.AmazonInfo, {
      foreignKey: 'sku',
      sourceKey: 'sku',
      as: 'amazonInfo'
    });

    this.hasOne(models.AmazonPrice, {
      foreignKey: 'sku',
      sourceKey: 'sku',
      as: 'amazonPrice'
    });

    this.hasOne(models.AmazonQuantity, {
      foreignKey: 'sku',
      sourceKey: 'sku',
      as: 'amazonQuantity'
    });

    this.hasOne(models.AmazonZShop, {
      foreignKey: 'sku',
      sourceKey: 'sku',
      as: 'amazonZShop'
    });
  }
}

// Initialize the model
AmazonVitals.init(AmazonVitals.attributes, {
  sequelize,
  modelName: 'AmazonVitals',
  tableName: 'amazon_vitals'
});

module.exports = AmazonVitals; 
const { DataTypes } = require('sequelize');
const BaseModel = require('./base.model');
const sequelize = require('../config/database');

class AmazonPrice extends BaseModel {
  static get attributes() {
    return {
      sku: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        unique: true
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
          min: 0
        }
      },
      bidForFeaturedPlacement: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'bid_for_featured_placement'
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
AmazonPrice.init(AmazonPrice.attributes, {
  sequelize,
  modelName: 'AmazonPrice',
  tableName: 'amazon_price'
});

module.exports = AmazonPrice; 
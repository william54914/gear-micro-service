const { DataTypes } = require('sequelize');
const BaseModel = require('./base.model');
const sequelize = require('../config/database');

class AmazonQuantity extends BaseModel {
  static get attributes() {
    return {
      sku: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        unique: true
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0
        }
      },
      pendingQuantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'pending_quantity',
        validate: {
          min: 0
        }
      },
      addDelete: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'add_delete'
      }
    };
  }

  static associate(models) {
    this.belongsTo(models.AmazonVitals, {
      foreignKey: 'sku',
      targetKey: 'sku'
    });
  }

  /**
   * Get total available quantity
   * @returns {number} Total available quantity
   */
  getTotalQuantity() {
    return this.quantity - this.pendingQuantity;
  }

  /**
   * Check if item is in stock
   * @returns {boolean} Whether item is in stock
   */
  isInStock() {
    return this.getTotalQuantity() > 0;
  }
}

// Initialize the model
AmazonQuantity.init(AmazonQuantity.attributes, {
  sequelize,
  modelName: 'AmazonQuantity',
  tableName: 'amazon_quantity'
});

module.exports = AmazonQuantity; 
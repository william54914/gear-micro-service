const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class VendorProductPricing extends Model {
    static associate(models) {
      // Define associations
      VendorProductPricing.belongsTo(models.VendorProduct, {
        foreignKey: 'product_id',
        as: 'product'
      });
    }
  }
  
  VendorProductPricing.init({
    pricing_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    cost: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    map_price: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    retail: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    discount_map_pct: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    est_shipping: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    is_map: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    effective_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'VendorProductPricing',
    tableName: 'vendor_product_pricing',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  
  return VendorProductPricing;
}; 
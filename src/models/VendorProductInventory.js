const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class VendorProductInventory extends Model {
    static associate(models) {
      // Define associations
      VendorProductInventory.belongsTo(models.VendorProduct, {
        foreignKey: 'product_id',
        as: 'product'
      });
    }
  }
  
  VendorProductInventory.init({
    inventory_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    inventory_east: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    inventory_midwest: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    inventory_west: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    invt_status: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'VendorProductInventory',
    tableName: 'vendor_product_inventory',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  
  return VendorProductInventory;
}; 
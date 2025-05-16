const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('Running Add Active Flags migration - UP');
    
    try {
      // Add active column to vendors table
      await queryInterface.addColumn('vendors', 'active', {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
      });

      // Add active column to products table
      await queryInterface.addColumn('products', 'active', {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
      });

      // Add active column to brands table
      await queryInterface.addColumn('brands', 'active', {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
      });

      // Add active column to vendor_products table
      await queryInterface.addColumn('vendor_products', 'active', {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
      });

      // Add indexes for active columns
      await queryInterface.addIndex('vendors', ['active']);
      await queryInterface.addIndex('products', ['active']);
      await queryInterface.addIndex('brands', ['active']);
      await queryInterface.addIndex('vendor_products', ['active']);

      console.log('Successfully added active flags and indexes');
    } catch (error) {
      console.error('Error in migration:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    console.log('Running Add Active Flags migration - DOWN');
    
    try {
      // Remove active columns in reverse order
      await queryInterface.removeColumn('vendor_products', 'active');
      await queryInterface.removeColumn('brands', 'active');
      await queryInterface.removeColumn('products', 'active');
      await queryInterface.removeColumn('vendors', 'active');

      console.log('Successfully removed active flags');
    } catch (error) {
      console.error('Error in migration rollback:', error);
      throw error;
    }
  }
}; 
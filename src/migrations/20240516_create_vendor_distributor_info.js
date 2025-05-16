const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('Running Create Vendor Distributor Info Table migration - UP');
    
    try {
      await queryInterface.createTable('vendor_distributor_info', {
        distributor_info_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          field: 'distributor_info_id'
        },
        distributor_part: {
          type: DataTypes.STRING(50),
          allowNull: false,
          field: 'distributor_part'
        },
        manufacturer_part: {
          type: DataTypes.STRING(50),
          allowNull: false,
          field: 'manufacturer_part'
        },
        vendor_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'vendor_id',
          references: {
            model: 'vendors',
            key: 'vendor_id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT'
        },
        cost: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: true
        },
        inventory_east: {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: 0,
          field: 'inventory_east'
        },
        inventory_west: {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: 0,
          field: 'inventory_west'
        },
        inventory_midwest: {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: 0,
          field: 'inventory_midwest'
        },
        total_inventory: {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: 0,
          field: 'total_inventory'
        },
        shipping_cost: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: true,
          field: 'shipping_cost'
        },
        active: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
          allowNull: false
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('NOW()')
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('NOW()')
        }
      });

      // Add indexes
      await queryInterface.addIndex('vendor_distributor_info', ['vendor_id']);
      await queryInterface.addIndex('vendor_distributor_info', ['distributor_part']);
      await queryInterface.addIndex('vendor_distributor_info', ['manufacturer_part']);

      console.log('Successfully created vendor_distributor_info table and indexes');
    } catch (error) {
      console.error('Error in migration:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    console.log('Running Create Vendor Distributor Info Table migration - DOWN');
    
    try {
      await queryInterface.dropTable('vendor_distributor_info');
      console.log('Successfully dropped vendor_distributor_info table');
    } catch (error) {
      console.error('Error in migration rollback:', error);
      throw error;
    }
  }
}; 
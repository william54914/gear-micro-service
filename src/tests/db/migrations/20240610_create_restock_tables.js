const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('Running Restock tables migration - UP');
    
    try {
      // Create restock_vitals table
      await queryInterface.createTable('restock_vitals', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        sku: {
          type: DataTypes.STRING(255),
          allowNull: false,
          unique: true
        },
        fnsku: {
          type: DataTypes.STRING(255)
        },
        product_name: {
          type: DataTypes.STRING(255)
        },
        asin: {
          type: DataTypes.STRING(255)
        },
        status: {
          type: DataTypes.STRING(255)
        },
        active: {
          type: DataTypes.BOOLEAN,
          defaultValue: true
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: Sequelize.literal('NOW()')
        },
        updated_at: {
          type: DataTypes.DATE,
          defaultValue: Sequelize.literal('NOW()')
        }
      });

      // Create restock_info table
      await queryInterface.createTable('restock_info', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        sku: {
          type: DataTypes.STRING(255),
          allowNull: false,
          unique: true,
          references: {
            model: 'restock_vitals',
            key: 'sku'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        msku: {
          type: DataTypes.STRING(255)
        },
        supplier: {
          type: DataTypes.STRING(255)
        },
        upc: {
          type: DataTypes.STRING(255)
        },
        ean: {  // Changed from PAN to EAN
          type: DataTypes.STRING(255)
        },
        tag1: DataTypes.STRING(255),
        tag2: DataTypes.STRING(255),
        tag3: DataTypes.STRING(255),
        tag4: DataTypes.STRING(255),
        tag5: DataTypes.STRING(255),
        tag6: DataTypes.STRING(255),
        tag7: DataTypes.STRING(255),
        tag8: DataTypes.STRING(255),
        tag9: DataTypes.STRING(255),
        tag10: DataTypes.STRING(255),
        active: {
          type: DataTypes.BOOLEAN,
          defaultValue: true
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: Sequelize.literal('NOW()')
        },
        updated_at: {
          type: DataTypes.DATE,
          defaultValue: Sequelize.literal('NOW()')
        }
      });

      // Create restock_cost table
      await queryInterface.createTable('restock_cost', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        sku: {
          type: DataTypes.STRING(255),
          allowNull: false,
          unique: true,
          references: {
            model: 'restock_vitals',
            key: 'sku'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        cost: {
          type: DataTypes.DECIMAL(10, 2)
        },
        active: {
          type: DataTypes.BOOLEAN,
          defaultValue: true
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: Sequelize.literal('NOW()')
        },
        updated_at: {
          type: DataTypes.DATE,
          defaultValue: Sequelize.literal('NOW()')
        }
      });

      // Add indexes
      await queryInterface.addIndex('restock_vitals', ['sku']);
      await queryInterface.addIndex('restock_vitals', ['asin']);
      await queryInterface.addIndex('restock_info', ['msku']);
      await queryInterface.addIndex('restock_info', ['upc']);
      await queryInterface.addIndex('restock_info', ['ean']);

      console.log('Successfully created Restock tables and indexes');
    } catch (error) {
      console.error('Error in migration:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    console.log('Running Restock tables migration - DOWN');
    
    try {
      // Drop tables in reverse order to handle foreign key constraints
      await queryInterface.dropTable('restock_cost');
      await queryInterface.dropTable('restock_info');
      await queryInterface.dropTable('restock_vitals');

      console.log('Successfully dropped Restock tables');
    } catch (error) {
      console.error('Error in migration rollback:', error);
      throw error;
    }
  }
}; 
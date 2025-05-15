const { DataTypes } = require('@sequelize/core');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create restock_vitals table
    await queryInterface.createTable('restock_vitals', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      sku: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      fnsku: {
        type: DataTypes.STRING,
        allowNull: true
      },
      product_name: {
        type: DataTypes.STRING,
        allowNull: true
      },
      asin: {
        type: DataTypes.STRING,
        allowNull: true
      },
      status: {
        type: DataTypes.STRING,
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false
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
        type: DataTypes.STRING,
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
        type: DataTypes.STRING,
        allowNull: true
      },
      supplier: {
        type: DataTypes.STRING,
        allowNull: true
      },
      upc: {
        type: DataTypes.STRING,
        allowNull: true
      },
      pan: {
        type: DataTypes.STRING,
        allowNull: true
      },
      tag1: {
        type: DataTypes.STRING,
        allowNull: true
      },
      tag2: {
        type: DataTypes.STRING,
        allowNull: true
      },
      tag3: {
        type: DataTypes.STRING,
        allowNull: true
      },
      tag4: {
        type: DataTypes.STRING,
        allowNull: true
      },
      tag5: {
        type: DataTypes.STRING,
        allowNull: true
      },
      tag6: {
        type: DataTypes.STRING,
        allowNull: true
      },
      tag7: {
        type: DataTypes.STRING,
        allowNull: true
      },
      tag8: {
        type: DataTypes.STRING,
        allowNull: true
      },
      tag9: {
        type: DataTypes.STRING,
        allowNull: true
      },
      tag10: {
        type: DataTypes.STRING,
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false
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
        type: DataTypes.STRING,
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
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });
  },

  async down(queryInterface, Sequelize) {
    // Drop tables in reverse order to avoid foreign key constraints
    await queryInterface.dropTable('restock_cost');
    await queryInterface.dropTable('restock_info');
    await queryInterface.dropTable('restock_vitals');
  }
}; 
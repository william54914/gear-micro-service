const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create amazon_vitals table
    await queryInterface.createTable('amazon_vitals', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      seller_sku: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      fnsku: {
        type: DataTypes.STRING,
        allowNull: true
      },
      item_name: {
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
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    // Create amazon_info table
    await queryInterface.createTable('amazon_info', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      seller_sku: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        references: {
          model: 'amazon_vitals',
          key: 'seller_sku'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      listing_id: {
        type: DataTypes.STRING,
        allowNull: true
      },
      item_description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      image_url: {
        type: DataTypes.STRING,
        allowNull: true
      },
      is_marketplace: {
        type: DataTypes.BOOLEAN,
        allowNull: true
      },
      product_id_type: {
        type: DataTypes.STRING,
        allowNull: true
      },
      item_note: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      item_condition: {
        type: DataTypes.STRING,
        allowNull: true
      },
      open_date: {
        type: DataTypes.DATE,
        allowNull: true
      },
      asin1: {
        type: DataTypes.STRING,
        allowNull: true
      },
      asin2: {
        type: DataTypes.STRING,
        allowNull: true
      },
      asin3: {
        type: DataTypes.STRING,
        allowNull: true
      },
      product_id: {
        type: DataTypes.STRING,
        allowNull: true
      },
      fulfillment_channel: {
        type: DataTypes.STRING,
        allowNull: true
      },
      merchant_shipping_group: {
        type: DataTypes.STRING,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    // Create amazon_price table
    await queryInterface.createTable('amazon_price', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      seller_sku: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        references: {
          model: 'amazon_vitals',
          key: 'seller_sku'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      bid_for_featured_placement: {
        type: DataTypes.STRING,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    // Create amazon_quantity table
    await queryInterface.createTable('amazon_quantity', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      seller_sku: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        references: {
          model: 'amazon_vitals',
          key: 'seller_sku'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      pending_quantity: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      add_delete: {
        type: DataTypes.STRING,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    // Create amazon_zshop table
    await queryInterface.createTable('amazon_zshop', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      seller_sku: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        references: {
          model: 'amazon_vitals',
          key: 'seller_sku'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      zshop_shipping_fee: {
        type: DataTypes.STRING,
        allowNull: true
      },
      zshop_category1: {
        type: DataTypes.STRING,
        allowNull: true
      },
      zshop_browse_path: {
        type: DataTypes.STRING,
        allowNull: true
      },
      zshop_storefront_feature: {
        type: DataTypes.STRING,
        allowNull: true
      },
      zshop_boldface: {
        type: DataTypes.STRING,
        allowNull: true
      },
      will_ship_internationally: {
        type: DataTypes.STRING,
        allowNull: true
      },
      expedited_shipping: {
        type: DataTypes.STRING,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });
  },

  async down(queryInterface, Sequelize) {
    // Drop tables in reverse order to avoid foreign key constraints
    await queryInterface.dropTable('amazon_zshop');
    await queryInterface.dropTable('amazon_quantity');
    await queryInterface.dropTable('amazon_price');
    await queryInterface.dropTable('amazon_info');
    await queryInterface.dropTable('amazon_vitals');
  }
}; 
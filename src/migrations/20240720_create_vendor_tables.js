const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('Running Create Vendor Tables migration - UP');
    
    try {
      // Create vendors table first (parent table)
      await queryInterface.createTable('vendors', {
        vendor_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        vendor_name: {
          type: DataTypes.STRING(100),
          allowNull: false,
          unique: true
        },
        active: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
          allowNull: false
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

      // Create vendor_brands table
      await queryInterface.createTable('vendor_brands', {
        brand_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        brand_name: {
          type: DataTypes.STRING(100),
          allowNull: false
        },
        brand_alt_1: DataTypes.STRING(100),
        brand_alt_2: DataTypes.STRING(100),
        vendor_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'vendors',
            key: 'vendor_id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT'
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

      // Create vendor_products table
      await queryInterface.createTable('vendor_products', {
        product_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        brand_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'vendor_brands',
            key: 'brand_id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT'
        },
        item_id: {
          type: DataTypes.STRING(50),
          allowNull: false
        },
        asin: DataTypes.STRING(10),
        upc: DataTypes.STRING(15),
        description_1: DataTypes.TEXT,
        description_2: DataTypes.TEXT,
        alt_sku_1: DataTypes.STRING(50),
        alt_sku_2: DataTypes.STRING(50),
        alt_sku_3: DataTypes.STRING(50),
        distributor_part: DataTypes.STRING(50),
        part_id: DataTypes.STRING(50),
        parent_id: DataTypes.STRING(50),
        product_type: DataTypes.STRING(100),
        title: DataTypes.STRING(255),
        closeout: DataTypes.BOOLEAN,
        discontinued: DataTypes.BOOLEAN,
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

      // Create vendor_product_attributes table
      await queryInterface.createTable('vendor_product_attributes', {
        attribute_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        product_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'vendor_products',
            key: 'product_id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        attribute_1: DataTypes.STRING(100),
        attribute_2: DataTypes.STRING(100),
        attribute_3: DataTypes.STRING(100),
        attribute_4: DataTypes.STRING(100),
        attribute_5: DataTypes.STRING(100),
        attribute_6: DataTypes.STRING(100),
        color: DataTypes.STRING(30),
        gender: DataTypes.STRING(10),
        size: DataTypes.STRING(20),
        warranty: DataTypes.STRING(100),
        active: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
          allowNull: false
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

      // Create vendor_product_dimensions table
      await queryInterface.createTable('vendor_product_dimensions', {
        dimension_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        product_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'vendor_products',
            key: 'product_id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        box_height: DataTypes.DECIMAL(10, 2),
        box_len: DataTypes.DECIMAL(10, 2),
        box_uom: DataTypes.STRING(5),
        box_uow: DataTypes.STRING(5),
        box_weight: DataTypes.DECIMAL(10, 2),
        box_wid: DataTypes.DECIMAL(10, 2),
        item_height: DataTypes.DECIMAL(10, 2),
        item_len: DataTypes.DECIMAL(10, 2),
        item_uom: DataTypes.STRING(5),
        item_uow: DataTypes.STRING(5),
        item_weight: DataTypes.DECIMAL(10, 2),
        item_width: DataTypes.DECIMAL(10, 2),
        active: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
          allowNull: false
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

      // Create vendor_product_images table
      await queryInterface.createTable('vendor_product_images', {
        image_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        product_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'vendor_products',
            key: 'product_id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        image_file: DataTypes.STRING(255),
        image_url: DataTypes.STRING(255),
        image_url_2: DataTypes.STRING(255),
        image_url_3: DataTypes.STRING(255),
        image_url_4: DataTypes.STRING(255),
        image_url_5: DataTypes.STRING(255),
        video_url: DataTypes.STRING(255),
        active: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
          allowNull: false
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

      // Create vendor_product_inventory table
      await queryInterface.createTable('vendor_product_inventory', {
        inventory_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        product_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'vendor_products',
            key: 'product_id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        inventory_east: DataTypes.INTEGER,
        inventory_midwest: DataTypes.INTEGER,
        inventory_west: DataTypes.INTEGER,
        invt_status: DataTypes.STRING(20),
        active: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
          allowNull: false
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

      // Create vendor_product_pricing table
      await queryInterface.createTable('vendor_product_pricing', {
        pricing_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        product_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'vendor_products',
            key: 'product_id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        map_price: DataTypes.DECIMAL(10, 2),
        retail: DataTypes.DECIMAL(10, 2),
        discount_map_pct: DataTypes.DECIMAL(5, 2),
        est_shipping: DataTypes.DECIMAL(10, 2),
        is_map: DataTypes.BOOLEAN,
        effective_date: DataTypes.DATEONLY,
        active: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
          allowNull: false
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

      // Create vendor_vehicle_compatibility table
      await queryInterface.createTable('vendor_vehicle_compatibility', {
        compatibility_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        product_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'vendor_products',
            key: 'product_id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        year_from: DataTypes.INTEGER,
        year_to: DataTypes.INTEGER,
        make: DataTypes.STRING(50),
        model: DataTypes.STRING(50),
        trim: DataTypes.STRING(50),
        engine_1: DataTypes.STRING(50),
        engine_2: DataTypes.STRING(50),
        active: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
          allowNull: false
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
      await queryInterface.addIndex('vendor_brands', ['vendor_id']);
      await queryInterface.addIndex('vendor_brands', ['brand_name']);
      await queryInterface.addIndex('vendor_products', ['brand_id']);
      await queryInterface.addIndex('vendor_products', ['item_id']);
      await queryInterface.addIndex('vendor_products', ['asin']);
      await queryInterface.addIndex('vendor_products', ['upc']);
      await queryInterface.addIndex('vendor_products', ['active']);
      await queryInterface.addIndex('vendor_product_inventory', ['product_id']);
      await queryInterface.addIndex('vendor_product_pricing', ['product_id']);
      await queryInterface.addIndex('vendor_vehicle_compatibility', ['make', 'model']);

      console.log('Successfully created vendor tables and indexes');
    } catch (error) {
      console.error('Error in migration:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    console.log('Running Create Vendor Tables migration - DOWN');
    
    try {
      // Drop tables in reverse order to handle foreign key constraints
      await queryInterface.dropTable('vendor_vehicle_compatibility');
      await queryInterface.dropTable('vendor_product_pricing');
      await queryInterface.dropTable('vendor_product_inventory');
      await queryInterface.dropTable('vendor_product_images');
      await queryInterface.dropTable('vendor_product_dimensions');
      await queryInterface.dropTable('vendor_product_attributes');
      await queryInterface.dropTable('vendor_products');
      await queryInterface.dropTable('vendor_brands');
      await queryInterface.dropTable('vendors');

      console.log('Successfully dropped vendor tables');
    } catch (error) {
      console.error('Error in migration rollback:', error);
      throw error;
    }
  }
}; 
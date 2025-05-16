const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../../.env') });
const { Pool } = require('pg');

async function simpleValidation() {
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    console.log('Starting simple database validation...');
    const client = await pool.connect();

    try {
      // Check vendors
      const { rows: vendors } = await client.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE active = true) as active
        FROM vendors;
      `);
      console.log('\nVendors:', vendors[0]);

      // Check products
      const { rows: products } = await client.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE active = true) as active,
          COUNT(DISTINCT brand_id) as unique_brands
        FROM products;
      `);
      console.log('\nProducts:', products[0]);

      // Check vendor products
      const { rows: vendorProducts } = await client.query(`
        SELECT 
          v.vendor_name,
          COUNT(vp.*) as total_products,
          COUNT(*) FILTER (WHERE vp.active = true) as active_products
        FROM vendors v
        LEFT JOIN vendor_products vp ON v.vendor_id = vp.vendor_id
        GROUP BY v.vendor_id, v.vendor_name
        ORDER BY v.vendor_name;
      `);
      console.log('\nVendor Products:');
      vendorProducts.forEach(vp => {
        console.log(`${vp.vendor_name}: ${vp.total_products} total, ${vp.active_products} active`);
      });

      // Check inventory
      const { rows: inventory } = await client.query(`
        SELECT 
          v.vendor_name,
          COUNT(vi.*) as inventory_records,
          SUM(vi.quantity) as total_quantity
        FROM vendors v
        LEFT JOIN vendor_products vp ON v.vendor_id = vp.vendor_id
        LEFT JOIN vendor_inventory vi ON vp.vendor_product_id = vi.vendor_product_id
        GROUP BY v.vendor_id, v.vendor_name
        ORDER BY v.vendor_name;
      `);
      console.log('\nInventory by Vendor:');
      inventory.forEach(inv => {
        console.log(`${inv.vendor_name}: ${inv.inventory_records} records, ${inv.total_quantity || 0} units`);
      });

      // Check for data inconsistencies
      const { rows: inconsistencies } = await client.query(`
        SELECT 
          'Products without brand' as issue,
          COUNT(*) as count
        FROM products 
        WHERE brand_id IS NULL
        UNION ALL
        SELECT 
          'Vendor products without product',
          COUNT(*)
        FROM vendor_products
        WHERE product_id IS NULL
        UNION ALL
        SELECT 
          'Active products without inventory',
          COUNT(*)
        FROM vendor_products vp
        LEFT JOIN vendor_inventory vi ON vp.vendor_product_id = vi.vendor_product_id
        WHERE vp.active = true AND vi.inventory_id IS NULL
        UNION ALL
        SELECT 
          'Active products without pricing',
          COUNT(*)
        FROM vendor_products vp
        LEFT JOIN vendor_pricing vpr ON vp.vendor_product_id = vpr.vendor_product_id
        WHERE vp.active = true AND vpr.pricing_id IS NULL;
      `);

      console.log('\nData Inconsistencies:');
      inconsistencies.forEach(inc => {
        console.log(`${inc.issue}: ${inc.count}`);
      });

      return {
        success: true,
        data: {
          vendors: vendors[0],
          products: products[0],
          vendorProducts,
          inventory,
          inconsistencies
        }
      };
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Simple validation error:', error);
    return { success: false, error: error.message };
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  simpleValidation();
}

module.exports = simpleValidation; 
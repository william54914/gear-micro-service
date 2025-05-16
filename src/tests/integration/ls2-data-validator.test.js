const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
const { Pool } = require('pg');

async function validateLs2Data() {
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    console.log('Starting LS2 data validation...');
    const client = await pool.connect();

    try {
      // Get LS2 vendor ID
      const { rows: [ls2] } = await client.query(`
        SELECT vendor_id 
        FROM vendors 
        WHERE vendor_name = 'LS2'
      `);

      if (!ls2) {
        throw new Error('LS2 vendor not found');
      }

      // Check LS2 products
      const { rows: products } = await client.query(`
        SELECT 
          vp.vendor_sku,
          vp.vendor_product_name,
          p.sku as master_sku,
          b.brand_name
        FROM vendor_products vp
        JOIN products p ON vp.product_id = p.product_id
        JOIN brands b ON p.brand_id = b.brand_id
        WHERE vp.vendor_id = $1
      `, [ls2.vendor_id]);

      console.log(`\nFound ${products.length} LS2 products`);

      // Check inventory levels
      const { rows: inventory } = await client.query(`
        SELECT 
          vp.vendor_sku,
          vi.quantity,
          vp.active
        FROM vendor_products vp
        JOIN vendor_inventory vi ON vp.vendor_product_id = vi.vendor_product_id
        WHERE vp.vendor_id = $1
      `, [ls2.vendor_id]);

      console.log(`Found ${inventory.length} inventory records`);
      
      // Check for products with zero inventory
      const zeroInventory = inventory.filter(i => i.quantity === 0 && i.active);
      console.log(`${zeroInventory.length} active products have zero inventory`);

      // Check pricing
      const { rows: pricing } = await client.query(`
        SELECT 
          vp.vendor_sku,
          vpr.cost_price,
          vpr.retail_price,
          vpr.map_price
        FROM vendor_products vp
        JOIN vendor_pricing vpr ON vp.vendor_product_id = vpr.vendor_product_id
        WHERE vp.vendor_id = $1
      `, [ls2.vendor_id]);

      console.log(`Found ${pricing.length} pricing records`);

      // Check for missing or invalid prices
      const invalidPricing = pricing.filter(p => 
        !p.cost_price || !p.retail_price || 
        p.cost_price < 0 || p.retail_price < 0 ||
        p.cost_price > p.retail_price
      );
      console.log(`${invalidPricing.length} products have invalid pricing`);

      // Check for missing attributes
      const { rows: attributes } = await client.query(`
        SELECT DISTINCT attribute_name
        FROM vendor_attributes va
        JOIN vendor_products vp ON va.vendor_product_id = vp.vendor_product_id
        WHERE vp.vendor_id = $1
      `, [ls2.vendor_id]);

      console.log('\nFound attributes:', attributes.map(a => a.attribute_name).join(', '));

      return {
        success: true,
        data: {
          productCount: products.length,
          inventoryCount: inventory.length,
          zeroInventoryCount: zeroInventory.length,
          pricingCount: pricing.length,
          invalidPricingCount: invalidPricing.length,
          attributes: attributes.map(a => a.attribute_name)
        }
      };
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('LS2 data validation error:', error);
    return { success: false, error: error.message };
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  validateLs2Data();
}

module.exports = validateLs2Data; 
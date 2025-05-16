const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../../.env') });
const { Pool } = require('pg');

async function validateAmazonMapping() {
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    console.log('Starting Amazon mapping validation...');
    const client = await pool.connect();

    try {
      // Check product mappings
      const { rows: unmappedProducts } = await client.query(`
        SELECT al.sku, al.product_name, al.asin
        FROM amazon_listings al
        LEFT JOIN vendor_products vp ON al.sku = vp.vendor_sku
        WHERE vp.vendor_product_id IS NULL;
      `);

      console.log('\nUnmapped Amazon Products:', unmappedProducts.length);
      if (unmappedProducts.length > 0) {
        console.log('Sample of unmapped products:');
        unmappedProducts.slice(0, 5).forEach(p => {
          console.log(`SKU: ${p.sku}, ASIN: ${p.asin}, Name: ${p.product_name}`);
        });
      }

      // Check inventory discrepancies
      const { rows: inventoryDiscrepancies } = await client.query(`
        SELECT 
          al.sku,
          al.quantity as amazon_quantity,
          vi.quantity as vendor_quantity
        FROM amazon_listings al
        JOIN vendor_products vp ON al.sku = vp.vendor_sku
        JOIN vendor_inventory vi ON vp.vendor_product_id = vi.vendor_product_id
        WHERE al.quantity != vi.quantity;
      `);

      console.log('\nInventory Discrepancies:', inventoryDiscrepancies.length);
      if (inventoryDiscrepancies.length > 0) {
        console.log('Sample of inventory discrepancies:');
        inventoryDiscrepancies.slice(0, 5).forEach(d => {
          console.log(`SKU: ${d.sku}, Amazon: ${d.amazon_quantity}, Vendor: ${d.vendor_quantity}`);
        });
      }

      // Check price discrepancies
      const { rows: priceDiscrepancies } = await client.query(`
        SELECT 
          al.sku,
          al.price as amazon_price,
          vp.retail_price as vendor_price
        FROM amazon_listings al
        JOIN vendor_products vp ON al.sku = vp.vendor_sku
        JOIN vendor_pricing vpr ON vp.vendor_product_id = vpr.vendor_product_id
        WHERE ABS(al.price - vpr.retail_price) > 0.01;
      `);

      console.log('\nPrice Discrepancies:', priceDiscrepancies.length);
      if (priceDiscrepancies.length > 0) {
        console.log('Sample of price discrepancies:');
        priceDiscrepancies.slice(0, 5).forEach(d => {
          console.log(`SKU: ${d.sku}, Amazon: $${d.amazon_price}, Vendor: $${d.vendor_price}`);
        });
      }

      return {
        success: true,
        data: {
          unmappedProducts,
          inventoryDiscrepancies,
          priceDiscrepancies
        }
      };
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Amazon mapping validation error:', error);
    return { success: false, error: error.message };
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  validateAmazonMapping();
}

module.exports = validateAmazonMapping; 
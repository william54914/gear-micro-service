const sequelize = require('../config/database');

/**
 * Script to add indexes to the SKU columns in restock tables
 * This will improve query performance significantly for operations that filter or join by SKU
 */
(async () => {
  try {
    console.log('Adding indexes to restock tables...');
    
    // Check if the indexes already exist
    const checkIndexQuery = `
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename IN ('restock_vitals', 'restock_info', 'restock_cost')
        AND indexname LIKE '%_sku_idx'
    `;
    
    const [existingIndexes] = await sequelize.query(checkIndexQuery);
    
    if (existingIndexes.length > 0) {
      console.log('The following indexes already exist:');
      existingIndexes.forEach(idx => console.log(`- ${idx.indexname}`));
    }

    // Add index to restock_vitals.sku if it doesn't exist
    if (!existingIndexes.some(idx => idx.indexname === 'restock_vitals_sku_idx')) {
      console.log('Adding index to restock_vitals.sku...');
      await sequelize.query(`
        CREATE INDEX restock_vitals_sku_idx ON restock_vitals (sku);
      `);
      console.log('Index on restock_vitals.sku created successfully');
    }

    // Add index to restock_info.sku if it doesn't exist
    if (!existingIndexes.some(idx => idx.indexname === 'restock_info_sku_idx')) {
      console.log('Adding index to restock_info.sku...');
      await sequelize.query(`
        CREATE INDEX restock_info_sku_idx ON restock_info (sku);
      `);
      console.log('Index on restock_info.sku created successfully');
    }

    // Add index to restock_cost.sku if it doesn't exist
    if (!existingIndexes.some(idx => idx.indexname === 'restock_cost_sku_idx')) {
      console.log('Adding index to restock_cost.sku...');
      await sequelize.query(`
        CREATE INDEX restock_cost_sku_idx ON restock_cost (sku);
      `);
      console.log('Index on restock_cost.sku created successfully');
    }
    
    console.log('All indexes have been added successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error adding indexes:', error);
    process.exit(1);
  }
})(); 
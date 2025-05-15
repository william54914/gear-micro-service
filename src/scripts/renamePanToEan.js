const sequelize = require('../config/database');

(async () => {
  try {
    console.log('Starting column rename from pan to ean...');
    
    // Check if the pan column exists
    const checkQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'restock_info' 
      AND column_name = 'pan'
    `;
    
    const [columns] = await sequelize.query(checkQuery);
    
    if (columns.length === 0) {
      console.log('The pan column does not exist. It may have already been renamed to ean.');
      process.exit(0);
    }
    
    // Check if the ean column already exists
    const checkEanQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'restock_info' 
      AND column_name = 'ean'
    `;
    
    const [eanColumns] = await sequelize.query(checkEanQuery);
    
    if (eanColumns.length > 0) {
      console.log('The ean column already exists. Cannot rename pan to ean.');
      process.exit(1);
    }

    // Rename the column
    console.log('Renaming pan column to ean...');
    await sequelize.query('ALTER TABLE restock_info RENAME COLUMN pan TO ean');
    
    // Update comment if applicable
    await sequelize.query(`
      COMMENT ON COLUMN restock_info.ean IS 'European Article Number'
    `);
    
    console.log('Successfully renamed column from pan to ean!');
    process.exit(0);
  } catch (error) {
    console.error('Error renaming column:', error);
    process.exit(1);
  }
})(); 
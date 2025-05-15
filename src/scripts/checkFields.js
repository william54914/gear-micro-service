const sequelize = require('../config/database');
const { QueryTypes } = require('@sequelize/core');

async function checkFields() {
  try {
    console.log('Checking fields in RestockInfo table...');
    
    // Check for records with MSKU populated
    const [msukResults] = await sequelize.query(`
      SELECT COUNT(*) as count 
      FROM restock_info 
      WHERE msku IS NOT NULL AND msku != ''
    `, { type: QueryTypes.SELECT });
    
    console.log(`Records with MSKU populated: ${msukResults.count}`);
    
    // Check for tag fields with data
    const tagResults = await sequelize.query(`
      SELECT 
        SUM(CASE WHEN tag1 IS NOT NULL AND tag1 != '' THEN 1 ELSE 0 END) as tag1_count,
        SUM(CASE WHEN tag2 IS NOT NULL AND tag2 != '' THEN 1 ELSE 0 END) as tag2_count,
        SUM(CASE WHEN tag3 IS NOT NULL AND tag3 != '' THEN 1 ELSE 0 END) as tag3_count,
        SUM(CASE WHEN tag4 IS NOT NULL AND tag4 != '' THEN 1 ELSE 0 END) as tag4_count,
        SUM(CASE WHEN tag5 IS NOT NULL AND tag5 != '' THEN 1 ELSE 0 END) as tag5_count,
        SUM(CASE WHEN tag6 IS NOT NULL AND tag6 != '' THEN 1 ELSE 0 END) as tag6_count,
        SUM(CASE WHEN tag7 IS NOT NULL AND tag7 != '' THEN 1 ELSE 0 END) as tag7_count,
        SUM(CASE WHEN tag8 IS NOT NULL AND tag8 != '' THEN 1 ELSE 0 END) as tag8_count,
        SUM(CASE WHEN tag9 IS NOT NULL AND tag9 != '' THEN 1 ELSE 0 END) as tag9_count,
        SUM(CASE WHEN tag10 IS NOT NULL AND tag10 != '' THEN 1 ELSE 0 END) as tag10_count
      FROM restock_info
    `, { type: QueryTypes.SELECT });
    
    console.log('Tag fields populated:');
    const tagCounts = tagResults[0];
    Object.entries(tagCounts).forEach(([field, count]) => {
      console.log(`- ${field}: ${count}`);
    });
    
    // Sample records to see actual values
    console.log('\nSample records:');
    const sampleRecords = await sequelize.query(`
      SELECT ri.sku, ri.msku, ri.tag1, ri.tag2, ri.tag3, ri.tag4, ri.tag5
      FROM restock_info ri
      WHERE (ri.msku IS NOT NULL AND ri.msku != '')
         OR (ri.tag1 IS NOT NULL AND ri.tag1 != '')
      LIMIT 5
    `, { type: QueryTypes.SELECT });
    
    sampleRecords.forEach((record, index) => {
      console.log(`\nSample Record ${index + 1}:`);
      console.log(`- SKU: ${record.sku}`);
      console.log(`- MSKU (supplier_sku): ${record.msku || '(empty)'}`);
      console.log(`- Tag1: ${record.tag1 || '(empty)'}`);
      console.log(`- Tag2: ${record.tag2 || '(empty)'}`);
      console.log(`- Tag3: ${record.tag3 || '(empty)'}`);
      console.log(`- Tag4: ${record.tag4 || '(empty)'}`);
      console.log(`- Tag5: ${record.tag5 || '(empty)'}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking fields:', error);
    process.exit(1);
  }
}

checkFields(); 
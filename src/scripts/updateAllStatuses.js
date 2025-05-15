const sequelize = require('../config/database');
const { QueryTypes } = require('@sequelize/core');

async function updateAllStatuses() {
  try {
    console.log('Updating all statuses to Active...');
    
    await sequelize.transaction(async (transaction) => {
      // Update restock vitals
      const [restockResult] = await sequelize.query(
        'UPDATE restock_vitals SET status = \'Active\', updated_at = NOW()',
        { 
          type: QueryTypes.UPDATE,
          transaction 
        }
      );
      
      console.log(`Updated ${restockResult} restock records to Active`);
      
      // Update amazon vitals
      const [amazonResult] = await sequelize.query(
        'UPDATE amazon_vitals SET status = \'Active\', updated_at = NOW()',
        { 
          type: QueryTypes.UPDATE,
          transaction 
        }
      );
      
      console.log(`Updated ${amazonResult} Amazon records to Active`);
    });
    
    // Check updated status counts
    const restockStatusCounts = await sequelize.query(
      'SELECT status, COUNT(*) as count FROM restock_vitals GROUP BY status',
      { type: QueryTypes.SELECT }
    );
    
    console.log('Updated Restock Status Counts:');
    console.log(restockStatusCounts);
    
    const amazonStatusCounts = await sequelize.query(
      'SELECT status, COUNT(*) as count FROM amazon_vitals GROUP BY status',
      { type: QueryTypes.SELECT }
    );
    
    console.log('\nUpdated Amazon Status Counts:');
    console.log(amazonStatusCounts);
    
    console.log('\nStatus update completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating statuses:', error);
    process.exit(1);
  }
}

updateAllStatuses(); 
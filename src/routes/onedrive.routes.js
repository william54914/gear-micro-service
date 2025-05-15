const express = require('express');
const OneDriveClient = require('../services/onedrive.service');
const importController = require('../controllers/import.controller');
const sequelize = require('../config/database');
const router = express.Router();

/**
 * @route GET /api/onedrive/folders
 * @description List folders in OneDrive root
 * @access Private
 */
router.get('/folders', async (req, res) => {
  try {
    const client = new OneDriveClient();
    const folders = await client.listRootFolders();
    console.log('Root folder contents:', folders);
    res.status(200).json(folders);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/onedrive/files/:folderId
 * @description List files in a specific folder
 * @access Private
 */
router.get('/files/:folderId', async (req, res) => {
  try {
    const client = new OneDriveClient();
    const files = await client.listFilesInFolder(req.params.folderId);
    res.status(200).json(files);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/onedrive/folders/:path
 * @description Find folder by path
 * @access Private
 */
router.get('/folders/:path(*)', async (req, res) => {
  try {
    const client = new OneDriveClient();
    const folder = await client.findFolderByPath(req.params.path);
    res.status(200).json(folder);
  } catch (error) {
    console.error('Error finding folder:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/onedrive/import-restock
 * @description Import restock data from OneDrive
 * @access Private
 */
router.get('/import-restock', async (req, res) => {
  try {
    // Get folder path and file name from query parameters or default values
    const folderPath = req.query.path || process.env.RESTOCK_FOLDER_PATH || 'inventory management/Restock Products';
    const fileName = req.query.file || process.env.RESTOCK_FILE || 'restock_products.csv';
    
    // Import data
    const result = await importController.importRestockFromOneDrive({
      folderPath,
      fileName
    });
    
    res.status(200).json({
      message: `Successfully imported ${result.results.success} restock records`,
      failed: result.results.failed,
      total: result.results.total,
      file: result.file
    });
  } catch (error) {
    console.error('Error importing restock data:', error);
    res.status(500).json({
      error: 'Failed to import restock data',
      details: error.message
    });
  }
});

/**
 * @route GET /api/onedrive/test-import-small
 * @description Test import with a small dataset (2 rows) for testing inactive marking
 * @access Private
 */
router.get('/test-import-small', async (req, res) => {
  try {
    // Clear existing data first
    console.log('Clearing existing restock data...');
    await sequelize.transaction(async (transaction) => {
      await sequelize.query('DELETE FROM restock_cost', { transaction });
      await sequelize.query('DELETE FROM restock_info', { transaction });
      await sequelize.query('DELETE FROM restock_vitals', { transaction });
    });
    
    // Sample CSV content with just 2 rows
    const sampleCsvContent = `SKU,FNSKU,Product Name,ASIN,Status,MSKU,Supplier,UPC,EAN,Cost,TAG 1,TAG 2,TAG 3,TAG 4,TAG 5
SKU123,FNSKU123,Test Product 1,B0123456,Active,MSKU123,Test Supplier,123456789012,,19.99,Tag1,Tag2,Tag3,,
SKU456,FNSKU456,Test Product 2,B0654321,Active,MSKU456,Another Supplier,098765432109,,24.99,TagA,TagB,,,`;

    console.log('Importing small test dataset...');
    
    // Use the same importer as the regular endpoint
    const result = await importController.importers.restock.import(sampleCsvContent);
    
    // Log results
    console.log(`First import completed. Success: ${result.success}, Failed: ${result.failed}`);
    
    // Return response
    res.status(200).json({
      message: `First import: ${result.success} records successfully imported`,
      importCount: result.success
    });
  } catch (error) {
    console.error('Error testing small import:', error);
    res.status(500).json({
      error: 'Failed to run test import',
      details: error.message
    });
  }
});

/**
 * @route GET /api/onedrive/test-import-smaller
 * @description Test import with an even smaller dataset (1 row) to test inactive marking
 * @access Private
 */
router.get('/test-import-smaller', async (req, res) => {
  try {
    // Sample CSV content with just 1 row (removed one record)
    const sampleCsvContent = `SKU,FNSKU,Product Name,ASIN,Status,MSKU,Supplier,UPC,EAN,Cost,TAG 1,TAG 2,TAG 3,TAG 4,TAG 5
SKU123,FNSKU123,Test Product 1,B0123456,Active,MSKU123,Test Supplier,123456789012,,19.99,Tag1,Tag2,Tag3,,`;

    console.log('Importing smaller test dataset (should mark SKU456 as inactive)...');
    
    // Use the same importer as the regular endpoint
    const result = await importController.importers.restock.import(sampleCsvContent);
    
    // Check statuses
    const statusCounts = await sequelize.query(
      'SELECT status, COUNT(*) as count FROM restock_vitals GROUP BY status',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    // Log results
    console.log(`Second import completed. Success: ${result.success}, Failed: ${result.failed}`);
    console.log('Status counts:', statusCounts);
    
    // Return response
    res.status(200).json({
      message: `Second import: ${result.success} records successfully imported`,
      importCount: result.success,
      statusCounts
    });
  } catch (error) {
    console.error('Error testing smaller import:', error);
    res.status(500).json({
      error: 'Failed to run smaller test import',
      details: error.message
    });
  }
});

module.exports = router; 
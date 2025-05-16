const BaseImporter = require('./importer.base');
const { RestockVitals, RestockInfo, RestockCost } = require('../../models');
const sequelize = require('../../config/database');
const OneDriveClient = require('../onedrive.service');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

/**
 * Importer for Restock products data
 */
class RestockImporter extends BaseImporter {
  constructor() {
    super();
    this.filename = 'restock_products.csv';
    this.folderPath = 'Inventory Management/Restock Products';
    this.batchSize = 100; // Process 100 records at a time
    this.markMissingAsInactive = true; // Flag to mark missing items as inactive
    this.oneDrive = new OneDriveClient();

    // Log configuration on initialization
    console.log('\nRestock Importer Configuration:');
    console.log('Folder Path:', this.folderPath);
    console.log('File Name:', this.filename);
    console.log('Batch Size:', this.batchSize);
    console.log('Mark Missing as Inactive:', this.markMissingAsInactive);
    console.log('\nOneDrive Environment Variables:');
    console.log('ONEDRIVE_CLIENT_ID:', process.env.ONEDRIVE_CLIENT_ID?.substring(0, 5) + '...');
    console.log('ONEDRIVE_CLIENT_SECRET:', process.env.ONEDRIVE_CLIENT_SECRET?.substring(0, 5) + '...');
    console.log('ONEDRIVE_TENANT_ID:', process.env.ONEDRIVE_TENANT_ID?.substring(0, 5) + '...');
    console.log('ONEDRIVE_USER_EMAIL:', process.env.ONEDRIVE_USER_EMAIL);
  }

  /**
   * Set folder name and file name for import
   * @param {string} folderName - OneDrive folder name 
   * @param {string} filename - File name to import
   */
  setSource(folderName, filename) {
    console.log('\nChanging source configuration:');
    console.log('Old Folder Path:', this.folderPath);
    console.log('Old File Name:', this.filename);
    console.log('New Folder Path:', folderName);
    console.log('New File Name:', filename);

    this.folderPath = folderName;
    this.filename = filename;
    return this;
  }

  /**
   * Set batch size for processing
   * @param {number} size - Batch size
   */
  setBatchSize(size) {
    this.batchSize = size;
    return this;
  }

  /**
   * Set whether to mark missing items as inactive
   * @param {boolean} value - True to mark missing items inactive
   */
  setMarkMissingAsInactive(value) {
    this.markMissingAsInactive = value;
    return this;
  }

  /**
   * Process a single record from the CSV
   * @param {Object} record - CSV record
   * @returns {Promise<boolean>} - Success status
   */
  async processRecord(record) {
    try {
      // Get SKU - required field
      const sku = this.getFieldValue(record, ['SKU', 'sku']);
      
      if (!sku) {
        console.warn('Skipping record with no SKU');
        return false;
      }

      // Create or update RestockVitals
      const [vitals, createdVitals] = await RestockVitals.findOrCreate({
        where: { sku },
        defaults: {
          fnsku: this.getFieldValue(record, ['FNSKU', 'fnsku']),
          product_name: this.getFieldValue(record, ['Product Name', 'product_name', 'name']),
          asin: this.getFieldValue(record, ['ASIN', 'asin']),
          status: this.getFieldValue(record, ['Status', 'status'], 'Active')
        }
      });

      if (!createdVitals) {
        await vitals.update({
          fnsku: this.getFieldValue(record, ['FNSKU', 'fnsku'], vitals.fnsku),
          product_name: this.getFieldValue(record, ['Product Name', 'product_name', 'name'], vitals.product_name),
          asin: this.getFieldValue(record, ['ASIN', 'asin'], vitals.asin),
          status: this.getFieldValue(record, ['Status', 'status'], vitals.status)
        });
      }

      // Create or update RestockInfo
      const [info, createdInfo] = await RestockInfo.findOrCreate({
        where: { sku },
        defaults: {
          msku: this.getFieldValue(record, ['MSKU', 'msku']),
          supplier: this.getFieldValue(record, ['Supplier', 'supplier']),
          upc: this.getFieldValue(record, ['UPC', 'upc']),
          ean: this.getFieldValue(record, ['EAN', 'ean']),
          tag1: this.getFieldValue(record, ['TAG 1', 'tag1']),
          tag2: this.getFieldValue(record, ['TAG 2', 'tag2']),
          tag3: this.getFieldValue(record, ['TAG 3', 'tag3']),
          tag4: this.getFieldValue(record, ['TAG 4', 'tag4']),
          tag5: this.getFieldValue(record, ['TAG 5', 'tag5']),
          tag6: this.getFieldValue(record, ['TAG 6', 'tag6']),
          tag7: this.getFieldValue(record, ['TAG 7', 'tag7']),
          tag8: this.getFieldValue(record, ['TAG 8', 'tag8']),
          tag9: this.getFieldValue(record, ['TAG 9', 'tag9']),
          tag10: this.getFieldValue(record, ['TAG 10', 'tag10'])
        }
      });

      if (!createdInfo) {
        await info.update({
          msku: this.getFieldValue(record, ['MSKU', 'msku'], info.msku),
          supplier: this.getFieldValue(record, ['Supplier', 'supplier'], info.supplier),
          upc: this.getFieldValue(record, ['UPC', 'upc'], info.upc),
          ean: this.getFieldValue(record, ['EAN', 'ean'], info.ean),
          tag1: this.getFieldValue(record, ['TAG 1', 'tag1'], info.tag1),
          tag2: this.getFieldValue(record, ['TAG 2', 'tag2'], info.tag2),
          tag3: this.getFieldValue(record, ['TAG 3', 'tag3'], info.tag3),
          tag4: this.getFieldValue(record, ['TAG 4', 'tag4'], info.tag4),
          tag5: this.getFieldValue(record, ['TAG 5', 'tag5'], info.tag5),
          tag6: this.getFieldValue(record, ['TAG 6', 'tag6'], info.tag6),
          tag7: this.getFieldValue(record, ['TAG 7', 'tag7'], info.tag7),
          tag8: this.getFieldValue(record, ['TAG 8', 'tag8'], info.tag8),
          tag9: this.getFieldValue(record, ['TAG 9', 'tag9'], info.tag9),
          tag10: this.getFieldValue(record, ['TAG 10', 'tag10'], info.tag10)
        });
      }

      // Create or update RestockCost
      const costValue = parseFloat(this.getFieldValue(record, ['Cost', 'cost'], '0'));
      const [cost, createdCost] = await RestockCost.findOrCreate({
        where: { sku },
        defaults: {
          cost: isNaN(costValue) ? 0 : costValue
        }
      });

      if (!createdCost && !isNaN(costValue)) {
        await cost.update({ cost: costValue });
      }

      return true;
    } catch (error) {
      console.error(`Error processing record with SKU ${record.SKU || record.sku || 'unknown'}:`, error);
      return false;
    }
  }

  /**
   * Import data from OneDrive
   * @returns {Promise<Object>} - Import results
   */
  async import() {
    try {
      console.log('\nStarting Restock import...');
      console.log('OneDrive Configuration:');
      console.log('Client ID:', process.env.ONEDRIVE_CLIENT_ID?.substring(0, 5) + '...');
      console.log('Client Secret:', process.env.ONEDRIVE_CLIENT_SECRET?.substring(0, 5) + '...');
      console.log('Tenant ID:', process.env.ONEDRIVE_TENANT_ID?.substring(0, 5) + '...');
      console.log('User Email:', process.env.ONEDRIVE_USER_EMAIL);
      
      // Verify all required environment variables are set
      if (!process.env.ONEDRIVE_CLIENT_ID || !process.env.ONEDRIVE_CLIENT_SECRET || 
          !process.env.ONEDRIVE_TENANT_ID || !process.env.ONEDRIVE_USER_EMAIL) {
        throw new Error('Missing required OneDrive environment variables');
      }
      
      console.log(`\nLooking for file '${this.filename}' in path '${this.folderPath}'...`);
      try {
        // First, try to get an access token
        console.log('\nGetting OneDrive access token...');
        const token = await this.oneDrive.getToken();
        if (!token) {
          throw new Error('Failed to get OneDrive access token');
        }
        console.log('Successfully obtained access token');

        // List root folders to verify connection
        console.log('\nListing root folders...');
        const rootFolders = await this.oneDrive.listRootFolders();
        if (!rootFolders || !Array.isArray(rootFolders)) {
          throw new Error('Failed to list root folders');
        }
        console.log('Root folders found:', rootFolders.map(f => ({ name: f.name, type: f.type })));

        // Then find the target folder
        console.log('\nFinding target folder...');
        const folder = await this.oneDrive.findFolderByPath(this.folderPath);
        if (!folder || !folder.id) {
          throw new Error(`Folder not found: ${this.folderPath}`);
        }
        console.log('Found folder:', folder);
        
        // List files in the folder
        console.log('\nListing files in folder...');
        const files = await this.oneDrive.listFilesInFolder(folder.id);
        if (!files || !Array.isArray(files)) {
          throw new Error('Failed to list files in folder');
        }
        console.log('Files in folder:', files.map(f => ({ name: f.name, type: f.type })));
        
        // Find our target file
        console.log('\nLooking for target file...');
        const file = await this.oneDrive.findFileInFolder(folder.id, this.filename);
        if (!file || !file.id) {
          throw new Error(`File not found: ${this.filename}`);
        }
        console.log('Found file:', file);
        
        console.log('\nDownloading file content...');
        const csvContent = await this.oneDrive.getFileContent(file.id);
        if (!csvContent) {
          throw new Error('Failed to download file content');
        }
        console.log('File content downloaded:', csvContent.substring(0, 100) + '...');
        
        // Process the CSV content
        return await super.import(csvContent);
      } catch (error) {
        console.error('\nError accessing OneDrive:', error);
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        }
        if (error.message.includes('invalid_client')) {
          console.error('\nOneDrive authentication failed. Please check:');
          console.error('1. ONEDRIVE_CLIENT_ID is correct');
          console.error('2. ONEDRIVE_CLIENT_SECRET is correct');
          console.error('3. ONEDRIVE_TENANT_ID is correct');
          console.error('4. ONEDRIVE_USER_EMAIL is correct');
          console.error('\nCurrent values:');
          console.error('ONEDRIVE_CLIENT_ID:', process.env.ONEDRIVE_CLIENT_ID);
          console.error('ONEDRIVE_CLIENT_SECRET:', process.env.ONEDRIVE_CLIENT_SECRET);
          console.error('ONEDRIVE_TENANT_ID:', process.env.ONEDRIVE_TENANT_ID);
          console.error('ONEDRIVE_USER_EMAIL:', process.env.ONEDRIVE_USER_EMAIL);
        }
        throw error;
      }
    } catch (error) {
      console.error('\nError during Restock import:', error);
      if (error.message.includes('Missing required OneDrive environment variables')) {
        console.error('\nPlease check your .env file has the following variables:');
        console.error('- ONEDRIVE_CLIENT_ID');
        console.error('- ONEDRIVE_CLIENT_SECRET');
        console.error('- ONEDRIVE_TENANT_ID');
        console.error('- ONEDRIVE_USER_EMAIL');
      } else if (error.message.includes('Folder') || error.message.includes('File')) {
        console.error('\nPlease check:');
        console.error(`1. The folder path "${this.folderPath}" exists`);
        console.error(`2. The file "${this.filename}" exists in that folder`);
        console.error('3. The OneDrive credentials are correct');
      }
      throw error;
    }
  }

  /**
   * Import data from CSV content with optimized batch processing
   * @param {string} csvContent - Raw CSV content
   * @returns {Promise<Object>} - Import results
   */
  async import(csvContent) {
    try {
      this.resetStats();
      console.log('Parsing CSV content...');
      const records = await this.parseCSV(csvContent);
      console.log(`Found ${records.length} records to process`);
      
      // Extract all SKUs from the import file
      const importedSkus = new Set();
      records.forEach(record => {
        const sku = this.getFieldValue(record, ['SKU', 'sku']);
        if (sku) importedSkus.add(sku);
      });
      
      console.log(`Found ${importedSkus.size} unique SKUs in import file`);
      
      // Group records by batches
      const batches = [];
      for (let i = 0; i < records.length; i += this.batchSize) {
        batches.push(records.slice(i, i + this.batchSize));
      }
      
      console.log(`Processing in ${batches.length} batches of ${this.batchSize} records`);
      
      // Process batches
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        console.log(`Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} records)...`);
        
        // Use transaction for each batch for better performance and data integrity
        await sequelize.transaction(async (transaction) => {
          // Extract SKUs to find existing records in bulk
          const skus = batch.map(record => 
            this.getFieldValue(record, ['SKU', 'sku'])
          ).filter(sku => sku); // Filter out empty SKUs
          
          // Fetch all existing records in one go
          const existingVitals = await RestockVitals.findAll({ 
            where: { sku: skus },
            transaction
          });
          const existingInfos = await RestockInfo.findAll({
            where: { sku: skus },
            transaction
          });
          const existingCosts = await RestockCost.findAll({
            where: { sku: skus },
            transaction
          });
          
          // Convert to maps for quick lookup
          const vitalsMap = new Map(existingVitals.map(v => [v.sku, v]));
          const infosMap = new Map(existingInfos.map(i => [i.sku, i]));
          const costsMap = new Map(existingCosts.map(c => [c.sku, c]));
          
          // Prepare bulk operations
          const vitalsToCreate = [];
          const vitalsToUpdate = [];
          const infosToCreate = [];
          const infosToUpdate = [];
          const costsToCreate = [];
          const costsToUpdate = [];
          
          // Process each record in the batch
          for (const record of batch) {
            try {
              const sku = this.getFieldValue(record, ['SKU', 'sku']);
              
              if (!sku) {
                console.warn('Skipping record with no SKU');
                this.errorCount++;
                this.errors.push({ record, error: 'Missing SKU' });
                continue;
              }
              
              // Process RestockVitals
              if (vitalsMap.has(sku)) {
                // Update existing
                const vital = vitalsMap.get(sku);
                vital.fnsku = this.getFieldValue(record, ['FNSKU', 'fnsku'], vital.fnsku);
                vital.product_name = this.getFieldValue(record, ['Product Name', 'product_name', 'name'], vital.product_name);
                vital.asin = this.getFieldValue(record, ['ASIN', 'asin'], vital.asin);
                
                // Always set imported records to Active unless explicitly marked as something else in the CSV
                const statusFromCSV = this.getFieldValue(record, ['Status', 'status']);
                vital.status = statusFromCSV || 'Active';
                
                vitalsToUpdate.push(vital);
              } else {
                // Create new
                vitalsToCreate.push({
                  sku,
                  fnsku: this.getFieldValue(record, ['FNSKU', 'fnsku']),
                  product_name: this.getFieldValue(record, ['Product Name', 'product_name', 'name']),
                  asin: this.getFieldValue(record, ['ASIN', 'asin']),
                  
                  // Always set imported records to Active unless explicitly marked as something else in the CSV
                  status: this.getFieldValue(record, ['Status', 'status']) || 'Active'
                });
              }
              
              // Process RestockInfo
              if (infosMap.has(sku)) {
                // Update existing
                const info = infosMap.get(sku);
                
                // Map supplier_sku to msku field
                info.msku = this.getFieldValue(record, ['supplier_sku', 'Supplier SKU', 'SupplierSKU'], info.msku);
                info.supplier = this.getFieldValue(record, ['Supplier', 'supplier'], info.supplier);
                info.upc = this.getFieldValue(record, ['UPC', 'upc'], info.upc);
                info.ean = this.getFieldValue(record, ['EAN', 'ean'], info.ean);
                
                // Parse tags from semicolon-separated list
                const tagsValue = this.getFieldValue(record, ['tags', 'Tags', 'TAGS']);
                if (tagsValue) {
                  const tagArray = tagsValue.split(';').map(tag => tag.trim()).filter(Boolean);
                  info.tag1 = tagArray[0] || info.tag1;
                  info.tag2 = tagArray[1] || info.tag2;
                  info.tag3 = tagArray[2] || info.tag3;
                  info.tag4 = tagArray[3] || info.tag4;
                  info.tag5 = tagArray[4] || info.tag5;
                  info.tag6 = tagArray[5] || info.tag6;
                  info.tag7 = tagArray[6] || info.tag7;
                  info.tag8 = tagArray[7] || info.tag8;
                  info.tag9 = tagArray[8] || info.tag9;
                  info.tag10 = tagArray[9] || info.tag10;
                } else {
                  // Fallback to individual tag fields if they exist
                  info.tag1 = this.getFieldValue(record, ['TAG 1', 'tag1'], info.tag1);
                  info.tag2 = this.getFieldValue(record, ['TAG 2', 'tag2'], info.tag2);
                  info.tag3 = this.getFieldValue(record, ['TAG 3', 'tag3'], info.tag3);
                  info.tag4 = this.getFieldValue(record, ['TAG 4', 'tag4'], info.tag4);
                  info.tag5 = this.getFieldValue(record, ['TAG 5', 'tag5'], info.tag5);
                  info.tag6 = this.getFieldValue(record, ['TAG 6', 'tag6'], info.tag6);
                  info.tag7 = this.getFieldValue(record, ['TAG 7', 'tag7'], info.tag7);
                  info.tag8 = this.getFieldValue(record, ['TAG 8', 'tag8'], info.tag8);
                  info.tag9 = this.getFieldValue(record, ['TAG 9', 'tag9'], info.tag9);
                  info.tag10 = this.getFieldValue(record, ['TAG 10', 'tag10'], info.tag10);
                }
                
                infosToUpdate.push(info);
              } else {
                // Create new
                const tagsValue = this.getFieldValue(record, ['tags', 'Tags', 'TAGS']);
                let tagValues = {
                  tag1: '', tag2: '', tag3: '', tag4: '', tag5: '',
                  tag6: '', tag7: '', tag8: '', tag9: '', tag10: ''
                };
                
                if (tagsValue) {
                  const tagArray = tagsValue.split(';').map(tag => tag.trim()).filter(Boolean);
                  for (let i = 0; i < Math.min(tagArray.length, 10); i++) {
                    tagValues[`tag${i+1}`] = tagArray[i];
                  }
                } else {
                  // Fallback to individual tag fields
                  tagValues.tag1 = this.getFieldValue(record, ['TAG 1', 'tag1']);
                  tagValues.tag2 = this.getFieldValue(record, ['TAG 2', 'tag2']);
                  tagValues.tag3 = this.getFieldValue(record, ['TAG 3', 'tag3']);
                  tagValues.tag4 = this.getFieldValue(record, ['TAG 4', 'tag4']);
                  tagValues.tag5 = this.getFieldValue(record, ['TAG 5', 'tag5']);
                  tagValues.tag6 = this.getFieldValue(record, ['TAG 6', 'tag6']);
                  tagValues.tag7 = this.getFieldValue(record, ['TAG 7', 'tag7']);
                  tagValues.tag8 = this.getFieldValue(record, ['TAG 8', 'tag8']);
                  tagValues.tag9 = this.getFieldValue(record, ['TAG 9', 'tag9']);
                  tagValues.tag10 = this.getFieldValue(record, ['TAG 10', 'tag10']);
                }
                
                infosToCreate.push({
                  sku,
                  msku: this.getFieldValue(record, ['supplier_sku', 'Supplier SKU', 'SupplierSKU']),
                  supplier: this.getFieldValue(record, ['Supplier', 'supplier']),
                  upc: this.getFieldValue(record, ['UPC', 'upc']),
                  ean: this.getFieldValue(record, ['EAN', 'ean']),
                  ...tagValues
                });
              }
              
              // Process RestockCost
              const costValue = parseFloat(this.getFieldValue(record, ['Cost', 'cost'], '0'));
              if (costsMap.has(sku)) {
                // Update existing
                const cost = costsMap.get(sku);
                if (!isNaN(costValue)) {
                  cost.cost = costValue;
                  costsToUpdate.push(cost);
                }
              } else {
                // Create new
                costsToCreate.push({
                  sku,
                  cost: isNaN(costValue) ? 0 : costValue
                });
              }
              
              this.successCount++;
            } catch (error) {
              console.error(`Error processing record:`, error);
              this.errorCount++;
              this.errors.push({ record, error: error.message });
            }
          }
          
          // Execute bulk operations
          if (vitalsToCreate.length > 0) {
            await RestockVitals.bulkCreate(vitalsToCreate, { transaction });
          }
          
          for (const vital of vitalsToUpdate) {
            await vital.save({ transaction });
          }
          
          if (infosToCreate.length > 0) {
            await RestockInfo.bulkCreate(infosToCreate, { transaction });
          }
          
          for (const info of infosToUpdate) {
            await info.save({ transaction });
          }
          
          if (costsToCreate.length > 0) {
            await RestockCost.bulkCreate(costsToCreate, { transaction });
          }
          
          for (const cost of costsToUpdate) {
            await cost.save({ transaction });
          }
        });
        
        console.log(`Batch ${batchIndex + 1} processed. Success: ${this.successCount}, Failed: ${this.errorCount}`);
      }

      // Mark missing items as inactive
      if (this.markMissingAsInactive) {
        console.log('Checking for SKUs in database that are not in the import file...');
        
        await sequelize.transaction(async (transaction) => {
          // Convert importedSkus Set to array for database operations
          const importedSkusArray = Array.from(importedSkus);
          
          // Use a more efficient approach by letting the database do the work
          if (importedSkusArray.length > 0) {
            // First, set all imported SKUs to Active
            const chunkSize = 1000; // PostgreSQL has limits on the number of parameters
            let activeCount = 0;
            
            // Process in chunks to avoid parameter limits
            for (let i = 0; i < importedSkusArray.length; i += chunkSize) {
              const chunk = importedSkusArray.slice(i, i + chunkSize);
              
              // Update all imported SKUs to Active
              const activateQuery = `
                UPDATE restock_vitals
                SET status = 'Active', updated_at = NOW()
                WHERE sku IN (
                  SELECT unnest($1::text[])
                )
              `;
              
              const [activateResult] = await sequelize.query(activateQuery, {
                bind: [chunk],
                type: sequelize.QueryTypes.UPDATE,
                transaction
              });
              
              activeCount += activateResult;
            }
            
            console.log(`${activeCount} restock items marked as Active`);
            
            // Now mark items not in the import as Inactive
            // Safer approach for large arrays - split into chunks if needed
            let inactiveCount = 0;
            
            // Process in chunks to avoid parameter limits
            for (let i = 0; i < importedSkusArray.length; i += chunkSize) {
              const chunk = importedSkusArray.slice(i, i + chunkSize);
              
              // Use unnest for better performance with arrays in PostgreSQL
              const updateQuery = `
                UPDATE restock_vitals
                SET status = 'Inactive', updated_at = NOW()
                WHERE status != 'Inactive'
                AND sku NOT IN (
                  SELECT unnest($1::text[])
                )
              `;
              
              const [updateResult] = await sequelize.query(updateQuery, {
                bind: [chunk],
                type: sequelize.QueryTypes.UPDATE,
                transaction
              });
              
              inactiveCount += updateResult;
            }
            
            if (inactiveCount > 0) {
              console.log(`${inactiveCount} restock items marked as Inactive with updated timestamps`);
            } else {
              console.log('No restock SKUs needed to be marked as Inactive');
            }
          } else {
            // If no SKUs in the import file, mark all active items as inactive
            const [updateResult] = await sequelize.query(`
              UPDATE restock_vitals
              SET status = 'Inactive', updated_at = NOW()
              WHERE status != 'Inactive'
            `, {
              type: sequelize.QueryTypes.UPDATE,
              transaction
            });
            
            console.log(`${updateResult} restock SKUs marked as Inactive (empty import file)`);
          }
        });
      }

      return this.getResults();
    } catch (error) {
      console.error('Import failed:', error);
      throw error;
    }
  }
}

module.exports = RestockImporter; 
const BaseImporter = require('./importer.base');
const { RestockVitals, RestockInfo, RestockCost } = require('../../models');
const sequelize = require('../../config/database');
const OneDriveClient = require('../onedrive.service');
const path = require('path');
const EventEmitter = require('events');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

/**
 * Importer for Restock products data
 */
class RestockImporter extends EventEmitter {
  constructor() {
    super();
    this.filename = 'restock_products.csv';
    this.folderPath = 'Inventory Management/Restock Products';
    this.batchSize = 1000; // Process 1000 records at a time for better performance
    this.markMissingAsInactive = true; // Flag to mark missing items as inactive
    this.oneDrive = new OneDriveClient();
    this.successCount = 0;
    this.errorCount = 0;
    this.errors = [];

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
   * Reset import statistics
   */
  resetStats() {
    this.successCount = 0;
    this.errorCount = 0;
    this.errors = [];
  }

  /**
   * Get import results
   * @returns {Object} - Import results summary
   */
  getResults() {
    return {
      success: this.successCount,
      failed: this.errorCount,
      total: this.successCount + this.errorCount,
      errors: this.errors
    };
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
   * @param {Transaction} transaction - Sequelize transaction
   * @returns {Promise<boolean>} - Success status
   */
  async processRecord(record, transaction) {
    try {
      // Get SKU - required field
      const sku = record.SKU || record.sku;
      
      if (!sku) {
        console.warn('Skipping record with no SKU');
        return false;
      }

      // Create or update RestockVitals
      const [vitals, createdVitals] = await RestockVitals.findOrCreate({
        where: { sku },
        defaults: {
          fnsku: record.FNSKU || record.fnsku,
          product_name: record['Product Name'] || record.product_name || record.name,
          asin: record.ASIN || record.asin,
          status: record.Status || record.status || 'Active'
        },
        transaction
      });

      if (!createdVitals) {
        await vitals.update({
          fnsku: record.FNSKU || record.fnsku || vitals.fnsku,
          product_name: record['Product Name'] || record.product_name || record.name || vitals.product_name,
          asin: record.ASIN || record.asin || vitals.asin,
          status: record.Status || record.status || vitals.status
        }, { transaction });
      }

      // Create or update RestockInfo
      const [info, createdInfo] = await RestockInfo.findOrCreate({
        where: { sku },
        defaults: {
          msku: record['Supplier SKU'] || record.supplier_sku || record.SupplierSKU,
          supplier: record.Supplier || record.supplier,
          upc: record.UPC || record.upc,
          ean: record.EAN || record.ean,
          tag1: record['TAG 1'] || record.tag1,
          tag2: record['TAG 2'] || record.tag2,
          tag3: record['TAG 3'] || record.tag3,
          tag4: record['TAG 4'] || record.tag4,
          tag5: record['TAG 5'] || record.tag5,
          tag6: record['TAG 6'] || record.tag6,
          tag7: record['TAG 7'] || record.tag7,
          tag8: record['TAG 8'] || record.tag8,
          tag9: record['TAG 9'] || record.tag9,
          tag10: record['TAG 10'] || record.tag10
        },
        transaction
      });

      if (!createdInfo) {
        await info.update({
          msku: record['Supplier SKU'] || record.supplier_sku || record.SupplierSKU || info.msku,
          supplier: record.Supplier || record.supplier || info.supplier,
          upc: record.UPC || record.upc || info.upc,
          ean: record.EAN || record.ean || info.ean,
          tag1: record['TAG 1'] || record.tag1 || info.tag1,
          tag2: record['TAG 2'] || record.tag2 || info.tag2,
          tag3: record['TAG 3'] || record.tag3 || info.tag3,
          tag4: record['TAG 4'] || record.tag4 || info.tag4,
          tag5: record['TAG 5'] || record.tag5 || info.tag5,
          tag6: record['TAG 6'] || record.tag6 || info.tag6,
          tag7: record['TAG 7'] || record.tag7 || info.tag7,
          tag8: record['TAG 8'] || record.tag8 || info.tag8,
          tag9: record['TAG 9'] || record.tag9 || info.tag9,
          tag10: record['TAG 10'] || record.tag10 || info.tag10
        }, { transaction });
      }

      // Create or update RestockCost
      const costValue = parseFloat(record['Supplier Cost'] || record.cost || '0');
      const [cost, createdCost] = await RestockCost.findOrCreate({
        where: { sku },
        defaults: {
          cost: isNaN(costValue) ? 0 : costValue
        },
        transaction
      });

      if (!createdCost && !isNaN(costValue)) {
        await cost.update({ cost: costValue }, { transaction });
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
  async importFromOneDrive() {
    console.log('\nStarting Restock import from OneDrive...');
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

      // Try to find the folder directly by path
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
      const file = files.find(f => f.name.toLowerCase() === this.filename.toLowerCase() && f.type !== 'folder');
      if (!file || !file.id) {
        throw new Error(`File not found: ${this.filename}`);
      }
      console.log('Found file:', file);
      
      console.log('\nDownloading file content...');
      const content = await this.oneDrive.getFileContent(file.id);
      if (!content) {
        throw new Error('Failed to download file content');
      }
      console.log('File content downloaded:', content.substring(0, 500) + '...');
      console.log('File content length:', content.length);
      console.log('First few lines:', content.split('\n').slice(0, 5));
      
      // Process the CSV content
      return await this.processCSVContent(content);
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
      }
      throw error;
    }
  }

  /**
   * Process CSV content and import to database
   * @param {string} csvContent - Raw CSV content
   * @returns {Promise<Object>} - Import results
   */
  async processCSVContent(csvContent) {
    try {
      this.resetStats();
      console.log('\nParsing CSV content...');
      
      // Parse CSV content into records
      const records = await this.parseCSV(csvContent);
      console.log(`\nFound ${records.length} records to process`);
      
      // Group records by batches
      const batches = [];
      for (let i = 0; i < records.length; i += this.batchSize) {
        batches.push(records.slice(i, i + this.batchSize));
      }
      
      console.log(`\nProcessing in ${batches.length} batches of ${this.batchSize} records`);
      console.log('Progress: 0%');
      
      // Process batches
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        const progress = Math.round((batchIndex / batches.length) * 100);
        console.log(`\nProcessing batch ${batchIndex + 1}/${batches.length} (${progress}% complete)`);
        
        // Use transaction for each batch
        await sequelize.transaction(async (transaction) => {
          // Prepare bulk operations
          const vitalsToUpsert = [];
          const infosToUpsert = [];
          const costsToUpsert = [];
          
          // Process each record in the batch
          for (const record of batch) {
            try {
              const sku = record.SKU || record.sku;
              if (!sku) {
                console.warn('Skipping record with no SKU');
                this.errorCount++;
                continue;
              }

              // Prepare Vitals upsert
              vitalsToUpsert.push({
                sku,
                fnsku: record.FNSKU || record.fnsku,
                product_name: record['Product Name'] || record.product_name || record.name,
                asin: record.ASIN || record.asin,
                status: record.Status || record.status || 'Active'
              });

              // Prepare Info upsert
              infosToUpsert.push({
                sku,
                msku: record['Supplier SKU'] || record.supplier_sku || record.SupplierSKU,
                supplier: record.Supplier || record.supplier,
                upc: record.UPC || record.upc,
                ean: record.EAN || record.ean,
                tag1: record['TAG 1'] || record.tag1,
                tag2: record['TAG 2'] || record.tag2,
                tag3: record['TAG 3'] || record.tag3,
                tag4: record['TAG 4'] || record.tag4,
                tag5: record['TAG 5'] || record.tag5,
                tag6: record['TAG 6'] || record.tag6,
                tag7: record['TAG 7'] || record.tag7,
                tag8: record['TAG 8'] || record.tag8,
                tag9: record['TAG 9'] || record.tag9,
                tag10: record['TAG 10'] || record.tag10
              });

              // Prepare Cost upsert
              const costValue = parseFloat(record['Supplier Cost'] || record.cost || '0');
              costsToUpsert.push({
                sku,
                cost: isNaN(costValue) ? 0 : costValue
              });

              this.successCount++;
            } catch (error) {
              console.error(`Error processing record:`, error);
              this.errorCount++;
              this.errors.push({ record, error: error.message });
            }
          }

          // Perform bulk upserts
          await RestockVitals.bulkCreate(vitalsToUpsert, {
            updateOnDuplicate: ['fnsku', 'product_name', 'asin', 'status'],
            transaction
          });

          await RestockInfo.bulkCreate(infosToUpsert, {
            updateOnDuplicate: ['msku', 'supplier', 'upc', 'ean', 'tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6', 'tag7', 'tag8', 'tag9', 'tag10'],
            transaction
          });

          await RestockCost.bulkCreate(costsToUpsert, {
            updateOnDuplicate: ['cost'],
            transaction
          });
        });

        // Log batch results
        console.log(`Batch ${batchIndex + 1} complete: ${this.successCount} successful, ${this.errorCount} failed`);
        console.log(`Total progress: ${progress}%`);
      }

      console.log('\nImport completed!');
      return this.getResults();
    } catch (error) {
      console.error('Import failed:', error);
      throw error;
    }
  }

  /**
   * Parse CSV content from string
   * @param {string} csvContent - Raw CSV content as string
   * @returns {Promise<Array>} - Array of parsed records
   */
  async parseCSV(csvContent) {
    if (!csvContent || typeof csvContent !== 'string') {
      throw new Error('Invalid CSV content: content must be a non-empty string');
    }

    return new Promise((resolve, reject) => {
      const results = [];
      const { Readable } = require('stream');
      const csv = require('csv-parser');
      
      const readableStream = new Readable();
      readableStream._read = () => {};

      // Remove any BOM and normalize line endings
      const cleanContent = csvContent.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
      readableStream.push(cleanContent);
      readableStream.push(null);

      readableStream
        .pipe(csv({
          strict: true,
          trim: true,
          skipLines: 0,
          mapHeaders: ({ header }) => header.trim()
        }))
        .on('data', (data) => {
          results.push(data);
        })
        .on('end', () => {
          console.log(`Finished parsing CSV. Found ${results.length} records.`);
          resolve(results);
        })
        .on('error', (error) => {
          console.error('Error parsing CSV:', error);
          reject(error);
        });
    });
  }
}

module.exports = RestockImporter; 
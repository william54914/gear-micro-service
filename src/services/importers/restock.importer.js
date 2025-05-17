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
    this.batchSize = 5000;
    this.markMissingAsInactive = true;
    this.oneDrive = new OneDriveClient();
    this.successCount = 0;
    this.errorCount = 0;
    this.errors = [];
  }

  resetStats() {
    this.successCount = 0;
    this.errorCount = 0;
    this.errors = [];
  }

  getResults() {
    return {
      success: this.successCount,
      failed: this.errorCount,
      total: this.successCount + this.errorCount,
      errors: this.errors
    };
  }

  setSource(folderName, filename) {
    this.folderPath = folderName;
    this.filename = filename;
    return this;
  }

  setBatchSize(size) {
    this.batchSize = size;
    return this;
  }

  setMarkMissingAsInactive(value) {
    this.markMissingAsInactive = value;
    return this;
  }

  async processRecord(record, transaction) {
    try {
      const sku = record.SKU || record.sku;
      
      if (!sku) {
        return false;
      }

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

      const [info, createdInfo] = await RestockInfo.findOrCreate({
        where: { sku },
        defaults: {
          msku: record['Supplier SKU'] || record.supplier_sku || record.SupplierSKU,
          supplier: record.Supplier || record.supplier,
          upc: record.UPC || record.upc,
          ean: record.EAN || record.ean,
          ...this.parseTags(record.Tags || record.tags || '')
        },
        transaction
      });

      if (!createdInfo) {
        await info.update({
          msku: record['Supplier SKU'] || record.supplier_sku || record.SupplierSKU || info.msku,
          supplier: record.Supplier || record.supplier || info.supplier,
          upc: record.UPC || record.upc || info.upc,
          ean: record.EAN || record.ean || info.ean,
          ...this.parseTags(record.Tags || record.tags || '')
        }, { transaction });
      }

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

  async importFromOneDrive() {
    console.log('Starting Restock import from OneDrive...');
    
    if (!process.env.ONEDRIVE_CLIENT_ID || !process.env.ONEDRIVE_CLIENT_SECRET || 
        !process.env.ONEDRIVE_TENANT_ID || !process.env.ONEDRIVE_USER_EMAIL) {
      throw new Error('Missing required OneDrive environment variables');
    }
    
    try {
      const token = await this.oneDrive.getToken();
      if (!token) {
        throw new Error('Failed to get OneDrive access token');
      }

      const folder = await this.oneDrive.findFolderByPath(this.folderPath);
      if (!folder || !folder.id) {
        throw new Error(`Folder not found: ${this.folderPath}`);
      }
      
      const files = await this.oneDrive.listFilesInFolder(folder.id);
      if (!files || !Array.isArray(files)) {
        throw new Error('Failed to list files in folder');
      }
      
      const file = files.find(f => f.name.toLowerCase() === this.filename.toLowerCase() && f.type !== 'folder');
      if (!file || !file.id) {
        throw new Error(`File not found: ${this.filename}`);
      }
      
      const content = await this.oneDrive.getFileContent(file.id);
      if (!content) {
        throw new Error('Failed to download file content');
      }
      
      return await this.processCSVContent(content);
    } catch (error) {
      console.error('Error accessing OneDrive:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  }

  async processCSVContent(csvContent) {
    try {
      this.resetStats();
      
      const records = await this.parseCSV(csvContent);
      console.log(`Processing ${records.length} records...`);
      
      const batches = [];
      for (let i = 0; i < records.length; i += this.batchSize) {
        batches.push(records.slice(i, i + this.batchSize));
      }
      
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        const progress = Math.round((batchIndex / batches.length) * 100);
        
        await sequelize.transaction(async (transaction) => {
          const vitalsToUpsert = [];
          const infosToUpsert = [];
          const costsToUpsert = [];
          
          for (const record of batch) {
            try {
              const sku = record.SKU || record.sku;
              if (!sku) {
                this.errorCount++;
                continue;
              }

              vitalsToUpsert.push({
                sku,
                fnsku: record.FNSKU || record.fnsku,
                product_name: record['Product Name'] || record.product_name || record.name,
                asin: record.ASIN || record.asin,
                status: record.Status || record.status || 'Active'
              });

              infosToUpsert.push({
                sku,
                msku: record['Supplier SKU'] || record.supplier_sku || record.SupplierSKU,
                supplier: record.Supplier || record.supplier,
                upc: record.UPC || record.upc,
                ean: record.EAN || record.ean,
                ...this.parseTags(record.Tags || record.tags || '')
              });

              const costValue = parseFloat(record['Supplier Cost'] || record.cost || '0');
              costsToUpsert.push({
                sku,
                cost: isNaN(costValue) ? 0 : costValue
              });

              this.successCount++;
            } catch (error) {
              this.errorCount++;
              this.errors.push({ record, error: error.message });
            }
          }

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

        if ((batchIndex + 1) % 5 === 0 || batchIndex === batches.length - 1) {
          console.log(`Progress: ${progress}% (${this.successCount} processed, ${this.errorCount} failed)`);
        }
      }

      return this.getResults();
    } catch (error) {
      console.error('Import failed:', error);
      throw error;
    }
  }

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
          resolve(results);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  parseTags(tagsString) {
    const tagFields = {};
    const tags = tagsString.split(/[,;]/)
      .map(tag => {
        const trimmed = tag.trim();
        // Just ensure it's a string
        return trimmed ? trimmed.toString() : null;
      })
      .filter(Boolean);
    
    for (let i = 0; i < Math.min(tags.length, 10); i++) {
      tagFields[`tag${i + 1}`] = tags[i];
    }
    
    for (let i = tags.length; i < 10; i++) {
      tagFields[`tag${i + 1}`] = null;
    }
    
    return tagFields;
  }
}

module.exports = RestockImporter; 
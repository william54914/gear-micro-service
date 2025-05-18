const BaseImporter = require('./importer.base');
const { VendorProduct, VendorProductPricing, VendorDistributorInfo, VendorBrand, Vendor } = require('../../models');
const sequelize = require('../../config/database');
const OneDriveClient = require('../onedrive.service');
const XLSX = require('xlsx');
const path = require('path');
const EventEmitter = require('events');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

/**
 * Importer for Bell price sheet data
 * Field mappings:
 * - Excel SKU → vendor_products.vendor_sku
 * - Excel SKU → vendor_products.mfg_part
 * - Excel DESCRIPTION → vendor_products.vendor_product_name
 * - Excel UPC → vendor_products.upc
 * - Excel US MSRP → vendor_products.msrp
 * - Excel US NON-PROMO MAP → vendor_products.map_price
 */
class BellImporter extends EventEmitter {
  constructor() {
    super();
    this.folderPath = 'Vendor Files/Bell';
    this.batchSize = 5000;
    this.oneDrive = new OneDriveClient();
    this.successCount = 0;
    this.errorCount = 0;
    this.errors = [];
    this.vendor_id = null;  // Will be set by the import script
    this.brand_id = null;   // Will be set by the import script
  }

  setSource(folderName, filename) {
    this.folderPath = folderName;
    return this;
  }

  setBatchSize(size) {
    this.batchSize = size;
    return this;
  }

  async processExcelContent(excelContent) {
    try {
      this.resetStats();
      
      console.log('Initial vendor_id and brand_id:', {
        vendor_id: this.vendor_id,
        brand_id: this.brand_id
      });

      if (!this.vendor_id || !this.brand_id) {
        throw new Error('Vendor ID and Brand ID must be set before processing');
      }

      // Verify vendor exists
      const vendor = await Vendor.findByPk(this.vendor_id);
      if (!vendor) {
        throw new Error(`Vendor with ID ${this.vendor_id} not found`);
      }
      console.log('Found vendor:', vendor.toJSON());

      // Verify brand exists
      const brand = await VendorBrand.findByPk(this.brand_id);
      if (!brand) {
        throw new Error(`Brand with ID ${this.brand_id} not found`);
      }
      console.log('Found brand:', brand.toJSON());

      const workbook = XLSX.read(excelContent, { 
        type: 'buffer',
        cellDates: true,
        cellNF: false,
        cellText: false
      });
      
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      const records = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        range: 5
      });
      
      const headers = records[0];
      
      const data = records.slice(1)
        .filter(row => {
          if (!row || !Array.isArray(row) || row.length === 0) return false;
          
          const testRecord = {};
          headers.forEach((header, index) => {
            if (header) {
              testRecord[header] = row[index];
            }
          });
          
          const isValid = testRecord.SKU && testRecord.DESCRIPTION && testRecord.UPC;
          if (!isValid) {
            console.log('Skipping invalid row:', testRecord);
          }
          return isValid;
        })
        .map(row => {
          const record = {};
          headers.forEach((header, index) => {
            if (header) {
              record[header] = row[index];
            }
          });
          return record;
        });

      console.log(`Processing ${data.length} Bell products...`);
      
      // Process in batches
      const batches = [];
      for (let i = 0; i < data.length; i += this.batchSize) {
        batches.push(data.slice(i, i + this.batchSize));
      }
      
      // Process each batch in its own transaction
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        const progress = Math.round((batchIndex / batches.length) * 100);
        
        try {
          await sequelize.transaction(async (transaction) => {
            const productsToUpsert = [];
            const distributorInfoToUpsert = [];
            
            // Prepare batch data
            for (const record of batch) {
              try {
                const partNumber = record.SKU.toString();
                
                if (!partNumber) {
                  throw new Error('SKU/Part Number is required');
                }

                productsToUpsert.push({
                  vendorId: this.vendor_id,
                  brandId: this.brand_id,
                  vendorSku: partNumber,
                  mfgPart: partNumber,
                  vendorProductName: record.DESCRIPTION,
                  upc: record.UPC.toString(),
                  msrp: parseFloat(record['US MSRP'] || '0'),
                  mapPrice: parseFloat(record['US NON-PROMO MAP'] || '0'),
                  active: true,
                  createdAt: new Date(),
                  updatedAt: new Date()
                });

                distributorInfoToUpsert.push({
                  distributorPart: partNumber,
                  manufacturerPart: partNumber,
                  vendorId: this.vendor_id,
                  cost: null,
                  inventoryEast: 0,
                  inventoryMidwest: 0,
                  inventoryWest: 0,
                  totalInventory: 0,
                  shippingCost: 0,
                  active: true,
                  createdAt: new Date(),
                  updatedAt: new Date()
                });

                this.successCount++;
              } catch (error) {
                this.errorCount++;
                this.errors.push({
                  record,
                  error: error.message,
                  sku: record.SKU || 'Unknown SKU'
                });
              }
            }

            if (productsToUpsert.length > 0) {
              // Bulk create/update products
              await VendorProduct.bulkCreate(productsToUpsert, {
                updateOnDuplicate: [
                  'brandId',
                  'mfgPart',
                  'vendorProductName',
                  'upc',
                  'msrp',
                  'mapPrice',
                  'active',
                  'updatedAt'
                ],
                transaction,
                returning: true
              });

              // Bulk create/update distributor info
              await VendorDistributorInfo.bulkCreate(distributorInfoToUpsert, {
                updateOnDuplicate: [
                  'cost',
                  'inventoryEast',
                  'inventoryMidwest',
                  'inventoryWest',
                  'totalInventory',
                  'shippingCost',
                  'active',
                  'updatedAt'
                ],
                transaction
              });
            }
          });

          if (progress % 20 === 0 || progress === 100) {
            console.log(`Progress: ${progress}% (${this.successCount} processed)`);
          }
        } catch (error) {
          console.error(`Error processing batch ${batchIndex}:`, error);
          this.errorCount += batch.length;
          for (const record of batch) {
            this.errors.push({
              record,
              error: error.message,
              sku: record.SKU || 'Unknown SKU'
            });
          }
        }
      }
      
      // Only return success if we actually processed some records
      if (this.successCount === 0) {
        throw new Error('No records were successfully processed');
      }

      return {
        success: this.successCount,
        failed: this.errorCount,
        total: data.length,
        errors: this.errors
      };
    } catch (error) {
      console.error('Error processing Excel content:', error);
      throw error;
    }
  }

  async importFromOneDrive() {
    console.log('Starting Bell price sheet import from OneDrive...');
    console.log(`Looking in folder path: ${this.folderPath}`);
    
    if (!process.env.ONEDRIVE_CLIENT_ID || !process.env.ONEDRIVE_CLIENT_SECRET || 
        !process.env.ONEDRIVE_TENANT_ID || !process.env.ONEDRIVE_USER_EMAIL) {
      throw new Error('Missing required OneDrive environment variables');
    }
    
    try {
      const token = await this.oneDrive.getToken();
      if (!token) {
        throw new Error('Failed to get OneDrive access token');
      }
      console.log('Successfully obtained OneDrive token');

      console.log(`Searching for folder: ${this.folderPath}`);
      const folder = await this.oneDrive.findFolderByPath(this.folderPath);
      if (!folder || !folder.id) {
        console.log('Available folders:');
        const rootFolders = await this.oneDrive.listRootFolders();
        console.log(JSON.stringify(rootFolders, null, 2));
        throw new Error(`Folder not found: ${this.folderPath}`);
      }
      console.log(`Found folder with ID: ${folder.id}`);
      
      console.log('Listing files in folder...');
      const files = await this.oneDrive.listFilesInFolder(folder.id);
      if (!files || !Array.isArray(files)) {
        throw new Error('Failed to list files in folder');
      }
      console.log('Files found in folder:');
      files.forEach(f => console.log(` - ${f.name}`));
      
      // Find the first Excel file in the folder
      const excelFile = files.find(f => 
        f.name.toLowerCase().endsWith('.xlsx') || 
        f.name.toLowerCase().endsWith('.xls')
      );
      
      if (!excelFile) {
        throw new Error('No Excel files found in folder');
      }
      
      console.log(`Found Excel file: ${excelFile.name}`);
      
      const content = await this.oneDrive.getFileContent(excelFile.id);
      if (!content) {
        throw new Error('Failed to download file content');
      }
      console.log(`Successfully downloaded file content (${content.length} bytes)`);
      
      return await this.processExcelContent(content);
    } catch (error) {
      console.error('Error accessing OneDrive:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  }

  resetStats() {
    this.successCount = 0;
    this.errorCount = 0;
    this.errors = [];
  }
}

module.exports = BellImporter; 
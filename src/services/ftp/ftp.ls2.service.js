const BaseService = require('../base.service');
const config = require('../../config/env');
const FtpService = require('./ftp.service');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const models = require('../../models');
const { Op } = require('sequelize');

class LS2FtpService extends BaseService {
  constructor() {
    super('ls2');

    if (process.env.NODE_ENV === 'test' && !process.env.FORCE_LS2_REAL) {
      this.config = {
        host: 'test-host',
        user: 'test-user',
        password: 'test-password',
        secure: false
      };
      return;
    }

    this.config = {
      host: config.ls2.host,
      user: config.ls2.user,
      password: config.ls2.password,
      secure: config.ls2.secure || false
    };

    this.ftpService = new FtpService(this.config);
    this.tmpDir = path.join(__dirname, '../../../tmp');
    this.vendorName = "LS2 Helmets";
    this.inventoryFileName = process.env.LS2_INVENTORY_FILE || "FlynCycle Inventory.csv";
    this.batchSize = 5000;
    
    if (!fs.existsSync(this.tmpDir)) {
      fs.mkdirSync(this.tmpDir, { recursive: true });
    }
  }

  async listFiles(remotePath = '.') {
    return await this.ftpService.listFiles(this.config, remotePath);
  }

  async downloadFile(remotePath, localPath) {
    await this.ftpService.downloadFile(this.config, remotePath, localPath);
  }
  
  async getLatestPriceFile() {
    try {
      const files = await this.listFiles();
      
      const priceFiles = files.filter(file => 
        file.name.toLowerCase().endsWith('.csv') || 
        file.name.toLowerCase().endsWith('.xlsx')
      );
      
      if (priceFiles.length === 0) {
        return null;
      }
      
      priceFiles.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      const latestFile = priceFiles[0];
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileExtension = path.extname(latestFile.name);
      const localFilename = `ls2_price_${timestamp}${fileExtension}`;
      const localPath = path.join(this.tmpDir, localFilename);
      
      await this.downloadFile(latestFile.name, localPath);
      
      return {
        path: localPath,
        name: latestFile.name,
        originalDate: latestFile.date
      };
    } catch (error) {
      console.error('Error getting latest price file from LS2:', error);
      throw error;
    }
  }

  async getAllPriceFiles() {
    try {
      const files = await this.listFiles();
      
      const priceFiles = files.filter(file => 
        file.name.toLowerCase().endsWith('.csv') || 
        file.name.toLowerCase().endsWith('.xlsx')
      );
      
      const downloadedFiles = [];
      
      for (const file of priceFiles) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const localFilename = `ls2_price_${timestamp}_${file.name}`;
        const localPath = path.join(this.tmpDir, localFilename);
        
        await this.downloadFile(file.name, localPath);
        
        downloadedFiles.push({
          path: localPath,
          name: file.name,
          originalDate: file.date
        });
      }
      
      return downloadedFiles;
    } catch (error) {
      console.error('Error getting all price files from LS2:', error);
      throw error;
    }
  }
  
  async getInventoryFile() {
    try {
      const files = await this.listFiles();
      
      const inventoryFile = files.find(file => file.name === this.inventoryFileName);
      
      if (!inventoryFile) {
        return null;
      }
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const localFilename = `ls2_inventory_${timestamp}.csv`;
      const localPath = path.join(this.tmpDir, localFilename);
      
      await this.downloadFile(inventoryFile.name, localPath);
      
      return {
        path: localPath,
        name: inventoryFile.name,
        originalDate: inventoryFile.date
      };
    } catch (error) {
      console.error('Error getting inventory file from LS2:', error);
      throw error;
    }
  }
  
  async importFile(filename) {
    try {
      const localFilePath = path.join(this.tmpDir, filename);
      await this.downloadFile(filename, localFilePath);
      
      const results = await this.processCSVFile(localFilePath);
      
      fs.unlinkSync(localFilePath);
      
      return results;
    } catch (error) {
      console.error('Error importing LS2 file:', filename, error);
      throw error;
    }
  }
  
  async processCSVFile(filePath) {
    try {
      const vendor = await this.getOrCreateVendor();
      const records = [];
      let isFirstRow = true;

      // First, collect all records from CSV
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (data) => {
            if (data.PartNumber) {
              records.push(data);
            }
          })
          .on('end', resolve)
          .on('error', reject);
      });

      console.log(`Processing ${records.length} records from LS2 CSV file...`);

      // Process in batches
      const batches = [];
      for (let i = 0; i < records.length; i += this.batchSize) {
        batches.push(records.slice(i, i + this.batchSize));
      }

      const results = {
        products: { created: 0, updated: 0, deactivated: 0 },
        brands: { created: 0, updated: 0, deactivated: 0 },
        distributor_info: { created: 0, updated: 0, deactivated: 0 }
      };

      // Create or get the LS2 brand first, outside the batch processing
      let ls2Brand;
      try {
        [ls2Brand] = await models.VendorBrand.findOrCreate({
          where: { 
            vendorId: vendor.vendorId,
            brandName: 'LS2'
          },
          defaults: {
            brandCode: 'LS2',
            brandName: 'LS2',
            brandAlt1: 'LS2 Helmets',
            active: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });

        if (!ls2Brand.isNewRecord) {
          await ls2Brand.update({
            brandAlt1: 'LS2 Helmets',
            active: true,
            updatedAt: new Date()
          });
          results.brands.updated++;
        } else {
          results.brands.created++;
        }
      } catch (error) {
        console.error('Error creating/updating LS2 brand:', error);
        throw error;
      }

      // Process each batch
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        const progress = Math.round((batchIndex / batches.length) * 100);
        
        try {
          await models.sequelize.transaction(async (transaction) => {
            const productRecords = [];
            const distributorRecords = [];

            // Prepare batch records
            for (const data of batch) {
              if (data.PartNumber) {
                const partNumber = data.PartNumber.toString();
                productRecords.push({
                  itemId: partNumber,
                  brandId: ls2Brand.brandId,
                  productType: data.TYPE || null,
                  mfgPart: partNumber,
                  vendorSku: partNumber,
                  title: data['Item Description'] || null,
                  vendorProductName: data['Item Description'] || `LS2 Product ${partNumber}`,
                  upc: data['EAN/UPC'] || null,
                  description1: data['Item Description'] || null,
                  discontinued: data['Is Discontinued']?.toUpperCase() === 'T',
                  vendorId: vendor.vendorId,
                  msrp: parseFloat(data['RetailPrice'] || '0'),
                  mapPrice: parseFloat(data['MAP Price'] || '0'),
                  active: true,
                  updatedAt: new Date()
                });

                distributorRecords.push({
                  distributorPart: partNumber,
                  manufacturerPart: partNumber,
                  vendorId: vendor.vendorId,
                  cost: parseFloat(data['Dealer Cost'] || '0'),
                  inventoryEast: parseInt(data['In Stock'] || '0', 10),
                  inventoryMidwest: 0,
                  inventoryWest: 0,
                  totalInventory: parseInt(data['In Stock'] || '0', 10),
                  shippingCost: 0,
                  active: true,
                  updatedAt: new Date()
                });
              }
            }

            // Bulk create/update products
            await models.VendorProduct.bulkCreate(productRecords, {
              updateOnDuplicate: [
                'brandId',
                'productType',
                'title',
                'vendorProductName',
                'upc',
                'description1',
                'discontinued',
                'msrp',
                'mapPrice',
                'active',
                'updatedAt'
              ],
              transaction
            });

            // Bulk create/update distributor info
            await models.VendorDistributorInfo.bulkCreate(distributorRecords, {
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

            results.products.created += productRecords.length;
            results.distributor_info.created += distributorRecords.length;
          });

          // Log progress every 20% or at the end
          if ((batchIndex + 1) % Math.max(1, Math.floor(batches.length / 5)) === 0 || batchIndex === batches.length - 1) {
            console.log(`Progress: ${progress}% (${results.products.created} products processed)`);
          }
        } catch (error) {
          console.error(`Error processing batch ${batchIndex}:`, error);
          // Continue with next batch despite error
        }
      }

      return results;
    } catch (error) {
      console.error('Error processing LS2 CSV file:', error);
      throw error;
    }
  }
  
  async processExcelFile(filePath) {
    throw new Error('Excel file processing not yet implemented');
  }
  
  async getOrCreateVendor() {
    let vendor = await models.Vendor.findOne({ 
      where: { vendorName: 'LS2' }
    });
    
    if (!vendor) {
      vendor = await models.Vendor.create({
        vendorName: 'LS2',
        vendorCode: 'LS2',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      });
    }
    
    return vendor;
  }
  
  async importAllFiles() {
    try {
      const files = await this.listFiles();
      const csvFiles = files.filter(f => f.name.toLowerCase().endsWith('.csv'));
      
      const results = {
        totalFiles: files.length,
        processed: []
      };
      
      for (const file of csvFiles) {
        try {
          const result = await this.importFile(file.name);
          results.processed.push({
            file: file.name,
            success: true,
            ...result
          });
        } catch (error) {
          console.error('Error importing file:', file.name, error);
          results.processed.push({
            file: file.name,
            success: false,
            error: error.message
          });
        }
      }
      
      return results;
    } catch (error) {
      console.error('Error importing LS2 files:', error);
      throw error;
    }
  }

  parseTags(tagsString) {
    const tagFields = {};
    // Split by either comma or semicolon and ensure each tag is a string
    const tags = (tagsString || '').split(/[,;]/)
      .map(tag => {
        const trimmed = tag.trim();
        // Convert to string and handle scientific notation
        if (trimmed) {
          // If it's a number in scientific notation or a large number
          if (!isNaN(trimmed) && Math.abs(Number(trimmed)) > 999999) {
            // Convert to string without scientific notation
            return trimmed.includes('e') || trimmed.includes('E') 
              ? BigInt(parseFloat(trimmed)).toString()
              : trimmed;
          }
          return trimmed;
        }
        return null;
      })
      .filter(Boolean);
    
    // Map up to 10 tags to their respective fields
    for (let i = 0; i < Math.min(tags.length, 10); i++) {
      tagFields[`tag${i + 1}`] = tags[i];
    }
    
    // Fill remaining fields with null
    for (let i = tags.length; i < 10; i++) {
      tagFields[`tag${i + 1}`] = null;
    }
    
    return tagFields;
  }
}

module.exports = new LS2FtpService(); 
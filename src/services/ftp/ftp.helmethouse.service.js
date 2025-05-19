const BaseService = require('../base.service');
const config = require('../../config/env');
const FtpService = require('./ftp.service');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const models = require('../../models');
const { Op } = require('sequelize');

class FtpHelmethouseService extends BaseService {
  constructor() {
    super('helmethouse');

    if (process.env.NODE_ENV === 'test' && !process.env.FORCE_HELMETHOUSE_REAL) {
      this.config = {
        host: 'test-host',
        user: 'test-user',
        password: 'test-password',
        secure: false
      };
      return;
    }

    this.config = {
      host: config.helmethouse.host,
      user: config.helmethouse.user,
      password: config.helmethouse.password,
      secure: config.helmethouse.secure || false
    };

    this.ftpService = new FtpService(this.config);
    this.tmpDir = path.join(__dirname, '../../../tmp');
    this.vendorName = "Helmet House";
    this.masterFileName = process.env.HELMETHOUSE_MASTER_FILE || "master.csv";
    this.batchSize = 10000;
    
    if (!fs.existsSync(this.tmpDir)) {
      fs.mkdirSync(this.tmpDir, { recursive: true });
    }
  }

  async listFiles(remotePath = '.') {
    console.log('Listing files in directory:', remotePath);
    const files = await this.ftpService.listFiles(this.config, remotePath);
    // console.log('Found files:', files.map(f => `${f.name} (${f.size} bytes)`).join(', '));
    return files;
  }

  async downloadFile(remotePath, localPath) {
    console.log('Downloading file:', remotePath, 'to:', localPath);
    await this.ftpService.downloadFile(this.config, remotePath, localPath);
  }

  async getMasterFile() {
    try {
      console.log('Looking for master file...');
      const files = await this.listFiles();
      
      const masterFile = files.find(file => file.name === this.masterFileName);
      
      if (!masterFile) {
        console.log('Master file not found');
        return null;
      }
      
      console.log('Found master file:', masterFile.name, `(${masterFile.size} bytes)`);
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const localFilename = `helmethouse_master_${timestamp}.csv`;
      const localPath = path.join(this.tmpDir, localFilename);
      
      await this.downloadFile(masterFile.name, localPath);
      
      return {
        path: localPath,
        name: masterFile.name,
        originalDate: masterFile.date
      };
    } catch (error) {
      console.error('Error getting master file from Helmet House:', error);
      throw error;
    }
  }

  async importAllFiles() {
    try {
      console.log('Starting Helmet House file import...');
      const masterFile = await this.getMasterFile();
      
      if (!masterFile) {
        console.log('No master file to import');
        return {
          totalFiles: 0,
          processed: []
        };
      }

      const results = {
        totalFiles: 1,
        processed: []
      };

      try {
        console.log('Processing master file...');
        const result = await this.processCSVFile(masterFile.path);
        results.processed.push({
          file: masterFile.name,
          success: true,
          ...result
        });
      } catch (error) {
        console.error('Error processing master file:', masterFile.name, error);
        results.processed.push({
          file: masterFile.name,
          success: false,
          error: error.message
        });
      }

      return results;
    } catch (error) {
      console.error('Error importing Helmet House files:', error);
      throw error;
    }
  }

  async processCSVFile(filePath) {
    try {
      const vendor = await this.getOrCreateVendor();
      const records = [];
      const brandCache = new Map(); // Cache to store brand lookups

      // First, collect all records from CSV
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (data) => {
            if (data['Part Number']) {
              records.push(data);
            }
          })
          .on('end', resolve)
          .on('error', reject);
      });

      console.log(`Processing ${records.length} records from Helmet House CSV file...`);

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

      // Process each batch
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        const progress = Math.round((batchIndex / batches.length) * 100);
        
        try {
          await models.sequelize.transaction(async (transaction) => {
            // First, ensure all brands exist
            for (const data of batch) {
              const brandName = data['Brand'] || 'Unknown Brand';
              
              if (!brandCache.has(brandName)) {
                const [brand] = await models.VendorBrand.findOrCreate({
                  where: { 
                    vendorId: vendor.vendorId,
                    brandName: brandName
                  },
                  defaults: {
                    brandCode: brandName.substring(0, 10).toUpperCase().replace(/[^A-Z0-9]/g, ''),
                    brandName: brandName,
                    active: true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                  },
                  transaction
                });
                
                brandCache.set(brandName, brand);
                if (brand.isNewRecord) {
                  results.brands.created++;
                }
              }
            }

            // Now create all products
            const productRecords = batch.map(data => {
              const partNumber = data['Part Number'].toString();
              const brandName = data['Brand'] || 'Unknown Brand';
              const brand = brandCache.get(brandName);

              return {
                vendorId: vendor.vendorId,
                brandId: brand.brandId,
                mfgPart: partNumber,
                vendorSku: data['Vendor P/N'] || partNumber,
                vendorProductName: data['Description'],
                description1: data['Description'],
                alt_sku_1: data['Alt Part#'],
                product_type: data['Category'],
                upc: data['UPC'],
                msrp: data['Retail'] ? parseFloat(data['Retail']) : null,
                mapPrice: data['MAPP Price'] ? parseFloat(data['MAPP Price']) : null,
                active: true,
                createdAt: new Date(),
                updatedAt: new Date()
              };
            });

            // Bulk create/update products
            const createdProducts = await models.VendorProduct.bulkCreate(productRecords, {
              updateOnDuplicate: [
                'brandId',
                'vendorSku',
                'vendorProductName',
                'description1',
                'alt_sku_1',
                'product_type',
                'upc',
                'msrp',
                'mapPrice',
                'active',
                'updatedAt'
              ],
              returning: true,
              transaction
            });

            // Now create related records using the created product IDs
            const dimensionRecords = [];
            const attributeRecords = [];
            const imageRecords = [];
            const distributorRecords = [];

            createdProducts.forEach((product, index) => {
              const data = batch[index];

              // Dimension record
              if (data['Depth'] || data['Length'] || data['Width'] || data['Weight']) {
                dimensionRecords.push({
                  productId: product.vendorProductId,
                  height: data['Depth'] || null,
                  length: data['Length'] || null,
                  width: data['Width'] || null,
                  weight: data['Weight'] || null,
                  dimensionUnit: 'IN',
                  weightUnit: 'LBS',
                  updatedAt: new Date()
                });
              }

              // Attribute record
              if (data['Color'] || data['Size']) {
                attributeRecords.push({
                  productId: product.vendorProductId,
                  color: data['Color'] ? data['Color'].substring(0, 20) : null,
                  size: data['Size'] ? data['Size'].substring(0, 20) : null,
                  active: true,
                  updatedAt: new Date()
                });
              }

              // Image record
              if (data['Photo']) {
                imageRecords.push({
                  productId: product.vendorProductId,
                  imageUrl: data['Photo'],
                  isPrimary: true,
                  updatedAt: new Date()
                });
              }

              // Distributor record
              distributorRecords.push({
                distributorPart: data['Vendor P/N'] || product.mfgPart,
                manufacturerPart: product.mfgPart,
                vendorId: vendor.vendorId,
                cost: data['Dealer'] ? parseFloat(data['Dealer']) : null,
                inventoryEast: data['East'] ? parseInt(data['East']) : 0,
                inventoryWest: data['West'] ? parseInt(data['West']) : 0,
                totalInventory: (data['East'] ? parseInt(data['East']) : 0) + (data['West'] ? parseInt(data['West']) : 0),
                active: true,
                updatedAt: new Date()
              });
            });

            // Bulk create/update related records
            if (dimensionRecords.length > 0) {
              await models.VendorProductDimensions.bulkCreate(dimensionRecords, {
                updateOnDuplicate: [
                  'height',
                  'length',
                  'width',
                  'weight',
                  'dimensionUnit',
                  'weightUnit',
                  'updatedAt'
                ],
                transaction
              });
            }

            if (attributeRecords.length > 0) {
              await models.VendorProductAttributes.bulkCreate(attributeRecords, {
                updateOnDuplicate: [
                  'color',
                  'size',
                  'active',
                  'updatedAt'
                ],
                transaction
              });
            }

            if (imageRecords.length > 0) {
              await models.VendorProductImages.bulkCreate(imageRecords, {
                updateOnDuplicate: [
                  'imageUrl',
                  'isPrimary',
                  'updatedAt'
                ],
                transaction
              });
            }

            await models.VendorDistributorInfo.bulkCreate(distributorRecords, {
              updateOnDuplicate: [
                'cost',
                'inventoryEast',
                'inventoryWest',
                'totalInventory',
                'active',
                'updatedAt'
              ],
              transaction
            });

            results.products.created += createdProducts.length;
            results.distributor_info.created += distributorRecords.length;

            console.log(`Progress: ${progress}% (${results.products.created} products processed)`);
          });
        } catch (error) {
          console.error(`Error processing batch ${batchIndex}:`, error);
          throw error; // Let's see the errors instead of continuing
        }
      }

      return results;
    } catch (error) {
      console.error('Error processing Helmet House CSV file:', error);
      throw error;
    }
  }

  async getOrCreateVendor() {
    let vendor = await models.Vendor.findOne({ 
      where: { vendorName: this.vendorName }
    });
    
    if (!vendor) {
      vendor = await models.Vendor.create({
        vendorName: this.vendorName,
        vendorCode: 'HELMETHOUSE',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      });
    }
    
    return vendor;
  }
}

module.exports = new FtpHelmethouseService();
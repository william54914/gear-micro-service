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
    this.inventoryFileName = "FlynCycle Inventory.csv";
    
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
      const transaction = await models.sequelize.transaction();
      
      try {
        const brandRecords = [];
        const productRecords = [];
        const attributeRecords = [];
        const imageRecords = [];
        const inventoryRecords = [];
        const pricingRecords = [];
        const dimensionRecords = [];
        const distributorRecords = [];

        const currentBrands = new Set();
        const currentProducts = new Set();
        const currentAttributes = new Set();
        const currentImages = new Set();
        const currentInventories = new Set();
        const currentPricing = new Set();
        const currentDimensions = new Set();

        let isFirstRow = true;

        return new Promise((resolve, reject) => {
          const results = {
            products: { created: 0, updated: 0, deactivated: 0 },
            brands: { created: 0, updated: 0, deactivated: 0 },
            attributes: { created: 0, updated: 0, deactivated: 0 },
            images: { created: 0, updated: 0, deactivated: 0 },
            inventory: { created: 0, updated: 0, deactivated: 0 },
            pricing: { created: 0, updated: 0, deactivated: 0 },
            dimensions: { created: 0, updated: 0, deactivated: 0 },
            distributor_info: { created: 0, updated: 0, deactivated: 0 }
          };
          
          fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => {
              if (!currentBrands.has('LS2')) {
                  currentBrands.add('LS2');
                  brandRecords.push({
                      brandName: 'LS2',
                      brandCode: 'LS2',
                      brandAlt1: 'LS2 Helmets',
                      vendorId: vendor.vendorId
                  });
              }

              if (data.PartNumber) {
                currentProducts.add(data.PartNumber);
                productRecords.push({
                  itemId: data.PartNumber,
                  brandName: 'LS2',
                  productType: data.TYPE || null,
                  mfgPart: data.PartNumber,
                  title: data['Item Description'] || null,
                  upc: data['EAN/UPC'] || null,
                  description1: data['Item Description'] || null,
                  discontinued: data['Is Discontinued']?.toUpperCase() === 'T',
                  vendorId: vendor.vendorId,
                  msrp: parseFloat(data['RetailPrice'] || '0'),
                  mapPrice: parseFloat(data['MAP Price'] || '0')
                });

                distributorRecords.push({
                  distributorPart: data.PartNumber,
                  manufacturerPart: data.PartNumber,
                  vendorId: vendor.vendorId,
                  cost: parseFloat(data['Dealer Cost'] || '0'),
                  inventoryEast: parseInt(data['In Stock'] || '0', 10),
                  inventoryMidwest: 0,
                  inventoryWest: 0,
                  totalInventory: parseInt(data['In Stock'] || '0', 10),
                  shippingCost: 0
                });
              }
            })
            .on('end', async () => {
              try {
                const existingBrands = await models.VendorBrand.findAll({
                  where: { vendorId: vendor.vendorId },
                  transaction
                });

                const brandMap = new Map(existingBrands.map(b => [b.brandName, b]));
                let ls2Brand;

                for (const brandRecord of brandRecords) {
                  if (brandMap.has(brandRecord.brandName)) {
                    await models.VendorBrand.update(
                      {
                        brandAlt1: brandRecord.brandAlt1,
                        active: true,
                        updatedAt: new Date()
                      },
                      {
                        where: { brandId: brandMap.get(brandRecord.brandName).brandId },
                        transaction
                      }
                    );
                    ls2Brand = brandMap.get(brandRecord.brandName);
                    results.brands.updated++;
                  } else {
                    ls2Brand = await models.VendorBrand.create({
                      ...brandRecord,
                      active: true,
                      createdAt: new Date(),
                      updatedAt: new Date()
                    }, { transaction });
                    results.brands.created++;
                  }
                }

                const existingProducts = await models.VendorProduct.findAll({
                  where: { vendorId: vendor.vendorId },
                  transaction
                });

                const productMap = new Map(existingProducts.map(p => [p.itemId, p]));

                for (const productRecord of productRecords) {
                  const productData = {
                    ...productRecord,
                    brandId: ls2Brand.brandId,
                    vendorSku: productRecord.itemId,
                    vendorProductName: productRecord.title || `LS2 Product ${productRecord.itemId}`,
                    active: true,
                    updatedAt: new Date()
                  };

                  if (productMap.has(productRecord.itemId)) {
                    await models.VendorProduct.update(
                      productData,
                      {
                        where: { productId: productMap.get(productRecord.itemId).productId },
                        transaction
                      }
                    );
                    results.products.updated++;
                  } else {
                    await models.VendorProduct.create({
                      ...productData,
                      createdAt: new Date()
                    }, { transaction });
                    results.products.created++;
                  }
                }

                for (const distributorRecord of distributorRecords) {
                  const existingDistInfo = await models.VendorDistributorInfo.findOne({
                    where: { manufacturerPart: distributorRecord.manufacturerPart },
                    transaction
                  });

                  if (existingDistInfo) {
                    await models.VendorDistributorInfo.update(
                      {
                        ...distributorRecord,
                        active: true,
                        updatedAt: new Date()
                      },
                      {
                        where: { distributorInfoId: existingDistInfo.distributorInfoId },
                        transaction
                      }
                    );
                    results.distributor_info.updated++;
                  } else {
                    await models.VendorDistributorInfo.create({
                      ...distributorRecord,
                      active: true,
                      createdAt: new Date(),
                      updatedAt: new Date()
                    }, { transaction });
                    results.distributor_info.created++;
                  }
                }

                await transaction.commit();
                resolve(results);
              } catch (error) {
                await transaction.rollback();
                reject(error);
              }
            })
            .on('error', async (error) => {
              await transaction.rollback();
              reject(error);
            });
        });
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
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
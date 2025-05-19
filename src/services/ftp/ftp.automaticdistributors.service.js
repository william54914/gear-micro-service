const BaseService = require('../base.service');
const config = require('../../config/env');
const FtpService = require('./ftp.service');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const models = require('../../models');
const { Op } = require('sequelize');

class FtpAutomaticDistributorsService extends BaseService {
  constructor() {
    super('automaticdistributors');

    if (process.env.NODE_ENV === 'test' && !process.env.FORCE_AUTODIST_REAL) {
      this.config = {
        host: 'test-host',
        user: 'test-user',
        password: 'test-password',
        secure: false
      };
      return;
    }

    this.config = {
      host: config.automaticdistributors.host,
      user: config.automaticdistributors.user,
      password: config.automaticdistributors.password,
      secure: config.automaticdistributors.secure || false
    };

    this.ftpService = new FtpService(this.config);
    this.tmpDir = path.join(__dirname, '../../../tmp');
    this.vendorName = "Automatic Distributors";
    this.productsFileName = process.env.AUTODIST_PRODUCTS_FILE || "All Products.csv";
    this.priceInventoryFileName = process.env.AUTODIST_PRICE_INVENTORY_FILE || "All Products, Price and Inventory.csv";
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

  async getFiles() {
    try {
      console.log('Looking for Automatic Distributors files...');
      const files = await this.listFiles();
      const results = {
        products: null,
        priceInventory: null
      };
      
      // Find products file
      const productsFile = files.find(file => file.name === this.productsFileName);
      if (productsFile) {
        console.log('Found products file:', productsFile.name, `(${productsFile.size} bytes)`);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const localFilename = `autodist_products_${timestamp}.csv`;
        const localPath = path.join(this.tmpDir, localFilename);
        await this.downloadFile(productsFile.name, localPath);
        results.products = {
          path: localPath,
          name: productsFile.name,
          originalDate: productsFile.date
        };
      }

      // Find price and inventory file
      const priceInventoryFile = files.find(file => file.name === this.priceInventoryFileName);
      if (priceInventoryFile) {
        console.log('Found price/inventory file:', priceInventoryFile.name, `(${priceInventoryFile.size} bytes)`);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const localFilename = `autodist_price_inventory_${timestamp}.csv`;
        const localPath = path.join(this.tmpDir, localFilename);
        await this.downloadFile(priceInventoryFile.name, localPath);
        results.priceInventory = {
          path: localPath,
          name: priceInventoryFile.name,
          originalDate: priceInventoryFile.date
        };
      }

      return results;
    } catch (error) {
      console.error('Error getting files from Automatic Distributors:', error);
      throw error;
    }
  }

  async importAllFiles() {
    try {
      console.log('Starting Automatic Distributors file import...');
      const files = await this.getFiles();
      
      if (!files.products && !files.priceInventory) {
        console.log('No files to import');
        return {
          totalFiles: 0,
          processed: []
        };
      }

      const results = {
        totalFiles: Object.values(files).filter(Boolean).length,
        processed: []
      };

      // Process products file first to ensure base product data exists
      if (files.products) {
        try {
          console.log('Processing products file...');
          const result = await this.processProductsFile(files.products.path);
          results.processed.push({
            file: files.products.name,
            success: true,
            ...result
          });
        } catch (error) {
          console.error('Error processing products file:', files.products.name, error);
          results.processed.push({
            file: files.products.name,
            success: false,
            error: error.message
          });
        }
      }

      // Then process price and inventory file
      if (files.priceInventory) {
        try {
          console.log('Processing price/inventory file...');
          const result = await this.processPriceInventoryFile(files.priceInventory.path);
          results.processed.push({
            file: files.priceInventory.name,
            success: true,
            ...result
          });
        } catch (error) {
          console.error('Error processing price/inventory file:', files.priceInventory.name, error);
          results.processed.push({
            file: files.priceInventory.name,
            success: false,
            error: error.message
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Error importing Automatic Distributors files:', error);
      throw error;
    }
  }

  async processProductsFile(filePath) {
    try {
      const vendor = await this.getOrCreateVendor();
      const records = [];
      const brandCache = new Map();

      // Collect all records from CSV
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (data) => {
            if (data['SKU']) {
              records.push(data);
            }
          })
          .on('end', resolve)
          .on('error', reject);
      });

      console.log(`Processing ${records.length} records from Automatic Distributors products CSV file...`);

      // Process in batches
      const batches = [];
      for (let i = 0; i < records.length; i += this.batchSize) {
        batches.push(records.slice(i, i + this.batchSize));
      }

      const results = {
        products: { created: 0, updated: 0, deactivated: 0 },
        brands: { created: 0, updated: 0, deactivated: 0 }
      };

      // Track all SKUs seen in this import
      const seenSkus = new Set();

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        const progress = Math.round(((batchIndex + 1) / batches.length) * 100);
        try {
          await models.sequelize.transaction(async (transaction) => {
            // Ensure all brands exist
            for (const data of batch) {
              const brandName = data['Manufacturer'] || 'Unknown Brand';
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

            // Prepare product records
            const productRecords = batch.map(data => {
              const sku = data['SKU'];
              seenSkus.add(sku);
              const brandName = data['Manufacturer'] || 'Unknown Brand';
              const brand = brandCache.get(brandName);
              // Discontinued logic
              let discontinued = false;
              if (data['Discontinued']) {
                const val = String(data['Discontinued']).toLowerCase();
                if (val === 'true' || val === 'yes' || val === '1') {
                  discontinued = true;
                }
              }
              return {
                vendorId: vendor.vendorId,
                brandId: brand.brandId,
                mfgPart: data['Manufacturer Number'] || sku,
                vendorSku: sku,
                vendorProductName: data['Item_Name'] || data['Description'] || sku,
                description1: data['Description'] || null,
                upc: data['UPC'] || null,
                msrp: data['List_Price'] ? parseFloat(data['List_Price']) : null,
                active: true,
                discontinued,
                itemHeight: data['Item_Height'] || null,
                itemLength: data['Item_Length'] || null,
                itemWidth: data['Item_Width'] || null,
                itemWeight: data['Item_Weight'] || null,
                itemUom: data['Item_Length_Unit_Code'] || null,
                itemUow: data['Item_Weight_Unit_Code'] || null,
                imageUrl: data['Image_URL_1'] || null,
                imageUrl2: data['Image_URL_2'] || null,
                imageUrl3: data['Image_URL_3'] || null,
                imageUrl4: data['Image_URL_4'] || null,
                imageUrl5: data['Image_URL_5'] || null,
                distributorPart: sku,
                title: data['Item_Name'] || null,
                createdAt: new Date(),
                updatedAt: new Date()
              };
            });

            // Bulk create/update products
            await models.VendorProduct.bulkCreate(productRecords, {
              updateOnDuplicate: [
                'brandId',
                'vendorSku',
                'vendorProductName',
                'description1',
                'upc',
                'msrp',
                'active',
                'discontinued',
                'itemHeight',
                'itemLength',
                'itemWidth',
                'itemWeight',
                'itemUom',
                'itemUow',
                'imageUrl',
                'imageUrl2',
                'imageUrl3',
                'imageUrl4',
                'imageUrl5',
                'distributorPart',
                'title',
                'updatedAt'
              ],
              transaction
            });
          });
          // Log progress every 20% or at the end
          if ((batchIndex + 1) % Math.max(1, Math.floor(batches.length / 5)) === 0 || batchIndex === batches.length - 1) {
            console.log(`Progress: ${progress}% (${Math.min((batchIndex + 1) * this.batchSize, records.length)} records processed)`);
          }
        } catch (error) {
          console.error(`Error processing batch ${batchIndex}:`, error);
          throw error;
        }
      }

      // Deactivate products not present in this import
      const allDbProducts = await models.VendorProduct.findAll({
        where: { vendorId: vendor.vendorId }
      });
      let deactivatedCount = 0;
      for (const dbProduct of allDbProducts) {
        if (!seenSkus.has(dbProduct.vendorSku)) {
          if (dbProduct.active) {
            dbProduct.active = false;
            await dbProduct.save();
            deactivatedCount++;
          }
        }
      }
      results.products.deactivated = deactivatedCount;

      return results;
    } catch (error) {
      console.error('Error processing Automatic Distributors products CSV file:', error);
      throw error;
    }
  }

  async processPriceInventoryFile(filePath) {
    try {
      const vendor = await this.getOrCreateVendor();
      const records = [];
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (data) => {
            if (data['SKU']) {
              records.push(data);
            }
          })
          .on('end', resolve)
          .on('error', reject);
      });
      console.log(`Processing ${records.length} records from Automatic Distributors price/inventory CSV file...`);
      const batches = [];
      for (let i = 0; i < records.length; i += this.batchSize) {
        batches.push(records.slice(i, i + this.batchSize));
      }
      const results = {
        pricing: { created: 0, updated: 0 },
        inventory: { created: 0, updated: 0 }
      };
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        const progress = Math.round(((batchIndex + 1) / batches.length) * 100);
        try {
          await models.sequelize.transaction(async (transaction) => {
            // Fetch all products for this batch in one query
            const skus = batch.map(data => data['SKU']);
            const products = await models.VendorProduct.findAll({
              where: { vendorId: vendor.vendorId, vendorSku: skus },
              transaction
            });
            const productMap = new Map();
            const mfgPartSet = new Set();
            products.forEach(product => {
              productMap.set(product.vendorSku, product);
              if (product.mfgPart) mfgPartSet.add(product.mfgPart);
            });
            for (const data of batch) {
              const sku = data['SKU'];
              const manufacturerPart = data['Manufacturer Number'];
              if (!manufacturerPart || !mfgPartSet.has(manufacturerPart)) {
                console.warn(`Skipping distributor info for SKU ${sku}: manufacturer part '${manufacturerPart}' not found in products.`);
                continue;
              }
              const product = productMap.get(sku);
              if (!product) continue;
              // Update pricing and inventory fields
              await models.VendorDistributorInfo.upsert({
                distributorPart: sku,
                manufacturerPart: manufacturerPart,
                vendorId: vendor.vendorId,
                cost: data['Standard_Dealer_Price'] ? parseFloat(data['Standard_Dealer_Price']) : null,
                mapPrice: data['MAP_Pricing'] ? parseFloat(data['MAP_Pricing']) : null,
                inventoryEast: data['Warehouse_1_Quantity'] ? parseInt(data['Warehouse_1_Quantity']) : 0,
                inventoryMidwest: data['Warehouse_2_Quantity'] ? parseInt(data['Warehouse_2_Quantity']) : 0,
                inventoryWest: data['Warehouse_3_Quantity'] ? parseInt(data['Warehouse_3_Quantity']) : 0,
                totalInventory: (data['Warehouse_1_Quantity'] ? parseInt(data['Warehouse_1_Quantity']) : 0) + (data['Warehouse_2_Quantity'] ? parseInt(data['Warehouse_2_Quantity']) : 0) + (data['Warehouse_3_Quantity'] ? parseInt(data['Warehouse_3_Quantity']) : 0),
                active: product.active,
                updatedAt: new Date()
              }, { transaction });
            }
          });
          // Log progress every 20% or at the end
          if ((batchIndex + 1) % Math.max(1, Math.floor(batches.length / 5)) === 0 || batchIndex === batches.length - 1) {
            console.log(`Progress: ${progress}% (${Math.min((batchIndex + 1) * this.batchSize, records.length)} records processed)`);
          }
        } catch (error) {
          console.error(`Error processing batch ${batchIndex}:`, error);
          throw error;
        }
      }
      return results;
    } catch (error) {
      console.error('Error processing Automatic Distributors price/inventory CSV file:', error);
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
        vendorCode: 'AUTODIST',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      });
    }
    
    return vendor;
  }
}

module.exports = new FtpAutomaticDistributorsService(); 
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

    // Skip configuration in test environment unless FORCE_LS2_REAL is set
    if (process.env.NODE_ENV === 'test' && !process.env.FORCE_LS2_REAL) {
      this.config = {
        host: 'test-host',
        user: 'test-user',
        password: 'test-password',
        secure: false
      };
      console.log('LS2 FTP config (test):', this.config);
      return;
    }

    // LS2 FTP connection details from validated config
    this.config = {
      host: config.ls2.host,
      user: config.ls2.user,
      password: config.ls2.password,
      secure: config.ls2.secure || false
    };
    console.log('LS2 FTP config (real):', this.config);

    this.ftpService = new FtpService(this.config);
    console.log('FtpService instance:', this.ftpService);
    this.tmpDir = path.join(__dirname, '../../../tmp');
    this.vendorName = "LS2 Helmets";
    
    // Create tmp directory if it doesn't exist
    if (!fs.existsSync(this.tmpDir)) {
      fs.mkdirSync(this.tmpDir, { recursive: true });
    }
  }

  async listFiles(remotePath = '.') {
    return await this.ftpService.listFiles(remotePath);
  }

  async downloadFile(remotePath, localPath) {
    await this.ftpService.downloadFile(remotePath, localPath);
  }
  
  async getLatestPriceFile() {
    try {
      // List all files in the directory
      const files = await this.listFiles();
      
      // Filter for price files
      const priceFiles = files.filter(file => 
        file.name.toLowerCase().endsWith('.csv') || 
        file.name.toLowerCase().endsWith('.xlsx')
      );
      
      if (priceFiles.length === 0) {
        console.log("No price files found in the LS2 directory");
        return null;
      }
      
      // Sort by date (newest first)
      priceFiles.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      // Get the most recent file
      const latestFile = priceFiles[0];
      
      // Create a timestamp for the local file
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileExtension = path.extname(latestFile.name);
      const localFilename = `ls2_price_${timestamp}${fileExtension}`;
      const localPath = path.join(this.tmpDir, localFilename);
      
      // Download the file
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
      // List all files in the directory
      const files = await this.listFiles();
      
      // Filter for price files
      const priceFiles = files.filter(file => 
        file.name.toLowerCase().endsWith('.csv') || 
        file.name.toLowerCase().endsWith('.xlsx')
      );
      
      const downloadedFiles = [];
      
      for (const file of priceFiles) {
        // Create a timestamp for the local file
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const localFilename = `ls2_price_${timestamp}_${file.name}`;
        const localPath = path.join(this.tmpDir, localFilename);
        
        // Download the file
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
  
  // Process an LS2 file for import into database tables
  async importFile(filename) {
    try {
      // Download the file
      const localFilePath = path.join(this.tmpDir, filename);
      await this.downloadFile(filename, localFilePath);
      
      // Process the file
      const results = await this.processCSVFile(localFilePath);
      
      // Clean up
      fs.unlinkSync(localFilePath);
      
      return results;
    } catch (error) {
      console.error('Error importing LS2 file:', filename, error);
      throw error;
    }
  }
  
  async processCSVFile(filePath) {
    try {
      console.log('Starting CSV processing...');
      
      // Get or create the LS2 vendor record
      const vendor = await this.getOrCreateVendor();
      console.log('Vendor:', vendor.toJSON());

      // Start a transaction
      const transaction = await models.sequelize.startUnmanagedTransaction();
      console.log('Transaction started');
      
      try {
        // Arrays to hold data for each table
        const brandRecords = [];
        const productRecords = [];
        const attributeRecords = [];
        const imageRecords = [];
        const inventoryRecords = [];
        const pricingRecords = [];
        const dimensionRecords = [];
        const distributorRecords = [];

        // Arrays to track what's in the current import file
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
              if (isFirstRow) {
                console.log('First row of CSV data:', data);
                console.log('Available fields:', Object.keys(data));
                isFirstRow = false;
              }

              // Process brands
              if (!currentBrands.has('LS2')) {
                  currentBrands.add('LS2');
                  brandRecords.push({
                      brand_name: 'LS2',
                      brand_alt_1: 'LS2 Helmets',
                      vendor_id: vendor.vendor_id
                  });
              }

              // Process products
              if (data.PartNumber) {
                currentProducts.add(data.PartNumber);
                productRecords.push({
                  item_id: data.PartNumber,
                  brand_name: 'LS2',
                  product_type: data.TYPE || null,
                  mfg_part: data.PartNumber,
                  title: data['Item Description'] || null,
                  upc: data['EAN/UPC'] || null,
                  description_1: data['Item Description'] || null,
                  discontinued: data['Is Discontinued']?.toUpperCase() === 'T',
                  vendor_id: vendor.vendor_id
                });

                // Process distributor info
                distributorRecords.push({
                  distributor_part: data.PartNumber,
                  manufacturer_part: data.PartNumber,
                  cost: parseFloat(data['Dealer Cost'] || '0'),
                  inventory_east: parseInt(data['In Stock'] || '0', 10),
                  inventory_midwest: 0,
                  inventory_west: 0,
                  total_inventory: parseInt(data['In Stock'] || '0', 10),
                  shipping_cost: 0
                });
              }
            })
            .on('end', async () => {
              try {
                console.log('CSV parsing complete.');
                console.log('Records collected:');
                console.log(`- Brands: ${brandRecords.length}`);
                console.log(`- Products: ${productRecords.length}`);
                console.log(`- Attributes: ${attributeRecords.length}`);
                console.log(`- Images: ${imageRecords.length}`);
                console.log(`- Distributor Info: ${distributorRecords.length}`);
                console.log(`- Dimensions: ${dimensionRecords.length}`);

                // Process brands
                console.log('Processing brands...');
                const existingBrands = await models.VendorBrand.findAll({
                  where: { vendor_id: vendor.vendor_id },
                  transaction
                });
                console.log(`Found existing brands: ${existingBrands.length}`);

                // Create a map for quick lookup
                const brandMap = new Map(existingBrands.map(b => [b.brand_name, b]));

                // Process each brand record
                for (const brandRecord of brandRecords) {
                  if (brandMap.has(brandRecord.brand_name)) {
                    // Update existing brand
                    await models.VendorBrand.update(
                      {
                        brand_alt_1: brandRecord.brand_alt_1,
                        brand_alt_2: brandRecord.brand_alt_2,
                        active: true,
                        updated_at: new Date()
                      },
                      {
                        where: { brand_id: brandMap.get(brandRecord.brand_name).brand_id },
                        transaction
                      }
                    );
                    results.brands.updated++;
                  } else {
                    // Create new brand
                    const newBrand = await models.VendorBrand.create({
                      ...brandRecord,
                      active: true,
                      created_at: new Date(),
                      updated_at: new Date()
                    }, { transaction });
                    results.brands.created++;
                  }
                }

                // Process products
                console.log('Processing products...');
                const existingProducts = await models.VendorProduct.findAll({
                  where: { vendor_id: vendor.vendor_id },
                  transaction
                });

                // Create a map for quick lookup
                const productMap = new Map(existingProducts.map(p => [p.item_id, p]));

                // Process each product record
                for (const productRecord of productRecords) {
                  if (productMap.has(productRecord.item_id)) {
                    // Update existing product
                    await models.VendorProduct.update(
                      {
                        ...productRecord,
                        active: true,
                        updated_at: new Date()
                      },
                      {
                        where: { product_id: productMap.get(productRecord.item_id).product_id },
                        transaction
                      }
                    );
                    results.products.updated++;
                  } else {
                    // Create new product
                    const newProduct = await models.VendorProduct.create({
                      ...productRecord,
                      active: true,
                      created_at: new Date(),
                      updated_at: new Date()
                    }, { transaction });
                    results.products.created++;
                  }
                }

                // Process distributor info
                console.log('Processing distributor info...');
                for (const distributorRecord of distributorRecords) {
                  const existingDistInfo = await models.VendorDistributorInfo.findOne({
                    where: { manufacturer_part: distributorRecord.manufacturer_part },
                    transaction
                  });

                  if (existingDistInfo) {
                    // Update existing distributor info
                    await models.VendorDistributorInfo.update(
                      {
                        ...distributorRecord,
                        active: true,
                        updated_at: new Date()
                      },
                      {
                        where: { distributor_info_id: existingDistInfo.distributor_info_id },
                        transaction
                      }
                    );
                    results.distributor_info.updated++;
                  } else {
                    // Create new distributor info
                    await models.VendorDistributorInfo.create({
                      ...distributorRecord,
                      active: true,
                      created_at: new Date(),
                      updated_at: new Date()
                    }, { transaction });
                    results.distributor_info.created++;
                  }
                }

                await transaction.commit();
                resolve(results);
              } catch (error) {
                console.error('Error processing CSV data:', error);
                await transaction.rollback();
                console.log('Transaction rolled back due to error');
                reject(error);
              }
            })
            .on('error', async (error) => {
              console.error('Error reading CSV:', error);
              await transaction.rollback();
              console.log('Transaction rolled back due to error');
              reject(error);
            });
        });
      } catch (error) {
        await transaction.rollback();
        console.log('Transaction rolled back due to error');
        throw error;
      }
    } catch (error) {
      console.error('Error processing LS2 CSV file:', error);
      throw error;
    }
  }
  
  async processExcelFile(filePath) {
    // TODO: Implement Excel processing using a library like exceljs
    // Similar to CSV processing but using excel parsing
    throw new Error('Excel file processing not yet implemented');
  }
  
  // Helper method to get or create the LS2 vendor record
  async getOrCreateVendor() {
    // First try to find by exact name match
    let vendor = await models.Vendor.findOne({ 
      where: { vendor_name: 'LS2' }
    });
    
    if (!vendor) {
      // If not found, create new
      vendor = await models.Vendor.create({
        vendor_name: 'LS2',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      });
    }
    
    return vendor;
  }
  
  // Import all available LS2 files
  async importAllFiles() {
    try {
      const files = await this.listFiles();
      console.log(`Found ${files.length} LS2 files to import`);
      
      const results = [];
      
      for (const file of files) {
        if (file.type === 1) { // Type 1 is typically a file (not a directory)
          try {
            const result = await this.importFile(file.name);
            results.push({
              file: file.name,
              success: true,
              result
            });
          } catch (error) {
            results.push({
              file: file.name,
              success: false,
              error: error.message
            });
          }
        }
      }
      
      return {
        totalFiles: files.filter(f => f.type === 1).length,
        processed: results
      };
    } catch (error) {
      console.error('Error importing all LS2 files:', error);
      throw error;
    }
  }
}

module.exports = new LS2FtpService(); 
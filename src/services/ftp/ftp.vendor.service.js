const SftpService = require('./sftp.service');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const { Vendor, VendorBrand, VendorProduct, 
        VendorProductAttributes, VendorProductDimensions, 
        VendorProductImages, VendorProductInventory, 
        VendorProductPricing, VendorVehicleCompatibility } = require('../../models');

class FtpVendorService {
  constructor() {
    // This is a placeholder config. You should replace it with your actual vendor FTP details
    this.config = {
      host: process.env.VENDOR_FTP_HOST || "vendor-ftp-host.com",
      user: process.env.VENDOR_FTP_USER || "ftpuser",
      password: process.env.VENDOR_FTP_PASSWORD || "password",
      port: parseInt(process.env.VENDOR_FTP_PORT || "22"),
      basePath: process.env.VENDOR_FTP_PATH || "Vendor"
    };
    
    this.ftp = new SftpService();
    this.tmpDir = path.join(__dirname, '../../../tmp');
    
    // Create tmp directory if it doesn't exist
    if (!fs.existsSync(this.tmpDir)) {
      fs.mkdirSync(this.tmpDir, { recursive: true });
    }
  }

  async connect() {
    await this.ftp.connect(this.config);
  }

  async disconnect() {
    await this.ftp.disconnect();
  }

  async downloadFile(remotePath, localPath) {
    await this.ftp.downloadFile(this.config, remotePath, localPath);
  }

  async listFiles() {
    return await this.ftp.listFiles(this.config, this.config.basePath);
  }
  
  // Download and process a specific file
  async importFile(filename) {
    const remotePath = `${this.config.basePath}/${filename}`;
    const localPath = path.join(this.tmpDir, filename);
    
    try {
      console.log(`Downloading file: ${remotePath}`);
      await this.downloadFile(remotePath, localPath);
      
      console.log(`Processing file: ${localPath}`);
      const importResult = await this.processFile(localPath, filename);
      
      // Clean up: delete the temp file
      fs.unlinkSync(localPath);
      
      return importResult;
    } catch (error) {
      console.error(`Error importing file ${filename}:`, error);
      throw error;
    }
  }
  
  // Process the downloaded file based on its type
  async processFile(filePath, filename) {
    if (filename.toLowerCase().includes('brand')) {
      return await this.processBrandsFile(filePath);
    } else if (filename.toLowerCase().includes('product')) {
      return await this.processProductsFile(filePath);
    } else if (filename.toLowerCase().includes('attribute')) {
      return await this.processAttributesFile(filePath);
    } else if (filename.toLowerCase().includes('dimension')) {
      return await this.processDimensionsFile(filePath);
    } else if (filename.toLowerCase().includes('image')) {
      return await this.processImagesFile(filePath);
    } else if (filename.toLowerCase().includes('inventory')) {
      return await this.processInventoryFile(filePath);
    } else if (filename.toLowerCase().includes('pricing')) {
      return await this.processPricingFile(filePath);
    } else if (filename.toLowerCase().includes('compatibility') || filename.toLowerCase().includes('vehicle')) {
      return await this.processCompatibilityFile(filePath);
    } else {
      throw new Error(`Unrecognized file type: ${filename}`);
    }
  }
  
  // Process vendor data and insert into database
  async processBrandsFile(filePath) {
    const records = [];
    const vendor = await this.getOrCreateVendor();
    
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
          records.push({
            brand_name: data.brand_name,
            brand_alt_1: data.brand_alt_1,
            brand_alt_2: data.brand_alt_2,
            vendor_id: vendor.vendor_id,
            created_at: new Date(),
            updated_at: new Date()
          });
        })
        .on('end', async () => {
          try {
            console.log(`Importing ${records.length} brand records`);
            await VendorBrand.bulkCreate(records);
            resolve({ success: true, count: records.length });
          } catch (error) {
            console.error('Error importing brands:', error);
            reject(error);
          }
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }
  
  async processProductsFile(filePath) {
    const records = [];
    const vendor = await this.getOrCreateVendor();
    
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', async (data) => {
          // Find or create brand
          let brand;
          if (data.brand_name) {
            brand = await VendorBrand.findOne({ 
              where: { brand_name: data.brand_name, vendor_id: vendor.vendor_id } 
            });
            
            if (!brand) {
              brand = await VendorBrand.create({
                brand_name: data.brand_name,
                vendor_id: vendor.vendor_id,
                created_at: new Date(),
                updated_at: new Date()
              });
            }
          }
          
          records.push({
            brand_id: brand?.brand_id || null,
            item_id: data.item_id,
            asin: data.asin,
            upc: data.upc,
            description_1: data.description_1,
            description_2: data.description_2,
            alt_sku_1: data.alt_sku_1,
            alt_sku_2: data.alt_sku_2,
            alt_sku_3: data.alt_sku_3,
            distributor_part: data.distributor_part,
            part_id: data.part_id,
            parent_id: data.parent_id,
            product_type: data.product_type,
            title: data.title,
            closeout: data.closeout?.toLowerCase() === 'true',
            discontinued: data.discontinued?.toLowerCase() === 'true',
            vendor_id: vendor.vendor_id,
            created_at: new Date(),
            updated_at: new Date()
          });
        })
        .on('end', async () => {
          try {
            console.log(`Importing ${records.length} product records`);
            await VendorProduct.bulkCreate(records);
            resolve({ success: true, count: records.length });
          } catch (error) {
            console.error('Error importing products:', error);
            reject(error);
          }
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }
  
  // Similar methods for other file types
  async processAttributesFile(filePath) {
    // Implementation similar to other methods
    // Read CSV, map to VendorProductAttributes model fields, bulk create records
    console.log('Processing attributes file (to be implemented)');
    return { success: true, message: "Attributes processing not yet implemented" };
  }
  
  async processDimensionsFile(filePath) {
    // Implementation for dimensions file
    console.log('Processing dimensions file (to be implemented)');
    return { success: true, message: "Dimensions processing not yet implemented" };
  }
  
  async processImagesFile(filePath) {
    // Implementation for images file
    console.log('Processing images file (to be implemented)');
    return { success: true, message: "Images processing not yet implemented" };
  }
  
  async processInventoryFile(filePath) {
    // Implementation for inventory file
    console.log('Processing inventory file (to be implemented)');
    return { success: true, message: "Inventory processing not yet implemented" };
  }
  
  async processPricingFile(filePath) {
    // Implementation for pricing file
    console.log('Processing pricing file (to be implemented)');
    return { success: true, message: "Pricing processing not yet implemented" };
  }
  
  async processCompatibilityFile(filePath) {
    // Implementation for compatibility file
    console.log('Processing compatibility file (to be implemented)');
    return { success: true, message: "Compatibility processing not yet implemented" };
  }
  
  // Helper method to get or create the main vendor record
  async getOrCreateVendor() {
    const vendorName = process.env.VENDOR_NAME || "Default Vendor";
    
    let vendor = await Vendor.findOne({ where: { vendor_name: vendorName } });
    
    if (!vendor) {
      vendor = await Vendor.create({
        vendor_name: vendorName,
        created_at: new Date(),
        updated_at: new Date()
      });
    }
    
    return vendor;
  }
  
  // Method to import all available files
  async importAllFiles() {
    try {
      const files = await this.listFiles();
      console.log(`Found ${files.length} files to import`);
      
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
      console.error('Error importing all files:', error);
      throw error;
    }
  }
}

module.exports = new FtpVendorService(); 
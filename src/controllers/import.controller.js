const OneDriveClient = require('../services/onedrive.service');
const { RestockImporter } = require('../services/importers');

/**
 * Controller to handle import operations from various sources
 */
class ImportController {
  constructor() {
    this.oneDriveClient = new OneDriveClient();
    this.importers = {
      restock: new RestockImporter()
    };
  }

  /**
   * Import restock products from OneDrive
   * @param {object} options - Import options
   * @param {string} options.folderPath - OneDrive folder path (default: "inventory management/Restock Products")
   * @param {string} options.fileName - File name (default: "restock_products.csv")
   * @returns {Promise<object>} - Import results
   */
  async importRestockFromOneDrive(options = {}) {
    // Default to the nested folder structure
    const folderPath = options.folderPath || process.env.RESTOCK_FOLDER_PATH || 'inventory management/Restock Products';
    const fileName = options.fileName || process.env.RESTOCK_FILE || 'restock_products.csv';
    
    try {
      console.log(`Searching for ${fileName} in folder path: ${folderPath}`);
      
      // Find the file using the path
      const file = await this.oneDriveClient.findFileByPath(folderPath, fileName);
      if (!file) {
        throw new Error(`File ${fileName} not found in path ${folderPath}`);
      }
      
      console.log(`Found file: ${file.name} (${file.id})`);
      
      // Get file content
      const fileContent = await this.oneDriveClient.getFileContent(file.id);
      console.log(`Retrieved file content (${fileContent.length} bytes). Starting import...`);
      
      // Import data
      const importer = this.importers.restock.setSource(folderPath, fileName);
      const results = await importer.import(fileContent);
      
      console.log(`Import completed. Success: ${results.success}, Failed: ${results.failed}`);
      return {
        file: {
          name: file.name,
          id: file.id,
          size: file.size,
          modifiedDateTime: file.modifiedDateTime
        },
        results
      };
    } catch (error) {
      console.error('Error importing restock data from OneDrive:', error);
      throw error;
    }
  }

  /**
   * Register a new importer
   * @param {string} name - Importer name
   * @param {BaseImporter} importer - Importer instance
   */
  registerImporter(name, importer) {
    this.importers[name] = importer;
  }
}

module.exports = new ImportController(); 
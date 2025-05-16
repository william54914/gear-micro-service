/**
 * Mock for ImportController used in tests
 */

const MockRestockImporter = require('../importers/restock.importer');

class MockImportController {
  constructor() {
    this.importers = {
      restock: new MockRestockImporter()
    };
  }
  
  async importRestockFromOneDrive(options = {}) {
    const folderPath = options.folderPath || 'Inventory Management/Restock Products';
    const fileName = options.fileName || 'restock_products.csv';
    
    return {
      file: {
        name: fileName,
        id: 'file-id-123',
        size: 1024,
        modifiedDateTime: new Date().toISOString()
      },
      results: {
        success: 10,
        failed: 0,
        total: 10
      }
    };
  }
  
  registerImporter(name, importer) {
    this.importers[name] = importer;
  }
}

module.exports = new MockImportController(); 
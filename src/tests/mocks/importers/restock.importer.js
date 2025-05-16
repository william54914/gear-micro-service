/**
 * Mock for RestockImporter used in tests
 */

const BaseImporter = require('../../../services/importers/importer.base');

class MockRestockImporter extends BaseImporter {
  constructor() {
    super();
    this.filename = 'test.csv';
    this.folderPath = 'Inventory Management';
    this.batchSize = 100;
    this.markMissingAsInactive = true;
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
  
  async processRecord(record) {
    return true;
  }
  
  async import(csvContent) {
    return {
      success: 10,
      failed: 0,
      total: 10
    };
  }
}

module.exports = MockRestockImporter; 
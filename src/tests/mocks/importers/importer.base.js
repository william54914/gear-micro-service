/**
 * Mock for BaseImporter used in tests
 */

class BaseImporter {
  constructor() {
    this.successCount = 0;
    this.errorCount = 0;
    this.errors = [];
  }
  
  resetStats() {
    this.successCount = 0;
    this.errorCount = 0;
    this.errors = [];
  }
  
  async parseCSV(content) {
    return [
      { SKU: 'TEST-001', name: 'Test Product', price: '19.99' }
    ];
  }
  
  getFieldValue(record, keys, defaultValue = '') {
    for (const key of keys) {
      if (record[key] !== undefined) {
        return record[key];
      }
    }
    return defaultValue;
  }
  
  async import(csvContent) {
    // Simple mock implementation
    return {
      success: 1,
      failed: 0,
      total: 1,
      errors: []
    };
  }
}

module.exports = BaseImporter; 
const { Readable } = require('stream');
const csv = require('csv-parser');

/**
 * Base Importer class that provides common functionality for all importers
 */
class BaseImporter {
  constructor() {
    this.results = [];
    this.successCount = 0;
    this.errorCount = 0;
    this.errors = [];
  }

  /**
   * Parse CSV content from string
   * @param {string} csvContent - Raw CSV content as string
   * @returns {Promise<Array>} - Array of parsed records
   */
  async parseCSV(csvContent) {
    if (!csvContent || typeof csvContent !== 'string') {
      throw new Error('Invalid CSV content: content must be a non-empty string');
    }

    return new Promise((resolve, reject) => {
      const results = [];
      const readableStream = new Readable();
      readableStream._read = () => {};

      // Remove any BOM and normalize line endings
      const cleanContent = csvContent.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
      readableStream.push(cleanContent);
      readableStream.push(null);

      console.log('\nParsing CSV with csv-parser...');
      console.log('CSV content type:', typeof cleanContent);
      console.log('CSV content length:', cleanContent.length);
      console.log('First few lines:', cleanContent.split('\n').slice(0, 5));

      readableStream
        .pipe(csv({
          strict: true,
          trim: true,
          skipLines: 0,
          mapHeaders: ({ header }) => header.trim()
        }))
        .on('data', (data) => {
          console.log('Parsed row:', data);
          results.push(data);
        })
        .on('end', () => {
          console.log(`Finished parsing CSV. Found ${results.length} records.`);
          resolve(results);
        })
        .on('error', (error) => {
          console.error('Error parsing CSV:', error);
          reject(error);
        });
    });
  }

  /**
   * Get normalized field value, checking various field name variations
   * @param {Object} record - CSV record
   * @param {string[]} possibleNames - Array of possible field names
   * @param {*} defaultValue - Default value if field not found
   * @returns {*} - Field value or default
   */
  getFieldValue(record, possibleNames, defaultValue = '') {
    for (const name of possibleNames) {
      if (name in record && record[name] !== undefined && record[name] !== null) {
        return record[name];
      }
    }
    return defaultValue;
  }

  /**
   * Process a single record (to be implemented by child classes)
   * @param {Object} record - Record to process
   * @returns {Promise<boolean>} - Success status
   */
  async processRecord(record) {
    throw new Error('processRecord method must be implemented by child importer');
  }

  /**
   * Import data from CSV content
   * @param {string} csvContent - Raw CSV content
   * @returns {Promise<Object>} - Import results
   */
  async import(csvContent) {
    try {
      this.resetStats();
      console.log('Parsing CSV content...');
      const records = await this.parseCSV(csvContent);
      console.log(`Found ${records.length} records to process`);

      for (const record of records) {
        try {
          const success = await this.processRecord(record);
          if (success) {
            this.successCount++;
          } else {
            this.errorCount++;
            this.errors.push({ record, error: 'Failed to process record' });
          }
        } catch (error) {
          this.errorCount++;
          this.errors.push({ record, error: error.message });
          console.error('Error processing record:', error);
        }
      }

      return this.getResults();
    } catch (error) {
      console.error('Import failed:', error);
      throw error;
    }
  }

  /**
   * Reset import statistics
   */
  resetStats() {
    this.successCount = 0;
    this.errorCount = 0;
    this.errors = [];
  }

  /**
   * Get import results
   * @returns {Object} - Import results summary
   */
  getResults() {
    return {
      success: this.successCount,
      failed: this.errorCount,
      total: this.successCount + this.errorCount,
      errors: this.errors
    };
  }
}

module.exports = BaseImporter; 
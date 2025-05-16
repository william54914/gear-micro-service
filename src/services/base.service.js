const config = require('../config/env');

class BaseService {
  constructor(serviceName = null) {
    if (serviceName && config[serviceName]) {
      config[serviceName].validate();
    }
  }

  /**
   * Format success response
   * @param {any} data - The data to return
   * @param {string} message - Optional success message
   */
  success(data, message = null) {
    return {
      success: true,
      ...(message && { message }),
      data
    };
  }

  /**
   * Format error response
   * @param {string} message - Error message
   * @param {any} details - Optional error details
   */
  error(message, details = null) {
    return {
      success: false,
      error: {
        message,
        ...(details && { details })
      }
    };
  }

  /**
   * Validate data against a schema
   * @param {object} data - Data to validate
   * @param {object} schema - Validation schema
   */
  validate(data, schema) {
    const { error } = schema.validate(data);
    if (error) {
      throw new Error(`Validation error: ${error.message}`);
    }
    return true;
  }

  /**
   * Handle pagination parameters
   * @param {object} options - Pagination options
   * @returns {object} Normalized pagination parameters
   */
  getPaginationParams(options = {}) {
    const page = Math.max(1, parseInt(options.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(options.limit) || 10));
    const offset = (page - 1) * limit;

    return {
      page,
      limit,
      offset
    };
  }
}

module.exports = BaseService; 
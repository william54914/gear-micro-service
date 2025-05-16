const config = require('../config/env');

class BaseService {
  constructor(serviceName = null) {
    // Skip validation in test environment
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    // Validate service configuration if provided
    if (serviceName && config[serviceName]) {
      this.validateConfig(serviceName);
    }
  }

  validateConfig(serviceName) {
    const serviceConfig = config[serviceName];
    if (!serviceConfig) {
      throw new Error(`Missing configuration for service: ${serviceName}`);
    }

    // Check for required fields based on service type
    switch (serviceName) {
      case 'amazon':
        this.validateAmazonConfig(serviceConfig);
        break;
      case 'ls2':
        this.validateLS2Config(serviceConfig);
        break;
      // Add other service validations as needed
    }
  }

  validateAmazonConfig(config) {
    const required = ['region', 'refreshToken', 'clientId', 'clientSecret'];
    this.validateRequiredFields(config, required, 'amazon');
  }

  validateLS2Config(config) {
    const required = ['host', 'user', 'password'];
    this.validateRequiredFields(config, required, 'ls2');
  }

  validateRequiredFields(config, required, serviceName) {
    const missing = required.filter(field => !config[field]);
    if (missing.length > 0) {
      throw new Error(`Missing required ${serviceName} configuration: ${missing.join(', ')}`);
    }
  }

  async handleError(error, operation) {
    console.error(`Error in ${operation}:`, error);
    throw error;
  }

  async validateInput(data, schema) {
    try {
      await schema.validateAsync(data);
      return true;
    } catch (error) {
      throw new Error(`Validation error: ${error.message}`);
    }
  }

  isValidDate(date) {
    return date instanceof Date && !isNaN(date);
  }

  formatDate(date) {
    if (!this.isValidDate(date)) {
      throw new Error('Invalid date provided');
    }
    return date.toISOString();
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
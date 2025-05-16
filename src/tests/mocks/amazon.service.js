/**
 * Mock for Amazon service used in tests
 */

const BaseService = require('./base.service');

class AmazonService extends BaseService {
  constructor() {
    super('amazon');
    
    this.spApi = {
      config: jest.fn()
    };
    
    this.baseUrl = 'https://sellingpartnerapi-na.amazon.com';
  }
  
  // Mock API methods
  getInventory = jest.fn().mockResolvedValue({
    items: [
      {
        sku: 'TEST-SKU-001',
        quantity: 100,
        condition: 'New'
      }
    ]
  });
  
  getPricing = jest.fn().mockResolvedValue({
    items: [
      {
        sku: 'TEST-SKU-001',
        price: 19.99,
        currency: 'USD'
      }
    ]
  });
  
  getListings = jest.fn().mockResolvedValue({
    items: [
      {
        sku: 'TEST-SKU-001',
        status: 'Active',
        fulfillmentChannel: 'FBA'
      }
    ]
  });
  
  updatePrice = jest.fn().mockResolvedValue({
    success: true,
    sku: 'TEST-SKU-001'
  });
  
  updateQuantity = jest.fn().mockResolvedValue({
    success: true,
    sku: 'TEST-SKU-001'
  });
  
  // Helper methods
  authenticate = jest.fn().mockResolvedValue({
    token: 'mock-token',
    expires: new Date(Date.now() + 3600000)
  });
  
  generateSignature = jest.fn().mockReturnValue('mock-signature');
  
  formatResponse = jest.fn(data => data);
}

module.exports = AmazonService; 
const service = require('../../../services/amazon.service');

describe('AmazonService', () => {
  it('should have a baseUrl', () => {
    expect(service.baseUrl).toBeDefined();
  });

  it('should get inventory', async () => {
    const result = await service.getInventory();
    expect(result).toHaveProperty('items');
    expect(Array.isArray(result.items)).toBe(true);
  });

  it('should get pricing', async () => {
    const result = await service.getPricing();
    expect(result).toHaveProperty('items');
    expect(Array.isArray(result.items)).toBe(true);
  });

  it('should get listings', async () => {
    const result = await service.getListings();
    expect(result).toHaveProperty('items');
    expect(Array.isArray(result.items)).toBe(true);
  });

  it('should update price', async () => {
    const result = await service.updatePrice({ sku: 'TEST-SKU-001', price: 19.99 });
    expect(result).toHaveProperty('success', true);
  });

  it('should update quantity', async () => {
    const result = await service.updateQuantity({ sku: 'TEST-SKU-001', quantity: 10 });
    expect(result).toHaveProperty('success', true);
  });

  it('should authenticate', async () => {
    const auth = await service.authenticate();
    expect(auth).toHaveProperty('token');
  });
}); 
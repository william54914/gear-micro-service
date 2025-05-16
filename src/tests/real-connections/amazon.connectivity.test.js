const request = require('supertest');
const app = require('../../../src/app');

describe('Real Connectivity: Amazon', () => {
  it('should get Amazon inventory', async () => {
    const res = await request(app)
      .get('/api/amazon/inventory'); // Adjust route if needed
    console.log('Amazon API response:', res.body);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data.payload.inventorySummaries)).toBe(true);
  });
}); 
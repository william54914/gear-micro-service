const request = require('supertest');
const app = require('../../../src/app'); // Adjust path if needed

describe('Real Connectivity: OneDrive', () => {
  it('should list root folders from OneDrive', async () => {
    const res = await request(app)
      .get('/api/onedrive/folders'); // Adjust route if needed
    console.log('OneDrive API response:', res.body);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty('name');
    expect(res.body.data[0]).toHaveProperty('type');
    expect(res.body.data[0]).toHaveProperty('id');
  });
}); 
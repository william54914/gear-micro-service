const request = require('supertest');
const app = require('../../../src/app');

describe('Real Connectivity: FTP LS2', () => {
  it('should list LS2 FTP files', async () => {
    const res = await request(app)
      .get('/api/ftp/ls2/files'); // Adjust route if needed
    console.log('LS2 FTP API response:', JSON.stringify(res.body, null, 2));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
}); 
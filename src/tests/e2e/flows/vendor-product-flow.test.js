const request = require('supertest');
const app = require('../../../app');
const { createTestUser, generateTestToken } = require('../../setup');

describe('Vendor Product Management Flow', () => {
  let adminToken;
  let vendor;
  let brand;

  beforeAll(async () => {
    const adminUser = await createTestUser('admin');
    adminToken = generateTestToken(adminUser);
  });

  describe('Complete Product Management Flow', () => {
    it('should complete the entire vendor-product flow', async () => {
      // Create vendor
      const vendorRes = await request(app)
        .post('/api/vendors')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          vendorName: 'Test Vendor',
          vendorCode: 'TV001',
          website: 'https://example.com',
          contactEmail: 'contact@example.com'
        });

      expect(vendorRes.status).toBe(200);
      expect(vendorRes.body.success).toBe(true);
      vendor = vendorRes.body.data;

      // Create brand
      const brandRes = await request(app)
        .post('/api/vendors/brands')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          vendorId: vendor.vendorId,
          brandName: 'Test Brand',
          brandCode: 'TB001',
          website: 'https://brand.example.com'
        });

      expect(brandRes.status).toBe(200);
      expect(brandRes.body.success).toBe(true);
      brand = brandRes.body.data;

      // Create product
      const productRes = await request(app)
        .post('/api/vendors/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          vendorId: vendor.vendorId,
          brandId: brand.brandId,
          vendorSku: 'SKU001',
          vendorProductName: 'Test Product',
          vendorProductDescription: 'Test Description',
          vendorProductCategory: 'Test Category',
          vendorProductSubcategory: 'Test Subcategory',
          vendorProductType: 'Test Type',
          vendorProductStatus: 'active',
          vendorProductUrl: 'https://example.com/product',
          vendorProductImageUrl: 'https://example.com/image.jpg',
          vendorProductPrice: 99.99,
          vendorProductCost: 49.99,
          vendorProductQuantity: 100,
          vendorProductMinQuantity: 10,
          vendorProductMaxQuantity: 1000,
          vendorProductWeight: 1.5,
          vendorProductLength: 10,
          vendorProductWidth: 5,
          vendorProductHeight: 2,
          vendorProductUpc: '123456789012',
          vendorProductMpn: 'MPN001',
          vendorProductGtin: 'GTIN001',
          vendorProductIsbn: 'ISBN001',
          vendorProductAsin: 'ASIN001',
          vendorProductBrand: 'Test Brand',
          vendorProductManufacturer: 'Test Manufacturer',
          vendorProductCondition: 'new',
          vendorProductWarranty: '1 year',
          vendorProductNotes: 'Test Notes'
        });

      expect(productRes.status).toBe(200);
      expect(productRes.body.success).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle duplicate SKU', async () => {
      const createProduct = {
        vendorId: vendor.vendorId,
        brandId: brand.brandId,
        vendorSku: 'SKU001',
        vendorProductName: 'Test Product',
        vendorProductDescription: 'Test Description'
      };

      const res = await request(app)
        .post('/api/vendors/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createProduct);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('SKU already exists');
    });

    it('should handle invalid brand-vendor relationship', async () => {
      // Create another vendor
      const otherVendorRes = await request(app)
        .post('/api/vendors')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          vendorName: 'Other Vendor',
          vendorCode: 'TV002',
          website: 'https://other.example.com',
          contactEmail: 'contact@other.example.com'
        });

      expect(otherVendorRes.status).toBe(200);

      // Try to create product with brand from first vendor
      const res = await request(app)
        .post('/api/vendors/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          vendorId: otherVendorRes.body.data.vendorId,
          brandId: brand.brandId,
          vendorSku: 'SKU002',
          vendorProductName: 'Test Product',
          vendorProductDescription: 'Test Description'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Brand does not belong to vendor');
    });
  });
}); 
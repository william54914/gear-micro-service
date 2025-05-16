const request = require('supertest');
const app = require('../../../app');
const { User, Vendor, VendorBrand, VendorProduct } = require('../../../models');
const { createTestUser, generateTestToken } = require('../../helpers');

describe('Vendor Product Management Flow', () => {
  let adminToken;
  let vendor;
  let brand;

  beforeAll(async () => {
    // Clean database
    await User.destroy({ where: {}, force: true });
    await Vendor.destroy({ where: {}, force: true });
    await VendorBrand.destroy({ where: {}, force: true });
    await VendorProduct.destroy({ where: {}, force: true });

    // Create admin user
    const admin = await createTestUser('admin');
    adminToken = generateTestToken(admin);
  });

  describe('Complete Product Management Flow', () => {
    it('should complete the entire vendor-product flow', async () => {
      // 1. Create Vendor
      const vendorRes = await request(app)
        .post('/api/vendors')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          vendorName: 'Test Vendor',
          vendorCode: 'TV001',
          website: 'https://testvendor.com',
          contactEmail: 'contact@testvendor.com'
        });

      expect(vendorRes.status).toBe(201);
      expect(vendorRes.body.success).toBe(true);
      vendor = vendorRes.body.data;

      // 2. Create Brand
      const brandRes = await request(app)
        .post('/api/vendors/brands')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          vendorId: vendor.vendorId,
          brandName: 'Test Brand',
          brandCode: 'TB001',
          website: 'https://testbrand.com'
        });

      expect(brandRes.status).toBe(201);
      expect(brandRes.body.success).toBe(true);
      brand = brandRes.body.data;

      // 3. Create Product
      const productRes = await request(app)
        .post('/api/vendors/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          vendorId: vendor.vendorId,
          brandId: brand.brandId,
          vendorSku: 'SKU001',
          vendorProductName: 'Test Product',
          description: 'Test product description',
          msrp: 99.99,
          mapPrice: 89.99,
          cost: 50.00
        });

      expect(productRes.status).toBe(201);
      expect(productRes.body.success).toBe(true);
      const product = productRes.body.data;

      // 4. Add Product Attributes
      const attributesRes = await request(app)
        .post(`/api/vendors/products/${product.vendorProductId}/attributes`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          attributes: [
            { name: 'Color', value: 'Black' },
            { name: 'Size', value: 'Large' }
          ]
        });

      expect(attributesRes.status).toBe(200);
      expect(attributesRes.body.success).toBe(true);

      // 5. Add Product Images
      const imagesRes = await request(app)
        .post(`/api/vendors/products/${product.vendorProductId}/images`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          images: [
            {
              url: 'https://example.com/image1.jpg',
              isPrimary: true
            },
            {
              url: 'https://example.com/image2.jpg',
              isPrimary: false
            }
          ]
        });

      expect(imagesRes.status).toBe(200);
      expect(imagesRes.body.success).toBe(true);

      // 6. Get Complete Product Details
      const getProductRes = await request(app)
        .get(`/api/vendors/products/${product.vendorProductId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(getProductRes.status).toBe(200);
      expect(getProductRes.body.success).toBe(true);
      expect(getProductRes.body.data.attributes).toHaveLength(2);
      expect(getProductRes.body.data.images).toHaveLength(2);

      // 7. Update Product
      const updateRes = await request(app)
        .put(`/api/vendors/products/${product.vendorProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          msrp: 109.99,
          description: 'Updated description'
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.success).toBe(true);
      expect(updateRes.body.data.msrp).toBe(109.99);

      // 8. List All Products
      const listRes = await request(app)
        .get('/api/vendors/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          vendorId: vendor.vendorId,
          page: 1,
          limit: 10
        });

      expect(listRes.status).toBe(200);
      expect(listRes.body.success).toBe(true);
      expect(listRes.body.data.items).toHaveLength(1);
      expect(listRes.body.data.pagination.total).toBe(1);

      // 9. Search Products
      const searchRes = await request(app)
        .get('/api/vendors/products/search')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          query: 'Test Product',
          vendorId: vendor.vendorId
        });

      expect(searchRes.status).toBe(200);
      expect(searchRes.body.success).toBe(true);
      expect(searchRes.body.data.items).toHaveLength(1);

      // 10. Delete Product
      const deleteRes = await request(app)
        .delete(`/api/vendors/products/${product.vendorProductId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.success).toBe(true);

      // 11. Verify Deletion
      const verifyRes = await request(app)
        .get(`/api/vendors/products/${product.vendorProductId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(verifyRes.status).toBe(404);
      expect(verifyRes.body.success).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle duplicate SKU', async () => {
      const createProduct = {
        vendorId: vendor.vendorId,
        brandId: brand.brandId,
        vendorSku: 'DUPLICATE_SKU',
        vendorProductName: 'Test Product',
        description: 'Test product description'
      };

      // Create first product
      await request(app)
        .post('/api/vendors/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createProduct);

      // Try to create product with same SKU
      const duplicateRes = await request(app)
        .post('/api/vendors/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createProduct);

      expect(duplicateRes.status).toBe(400);
      expect(duplicateRes.body.success).toBe(false);
      expect(duplicateRes.body.error.message).toContain('SKU already exists');
    });

    it('should handle invalid brand-vendor relationship', async () => {
      // Create another vendor
      const otherVendorRes = await request(app)
        .post('/api/vendors')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          vendorName: 'Other Vendor',
          vendorCode: 'OV001'
        });

      // Try to create product with brand from different vendor
      const invalidRes = await request(app)
        .post('/api/vendors/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          vendorId: otherVendorRes.body.data.vendorId,
          brandId: brand.brandId,
          vendorSku: 'SKU002',
          vendorProductName: 'Test Product'
        });

      expect(invalidRes.status).toBe(400);
      expect(invalidRes.body.success).toBe(false);
      expect(invalidRes.body.error.message).toContain('Brand does not belong to vendor');
    });
  });
}); 
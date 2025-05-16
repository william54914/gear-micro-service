const BaseController = require('./base.controller');
const schemas = require('../schemas/vendor.schema');
const { Vendor, VendorProduct, VendorBrand, VendorDistributorInfo } = require('../models');
const Joi = require('joi');

class VendorController extends BaseController {
  /**
   * Get all vendors with pagination and filtering
   */
  getVendors = [
    this.validate(schemas.query, 'query'),
    this.asyncHandler(async (req, res) => {
      const vendors = await Vendor.paginate({
        ...req.query,
        include: [
          {
            model: VendorBrand,
            as: 'brands',
            where: req.query.brandId ? { brandId: req.query.brandId } : undefined
          }
        ]
      });

      this.sendSuccess(res, vendors);
    })
  ];

  /**
   * Get a single vendor by ID
   */
  getVendor = [
    this.validate(Joi.object({ vendorId: Joi.number().required() }), 'params'),
    this.asyncHandler(async (req, res) => {
      const vendor = await Vendor.findByPk(req.params.vendorId, {
        include: ['brands', 'distributorInfo']
      });

      if (!vendor) {
        return this.sendError(res, 'Vendor not found', 404);
      }

      this.sendSuccess(res, vendor);
    })
  ];

  /**
   * Create a new vendor
   */
  createVendor = [
    this.validate(schemas.vendor, 'body'),
    this.asyncHandler(async (req, res) => {
      const vendor = await Vendor.create(req.body);
      this.sendSuccess(res, vendor, 'Vendor created successfully');
    })
  ];

  /**
   * Update a vendor
   */
  updateVendor = [
    this.validate(Joi.object({ vendorId: Joi.number().required() }), 'params'),
    this.validate(schemas.vendor, 'body'),
    this.asyncHandler(async (req, res) => {
      const vendor = await Vendor.findByPk(req.params.vendorId);
      if (!vendor) {
        return this.sendError(res, 'Vendor not found', 404);
      }
      await vendor.update(req.body);
      this.sendSuccess(res, vendor, 'Vendor updated successfully');
    })
  ];

  /**
   * Delete a vendor
   */
  deleteVendor = [
    this.validate(Joi.object({ vendorId: Joi.number().required() }), 'params'),
    this.asyncHandler(async (req, res) => {
      const vendor = await Vendor.findByPk(req.params.vendorId);
      if (!vendor) {
        return this.sendError(res, 'Vendor not found', 404);
      }
      await vendor.destroy();
      this.sendSuccess(res, null, 'Vendor deleted successfully');
    })
  ];

  /**
   * Get vendor brands
   */
  getVendorBrands = [
    this.validate(Joi.object({ vendorId: Joi.number().required() }), 'params'),
    this.validate(schemas.query, 'query'),
    this.asyncHandler(async (req, res) => {
      const brands = await VendorBrand.paginate({
        ...req.query,
        where: { vendorId: req.params.vendorId }
      });

      this.sendSuccess(res, brands);
    })
  ];

  /**
   * Create vendor brand
   */
  createVendorBrand = [
    this.validate(schemas.vendorBrand, 'body'),
    this.asyncHandler(async (req, res) => {
      const brand = await VendorBrand.create(req.body);
      this.sendSuccess(res, brand, 'Brand created successfully');
    })
  ];

  /**
   * Update vendor brand
   */
  updateVendorBrand = [
    this.validate(Joi.object({ id: Joi.number().required() }), 'params'),
    this.validate(schemas.vendorBrand, 'body'),
    this.asyncHandler(async (req, res) => {
      const brand = await VendorBrand.findByPk(req.params.id);
      if (!brand) {
        return this.sendError(res, 'Brand not found', 404);
      }
      await brand.update(req.body);
      this.sendSuccess(res, brand, 'Brand updated successfully');
    })
  ];

  /**
   * Delete vendor brand
   */
  deleteVendorBrand = [
    this.validate(Joi.object({ id: Joi.number().required() }), 'params'),
    this.asyncHandler(async (req, res) => {
      const brand = await VendorBrand.findByPk(req.params.id);
      if (!brand) {
        return this.sendError(res, 'Brand not found', 404);
      }
      await brand.destroy();
      this.sendSuccess(res, null, 'Brand deleted successfully');
    })
  ];

  /**
   * Get vendor products
   */
  getVendorProducts = [
    this.validate(Joi.object({ vendorId: Joi.number().required() }), 'params'),
    this.validate(schemas.query, 'query'),
    this.asyncHandler(async (req, res) => {
      const products = await VendorProduct.paginate({
        ...req.query,
        where: { vendorId: req.params.vendorId },
        include: ['brand', 'attributes', 'dimensions', 'images']
      });

      this.sendSuccess(res, products);
    })
  ];

  /**
   * Create vendor product
   */
  createVendorProduct = [
    this.validate(schemas.vendorProduct, 'body'),
    this.asyncHandler(async (req, res) => {
      const product = await VendorProduct.create(req.body);
      
      // Load associations
      await product.reload({
        include: ['brand', 'attributes', 'dimensions', 'images']
      });

      this.sendSuccess(res, product, 'Product created successfully');
    })
  ];

  /**
   * Update vendor product
   */
  updateVendorProduct = [
    this.validate(Joi.object({ productId: Joi.number().required() }), 'params'),
    this.validate(schemas.vendorProduct, 'body'),
    this.asyncHandler(async (req, res) => {
      const product = await VendorProduct.findByPk(req.params.productId);
      if (!product) {
        return this.sendError(res, 'Product not found', 404);
      }
      await product.update(req.body);
      
      // Reload with associations
      await product.reload({
        include: ['brand', 'attributes', 'dimensions', 'images']
      });

      this.sendSuccess(res, product, 'Product updated successfully');
    })
  ];

  /**
   * Delete vendor product
   */
  deleteVendorProduct = [
    this.validate(Joi.object({ productId: Joi.number().required() }), 'params'),
    this.asyncHandler(async (req, res) => {
      const product = await VendorProduct.findByPk(req.params.productId);
      if (!product) {
        return this.sendError(res, 'Product not found', 404);
      }
      await product.destroy();
      this.sendSuccess(res, null, 'Product deleted successfully');
    })
  ];
}

module.exports = new VendorController(); 
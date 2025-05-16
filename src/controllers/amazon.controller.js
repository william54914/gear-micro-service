const BaseController = require('./base.controller');
const amazonService = require('../services/amazon.service');
const amazonDbService = require('../services/amazonDb.service');
const schemas = require('../schemas/amazon.schema');

class AmazonController extends BaseController {
  constructor() {
    super();
    this.service = amazonService;
    this.dbService = amazonDbService;
  }

  /**
   * Get Amazon inventory
   */
  getInventory = this.asyncHandler(async (req, res) => {
    const inventory = await this.service.getInventory();
    this.sendSuccess(res, inventory);
  });

  /**
   * Get all Amazon listings with pagination and filtering
   */
  getListings = [
    this.validate(schemas.listingQuery, 'query'),
    this.asyncHandler(async (req, res) => {
      const listings = await this.dbService.getListings(req.query);
      this.sendSuccess(res, listings);
    })
  ];

  /**
   * Import Amazon listings
   */
  importListings = [
    this.validate(schemas.importOptions, 'body'),
    this.asyncHandler(async (req, res) => {
      const listings = await this.service.getAllListings(req.body);
      
      if (!listings.success) {
        return this.sendError(res, 'Failed to fetch Amazon listings', 500, listings);
      }

      const result = await this.dbService.saveListings(listings.data);
      this.sendSuccess(res, result);
    })
  ];

  /**
   * Get listing by SKU
   */
  getListingBySku = [
    this.validate(schemas.sku, 'params'),
    this.asyncHandler(async (req, res) => {
      const { sku } = req.params;
      
      const listing = await this.dbService.getListings({ sku });
      
      if (!listing.data || listing.data.length === 0) {
        return this.sendError(res, 'Listing not found', 404);
      }
      
      this.sendSuccess(res, listing.data[0]);
    })
  ];

  /**
   * Update listing price
   */
  updatePrice = [
    this.validate(schemas.priceUpdate, 'body'),
    this.asyncHandler(async (req, res) => {
      const result = await this.dbService.updatePrice(req.body);
      this.sendSuccess(res, result);
    })
  ];

  /**
   * Update listing quantity
   */
  updateQuantity = [
    this.validate(schemas.quantityUpdate, 'body'),
    this.asyncHandler(async (req, res) => {
      const result = await this.dbService.updateQuantity(req.body);
      this.sendSuccess(res, result);
    })
  ];
}

module.exports = new AmazonController(); 
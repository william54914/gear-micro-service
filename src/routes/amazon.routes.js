const express = require('express');
const router = express.Router();
const amazonService = require('../services/amazon.service.js');
const amazonDbService = require('../services/amazonDb.service.js');

/**
 * @route GET /api/amazon/inventory/:marketplaceId
 * @desc Get inventory from Amazon for a specific marketplace
 * @access Private
 */
router.get('/inventory/:marketplaceId', async (req, res) => {
  try {
    const { marketplaceId } = req.params;
    const inventory = await amazonService.getInventory(marketplaceId);

    res.json({
      success: true,
      message: 'Inventory retrieved successfully',
      marketplaceId,
      data: inventory
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory',
      error: error.message
    });
  }
});

/**
 * @route GET /api/amazon/listings
 * @desc Get all merchant listings from Amazon
 * @access Private
 */
router.get('/listings', async (req, res) => {
  try {
    const listings = await amazonService.getAllListings();

    res.json(listings);
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch listings',
      error: error.message
    });
  }
});

/**
 * @route POST /api/amazon/listings/save
 * @desc Save Amazon listings to database
 * @access Private
 */
router.post('/listings/save', async (req, res) => {
  try {
    // Get listings from Amazon API
    const amazonResponse = await amazonService.getAllListings();
    
    if (!amazonResponse.success || !amazonResponse.data) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch listings from Amazon API',
        error: 'No data returned from Amazon API'
      });
    }
    
    // Save listings to database
    const result = await amazonDbService.saveListings(amazonResponse.data);
    
    res.json({
      success: true,
      message: 'Amazon listings saved to database',
      amazonCount: amazonResponse.count,
      savedCount: result.savedCount
    });
  } catch (error) {
    console.error('Error saving listings to database:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save listings to database',
      error: error.message
    });
  }
});

/**
 * @route GET /api/amazon/db/listings
 * @desc Get Amazon listings from database
 * @access Private
 */
router.get('/db/listings', async (req, res) => {
  try {
    const { limit, offset, sku } = req.query;
    
    const options = {
      limit: limit ? parseInt(limit, 10) : 100,
      offset: offset ? parseInt(offset, 10) : 0
    };
    
    if (sku) {
      options.sku = sku;
    }
    
    const listings = await amazonDbService.getListings(options);
    
    res.json(listings);
  } catch (error) {
    console.error('Error fetching listings from database:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch listings from database',
      error: error.message
    });
  }
});

/**
 * @route GET /api/amazon/db/listings/:sku
 * @desc Get a specific Amazon listing by SKU
 * @access Private
 */
router.get('/db/listings/:sku', async (req, res) => {
  try {
    const { sku } = req.params;
    
    const listings = await amazonDbService.getListings({ sku });
    
    if (listings.count === 0) {
      return res.status(404).json({
        success: false,
        message: `No listing found with SKU: ${sku}`
      });
    }
    
    res.json({
      success: true,
      data: listings.data[0]
    });
  } catch (error) {
    console.error('Error fetching listing from database:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch listing from database',
      error: error.message
    });
  }
});

module.exports = router; 
const express = require('express');
const router = express.Router();
const amazonController = require('../controllers/amazon.controller');

/**
 * @route GET /api/amazon/inventory
 * @desc Get inventory from Amazon for a specific marketplace
 * @access Private
 */
router.get('/inventory', amazonController.getInventory);

/**
 * @route GET /api/amazon/listings
 * @desc Get all merchant listings from Amazon
 * @access Private
 */
router.get('/listings', amazonController.getListings);

/**
 * @route POST /api/amazon/import
 * @desc Import Amazon listings to database
 * @access Private
 */
router.post('/import', amazonController.importListings);

/**
 * @route GET /api/amazon/listings/:sku
 * @desc Get a specific Amazon listing by SKU
 * @access Private
 */
router.get('/listings/:sku', amazonController.getListingBySku);

module.exports = router; 
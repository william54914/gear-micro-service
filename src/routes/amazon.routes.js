const express = require('express');
const router = express.Router();
const amazonService = require('../services/amazon.service.js');

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

module.exports = router; 
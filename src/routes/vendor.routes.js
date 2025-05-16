const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendor.controller');

// Vendor routes
router.get('/', vendorController.getVendors);
router.get('/:id', vendorController.getVendor);
router.post('/', vendorController.createVendor);
router.put('/:id', vendorController.updateVendor);
router.delete('/:id', vendorController.deleteVendor);

// Vendor brand routes
router.get('/:vendorId/brands', vendorController.getVendorBrands);
router.post('/brands', vendorController.createVendorBrand);
router.put('/brands/:id', vendorController.updateVendorBrand);
router.delete('/brands/:id', vendorController.deleteVendorBrand);

// Vendor product routes
router.get('/:vendorId/products', vendorController.getVendorProducts);
router.post('/products', vendorController.createVendorProduct);
router.put('/products/:id', vendorController.updateVendorProduct);
router.delete('/products/:id', vendorController.deleteVendorProduct);

module.exports = router; 
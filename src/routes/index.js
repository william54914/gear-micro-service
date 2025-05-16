const express = require('express');
const router = express.Router();
const userRoutes = require('./user.routes');
const amazonRoutes = require('./amazon.routes');
const onedriveRoutes = require('./onedrive.routes');
const ftpRoutes = require('./ftp.routes');
const vendorRoutes = require('./vendor.routes');

// Health check route
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount routes
router.use('/users', userRoutes);
router.use('/amazon', amazonRoutes);
router.use('/onedrive', onedriveRoutes);
router.use('/ftp', ftpRoutes);
router.use('/vendors', vendorRoutes);

module.exports = router; 
const express = require('express');
const router = express.Router();
const userRoutes = require('./user.routes.js');
const amazonRoutes = require('./amazon.routes.js');

// Health check route
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount routes
router.use('/users', userRoutes);
router.use('/amazon', amazonRoutes);

module.exports = router; 
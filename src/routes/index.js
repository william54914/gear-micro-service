const express = require('express');
const router = express.Router();

// Import route modules
const userRoutes = require('./user.routes');

// Health check route
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount routes
router.use('/users', userRoutes);

module.exports = router; 
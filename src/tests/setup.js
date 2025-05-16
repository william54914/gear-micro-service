// Use separate test database connection
const { Sequelize } = require('sequelize');
const config = require('../config/env');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Create models
const models = require('../models');

// Set test environment
process.env.NODE_ENV = 'test';

// Create test database connection using SQLite in-memory for tests
const testSequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:', // In-memory SQLite database
  logging: false
});

// Initialize all models with test connection
Object.values(models).forEach(model => {
  if (typeof model.init === 'function' && model.attributes) {
    model.init(model.attributes, {
      sequelize: testSequelize,
      modelName: model.name,
      tableName: model.tableName || model.name.toLowerCase() + 's',
      hooks: model.hooks // Register hooks for test DB
    });
  }
});

// Set up associations
Object.values(models).forEach(model => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});

// Global test setup
beforeAll(async () => {
  try {
    // Sync database with force to ensure clean state
    if (testSequelize.sync) {
      await testSequelize.sync({ force: true });
      console.log('Test database synced successfully');
    }
  } catch (error) {
    console.error('Failed to sync test database:', error);
    throw error;
  }
});

// Global test teardown
afterAll(async () => {
  try {
    // Close Express server if it exists first
    try {
      const app = require('./app');
      if (app && typeof app.closeServer === 'function') {
        await app.closeServer();
        console.log('Test server closed');
      }
    } catch (serverError) {
      console.warn('Could not close server:', serverError.message);
    }

    // Close database connection - only if it's open
    if (testSequelize && !testSequelize.closed) {
      try {
        if (testSequelize.connectionManager) {
          await testSequelize.connectionManager.close();
        }
        await testSequelize.close();
        testSequelize.closed = true;
        console.log('Test database connection closed');
      } catch (dbError) {
        if (dbError.code !== 'SQLITE_MISUSE') {
          console.error('Error closing database:', dbError);
        }
      }
    }

    // Debug open handles that might prevent Jest from exiting
    const handles = process._getActiveHandles();
    const requests = process._getActiveRequests();
    
    if (handles.length > 0 || requests.length > 0) {
      console.log('\nWarning: Found open handles/requests after cleanup:');
      console.log('Active handles:', handles.length);
      handles.forEach((h, i) => {
        if (h && h.constructor) {
          console.log(`[Handle ${i}]:`, h.constructor.name);
          // Extra logging for known handle types
          if (h.constructor.name === 'Socket') {
            if (h.remoteAddress || h.localAddress) {
              console.log(`[Handle ${i}] Socket details:`, {
                localAddress: h.localAddress,
                localPort: h.localPort,
                remoteAddress: h.remoteAddress,
                remotePort: h.remotePort,
                destroyed: h.destroyed,
                writable: h.writable,
                readable: h.readable
              });
            }
            if (h._handle && h._handle.getAsyncId) {
              console.log(`[Handle ${i}] Socket asyncId:`, h._handle.getAsyncId());
            }
            if (typeof h.destroy === 'function') {
              h.destroy();
            }
          }
          if (h.constructor.name === 'Server') {
            if (h.address) {
              console.log(`[Handle ${i}] Server address:`, h.address());
            }
            if (typeof h.close === 'function') {
              h.close();
            }
          }
          if (h.constructor.name === 'WriteStream') {
            console.log(`[Handle ${i}] WriteStream path:`, h.path);
          }
          if (h.constructor.name === 'ChildProcess') {
            console.log(`[Handle ${i}] ChildProcess pid:`, h.pid);
            if (typeof h.kill === 'function') {
              h.kill();
            }
          }
        }
        // Print stack trace if available
        if (h && h.stack) {
          console.log(`[Handle ${i}] Stack:`, h.stack);
        }
      });
      
      console.log('Active requests:', requests.length);
      requests.forEach((r, i) => {
        if (r && r.constructor) {
          console.log(`[Request ${i}]:`, r.constructor.name);
        }
      });
    }
  } catch (error) {
    console.error('Error during test teardown:', error);
  }
}, 10000); // Add 10 second timeout for cleanup

// Helper to create test user
async function createTestUser(role = 'user') {
  const { User } = models;
  return User.create({
    email: `test-${Date.now()}@example.com`,
    password: 'password123',
    firstName: 'Test',
    lastName: 'User',
    role
  });
}

// Helper to create test token
function generateTestToken(user) {
  return jwt.sign(
    { userId: user.userId, role: user.role },
    config.jwt.secret || 'test-secret',
    { expiresIn: '1h' }
  );
}

// Helper to create test vendor
async function createTestVendor() {
  const { Vendor } = models;
  return Vendor.create({
    vendorName: `Test Vendor ${Date.now()}`,
    vendorCode: `TV${Date.now()}`,
    website: 'https://example.com',
    contactEmail: 'contact@example.com'
  });
}

// Helper to create test brand
async function createTestBrand(vendorId) {
  const { VendorBrand } = models;
  return VendorBrand.create({
    vendorId,
    brandName: `Test Brand ${Date.now()}`,
    brandCode: `TB${Date.now()}`,
    website: 'https://brand.example.com'
  });
}

// Export test helpers and sequelize instance for tests
module.exports = {
  sequelize: testSequelize,
  createTestUser,
  generateTestToken,
  createTestVendor,
  createTestBrand
};
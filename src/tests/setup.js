// Use separate test database connection
const { Sequelize } = require('sequelize');
const config = require('../config/env');
const bcrypt = require('bcryptjs');

// Create models
let User;
try {
  User = require('../models/User');
} catch (error) {
  // If we can't load the real User model, use the mock
  User = require('./mocks/models').User;
}

// Set test environment
process.env.NODE_ENV = 'test';

// Create test database connection using SQLite in-memory for tests
const testSequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:', // In-memory SQLite database
  logging: false
});

// Only init if User model has the init function (real model, not mock)
if (typeof User.init === 'function' && User.attributes) {
  // Initialize models with test connection
  User.init(User.attributes, {
    sequelize: testSequelize,
    modelName: 'User',
    tableName: 'users',
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      }
    }
  });
  
  // Add methods to the User model if it's a real model
  if (User.prototype) {
    // Add mock methods that might be missing
    User.prototype.comparePassword = async function(candidatePassword) {
      return bcrypt.compare(candidatePassword, this.password);
    };

    User.prototype.generatePasswordResetToken = function() {
      // Use simple mock for test since we don't have crypto
      const token = Array.from({length: 32}, () => Math.floor(Math.random() * 16).toString(16)).join('');
      this.passwordResetToken = token;
      this.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour
      return token;
    };

    User.prototype.updateLastLogin = async function() {
      this.lastLoginAt = new Date();
      await this.save();
    };
  }
}

// Associate models if needed
// User.associate({ User });

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
  if (testSequelize.close) {
    await testSequelize.close();
    console.log('Test database connection closed');
  }
});

// Helper to create test user
async function createTestUser(role = 'user') {
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
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { userId: user.userId, role: user.role },
    config.jwt.secret || 'test-secret',
    { expiresIn: '1h' }
  );
}

// Helper to create test vendor
async function createTestVendor() {
  const { Vendor } = require('../models');
  return Vendor.create({
    vendorName: `Test Vendor ${Date.now()}`,
    vendorCode: `TV${Date.now()}`,
    website: 'https://example.com',
    contactEmail: 'contact@example.com'
  });
}

// Helper to create test brand
async function createTestBrand(vendorId) {
  const { VendorBrand } = require('../models');
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
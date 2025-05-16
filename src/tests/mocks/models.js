/**
 * Mock for models used in tests
 */

const { Model } = require('sequelize');

// Mock User model with Model inheritance
class UserModel extends Model {
  static init(attributes, options) {
    super.init(attributes, options);
    return this;
  }
  
  static findOne() {
    const mockUser = {
      userId: 1,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'user',
      password: '$2a$10$XXXXXXXXXXXXXXXXXXXXXXXX',
      passwordResetToken: 'reset-token',
      passwordResetExpires: new Date(Date.now() + 3600000),
      lastLoginAt: new Date(),
      comparePassword: () => Promise.resolve(true),
      generatePasswordResetToken: () => {
        mockUser.passwordResetToken = 'reset-token';
        mockUser.passwordResetExpires = new Date(Date.now() + 3600000);
        return 'reset-token';
      },
      updateLastLogin: () => {
        mockUser.lastLoginAt = new Date();
        return Promise.resolve(mockUser);
      },
      update: () => Promise.resolve(mockUser),
      save: () => Promise.resolve(mockUser),
      getFullName: () => 'Test User',
      hasRole: () => true,
      toJSON: () => ({
        userId: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
        lastLoginAt: new Date()
      })
    };
    return Promise.resolve(mockUser);
  }
  
  static findByPk() {
    return this.findOne();
  }
  
  static findByIdOrFail() {
    return this.findOne();
  }
  
  static create() {
    return this.findOne();
  }
  
  static destroy() {
    return Promise.resolve(1);
  }
  
  static paginate() {
    return Promise.resolve({
      rows: [this.findOne()],
      count: 1
    });
  }
}

// Add attributes
UserModel.attributes = {
  userId: { type: 'INTEGER', primaryKey: true, autoIncrement: true },
  email: { type: 'STRING', allowNull: false, unique: true },
  password: { type: 'STRING', allowNull: false },
  firstName: { type: 'STRING', allowNull: false },
  lastName: { type: 'STRING', allowNull: false },
  role: { type: 'STRING', defaultValue: 'user' }
};

// Mock Vendor models
const Vendor = {
  findOne: jest.fn(),
  findByPk: jest.fn(),
  findByIdOrFail: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  paginate: jest.fn()
};

const VendorBrand = {
  findOne: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn()
};

const VendorProduct = {
  findOne: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn()
};

const VendorDistributorInfo = {
  findOne: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn()
};

// Mock Restock models
const RestockVitals = {
  findOne: jest.fn(),
  findAll: jest.fn(),
  findOrCreate: jest.fn(),
  bulkCreate: jest.fn()
};

const RestockInfo = {
  findOne: jest.fn(),
  findAll: jest.fn(),
  findOrCreate: jest.fn(),
  bulkCreate: jest.fn()
};

const RestockCost = {
  findOne: jest.fn(),
  findAll: jest.fn(),
  findOrCreate: jest.fn(),
  bulkCreate: jest.fn()
};

module.exports = {
  User: UserModel,
  Vendor,
  VendorBrand,
  VendorProduct,
  VendorDistributorInfo,
  RestockVitals,
  RestockInfo,
  RestockCost
}; 
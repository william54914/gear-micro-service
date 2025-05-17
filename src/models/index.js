const sequelize = require('../config/database');

// Import directly initialized models (these are already initialized with sequelize)
const User = require('./User');
const UserRole = require('./UserRole');
const UserPermission = require('./UserPermission');
const AmazonVitals = require('./AmazonVitals');
const AmazonInfo = require('./AmazonInfo');
const AmazonPrice = require('./AmazonPrice');
const AmazonQuantity = require('./AmazonQuantity');
const AmazonZShop = require('./AmazonZShop');
const RestockVitals = require('./RestockVitals');
const RestockInfo = require('./RestockInfo');
const RestockCost = require('./RestockCost');
const Vendor = require('./Vendor');
const VendorBrand = require('./VendorBrand');
const VendorProduct = require('./VendorProduct');
const VendorProductAttributes = require('./VendorProductAttributes');
const VendorProductDimensions = require('./VendorProductDimensions');
const VendorProductImages = require('./VendorProductImages');
const VendorProductInventory = require('./VendorProductInventory');
const VendorProductPricing = require('./VendorProductPricing');
const VendorVehicleCompatibility = require('./VendorVehicleCompatibility');
const VendorDistributorInfo = require('./VendorDistributorInfo');

// Put all models in an object
const models = {
  User,
  UserRole,
  UserPermission,
  AmazonVitals,
  AmazonInfo,
  AmazonPrice,
  AmazonQuantity,
  AmazonZShop,
  RestockVitals,
  RestockInfo,
  RestockCost,
  Vendor,
  VendorBrand,
  VendorProduct,
  VendorProductAttributes,
  VendorProductDimensions,
  VendorProductImages,
  VendorProductInventory,
  VendorProductPricing,
  VendorVehicleCompatibility,
  VendorDistributorInfo,
  sequelize
};

// Run associate methods for all models that have them
Object.values(models).forEach(model => {
  if (model.associate) {
    model.associate(models);
  }
});

module.exports = models; 
const User = require('./User');
const AmazonVitals = require('./AmazonVitals');
const AmazonInfo = require('./AmazonInfo');
const AmazonPrice = require('./AmazonPrice');
const AmazonQuantity = require('./AmazonQuantity');
const AmazonZShop = require('./AmazonZShop');
const RestockVitals = require('./RestockVitals');
const RestockInfo = require('./RestockInfo');
const RestockCost = require('./RestockCost');

// Define relationships
// AmazonVitals is the central table that all other tables reference via SKU
AmazonVitals.hasOne(AmazonInfo, {
  foreignKey: 'sku',
  sourceKey: 'sku',
  as: 'info'
});
AmazonInfo.belongsTo(AmazonVitals, {
  foreignKey: 'sku',
  targetKey: 'sku'
});

AmazonVitals.hasOne(AmazonPrice, {
  foreignKey: 'sku',
  sourceKey: 'sku',
  as: 'price'
});
AmazonPrice.belongsTo(AmazonVitals, {
  foreignKey: 'sku',
  targetKey: 'sku'
});

AmazonVitals.hasOne(AmazonQuantity, {
  foreignKey: 'sku',
  sourceKey: 'sku',
  as: 'quantity'
});
AmazonQuantity.belongsTo(AmazonVitals, {
  foreignKey: 'sku',
  targetKey: 'sku'
});

AmazonVitals.hasOne(AmazonZShop, {
  foreignKey: 'sku',
  sourceKey: 'sku',
  as: 'zshop'
});
AmazonZShop.belongsTo(AmazonVitals, {
  foreignKey: 'sku',
  targetKey: 'sku'
});

// Define relationships for restock models
// RestockVitals is the central table for restock data
RestockVitals.hasOne(RestockInfo, {
  foreignKey: 'sku',
  sourceKey: 'sku',
  as: 'info'
});
RestockInfo.belongsTo(RestockVitals, {
  foreignKey: 'sku',
  targetKey: 'sku'
});

RestockVitals.hasOne(RestockCost, {
  foreignKey: 'sku',
  sourceKey: 'sku',
  as: 'cost'
});
RestockCost.belongsTo(RestockVitals, {
  foreignKey: 'sku',
  targetKey: 'sku'
});

module.exports = {
  User,
  AmazonVitals,
  AmazonInfo,
  AmazonPrice,
  AmazonQuantity,
  AmazonZShop,
  RestockVitals,
  RestockInfo,
  RestockCost
}; 
const User = require('./User');
const AmazonVitals = require('./AmazonVitals');
const AmazonInfo = require('./AmazonInfo');
const AmazonPrice = require('./AmazonPrice');
const AmazonQuantity = require('./AmazonQuantity');
const AmazonZShop = require('./AmazonZShop');

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

module.exports = {
  User,
  AmazonVitals,
  AmazonInfo,
  AmazonPrice,
  AmazonQuantity,
  AmazonZShop
}; 
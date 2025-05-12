const { 
  AmazonVitals, 
  AmazonInfo, 
  AmazonPrice, 
  AmazonQuantity, 
  AmazonZShop 
} = require('../models');
const sequelize = require('../config/database');

class AmazonDbService {
  /**
   * Save Amazon listings data to the database
   * @param {Array} listings - Array of Amazon listings
   * @returns {Object} - Result of the save operation
   */
  async saveListings(listings) {
    try {
      console.log(`Processing ${listings.length} Amazon listings...`);
      let savedCount = 0;
      
      // Start an unmanaged transaction
      const transaction = await sequelize.startUnmanagedTransaction();
      
      try {
        for (const listing of listings) {
          // Map listing data to our models
          const vitalsData = {
            sku: listing['seller-sku'],
            fnsku: listing['fulfillment-channel'] === 'AMAZON_NA' ? listing['seller-sku'] : null, // FNSKU is typically available for FBA items
            name: listing['item-name'],
            asin: listing['asin1'] || listing['product-id'],
            status: listing['status']
          };
          
          const infoData = {
            sku: listing['seller-sku'],
            listingId: listing['listing-id'],
            description: listing['item-description'],
            imageUrl: listing['image-url'],
            isMarketplace: listing['item-is-marketplace'] === 'y',
            productIdType: listing['product-id-type'],
            itemNote: listing['item-note'],
            itemCondition: listing['item-condition'],
            openDate: new Date(listing['open-date']),
            asin1: listing['asin1'],
            asin2: listing['asin2'],
            asin3: listing['asin3'],
            productId: listing['product-id'],
            fulfillmentChannel: listing['fulfillment-channel'],
            merchantShippingGroup: listing['merchant-shipping-group']
          };
          
          const priceData = {
            sku: listing['seller-sku'],
            price: parseFloat(listing['price'] || 0),
            bidForFeaturedPlacement: listing['bid-for-featured-placement']
          };
          
          const quantityData = {
            sku: listing['seller-sku'],
            quantity: parseInt(listing['quantity'] || 0, 10),
            pendingQuantity: parseInt(listing['pending-quantity'] || 0, 10),
            addDelete: listing['add-delete']
          };
          
          const zshopData = {
            sku: listing['seller-sku'],
            zshopShippingFee: listing['zshop-shipping-fee'],
            zshopCategory1: listing['zshop-category1'],
            zshopBrowsePath: listing['zshop-browse-path'],
            zshopStorefrontFeature: listing['zshop-storefront-feature'],
            zshopBoldface: listing['zshop-boldface'],
            willShipInternationally: listing['will-ship-internationally'],
            expeditedShipping: listing['expedited-shipping']
          };
          
          // Upsert data (create if not exists, update if exists)
          await AmazonVitals.upsert(vitalsData, { transaction });
          await AmazonInfo.upsert(infoData, { transaction });
          await AmazonPrice.upsert(priceData, { transaction });
          await AmazonQuantity.upsert(quantityData, { transaction });
          await AmazonZShop.upsert(zshopData, { transaction });
          
          savedCount++;
          
          // Log progress every 100 items
          if (savedCount % 100 === 0) {
            console.log(`Processed ${savedCount}/${listings.length} listings...`);
          }
        }
        
        // Commit the transaction
        await transaction.commit();
        
        return {
          success: true,
          message: `Successfully saved ${savedCount} Amazon listings to database`,
          savedCount
        };
      } catch (error) {
        // Rollback the transaction on error
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      console.error('Error saving Amazon listings to database:', error);
      throw error;
    }
  }
  
  /**
   * Get all Amazon listings with their related data
   * @param {Object} options - Query options
   * @returns {Array} - Array of Amazon listings
   */
  async getListings(options = {}) {
    try {
      const { limit = 100, offset = 0, sku = null } = options;
      
      const query = {
        include: [
          { model: AmazonInfo, as: 'info' },
          { model: AmazonPrice, as: 'price' },
          { model: AmazonQuantity, as: 'quantity' },
          { model: AmazonZShop, as: 'zshop' }
        ],
        limit,
        offset
      };
      
      // Filter by SKU if provided
      if (sku) {
        query.where = { sku };
      }
      
      const listings = await AmazonVitals.findAll(query);
      
      return {
        success: true,
        count: listings.length,
        data: listings
      };
    } catch (error) {
      console.error('Error fetching Amazon listings from database:', error);
      throw error;
    }
  }
}

module.exports = new AmazonDbService(); 
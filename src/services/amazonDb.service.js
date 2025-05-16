const { 
  AmazonVitals, 
  AmazonInfo, 
  AmazonPrice, 
  AmazonQuantity, 
  AmazonZShop 
} = require('../models');
const sequelize = require('../config/database');
const { QueryTypes } = require('sequelize');
const config = require('../config/env');

class AmazonDbService {
  constructor() {
    // Validate database config before using
    config.database.validate();
    
    this.batchSize = 1000; // Process records in batches of 1000 instead of 100
  }

  /**
   * Save Amazon listings data to the database with optimization
   * @param {Array} listings - Array of Amazon listings
   * @returns {Object} - Result of the save operation
   */
  async saveListings(listings) {
    try {
      console.log(`Processing ${listings.length} Amazon listings...`);
      let savedCount = 0;
      let errorCount = 0;
      
      // Extract all SKUs from the current import
      const importedSkus = new Set(listings.map(listing => listing['seller-sku']).filter(Boolean));
      console.log(`Found ${importedSkus.size} unique SKUs in the import`);
      
      // Group records by batches for better performance
      const batches = [];
      for (let i = 0; i < listings.length; i += this.batchSize) {
        batches.push(listings.slice(i, i + this.batchSize));
      }
      
      console.log(`Processing in ${batches.length} batches of ${this.batchSize} records (max per batch)`);
      console.time('Total import time');

      // Process each batch in a separate transaction
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        console.log(`Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} records)...`);
        
        // Start a transaction for this batch
        const transaction = await sequelize.startUnmanagedTransaction();
        
        try {
          // Collect SKUs in this batch for efficient querying
          const batchSkus = batch.map(listing => listing['seller-sku']).filter(Boolean);
          
          // Fetch existing records for this batch to minimize database calls
          const existingVitals = await AmazonVitals.findAll({
            where: { sku: batchSkus },
            transaction
          });
          
          // Create a map for quick lookup
          const vitalsMap = new Map();
          existingVitals.forEach(vital => {
            vitalsMap.set(vital.sku, vital);
          });

          // Prepare bulk operations
          const vitalsToCreate = [];
          const vitalsToUpdate = [];
          const infoToUpsert = [];
          const priceToUpsert = [];
          const quantityToUpsert = [];
          const zshopToUpsert = [];
          
          // Process each listing in the batch
          for (const listing of batch) {
            try {
              const sku = listing['seller-sku'];
              if (!sku) {
                console.warn('Skipping listing with no SKU');
                errorCount++;
                continue;
              }
              
              // Map listing data to our models
              const vitalsData = {
                // Use seller-sku field for sku
                sku: sku,
                // Only set fnsku to sku for FBA items
                fnsku: listing['fulfillment-channel'] === 'AMAZON_NA' ? sku : null,
                // Use item-name for name field
                name: listing['item-name'],
                // Important: Map just the ASIN to the asin field - not product-id
                asin: listing['asin1'],
                status: listing['status'] || 'Active'
              };
              
              // Check if this SKU exists
              if (vitalsMap.has(sku)) {
                // Update existing record
                const vital = vitalsMap.get(sku);
                
                // Only update fields if they've actually changed
                let changed = false;
                if (vital.fnsku !== vitalsData.fnsku) {
                  vital.fnsku = vitalsData.fnsku;
                  changed = true;
                }
                if (vital.name !== vitalsData.name) {
                  vital.name = vitalsData.name;
                  changed = true;
                }
                if (vital.asin !== vitalsData.asin) {
                  vital.asin = vitalsData.asin;
                  changed = true;
                }
                if (vital.status !== vitalsData.status) {
                  vital.status = vitalsData.status;
                  changed = true;
                }
                
                // Only update if something changed
                if (changed) {
                  vitalsToUpdate.push(vital);
                }
              } else {
                // Create new record
                vitalsToCreate.push(vitalsData);
              }
              
              // Prepare related data for upsert
              const infoData = {
                sku: sku,
                listingId: listing['listing-id'],
                description: listing['item-description'],
                imageUrl: listing['image-url'],
                isMarketplace: listing['item-is-marketplace'] === 'y',
                productIdType: listing['product-id-type'],
                itemNote: listing['item-note'],
                itemCondition: listing['item-condition'],
                openDate: listing['open-date'] ? new Date(listing['open-date']) : null,
                asin1: listing['asin1'],
                asin2: listing['asin2'],
                asin3: listing['asin3'],
                // Map product-id to productId correctly
                // This ensures the actual product ID is stored separately from the ASIN
                productId: listing['product-id'],
                fulfillmentChannel: listing['fulfillment-channel'],
                merchantShippingGroup: listing['merchant-shipping-group']
              };
              
              const priceData = {
                sku: sku,
                price: parseFloat(listing['price'] || 0),
                bidForFeaturedPlacement: listing['bid-for-featured-placement']
              };
              
              const quantityData = {
                sku: sku,
                quantity: parseInt(listing['quantity'] || 0, 10),
                pendingQuantity: parseInt(listing['pending-quantity'] || 0, 10),
                addDelete: listing['add-delete']
              };
              
              const zshopData = {
                sku: sku,
                zshopShippingFee: listing['zshop-shipping-fee'],
                zshopCategory1: listing['zshop-category1'],
                zshopBrowsePath: listing['zshop-browse-path'],
                zshopStorefrontFeature: listing['zshop-storefront-feature'],
                zshopBoldface: listing['zshop-boldface'],
                willShipInternationally: listing['will-ship-internationally'],
                expeditedShipping: listing['expedited-shipping']
              };
              
              infoToUpsert.push(infoData);
              priceToUpsert.push(priceData);
              quantityToUpsert.push(quantityData);
              zshopToUpsert.push(zshopData);
              
              savedCount++;
            } catch (error) {
              console.error(`Error processing listing with SKU ${listing['seller-sku'] || 'unknown'}:`, error);
              errorCount++;
            }
          }
          
          // Execute bulk operations
          if (vitalsToCreate.length > 0) {
            await AmazonVitals.bulkCreate(vitalsToCreate, { transaction });
          }
          
          for (const vital of vitalsToUpdate) {
            await vital.save({ transaction });
          }
          
          if (infoToUpsert.length > 0) {
            await AmazonInfo.bulkCreate(infoToUpsert, { 
              updateOnDuplicate: ['listingId', 'description', 'imageUrl', 'isMarketplace', 
                'productIdType', 'itemNote', 'itemCondition', 'openDate', 'asin1', 
                'asin2', 'asin3', 'productId', 'fulfillmentChannel', 'merchantShippingGroup', 
                'updatedAt'],
              transaction
            });
          }
          
          if (priceToUpsert.length > 0) {
            await AmazonPrice.bulkCreate(priceToUpsert, {
              updateOnDuplicate: ['price', 'bidForFeaturedPlacement', 'updatedAt'],
              transaction
            });
          }
          
          if (quantityToUpsert.length > 0) {
            await AmazonQuantity.bulkCreate(quantityToUpsert, {
              updateOnDuplicate: ['quantity', 'pendingQuantity', 'addDelete', 'updatedAt'],
              transaction
            });
          }
          
          if (zshopToUpsert.length > 0) {
            await AmazonZShop.bulkCreate(zshopToUpsert, {
              updateOnDuplicate: ['zshopShippingFee', 'zshopCategory1', 'zshopBrowsePath', 
                'zshopStorefrontFeature', 'zshopBoldface', 'willShipInternationally', 
                'expeditedShipping', 'updatedAt'],
              transaction
            });
          }
          
          // Commit the transaction
          await transaction.commit();
          console.log(`Batch ${batchIndex + 1} processed. Success: ${savedCount}, Errors: ${errorCount}`);
        } catch (error) {
          // Rollback the transaction on error
          await transaction.rollback();
          console.error(`Error processing batch ${batchIndex + 1}:`, error);
          errorCount += batch.length;
        }
      }
      
      // Mark items as inactive if they're not in the current import
      await this.markMissingItemsAsInactive(Array.from(importedSkus));
      
      console.timeEnd('Total import time');
      
      return {
        success: true,
        message: `Successfully processed ${savedCount} Amazon listings with ${errorCount} errors`,
        savedCount,
        errorCount
      };
    } catch (error) {
      console.timeEnd('Total import time');
      console.error('Error saving Amazon listings to database:', error);
      throw error;
    }
  }
  
  /**
   * Mark items as inactive if they're not in the current import
   * @param {Array} importedSkus - Array of SKUs in the current import
   */
  async markMissingItemsAsInactive(importedSkus) {
    try {
      console.log('Checking for SKUs in database that are not in the current import file...');
      
      await sequelize.transaction(async (transaction) => {
        // First, set all newly imported SKUs to Active
        if (importedSkus.length > 0) {
          // Process in chunks for large SKU arrays
          const chunkSize = 1000; // PostgreSQL has limits on the number of parameters
          let activeCount = 0;
          
          // Process in chunks to avoid parameter limits
          for (let i = 0; i < importedSkus.length; i += chunkSize) {
            const chunk = importedSkus.slice(i, i + chunkSize);
            
            // Update all imported SKUs to Active
            const activateQuery = `
              UPDATE amazon_vitals
              SET status = 'Active', updated_at = NOW()
              WHERE seller_sku IN (
                SELECT unnest($1::text[])
              )
            `;
            
            const [activateResult] = await sequelize.query(activateQuery, {
              bind: [chunk],
              type: QueryTypes.UPDATE,
              transaction
            });
            
            activeCount += activateResult;
          }
          
          console.log(`${activeCount} Amazon listings marked as Active`);
        }
        
        // Now mark items not in the import as Inactive
        // Process in chunks for large SKU arrays
        const chunkSize = 1000; // PostgreSQL has limits on the number of parameters
        let inactiveCount = 0;
        
        // Process in chunks to avoid parameter limits
        for (let i = 0; i < importedSkus.length; i += chunkSize) {
          const chunk = importedSkus.slice(i, i + chunkSize);
          
          // Use unnest for better performance with arrays in PostgreSQL
          const updateQuery = `
            UPDATE amazon_vitals
            SET status = 'Inactive', updated_at = NOW()
            WHERE status != 'Inactive'
            AND seller_sku NOT IN (
              SELECT unnest($1::text[])
            )
          `;
          
          const [updateResult] = await sequelize.query(updateQuery, {
            bind: [chunk],
            type: QueryTypes.UPDATE,
            transaction
          });
          
          inactiveCount += updateResult;
        }
        
        if (inactiveCount > 0) {
          console.log(`${inactiveCount} Amazon listings marked as Inactive with updated timestamps`);
        } else {
          console.log('No SKUs needed to be marked as Inactive');
        }
      });
    } catch (error) {
      console.error('Error marking missing items as inactive:', error);
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
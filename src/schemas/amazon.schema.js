const Joi = require('joi');

const schemas = {
  // Pagination schema used in multiple endpoints
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
  }),

  // SKU parameter schema
  sku: Joi.object({
    sku: Joi.string().required().trim()
  }),

  // Listing query parameters
  listingQuery: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sku: Joi.string().trim(),
    status: Joi.string().valid('Active', 'Inactive'),
    fulfillmentChannel: Joi.string()
  }),

  // Import options
  importOptions: Joi.object({
    marketplaceId: Joi.string().default('ATVPDKIKX0DER'),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().min(Joi.ref('startDate'))
  }),

  // Price update
  priceUpdate: Joi.object({
    sku: Joi.string().required().trim(),
    price: Joi.number().required().min(0),
    bidForFeaturedPlacement: Joi.string()
  }),

  // Quantity update
  quantityUpdate: Joi.object({
    sku: Joi.string().required().trim(),
    quantity: Joi.number().integer().required().min(0),
    pendingQuantity: Joi.number().integer().min(0).default(0)
  })
};

module.exports = schemas; 
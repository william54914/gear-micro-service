const Joi = require('joi');

const schemas = {
  // Pagination schema used in multiple endpoints
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
  }),

  // Vendor creation/update
  vendor: Joi.object({
    vendorName: Joi.string().required().trim().max(100),
    vendorCode: Joi.string().required().trim().min(2).max(10),
    website: Joi.string().uri().allow(null, ''),
    contactEmail: Joi.string().email().allow(null, ''),
    contactPhone: Joi.string().allow(null, ''),
    notes: Joi.string().allow(null, '')
  }),

  // Vendor product creation/update
  vendorProduct: Joi.object({
    vendorId: Joi.number().integer().required(),
    brandId: Joi.number().integer().required(),
    vendorSku: Joi.string().required().trim(),
    vendorProductName: Joi.string().required().trim(),
    description: Joi.string().allow(null, ''),
    msrp: Joi.number().min(0).allow(null),
    mapPrice: Joi.number().min(0).allow(null),
    cost: Joi.number().min(0).allow(null),
    weight: Joi.number().min(0).allow(null),
    upc: Joi.string().length(12).allow(null, '')
  }),

  // Product attributes
  productAttributes: Joi.object({
    vendorProductId: Joi.number().integer().required(),
    attributes: Joi.array().items(
      Joi.object({
        name: Joi.string().required().trim(),
        value: Joi.string().required().trim()
      })
    )
  }),

  // Product dimensions
  productDimensions: Joi.object({
    vendorProductId: Joi.number().integer().required(),
    length: Joi.number().min(0).required(),
    width: Joi.number().min(0).required(),
    height: Joi.number().min(0).required(),
    dimensionUnit: Joi.string().valid('in', 'cm').required(),
    weight: Joi.number().min(0).required(),
    weightUnit: Joi.string().valid('lb', 'kg').required()
  }),

  // Product images
  productImages: Joi.object({
    vendorProductId: Joi.number().integer().required(),
    images: Joi.array().items(
      Joi.object({
        url: Joi.string().uri().required(),
        isPrimary: Joi.boolean().default(false),
        sortOrder: Joi.number().integer().min(0).default(0)
      })
    )
  }),

  // Vehicle compatibility
  vehicleCompatibility: Joi.object({
    vendorProductId: Joi.number().integer().required(),
    year: Joi.number().integer().min(1900).max(2100).required(),
    make: Joi.string().required().trim(),
    model: Joi.string().required().trim(),
    submodel: Joi.string().allow(null, ''),
    notes: Joi.string().allow(null, '')
  }),

  // Query parameters
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    vendorId: Joi.number().integer(),
    brandId: Joi.number().integer(),
    active: Joi.boolean(),
    search: Joi.string().trim(),
    sortBy: Joi.string().valid('vendorName', 'createdAt', 'updatedAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('asc')
  })
};

module.exports = schemas; 
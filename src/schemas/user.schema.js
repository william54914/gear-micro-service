const Joi = require('joi');

const schemas = {
  // User registration
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    role: Joi.string().valid('admin', 'manager', 'user').default('user')
  }),

  // User login
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  // Password update
  updatePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
      .messages({ 'any.only': 'Passwords do not match' })
  }),

  // Password reset request
  resetRequest: Joi.object({
    email: Joi.string().email().required()
  }),

  // Password reset
  resetPassword: Joi.object({
    token: Joi.string().required(),
    newPassword: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
      .messages({ 'any.only': 'Passwords do not match' })
  }),

  // Profile update
  updateProfile: Joi.object({
    firstName: Joi.string(),
    lastName: Joi.string(),
    email: Joi.string().email()
  }).min(1),

  // Admin user update
  adminUpdateUser: Joi.object({
    firstName: Joi.string(),
    lastName: Joi.string(),
    email: Joi.string().email(),
    role: Joi.string().valid('admin', 'manager', 'user'),
    active: Joi.boolean()
  }).min(1),

  // Query parameters
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    role: Joi.string().valid('admin', 'manager', 'user'),
    active: Joi.boolean(),
    search: Joi.string().trim(),
    sortBy: Joi.string().valid('email', 'firstName', 'lastName', 'role', 'createdAt', 'lastLoginAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('asc')
  })
};

module.exports = schemas; 
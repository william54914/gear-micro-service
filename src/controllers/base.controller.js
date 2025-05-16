class BaseController {
  /**
   * Send a success response
   * @param {object} res - Express response object
   * @param {any} data - Response data
   * @param {number} status - HTTP status code (default: 200)
   */
  sendSuccess(res, data, status = 200) {
    res.status(status).json({
      success: true,
      data
    });
  }

  /**
   * Send an error response
   * @param {object} res - Express response object
   * @param {string} message - Error message
   * @param {number} status - HTTP status code (default: 500)
   * @param {object} details - Additional error details
   */
  sendError(res, message, status = 500, details = null) {
    const response = {
      success: false,
      error: {
        message,
        ...(details && { details })
      }
    };

    res.status(status).json(response);
  }

  /**
   * Handle async route functions
   * @param {Function} fn - Async function to handle the route
   */
  asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(error => {
        console.error('Route error:', error);
        this.sendError(
          res,
          error.message || 'Internal server error',
          error.status || 500,
          process.env.NODE_ENV === 'development' ? error : null
        );
      });
    };
  }

  /**
   * Validate request data
   * @param {object} schema - Validation schema
   * @param {string} location - Request location to validate (body, query, params)
   */
  validate(schema, location = 'body') {
    return (req, res, next) => {
      const { error } = schema.validate(req[location]);
      if (error) {
        return this.sendError(res, 'Validation error', 400, {
          details: error.details.map(err => ({
            message: err.message,
            field: err.context.key
          }))
        });
      }
      next();
    };
  }
}

module.exports = BaseController; 
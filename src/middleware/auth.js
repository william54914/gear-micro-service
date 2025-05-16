const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { User } = require('../models');

/**
 * Middleware to authenticate requests using JWT
 */
exports.authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'No token provided'
        }
      });
    }
    
    // Extract token
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Check if user exists
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid token'
        }
      });
    }
    
    // Add user info to request
    req.user = decoded;
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Invalid token'
      }
    });
  }
};

/**
 * Middleware to authorize based on user roles
 * @param {string|string[]} roles - Role(s) required to access the route
 */
exports.authorize = (roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Unauthorized access'
          }
        });
      }
      
      // Convert single role to array
      const allowedRoles = Array.isArray(roles) ? roles : [roles];
      
      // Check if user role is allowed
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Forbidden: insufficient permissions'
          }
        });
      }
      
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: {
          message: 'Authorization error',
          details: error.message
        }
      });
    }
  };
}; 
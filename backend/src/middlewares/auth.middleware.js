const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/response');
const { AuthenticationError } = require('../utils/errors');

/**
 * Authentication Middleware
 * Verifies JWT token from Authorization header and attaches user to request
 * Used to protect routes that require authentication
 */

/**
 * Verify JWT token and extract user information
 * Expects token in Authorization header: Bearer <token>
 * Attaches decoded user data to req.user
 */
const authMiddleware = (req, res, next) => {
  try {
    // Extract Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(errorResponse('No token provided', 401));
    }

    // Extract token from "Bearer <token>" format
    const token = authHeader.slice(7);

    // Verify token using JWT secret
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_in_production_minimum_32_characters'
    );

    // Attach decoded user data to request object
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json(errorResponse('Token expired', 401));
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json(errorResponse('Invalid token', 401));
    }
    return res.status(401).json(errorResponse('Authentication failed', 401));
  }
};

module.exports = {
  authMiddleware,
};

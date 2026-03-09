const { errorResponse } = require('../utils/response');
const { AuthorizationError } = require('../utils/errors');

/**
 * Role-Based Access Control (RBAC) Middleware
 * Restricts route access based on user role
 * Available roles: ADMIN, STORE_MANAGER, SITE_ENGINEER
 */

/**
 * Middleware to verify user has required role(s)
 * Must be used after authMiddleware to have access to req.user
 * @param {...string} allowedRoles - One or more roles that can access the route
 * @returns {function} Middleware function
 */
const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json(errorResponse('Unauthorized', 401));
      }

      // Check if user's role is in allowed roles
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json(
          errorResponse(
            `Access denied. Required role(s): ${allowedRoles.join(', ')}`,
            403
          )
        );
      }

      next();
    } catch (error) {
      return res.status(500).json(errorResponse('Authorization check failed', 500));
    }
  };
};

module.exports = {
  roleMiddleware,
};

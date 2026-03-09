const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { authMiddleware } = require('../../middlewares/auth.middleware');
const { roleMiddleware } = require('../../middlewares/rbac.middleware');

/**
 * Authentication Routes
 * Handles all authentication and user management API endpoints
 */

/**
 * POST /api/auth/login
 * Login endpoint for mobile users
 * No authentication required
 * Request body:
 *   - email: string (valid email format)
 *   - password: string
 * Response: { user: {...}, token: string }
 */
router.post('/login', authController.login);

/**
 * POST /api/auth/users
 * Create new user (Admin only)
 * Requires authentication and ADMIN role
 * Request body:
 *   - email: string (valid email format, must be unique)
 *   - firstName: string
 *   - lastName: string
 *   - password: string (must be strong: 8+ chars, uppercase, lowercase, number, special char)
 *   - confirmPassword: string (must match password)
 *   - role: string (ADMIN, STORE_MANAGER, or SITE_ENGINEER)
 * Response: { id, email, firstName, lastName, role, createdAt }
 */
router.post(
  '/users',
  authMiddleware,
  roleMiddleware('ADMIN'),
  authController.createUser
);

module.exports = router;

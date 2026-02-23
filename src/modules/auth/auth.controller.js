const { successResponse, errorResponse } = require('../../utils/response');
const {
  isValidEmail,
  isStrongPassword,
  validateRequiredFields,
  isInAllowedOptions,
} = require('../../utils/validators');
const authService = require('./auth.service');

/**
 * Authentication Controller
 * Handles HTTP requests and responses
 * Validates input and calls service layer
 */

/**
 * Login Controller
 * Handles mobile user login
 * POST /api/auth/login
 * @param {object} req - Express request object with body { email, password }
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    const validation = validateRequiredFields(req.body, ['email', 'password']);
    if (!validation.isValid) {
      return res.status(400).json(
        errorResponse(
          'Missing required fields',
          400,
          validation.missingFields
        )
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json(
        errorResponse('Invalid email format', 400)
      );
    }

    // Call service to authenticate user
    const result = await authService.loginUser(email, password);

    return res.status(200).json(
      successResponse(result, 'Login successful', 200)
    );
  } catch (error) {
    // Return generic error message for security
    if (error.statusCode === 401) {
      return res.status(401).json(
        errorResponse('Invalid email or password', 401)
      );
    }
    if (error.statusCode === 403) {
      return res.status(403).json(
        errorResponse('Account is inactive', 403)
      );
    }
    next(error);
  }
};

/**
 * Create User Controller (Admin only)
 * Creates a new user account
 * POST /api/auth/users
 * @param {object} req - Express request object with body { email, firstName, lastName, password, role }
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware
 */
const createUser = async (req, res, next) => {
  try {
    const { email, firstName, lastName, password, confirmPassword, role } = req.body;

    // Validate required fields
    const validation = validateRequiredFields(req.body, [
      'email',
      'firstName',
      'lastName',
      'password',
      'confirmPassword',
      'role',
    ]);

    if (!validation.isValid) {
      return res.status(400).json(
        errorResponse(
          'Missing required fields',
          400,
          validation.missingFields
        )
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json(
        errorResponse('Invalid email format', 400)
      );
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      return res.status(400).json(
        errorResponse('Passwords do not match', 400)
      );
    }

    // Validate password strength
    if (!isStrongPassword(password)) {
      return res.status(400).json(
        errorResponse(
          'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
          400
        )
      );
    }

    // Validate role
    const validRoles = ['ADMIN', 'STORE_MANAGER', 'SITE_ENGINEER'];
    if (!isInAllowedOptions(role, validRoles)) {
      return res.status(400).json(
        errorResponse(
          `Invalid role. Must be one of: ${validRoles.join(', ')}`,
          400
        )
      );
    }

    // Call service to create user
    const user = await authService.createUser({
      email,
      firstName,
      lastName,
      password,
      role,
    });

    return res.status(201).json(
      successResponse(user, 'User created successfully', 201)
    );
  } catch (error) {
    // Check for specific error types
    if (error.statusCode === 409) {
      return res.status(409).json(
        errorResponse('Email already exists', 409)
      );
    }
    next(error);
  }
};

module.exports = {
  login,
  createUser,
};

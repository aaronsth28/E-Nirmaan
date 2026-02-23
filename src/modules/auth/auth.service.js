const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../../config/db');
const {
  ValidationError,
  AuthenticationError,
  ConflictError,
  DatabaseError,
} = require('../../utils/errors');

/**
 * Authentication Service
 * Contains all business logic for authentication operations
 * Handles user registration (admin), login, and token generation
 */

/**
 * Create new user (Admin only)
 * @param {object} userData - User data
 * @param {string} userData.email - User email address
 * @param {string} userData.firstName - User first name
 * @param {string} userData.lastName - User last name
 * @param {string} userData.password - Plain text password
 * @param {string} userData.role - User role (ADMIN, STORE_MANAGER, SITE_ENGINEER)
 * @returns {Promise<object>} Created user object with id, email, firstName, lastName, role, createdAt
 * @throws {ConflictError} If email already exists
 * @throws {DatabaseError} If database operation fails
 */
const createUser = async (userData) => {
  const { email, firstName, lastName, password, role } = userData;

  try {
    // Check if email already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw new ConflictError('Email already exists');
    }

    // Hash password with bcrypt (10 salt rounds)
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert new user into database
    const result = await pool.query(
      `INSERT INTO users (email, first_name, last_name, password_hash, role, is_active)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING id, email, first_name, last_name, role, created_at`,
      [email, firstName, lastName, passwordHash, role]
    );

    const user = result.rows[0];

    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      createdAt: user.created_at,
    };
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    throw new DatabaseError(`Failed to create user: ${error.message}`);
  }
};

/**
 * Authenticate user with email and password
 * @param {string} email - User email
 * @param {string} password - Plain text password
 * @returns {Promise<object>} Object containing user data and JWT token
 * @throws {AuthenticationError} If credentials are invalid
 * @throws {DatabaseError} If database operation fails
 */
const loginUser = async (email, password) => {
  try {
    // Query user by email
    const result = await pool.query(
      `SELECT id, email, first_name, last_name, password_hash, role, is_active
       FROM users WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      throw new AuthenticationError('Invalid email or password');
    }

    const user = result.rows[0];

    // Check if user account is active
    if (!user.is_active) {
      throw new AuthenticationError('Account is inactive');
    }

    // Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
      },
      process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_in_production_minimum_32_characters',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
      },
      token,
    };
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    throw new DatabaseError(`Login failed: ${error.message}`);
  }
};

module.exports = {
  createUser,
  loginUser,
};

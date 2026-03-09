/**
 * Custom Error Classes
 * Provides standardized error types for consistent error handling
 */

/**
 * Base application error class
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error - 400 Bad Request
 */
class ValidationError extends AppError {
  constructor(message = 'Validation Error', errors = null) {
    super(message, 400);
    this.errors = errors;
  }
}

/**
 * Authentication error - 401 Unauthorized
 */
class AuthenticationError extends AppError {
  constructor(message = 'Authentication Failed') {
    super(message, 401);
  }
}

/**
 * Authorization error - 403 Forbidden
 */
class AuthorizationError extends AppError {
  constructor(message = 'Insufficient Permissions') {
    super(message, 403);
  }
}

/**
 * Not found error - 404 Not Found
 */
class NotFoundError extends AppError {
  constructor(message = 'Resource Not Found') {
    super(message, 404);
  }
}

/**
 * Conflict error - 409 Conflict
 */
class ConflictError extends AppError {
  constructor(message = 'Resource Conflict') {
    super(message, 409);
  }
}

/**
 * Database error - 500 Internal Server Error
 */
class DatabaseError extends AppError {
  constructor(message = 'Database Error') {
    super(message, 500);
  }
}

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  DatabaseError,
};

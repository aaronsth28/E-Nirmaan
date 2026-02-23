/**
 * Input Validation Utilities
 * Provides validation functions for common data types and formats
 */

/**
 * Validates email format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates password strength
 * Requirements: minimum 8 characters, at least one uppercase, one lowercase, one number, one special character
 * @param {string} password - Password to validate
 * @returns {boolean} True if strong password
 */
const isStrongPassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Validates if value is a non-empty string
 * @param {any} value - Value to validate
 * @returns {boolean} True if non-empty string
 */
const isValidString = (value) => {
  return typeof value === 'string' && value.trim().length > 0;
};

/**
 * Validates if value is in allowed options
 * @param {any} value - Value to validate
 * @param {array} allowedOptions - Array of allowed values
 * @returns {boolean} True if value is in options
 */
const isInAllowedOptions = (value, allowedOptions) => {
  return allowedOptions.includes(value);
};

/**
 * Validates required fields in an object
 * @param {object} obj - Object to validate
 * @param {array} requiredFields - Array of field names that are required
 * @returns {object} { isValid: boolean, missingFields: array }
 */
const validateRequiredFields = (obj, requiredFields) => {
  const missingFields = requiredFields.filter(
    (field) => !obj[field] || (typeof obj[field] === 'string' && obj[field].trim() === '')
  );
  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
};

/**
 * Sanitizes string input by trimming and removing dangerous characters
 * @param {string} input - String to sanitize
 * @returns {string} Sanitized string
 */
const sanitizeString = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>\"']/g, '');
};

module.exports = {
  isValidEmail,
  isStrongPassword,
  isValidString,
  isInAllowedOptions,
  validateRequiredFields,
  sanitizeString,
};

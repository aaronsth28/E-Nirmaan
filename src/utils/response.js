/**
 * Response Formatter Utility
 * Standardizes API response format for mobile app consumption
 */

/**
 * Success response formatter
 * @param {any} data - Response data payload
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 * @returns {object} Formatted response object
 */
const successResponse = (data = null, message = 'Success', statusCode = 200) => {
  return {
    success: true,
    statusCode,
    message,
    data,
  };
};

/**
 * Error response formatter
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {array|object} errors - Validation or detailed errors
 * @returns {object} Formatted error response object
 */
const errorResponse = (message = 'Internal Server Error', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    statusCode,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  return response;
};

module.exports = {
  successResponse,
  errorResponse,
};

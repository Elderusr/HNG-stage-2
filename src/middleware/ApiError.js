// src/utils/ApiError.js

/**
 * Custom error class for failures when calling external APIs.
 * This allows us to specifically catch these errors and return a 503 status.
 */
class ApiError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ApiError';
  }
}

module.exports = ApiError;

import { ERROR_MESSAGES } from '../constants';

/**
 * Handles API errors and returns user-friendly error messages
 * @param {Error} error - The error object
 * @returns {Object} - Formatted error object with message and details
 */
export const handleApiError = (error) => {
  // If it's already a structured error from our API
  if (error.errors !== undefined || error.success !== undefined) {
    return {
      message: error.message || ERROR_MESSAGES.UNKNOWN_ERROR,
      errors: error.errors || {},
      success: error.success || false,
      status: error.status,
    };
  }

  // Network errors
  if (
    error.message &&
    (error.message.includes('Failed to fetch') ||
      error.message.includes('Network') ||
      error.message.includes('NetworkError'))
  ) {
    return {
      message: ERROR_MESSAGES.NETWORK_ERROR,
      errors: {},
      success: false,
      status: 0,
    };
  }

  // HTTP status code errors
  if (error.status) {
    switch (error.status) {
      case 401:
        return {
          message: ERROR_MESSAGES.UNAUTHORIZED,
          errors: {},
          success: false,
          status: 401,
        };
      case 403:
        return {
          message: ERROR_MESSAGES.FORBIDDEN,
          errors: {},
          success: false,
          status: 403,
        };
      case 404:
        return {
          message: ERROR_MESSAGES.NOT_FOUND,
          errors: {},
          success: false,
          status: 404,
        };
      case 500:
      case 502:
      case 503:
        return {
          message: ERROR_MESSAGES.SERVER_ERROR,
          errors: {},
          success: false,
          status: error.status,
        };
      default:
        return {
          message: error.message || ERROR_MESSAGES.UNKNOWN_ERROR,
          errors: {},
          success: false,
          status: error.status,
        };
    }
  }

  // Default error
  return {
    message: error.message || ERROR_MESSAGES.UNKNOWN_ERROR,
    errors: {},
    success: false,
    status: null,
  };
};

/**
 * Extracts validation errors from API response
 * @param {Object} errors - Error object from API
 * @returns {Object} - Formatted validation errors
 */
export const extractValidationErrors = (errors) => {
  if (!errors || typeof errors !== 'object') {
    return {};
  }

  const formattedErrors = {};
  Object.keys(errors).forEach((key) => {
    if (Array.isArray(errors[key])) {
      formattedErrors[key] = errors[key][0]; // Take first error message
    } else if (typeof errors[key] === 'string') {
      formattedErrors[key] = errors[key];
    } else if (typeof errors[key] === 'object') {
      formattedErrors[key] = extractValidationErrors(errors[key]);
    }
  });

  return formattedErrors;
};

/**
 * Checks if error is a network error
 * @param {Error} error - The error object
 * @returns {boolean}
 */
export const isNetworkError = (error) => {
  return (
    error.message &&
    (error.message.includes('Failed to fetch') ||
      error.message.includes('Network') ||
      error.message.includes('NetworkError'))
  );
};

/**
 * Checks if error is an authentication error
 * @param {Error} error - The error object
 * @returns {boolean}
 */
export const isAuthError = (error) => {
  return error.status === 401 || error.message === ERROR_MESSAGES.UNAUTHORIZED;
};




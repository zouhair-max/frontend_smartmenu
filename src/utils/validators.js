import { VALIDATION } from '../constants';

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  return VALIDATION.EMAIL_REGEX.test(email.trim());
};

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {Object} - { valid: boolean, message: string }
 */
export const validatePassword = (password) => {
  if (!password) {
    return { valid: false, message: 'Password is required' };
  }

  if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
    return {
      valid: false,
      message: `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`,
    };
  }

  if (password.length > VALIDATION.PASSWORD_MAX_LENGTH) {
    return {
      valid: false,
      message: `Password must be less than ${VALIDATION.PASSWORD_MAX_LENGTH} characters`,
    };
  }

  return { valid: true, message: '' };
};

/**
 * Validates name field
 * @param {string} name - Name to validate
 * @param {string} fieldName - Name of the field (for error message)
 * @returns {Object} - { valid: boolean, message: string }
 */
export const validateName = (name, fieldName = 'Name') => {
  if (!name || !name.trim()) {
    return { valid: false, message: `${fieldName} is required` };
  }

  if (name.trim().length < VALIDATION.NAME_MIN_LENGTH) {
    return {
      valid: false,
      message: `${fieldName} must be at least ${VALIDATION.NAME_MIN_LENGTH} characters`,
    };
  }

  if (name.trim().length > VALIDATION.NAME_MAX_LENGTH) {
    return {
      valid: false,
      message: `${fieldName} must be less than ${VALIDATION.NAME_MAX_LENGTH} characters`,
    };
  }

  return { valid: true, message: '' };
};

/**
 * Validates phone number (basic validation)
 * @param {string} phone - Phone number to validate
 * @returns {Object} - { valid: boolean, message: string }
 */
export const validatePhone = (phone) => {
  if (!phone) {
    return { valid: false, message: 'Phone number is required' };
  }

  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');

  if (digitsOnly.length < 10) {
    return { valid: false, message: 'Phone number must be at least 10 digits' };
  }

  return { valid: true, message: '' };
};

/**
 * Validates required field
 * @param {any} value - Value to validate
 * @param {string} fieldName - Name of the field
 * @returns {Object} - { valid: boolean, message: string }
 */
export const validateRequired = (value, fieldName) => {
  if (value === null || value === undefined || value === '') {
    return { valid: false, message: `${fieldName} is required` };
  }

  if (typeof value === 'string' && !value.trim()) {
    return { valid: false, message: `${fieldName} is required` };
  }

  return { valid: true, message: '' };
};

/**
 * Validates number range
 * @param {number} value - Number to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {string} fieldName - Name of the field
 * @returns {Object} - { valid: boolean, message: string }
 */
export const validateNumberRange = (value, min, max, fieldName) => {
  const num = Number(value);

  if (isNaN(num)) {
    return { valid: false, message: `${fieldName} must be a number` };
  }

  if (num < min) {
    return { valid: false, message: `${fieldName} must be at least ${min}` };
  }

  if (num > max) {
    return { valid: false, message: `${fieldName} must be at most ${max}` };
  }

  return { valid: true, message: '' };
};


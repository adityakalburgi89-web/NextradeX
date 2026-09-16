/**
 * Form Validation Utilities
 */
export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const isMinLength = (str, min) => typeof str === 'string' && str.length >= min;

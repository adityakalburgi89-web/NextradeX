/**
 * UI Notification Banner Utilities
 */
export const createNotification = (message, type = 'info') => ({ id: Date.now(), message, type });

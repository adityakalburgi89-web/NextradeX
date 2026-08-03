/**
 * LocalStorage Accessor Utilities
 */
export const getStorageItem = (key, fallback = null) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};
export const setStorageItem = (key, val) => localStorage.setItem(key, JSON.stringify(val));

/**
 * Trading Math Utilities
 */
export const calculatePnL = (entry, current, qty, isLong = true) => isLong ? (current - entry) * qty : (entry - current) * qty;
export const calculateMargin = (price, qty, leverage) => (price * qty) / leverage;

/**
 * Currency & Number Formatting Utilities
 */
export const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
export const formatPercent = (val) => `${val >= 0 ? '+' : ''}${val.toFixed(2)}%`;

/**
 * Portfolio Analytics Calculators
 */
export const calculateWinRate = (wins, total) => total > 0 ? ((wins / total) * 100).toFixed(1) : '0.0';

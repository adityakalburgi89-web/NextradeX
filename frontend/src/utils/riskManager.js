/**
 * Risk Assessment Utilities
 */
export const checkMaxDrawdown = (peak, current) => peak > 0 ? ((peak - current) / peak) * 100 : 0;

/**
 * Trading Fee Structure Utilities
 */
export const calculateMakerFee = (notional) => notional * 0.0002;
export const calculateTakerFee = (notional) => notional * 0.0005;

/**
 * Position Liquidation Calculator
 */
export const calculateLiquidationPrice = (entryPrice, leverage, isLong = true) => isLong ? entryPrice * (1 - 1 / leverage) : entryPrice * (1 + 1 / leverage);

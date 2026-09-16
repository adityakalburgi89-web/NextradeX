import { calculateLiquidationPrice } from '../positionUtils';
test('calculateLiquidationPrice calculates long liquidation', () => { expect(calculateLiquidationPrice(100, 10, true)).toBe(90); });

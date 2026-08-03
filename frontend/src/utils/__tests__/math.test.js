import { calculatePnL } from '../math';
test('calculatePnL returns correct value', () => { expect(calculatePnL(100, 110, 2, true)).toBe(20); });

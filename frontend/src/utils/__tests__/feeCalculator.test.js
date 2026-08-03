import { calculateMakerFee } from '../feeCalculator';
test('calculateMakerFee calculates fee', () => { expect(calculateMakerFee(10000)).toBe(2); });

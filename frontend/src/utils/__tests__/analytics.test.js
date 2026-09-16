import { calculateWinRate } from '../analytics';
test('calculateWinRate returns percentage', () => { expect(calculateWinRate(5, 10)).toBe('50.0'); });

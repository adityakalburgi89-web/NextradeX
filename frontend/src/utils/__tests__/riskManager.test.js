import { checkMaxDrawdown } from '../riskManager';
test('checkMaxDrawdown calculates drawdown %', () => { expect(checkMaxDrawdown(100, 80)).toBe(20); });

import { validateOrderInputs } from '../orderValidator';
test('validateOrderInputs validates price and qty', () => { expect(validateOrderInputs(100, 1)).toBe(true); });

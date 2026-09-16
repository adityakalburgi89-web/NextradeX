import { isValidEmail } from '../validators';
test('isValidEmail validates emails', () => { expect(isValidEmail('test@example.com')).toBe(true); });

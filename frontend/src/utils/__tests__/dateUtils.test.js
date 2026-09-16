import { formatDate } from '../dateUtils';
test('formatDate formats valid date', () => { expect(typeof formatDate(Date.now())).toBe('string'); });

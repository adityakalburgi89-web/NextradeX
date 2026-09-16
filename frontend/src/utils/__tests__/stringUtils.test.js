import { truncateAddress } from '../stringUtils';
test('truncateAddress truncates long hash', () => { expect(truncateAddress('0x1234567890abcdef', 4, 4)).toBe('0x12...cdef'); });

import { generateTxHash } from '../crypto';
test('generateTxHash returns valid hash format', () => { expect(generateTxHash().startsWith('0x')).toBe(true); });

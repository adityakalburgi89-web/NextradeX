import { getStorageItem } from '../storage';
test('getStorageItem returns fallback', () => { expect(getStorageItem('non_existent', 'def')).toBe('def'); });

import { isSessionActive } from '../sessionUtils';
test('isSessionActive checks timestamp', () => { expect(isSessionActive(Date.now() + 10000)).toBe(true); });

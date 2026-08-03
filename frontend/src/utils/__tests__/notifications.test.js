import { createNotification } from '../notifications';
test('createNotification returns object with type', () => { expect(createNotification('hello').type).toBe('info'); });

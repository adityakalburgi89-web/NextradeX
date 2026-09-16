import { aggregateDepth } from '../orderBookUtils';
test('aggregateDepth formats prices', () => { expect(aggregateDepth([['10.123', 5]])[0][0]).toBe('10.12'); });

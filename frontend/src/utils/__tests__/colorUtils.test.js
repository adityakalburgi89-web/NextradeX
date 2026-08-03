import { getPriceColorClass } from '../colorUtils';
test('getPriceColorClass returns green for positive', () => { expect(getPriceColorClass(5)).toBe('text-[#33c758]'); });

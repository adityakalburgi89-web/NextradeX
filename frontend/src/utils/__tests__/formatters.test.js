import { formatCurrency, formatPercent } from '../formatters';
test('formatCurrency formats USD correctly', () => { expect(formatCurrency(100)).toBe('$100.00'); });

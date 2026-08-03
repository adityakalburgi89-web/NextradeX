/**
 * Order Book Aggregation Utilities
 */
export const aggregateDepth = (orders, precision = 2) => orders.map(([p, q]) => [Number(p).toFixed(precision), q]);

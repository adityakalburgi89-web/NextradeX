/**
 * Order Field Validation
 */
export const validateOrderInputs = (price, amount) => Number(price) > 0 && Number(amount) > 0;

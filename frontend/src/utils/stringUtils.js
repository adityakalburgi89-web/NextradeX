/**
 * String Truncation Utilities
 */
export const truncateAddress = (addr, head = 6, tail = 4) => !addr ? '' : `${addr.slice(0, head)}...${addr.slice(-tail)}`;

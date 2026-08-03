/**
 * Date & Timestamp Utilities
 */
export const formatTimestamp = (ts) => new Date(ts).toLocaleTimeString();
export const formatDate = (ts) => new Date(ts).toLocaleDateString();

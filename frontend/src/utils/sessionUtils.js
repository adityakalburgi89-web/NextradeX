/**
 * User Session State Helpers
 */
export const isSessionActive = (expiry) => Date.now() < expiry;

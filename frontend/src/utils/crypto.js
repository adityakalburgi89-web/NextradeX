/**
 * Cryptographic Hash Mock Utilities
 */
export const generateTxHash = () => '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');

/**
 * Clipboard Helper Utilities
 */
export const copyToClipboard = async (text) => {
  if (navigator.clipboard) { await navigator.clipboard.writeText(text); return true; }
  return false;
};

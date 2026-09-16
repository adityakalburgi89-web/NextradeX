/**
 * Device Detection Utilities
 */
export const isMobileViewport = () => typeof window !== 'undefined' && window.innerWidth < 768;

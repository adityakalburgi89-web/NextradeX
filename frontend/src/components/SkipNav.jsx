import React from "react";

const SkipNav = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-foreground focus:font-bold focus:rounded-2xl focus:text-sm focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
    >
      Skip to main content
    </a>
  );
};

export default SkipNav;
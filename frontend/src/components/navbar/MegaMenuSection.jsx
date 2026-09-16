import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";

/**
 * Reusable MegaMenuSection Component
 * Uses HugeiconsIcon component to render section headers.
 */
export default function MegaMenuSection({ title, icon: Icon, children }) {
  return (
    <div className="crypto-megamenu-section">
      {title && (
        <div className="crypto-megamenu-col-header">
          {Icon && <HugeiconsIcon icon={Icon} size={16} />}
          <span>{title}</span>
        </div>
      )}
      <div className="crypto-megamenu-col-list">{children}</div>
    </div>
  );
}

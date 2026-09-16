import React from "react";
import { Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";

/**
 * Reusable MegaMenuItem Component
 * Uses HugeiconsIcon component to render official Stroke-Rounded Hugeicons.
 */
export default function MegaMenuItem({ item, onClick }) {
  const Icon = item.icon;

  const renderBadge = (badge) => {
    if (!badge) return null;
    let badgeClass = "crypto-badge-hot";
    if (badge === "NEW") badgeClass = "crypto-badge-new";
    if (badge === "AI") badgeClass = "crypto-badge-ai";

    return <span className={`crypto-badge ${badgeClass}`}>{badge}</span>;
  };

  return (
    <Link
      to={item.route || "#"}
      onClick={onClick}
      className="crypto-megamenu-item"
      role="menuitem"
      tabIndex={0}
    >
      {Icon && (
        <div className="crypto-megamenu-item-icon-box">
          <HugeiconsIcon icon={Icon} size={18} />
        </div>
      )}
      <div className="crypto-megamenu-item-body">
        <div className="crypto-megamenu-item-head">
          <h4 className="crypto-megamenu-item-title">{item.title}</h4>
          {renderBadge(item.badge)}
        </div>
        {item.description && (
          <p className="crypto-megamenu-item-desc">{item.description}</p>
        )}
      </div>
    </Link>
  );
}

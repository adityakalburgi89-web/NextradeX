import React from "react";
import { Link, useLocation } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";

/**
 * Reusable NavItem Component
 * Uses Hugeicons stroke-rounded ArrowDown01Icon for drop-down indicator.
 */
export default function NavItem({
  item,
  isOpen,
  onMouseEnter,
  onMouseLeave,
  onClick,
}) {
  const location = useLocation();

  if (item.type === "link") {
    const isActive = location.pathname === item.route;
    return (
      <li className="crypto-nav-item-wrapper" role="none">
        <Link
          to={item.route}
          className={`crypto-nav-link ${isActive ? "is-active" : ""}`}
          role="menuitem"
        >
          {item.label}
        </Link>
      </li>
    );
  }

  return (
    <li
      className="crypto-nav-item-wrapper"
      role="none"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <button
        type="button"
        className={`crypto-nav-button ${isOpen ? "is-active" : ""}`}
        onClick={onClick}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-controls={`megamenu-${item.id}`}
        role="menuitem"
      >
        <span>{item.label}</span>
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          size={13}
          className={`crypto-chevron ${isOpen ? "is-open" : ""}`}
        />
      </button>
    </li>
  );
}

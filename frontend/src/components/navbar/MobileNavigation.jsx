import React, { useState } from "react";
import { Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon, ArrowDown01Icon } from "@hugeicons/core-free-icons";
import MegaMenuItem from "./MegaMenuItem";
import MarketPanel from "./MarketPanel";

/**
 * Reusable MobileNavigation Component
 * Uses Stroke-Rounded Hugeicons for mobile search & drop-down indicators.
 */
export default function MobileNavigation({
  open,
  navItems,
  onClose,
  setSearchOpen,
  isLoggedIn,
  user,
  triggerLogoutConfirm,
}) {
  const [expandedSection, setExpandedSection] = useState(null);

  if (!open) return null;

  const toggleAccordion = (id) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  return (
    <div className="crypto-mobile-drawer" role="dialog" aria-label="Mobile Navigation">
      {/* Mobile Search Bar Trigger */}
      <div style={{ marginBottom: "12px" }}>
        <button
          onClick={() => {
            onClose();
            setSearchOpen(true);
          }}
          className="crypto-market-search-wrapper"
          style={{
            width: "100%",
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: "10px",
            padding: "8px 12px",
            color: "#6b7280",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
          }}
        >
          <HugeiconsIcon icon={Search01Icon} size={16} />
          <span>Search markets, coins, docs...</span>
        </button>
      </div>

      {/* Accordion Nav Items */}
      {navItems.map((item) => {
        if (item.type === "link") {
          return (
            <Link
              key={item.id}
              to={item.route}
              onClick={onClose}
              className="crypto-mobile-nav-link"
            >
              {item.label}
            </Link>
          );
        }

        const isExpanded = expandedSection === item.id;
        const data = item.data;

        return (
          <div key={item.id} className="crypto-mobile-accordion-item">
            <button
              type="button"
              className="crypto-mobile-accordion-header"
              onClick={() => toggleAccordion(item.id)}
              aria-expanded={isExpanded}
            >
              <span>{item.label}</span>
              <HugeiconsIcon
                icon={ArrowDown01Icon}
                size={16}
                className={`crypto-chevron ${isExpanded ? "is-open" : ""}`}
              />
            </button>

            {isExpanded && (
              <div className="crypto-mobile-accordion-content">
                {/* 1. Trade Accordion */}
                {item.id === "trade" && (
                  <>
                    <div style={{ marginBottom: "12px" }}>
                      <p className="crypto-megamenu-header-desc">
                        {data.header?.description}
                      </p>
                    </div>
                    {data.items?.map((subItem) => (
                      <MegaMenuItem
                        key={subItem.id}
                        item={subItem}
                        onClick={onClose}
                      />
                    ))}
                    <div style={{ marginTop: "12px" }}>
                      <MarketPanel
                        panelData={data.marketPanel}
                        onItemClick={onClose}
                      />
                    </div>
                  </>
                )}

                {/* 2. Derivatives Accordion */}
                {item.id === "derivatives" && (
                  <>
                    <div style={{ marginBottom: "12px" }}>
                      <p className="crypto-megamenu-header-desc">
                        {data.header?.description}
                      </p>
                    </div>
                    {data.items?.map((subItem) => (
                      <MegaMenuItem
                        key={subItem.id}
                        item={subItem}
                        onClick={onClose}
                      />
                    ))}
                    <div style={{ marginTop: "12px" }}>
                      <MarketPanel
                        panelData={data.marketPanel}
                        onItemClick={onClose}
                      />
                    </div>
                  </>
                )}

                {/* 3. More Accordion */}
                {item.id === "more" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {data.columns?.map((col) => (
                      <div key={col.id}>
                        <div className="crypto-megamenu-col-header">
                          <span>{col.title}</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          {col.items?.map((subItem, idx) => (
                            <MegaMenuItem
                              key={`${subItem.title}-${idx}`}
                              item={subItem}
                              onClick={onClose}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Mobile Auth Buttons */}
      <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid #f3f4f6" }}>
        {isLoggedIn ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ color: "#111827", fontSize: "14px", fontWeight: "600" }}>
              Logged in as {user?.username || "User"}
            </div>
            <button
              onClick={() => {
                onClose();
                triggerLogoutConfirm();
              }}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "12px",
                background: "rgba(239, 68, 68, 0.1)",
                color: "#ef4444",
                border: "none",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Log Out
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "12px" }}>
            <Link
              to="/auth?mode=login"
              onClick={onClose}
              className="crypto-login-link"
              style={{ flex: 1, textAlign: "center", border: "1px solid #e5e7eb", color: "#111827" }}
            >
              Login
            </Link>
            <Link
              to="/auth?mode=register"
              onClick={onClose}
              className="crypto-register-btn"
              style={{ flex: 1, textAlign: "center" }}
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

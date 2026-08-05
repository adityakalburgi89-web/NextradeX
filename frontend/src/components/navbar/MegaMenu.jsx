import React from "react";
import MegaMenuItem from "./MegaMenuItem";
import MegaMenuSection from "./MegaMenuSection";
import MarketPanel from "./MarketPanel";

/**
 * Reusable MegaMenu Dropdown Container Component
 * Handles rendering of Trade, Derivatives, and More mega menu layouts.
 */
export default function MegaMenu({
  menuId,
  data,
  onMouseEnter,
  onMouseLeave,
  onItemClick,
}) {
  if (!data) return null;

  // Class name according to menu type
  const widthClass = `width-${menuId}`;

  return (
    <div
      className={`crypto-megamenu-dropdown ${widthClass}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      role="menu"
      aria-label={`${menuId} mega menu`}
    >
      {/* 1. Trade Mega Menu Layout */}
      {menuId === "trade" && (
        <div className="crypto-megamenu-content-2col">
          {/* Left Column: Title + 6 Trading Options */}
          <div className="crypto-megamenu-left-col">
            <div className="crypto-megamenu-header">
              <h3 className="crypto-megamenu-header-title">
                {data.header?.title || "Trade"}
              </h3>
              <p className="crypto-megamenu-header-desc">
                {data.header?.description}
              </p>
            </div>
            <div className="crypto-megamenu-grid-2col">
              {data.items?.map((item) => (
                <MegaMenuItem
                  key={item.id}
                  item={item}
                  onClick={onItemClick}
                />
              ))}
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="crypto-megamenu-vertical-divider" />

          {/* Right Column: Market Panel */}
          <div className="crypto-megamenu-right-col">
            <MarketPanel
              panelData={data.marketPanel}
              onItemClick={onItemClick}
            />
          </div>
        </div>
      )}

      {/* 2. Derivatives Mega Menu Layout */}
      {menuId === "derivatives" && (
        <div className="crypto-megamenu-content-2col">
          {/* Left Column: Title + 5 Options */}
          <div className="crypto-megamenu-left-col">
            <div className="crypto-megamenu-header">
              <h3 className="crypto-megamenu-header-title">
                {data.header?.title || "Futures"}
              </h3>
              <p className="crypto-megamenu-header-desc">
                {data.header?.description}
              </p>
            </div>
            <div className="crypto-megamenu-col-list">
              {data.items?.map((item) => (
                <MegaMenuItem
                  key={item.id}
                  item={item}
                  onClick={onItemClick}
                />
              ))}
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="crypto-megamenu-vertical-divider" />

          {/* Right Column: Derivatives Market Panel */}
          <div className="crypto-megamenu-right-col">
            <MarketPanel
              panelData={data.marketPanel}
              onItemClick={onItemClick}
            />
          </div>
        </div>
      )}

      {/* 3. More Mega Menu Layout (4 Columns) */}
      {menuId === "more" && (
        <div className="crypto-megamenu-grid-4col">
          {data.columns?.map((col) => (
            <MegaMenuSection
              key={col.id}
              title={col.title}
              icon={col.icon}
            >
              {col.items?.map((item, idx) => (
                <MegaMenuItem
                  key={`${item.title}-${idx}`}
                  item={item}
                  onClick={onItemClick}
                />
              ))}
            </MegaMenuSection>
          ))}
        </div>
      )}
    </div>
  );
}

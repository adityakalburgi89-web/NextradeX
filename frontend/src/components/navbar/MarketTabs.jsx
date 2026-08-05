import React from "react";

/**
 * Reusable MarketTabs Component
 * Switches between market tabs (e.g., Majors, New, TON, More / ALL, USDT-ⓜ, USDC-ⓜ).
 */
export default function MarketTabs({ tabs, activeTab, onSelectTab }) {
  if (!tabs || tabs.length === 0) return null;

  return (
    <div className="crypto-market-tabs" role="tablist" aria-label="Market Categories">
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`crypto-market-tab-btn ${isActive ? "is-active" : ""}`}
            onClick={() => onSelectTab(tab)}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}

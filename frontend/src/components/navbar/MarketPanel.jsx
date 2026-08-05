import React, { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";
import MarketTabs from "./MarketTabs";
import MarketRow from "./MarketRow";

/**
 * Reusable MarketPanel Component
 * Uses HugeiconsIcon component for search input icon.
 */
export default function MarketPanel({ panelData, onItemClick }) {
  const tabs = panelData?.tabs || [];
  const [activeTab, setActiveTab] = useState(tabs[0] || "");
  const [searchQuery, setSearchQuery] = useState("");

  const rawList =
    panelData?.assets?.[activeTab] ||
    panelData?.contracts?.[activeTab] ||
    [];

  const filteredList = rawList.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const symbolMatch = item.symbol?.toLowerCase().includes(q);
    const nameMatch = item.name?.toLowerCase().includes(q);
    return symbolMatch || nameMatch;
  });

  return (
    <div className="crypto-market-panel">
      {/* Search Bar with Hugeicon */}
      <div className="crypto-market-search-wrapper">
        <HugeiconsIcon
          icon={Search01Icon}
          size={14}
          className="crypto-market-search-icon"
        />
        <input
          type="text"
          className="crypto-market-search-input"
          placeholder="Search markets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Category Tabs */}
      <MarketTabs
        tabs={tabs}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setSearchQuery("");
        }}
      />

      {/* Asset / Contract Rows */}
      <div className="crypto-market-rows-container" role="menu">
        {filteredList.length > 0 ? (
          filteredList.map((row, idx) => (
            <MarketRow
              key={`${row.symbol}-${idx}`}
              row={row}
              onClick={onItemClick}
            />
          ))
        ) : (
          <div style={{ padding: "16px", textAlign: "center", color: "#6b7280", fontSize: "12px" }}>
            No matching markets found
          </div>
        )}
      </div>
    </div>
  );
}

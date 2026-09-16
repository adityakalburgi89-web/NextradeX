import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { FireIcon, FlashIcon, StarsIcon } from "@hugeicons/core-free-icons";
import { formatCurrency, formatPercent } from "../../lib/utils";
import UniversalCoinIcon from "../../lib/coinIcons";

const cardIconMap = {
  trending: FireIcon,
  gainers: FlashIcon,
  newListings: StarsIcon,
};

/**
 * Market Highlight Banner Cards (Trending, Top Gainers, New Listings)
 * Visitors White Engineering Blueprint Card UI.
 */
export function MarketHighlightCard({ type = "trending", title, items = [], onSelectSymbol }) {
  const IconComponent = cardIconMap[type] || FireIcon;

  return (
    <div className="bg-white border border-[#e8e8e8] rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-200 font-openrunde">
      <div className="flex items-center justify-between pb-4 border-b border-[#e8e8e8]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#f5f5f5] flex items-center justify-center text-[#181925] border border-[#e8e8e8]">
            <HugeiconsIcon icon={IconComponent} size={16} />
          </div>
          <h4 className="text-base font-semibold text-[#181925] tracking-[-0.32px]">{title}</h4>
        </div>
        <span className="text-xs font-medium text-[#999999] cursor-pointer hover:text-[#918df6] transition-colors tracking-[-0.32px]">
          View all
        </span>
      </div>

      <div className="divide-y divide-[#e8e8e8] pt-1">
        {items.slice(0, 3).map((item, idx) => {
          const isUp = Number(item.percentChange24h ?? item.change ?? 0) >= 0;
          return (
            <div
              key={item.symbol || idx}
              onClick={() => onSelectSymbol && onSelectSymbol(item.symbol)}
              className="py-3 flex items-center justify-between cursor-pointer hover:bg-[#fafafa] px-2 rounded-xl transition-colors duration-150 group"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#999999] font-medium w-4">{idx + 1}</span>
                <UniversalCoinIcon symbol={item.symbol} size="w-7 h-7" className="drop-shadow-xs" />
                <div>
                  <span className="font-semibold text-sm text-[#181925] tracking-[-0.32px] block group-hover:text-[#918df6] transition-colors">
                    {item.symbol}
                  </span>
                  <span className="text-xs text-[#999999] tracking-[-0.32px] block">{item.name || item.symbol}</span>
                </div>
              </div>

              <div className="text-right space-y-0.5">
                <span className="text-sm font-semibold text-[#181925] tracking-[-0.32px] block">
                  {formatCurrency(item.currentPrice || item.price)}
                </span>
                <span className={`text-xs font-medium tracking-tight flex items-center justify-end gap-0.5 ${isUp ? "text-[#33c758]" : "text-[#ff3e00]"}`}>
                  {isUp ? "+" : ""}
                  {formatPercent(item.percentChange24h || item.change)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MarketHighlightCard;

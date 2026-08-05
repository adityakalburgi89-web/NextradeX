import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { FireIcon, FlashIcon, StarsIcon } from "@hugeicons/core-free-icons";
import { formatCurrency, formatPercent } from "../../lib/utils";

import btcIcon from "../../assets/Icons/btc.svg";
import ethIcon from "../../assets/Icons/eth.svg";
import solIcon from "../../assets/Icons/sol.svg";
import bnbIcon from "../../assets/Icons/bnb.svg";
import dotIcon from "../../assets/Icons/dot.svg";
import linkIcon from "../../assets/Icons/link.svg";
import ltcIcon from "../../assets/Icons/ltc.svg";
import arbIcon from "../../assets/Icons/arb.svg";
import opIcon from "../../assets/Icons/op.svg";
import suiIcon from "../../assets/Icons/sui.svg";
import tiaIcon from "../../assets/Icons/tia.svg";
import seiIcon from "../../assets/Icons/sei.svg";

const cardIconMap = {
  trending: FireIcon,
  gainers: FlashIcon,
  newListings: StarsIcon,
};

const localIconMap = {
  BTC: btcIcon,
  ETH: ethIcon,
  SOL: solIcon,
  BNB: bnbIcon,
  DOT: dotIcon,
  LINK: linkIcon,
  LTC: ltcIcon,
  ARB: arbIcon,
  OP: opIcon,
  SUI: suiIcon,
  TIA: tiaIcon,
  SEI: seiIcon,
};

const cdnIconMap = {
  BTC: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/btc.png",
  ETH: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/eth.png",
  SOL: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/sol.png",
  BNB: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/bnb.png",
  DOT: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/dot.png",
  DOGE: "https://s2.coinmarketcap.com/static/img/coins/64x64/74.png",
  XRP: "https://s2.coinmarketcap.com/static/img/coins/64x64/52.png",
  ADA: "https://s2.coinmarketcap.com/static/img/coins/64x64/2011.png",
  AVAX: "https://s2.coinmarketcap.com/static/img/coins/64x64/5805.png",
  PEPE: "https://s2.coinmarketcap.com/static/img/coins/64x64/24478.png",
  WIF: "https://s2.coinmarketcap.com/static/img/coins/64x64/28752.png",
  TON: "https://s2.coinmarketcap.com/static/img/coins/64x64/11419.png",
  NEAR: "https://s2.coinmarketcap.com/static/img/coins/64x64/6535.png",
};

const getCryptoIcon = (symbol) => {
  const base = (symbol?.endsWith("USDT") ? symbol.slice(0, -4) : symbol)?.toUpperCase();
  if (localIconMap[base]) {
    return localIconMap[base];
  }
  if (cdnIconMap[base]) {
    return cdnIconMap[base];
  }
  return `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${base?.toLowerCase()}.png`;
};

/**
 * Market Highlight Banner Cards (Trending, Top Gainers, New Listings)
 * Real crypto brand icons implementation.
 */
export function MarketHighlightCard({ type = "trending", title, items = [], onSelectSymbol }) {
  const IconComponent = cardIconMap[type] || FireIcon;

  return (
    <div className="bg-white border border-fog rounded-2xl p-4 shadow-sm hover:shadow-md transition-all font-openrunde">
      <div className="flex items-center justify-between pb-3 border-b border-fog">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-mist flex items-center justify-center text-carbon">
            <HugeiconsIcon icon={IconComponent} size={16} />
          </div>
          <h4 className="text-sm font-semibold text-carbon tracking-tight">{title}</h4>
        </div>
        <span className="text-[11px] font-medium text-ash cursor-pointer hover:text-lavender transition-colors">
          View all
        </span>
      </div>

      <div className="divide-y divide-fog">
        {items.slice(0, 3).map((item, idx) => {
          const isUp = Number(item.percentChange24h ?? item.change ?? 0) >= 0;
          return (
            <div
              key={item.symbol || idx}
              onClick={() => onSelectSymbol && onSelectSymbol(item.symbol)}
              className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-mist px-1.5 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xs text-ash font-semibold w-3">{idx + 1}</span>
                <img
                  src={getCryptoIcon(item.symbol)}
                  alt={item.symbol}
                  className="w-6 h-6 object-contain rounded-full bg-white border border-fog p-0.5 shadow-xs"
                  onError={(e) => {
                    e.target.src = "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/generic.png";
                  }}
                />
                <div>
                  <span className="font-semibold text-xs text-carbon block">{item.symbol}</span>
                  <span className="text-[11px] text-ash block">{item.name || item.symbol}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-semibold text-carbon block">
                  {formatCurrency(item.currentPrice || item.price)}
                </span>
                <span className={`text-[11px] font-medium ${isUp ? "text-mint" : "text-ember"}`}>
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

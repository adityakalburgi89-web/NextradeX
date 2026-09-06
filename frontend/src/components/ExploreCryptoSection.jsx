import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchAllPrices, getCachedPrices } from "../api";
import { useWebSocket } from "../hooks/useWebSocket";
import { formatCurrency } from "../lib/utils";

// Import real official vector SVG crypto icons from assets/Icons
import btcIcon from "../assets/Icons/btc.svg";
import ethIcon from "../assets/Icons/eth.svg";
import usdtIcon from "../assets/Icons/usdt.svg";
import bnbIcon from "../assets/Icons/bnb.svg";
import usdcIcon from "../assets/Icons/usdc.svg";
import xrpIcon from "../assets/Icons/xrp.svg";
import solIcon from "../assets/Icons/sol.svg";
import suiIcon from "../assets/Icons/sui.svg";
import arbIcon from "../assets/Icons/arb.svg";

// Asset dataset definitions with trading symbols for backend matching
const tradableAssets = [
  {
    id: "btc",
    name: "Bitcoin",
    symbol: "BTCUSDT",
    icon: btcIcon,
    defaultPrice: 63803.33,
    defaultChange: -1.23,
  },
  {
    id: "eth",
    name: "Ethereum",
    symbol: "ETHUSDT",
    icon: ethIcon,
    defaultPrice: 2614.50,
    defaultChange: -1.01,
  },
  {
    id: "usdt",
    name: "Tether",
    symbol: "USDTUSDT",
    icon: usdtIcon,
    defaultPrice: 1.00,
    defaultChange: 0.01,
  },
  {
    id: "bnb",
    name: "BNB",
    symbol: "BNBUSDT",
    icon: bnbIcon,
    defaultPrice: 580.66,
    defaultChange: -0.72,
  },
  {
    id: "usdc",
    name: "USDC",
    symbol: "USDCUSDT",
    icon: usdcIcon,
    defaultPrice: 1.00,
    defaultChange: 0.0,
    isNeutral: true,
  },
  {
    id: "xrp",
    name: "XRP",
    symbol: "XRPUSDT",
    icon: xrpIcon,
    defaultPrice: 0.58,
    defaultChange: -0.91,
  },
];

const topGainersAssets = [
  {
    id: "sol",
    name: "Solana",
    symbol: "SOLUSDT",
    icon: solIcon,
    defaultPrice: 145.20,
    defaultChange: 8.45,
  },
  {
    id: "sui",
    name: "Sui",
    symbol: "SUIUSDT",
    icon: suiIcon,
    defaultPrice: 1.84,
    defaultChange: 7.12,
  },
  {
    id: "arb",
    name: "Arbitrum",
    symbol: "ARBUSDT",
    icon: arbIcon,
    defaultPrice: 0.74,
    defaultChange: 5.80,
  },
  {
    id: "usdt",
    name: "Tether",
    symbol: "USDTUSDT",
    icon: usdtIcon,
    defaultPrice: 1.00,
    defaultChange: 0.01,
  },
  {
    id: "btc",
    name: "Bitcoin",
    symbol: "BTCUSDT",
    icon: btcIcon,
    defaultPrice: 63803.33,
    defaultChange: -1.23,
  },
  {
    id: "eth",
    name: "Ethereum",
    symbol: "ETHUSDT",
    icon: ethIcon,
    defaultPrice: 2614.50,
    defaultChange: -1.01,
  },
];

export default function ExploreCryptoSection({ prices: initialPrices }) {
  const [prices, setPrices] = useState(initialPrices || getCachedPrices() || []);
  const [activeTab, setActiveTab] = useState("tradable");

  const handlePriceUpdate = (payload) => {
    if (Array.isArray(payload) && payload.length > 0) {
      setPrices(payload);
    } else if (payload?.symbol) {
      setPrices((prev) => {
        const idx = prev.findIndex((p) => p.symbol === payload.symbol);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], ...payload };
          return next;
        }
        return [...prev, payload];
      });
    }
  };

  useWebSocket("/topic/prices", handlePriceUpdate, true);

  useEffect(() => {
    if (initialPrices && initialPrices.length > 0) {
      setPrices(initialPrices);
    } else {
      fetchAllPrices()
        .then((res) => {
          if (res?.data) {
            setPrices(res.data);
          }
        })
        .catch(() => {});
    }
  }, [initialPrices]);

  const getActiveAssets = () => {
    const rawList = activeTab === "gainers" ? topGainersAssets : tradableAssets;

    return rawList.map((asset) => {
      const live = prices.find((p) => p.symbol === asset.symbol);

      const rawPrice = live?.currentPrice ?? live?.price ?? asset.defaultPrice;
      const rawChange =
        live?.percentChange24h ?? live?.change24h ?? live?.changePercent24h ?? asset.defaultChange;

      const numericPrice = Number(rawPrice);
      const numericChange = Number(rawChange);

      const formattedPrice = formatCurrency(numericPrice, {
        maximumFractionDigits: numericPrice < 1 ? 4 : 2,
        minimumFractionDigits: numericPrice < 1 ? 2 : 2,
      });

      const isNeutral = asset.isNeutral || (numericChange === 0 && asset.symbol.includes("USDC"));
      const isNegative = numericChange < 0;
      const formattedChange = `${Math.abs(numericChange).toFixed(2)}%`;

      return {
        ...asset,
        price: formattedPrice,
        change: formattedChange,
        isNegative,
        isNeutral,
      };
    });
  };

  const assets = getActiveAssets();

  return (
    <section className="w-full bg-[hsl(0,0%,98%)] py-20 sm:py-28 px-6 overflow-hidden font-openrunde">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        
        {/* Left Column: Visitors Style Engineered Typography */}
        <div className="lg:col-span-5 space-y-6 text-left">
          {/* Display Headline: OpenRunde display weight with tight negative tracking */}
          <h2 className="font-openrunde text-[40px] sm:text-[48px] md:text-[54px] font-semibold text-[#181925] tracking-[-2.2px] leading-[1.12]">
            Explore crypto like Bitcoin, Ethereum, and Dogecoin.
          </h2>

          {/* Body Subtitle: Subordinate Graphite (#666666) text */}
          <p className="font-openrunde text-base sm:text-lg text-[#666666] leading-relaxed tracking-[-0.32px] max-w-md">
            Simply and securely buy, sell, and manage hundreds of cryptocurrencies.
          </p>

          {/* Primary Action Button (Filled): Lavender (#918df6) CTA pill button */}
          <div className="pt-2">
            <Link
              to="/markets"
              className="inline-flex items-center justify-center bg-[#918df6] hover:bg-[#807be8] text-white font-medium rounded-full px-6 py-3 text-sm sm:text-base tracking-[-0.32px] transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_1px_1px_1px_rgba(0,0,0,0.08),0_0_0_0.5px_rgba(0,0,0,0.06)]"
            >
              See more assets
            </Link>
          </div>
        </div>

        {/* Right Column: Clean Blueprint Card Showcase */}
        <div className="lg:col-span-7 w-full flex justify-center lg:justify-end">
          <div className="w-full max-w-[580px] lg:max-w-none bg-[hsl(0,0%,98%)] border border-[#e8e8e8] rounded-[28px] sm:rounded-[36px] p-8 sm:p-12 lg:p-14 shadow-[0_12px_40px_rgba(0,0,0,0.06)] text-[#181925]">
            
            {/* Header Navigation Tabs: Visitors Pill Tab Row */}
            <div className="flex items-center gap-2 sm:gap-3 pb-6 sm:pb-8 pt-1 px-1 sm:px-2 text-xs sm:text-sm font-medium border-b border-[#e8e8e8]">
              <button
                onClick={() => setActiveTab("tradable")}
                className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-full transition-all duration-200 ${
                  activeTab === "tradable"
                    ? "bg-[#181925] text-white font-semibold shadow-xs"
                    : "text-[#999999] hover:text-[#181925]"
                }`}
              >
                Tradable
              </button>
              <button
                onClick={() => setActiveTab("gainers")}
                className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-full transition-all duration-200 ${
                  activeTab === "gainers"
                    ? "bg-[#181925] text-white font-semibold shadow-xs"
                    : "text-[#999999] hover:text-[#181925]"
                }`}
              >
                Top gainers
              </button>
            </div>

            {/* Crypto Asset List Rows */}
            <div className="pt-6 sm:pt-8 space-y-2 sm:space-y-3">
              {assets.map((asset) => (
                <div
                  key={`${asset.id}-${asset.symbol}`}
                  className="flex items-center justify-between py-4 px-4 sm:px-6 rounded-2xl hover:bg-[#f5f5f7] transition-colors duration-150 group cursor-pointer"
                >
                  {/* Left: Real Official Crypto Logo + Asset Name */}
                  <div className="flex items-center gap-4 sm:gap-5">
                    <img
                      src={asset.icon}
                      alt={asset.name}
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-contain shrink-0 drop-shadow-xs"
                    />
                    <span className="font-openrunde font-semibold text-lg sm:text-xl text-[#181925] tracking-[-0.4px]">
                      {asset.name}
                    </span>
                  </div>

                  {/* Right: Price & Percentage Deltas (Mint #33c758 for positive, Ember #ff3e00 for negative) */}
                  <div className="text-right space-y-1">
                    <div className="font-openrunde font-semibold text-lg sm:text-xl text-[#181925] tracking-[-0.4px]">
                      {asset.price}
                    </div>
                    <div className="flex items-center justify-end gap-1 text-xs sm:text-sm font-semibold tracking-tight">
                      {asset.isNeutral ? (
                        <span className="text-[#999999]">--</span>
                      ) : asset.isNegative ? (
                        <span className="text-[#ff3e00] flex items-center gap-0.5">
                          <svg className="w-3.5 h-3.5 fill-current inline" viewBox="0 0 12 12">
                            <path d="M9.5 2.5L2.5 9.5M2.5 9.5H8.5M2.5 9.5V3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          {asset.change}
                        </span>
                      ) : (
                        <span className="text-[#33c758] flex items-center gap-0.5">
                          <svg className="w-3.5 h-3.5 fill-current inline" viewBox="0 0 12 12">
                            <path d="M2.5 9.5L9.5 2.5M9.5 2.5H3.5M9.5 2.5V8.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          {asset.change}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}


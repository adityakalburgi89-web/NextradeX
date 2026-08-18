import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  StarIcon,
  FavouriteIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons";

import { fetchAllPrices, fetchGlobalMarketStats } from "../api";
import { PageTransition } from "../components/ui/PageTransition";
import { Skeleton } from "../components/ui/Skeleton";
import { useWebSocket } from "../hooks/useWebSocket";
import { formatCompactNumber, formatCurrency, formatPercent } from "../lib/utils";

import GlobalMarketHeader from "../components/markets/GlobalMarketHeader";
import MarketHighlightCard from "../components/markets/MarketHighlightCard";
import SparklineChart from "../components/markets/SparklineChart";
import UniversalCoinIcon from "../lib/coinIcons";

const cryptoFullNameMap = {
  BTCUSDT: "Bitcoin",
  ETHUSDT: "Ethereum",
  SOLUSDT: "Solana",
  BNBUSDT: "BNB Chain",
  DOTUSDT: "Polkadot",
  LINKUSDT: "Chainlink",
  LTCUSDT: "Litecoin",
  XRPUSDT: "XRP Ledger",
  ADAUSDT: "Cardano",
  DOGEUSDT: "Dogecoin",
  AVAXUSDT: "Avalanche",
  PEPEUSDT: "Pepe Coin",
  WIFUSDT: "dogwifhat",
  SUIUSDT: "Sui Network",
  TONUSDT: "Toncoin",
  NEARUSDT: "NEAR Protocol",
  ARBUSDT: "Arbitrum",
  OPUSDT: "Optimism",
  TIAUSDT: "Celestia",
  SEIUSDT: "Sei Network",
};

const cryptoCategoryMap = {
  BTCUSDT: "Layer 1",
  ETHUSDT: "Layer 1",
  SOLUSDT: "Layer 1",
  BNBUSDT: "Layer 1",
  DOTUSDT: "Layer 1",
  LINKUSDT: "DeFi",
  LTCUSDT: "Layer 1",
  XRPUSDT: "Layer 1",
  ADAUSDT: "Layer 1",
  DOGEUSDT: "Meme",
  AVAXUSDT: "Layer 1",
  PEPEUSDT: "Meme",
  WIFUSDT: "Meme",
  SUIUSDT: "Layer 1",
  TONUSDT: "Layer 1",
  NEARUSDT: "AI Tokens",
  ARBUSDT: "Layer 2",
  OPUSDT: "Layer 2",
  TIAUSDT: "Modular",
  SEIUSDT: "Layer 1",
};

export default function MarketsPage() {
  const navigate = useNavigate();
  const [prices, setPrices] = useState([]);
  const [globalStats, setGlobalStats] = useState(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [favorites, setFavorites] = useState(new Set(["BTCUSDT", "ETHUSDT", "SOLUSDT"]));

  const handlePriceUpdate = (payload) => {
    if (Array.isArray(payload) && payload.length > 0) {
      setPrices(payload);
    } else if (payload?.symbol) {
      setPrices((previousPrices) => {
        const existingIndex = previousPrices.findIndex((price) => price.symbol === payload.symbol);
        if (existingIndex >= 0) {
          const nextPrices = [...previousPrices];
          nextPrices[existingIndex] = { ...nextPrices[existingIndex], ...payload };
          return nextPrices;
        }
        return [...previousPrices, payload];
      });
    }
  };

  const { connected } = useWebSocket("/topic/prices", handlePriceUpdate, true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [pricesRes, statsRes] = await Promise.allSettled([
          fetchAllPrices(),
          fetchGlobalMarketStats(),
        ]);

        if (pricesRes.status === "fulfilled" && pricesRes.value?.data) {
          setPrices(pricesRes.value.data);
        }

        if (statsRes.status === "fulfilled" && statsRes.value?.data) {
          setGlobalStats(statsRes.value.data);
        }
      } catch (err) {
        console.error("Failed to load real market data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const toggleFavorite = (symbol, e) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(symbol)) {
        next.delete(symbol);
      } else {
        next.add(symbol);
      }
      return next;
    });
  };

  const trendingCoins = useMemo(() => {
    return [...prices]
      .sort((a, b) => Number(b.volume24h || 0) - Number(a.volume24h || 0))
      .slice(0, 3)
      .map((p) => ({ ...p, name: cryptoFullNameMap[p.symbol] || p.symbol }));
  }, [prices]);

  const topGainers = useMemo(() => {
    return [...prices]
      .sort((a, b) => Number(b.percentChange24h || 0) - Number(a.percentChange24h || 0))
      .slice(0, 3)
      .map((p) => ({ ...p, name: cryptoFullNameMap[p.symbol] || p.symbol }));
  }, [prices]);

  const newListings = useMemo(() => {
    return prices.slice(-3).map((p) => ({ ...p, name: cryptoFullNameMap[p.symbol] || p.symbol }));
  }, [prices]);

  const categories = ["All", "Favorites", "Layer 1", "Layer 2", "DeFi", "AI Tokens", "Meme"];

  const filteredPrices = useMemo(() => {
    return prices.filter((price) => {
      const matchesQuery = !query
        ? true
        : price.symbol?.toLowerCase().includes(query.toLowerCase()) ||
          cryptoFullNameMap[price.symbol]?.toLowerCase().includes(query.toLowerCase());

      if (!matchesQuery) return false;

      if (activeCategory === "Favorites") {
        return favorites.has(price.symbol);
      }

      if (activeCategory === "All") return true;

      const category = cryptoCategoryMap[price.symbol];
      return category === activeCategory;
    });
  }, [prices, query, activeCategory, favorites]);

  return (
    <PageTransition>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-32 sm:pt-36 pb-24 space-y-10 font-openrunde">
        {/* Global Market Telemetry Header */}
        <GlobalMarketHeader globalStats={globalStats || undefined} />

        {/* Top Market Highlights Cards Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MarketHighlightCard
            type="trending"
            title="Trending Coins"
            items={trendingCoins}
            onSelectSymbol={(sym) => navigate(`/trade/spot?symbol=${sym}`)}
          />
          <MarketHighlightCard
            type="gainers"
            title="Top Gainers"
            items={topGainers}
            onSelectSymbol={(sym) => navigate(`/trade/spot?symbol=${sym}`)}
          />
          <MarketHighlightCard
            type="newListings"
            title="New Listings"
            items={newListings}
            onSelectSymbol={(sym) => navigate(`/trade/spot?symbol=${sym}`)}
          />
        </div>

        {/* Visitors Engineered White Card Container */}
        <div className="bg-white border border-[#e8e8e8] rounded-[28px] sm:rounded-[36px] p-6 sm:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.04)] space-y-8">
          
          {/* Header Row & Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#e8e8e8]">
            <div className="space-y-1">
              <h2 className="font-openrunde text-2xl sm:text-3xl font-semibold text-[#181925] tracking-[-1px]">
                Cryptocurrency Prices by Market Cap
              </h2>
              <p className="font-openrunde text-sm text-[#666666] tracking-[-0.32px]">
                Real-time streaming market data, 24h metrics, and live price trend charts.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto">
              <span className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-[-0.32px] flex items-center gap-2 ${connected ? "bg-[#def6e4] text-[#33c758]" : "bg-[#f5f5f5] text-[#999999]"}`}>
                <span className={`w-2 h-2 rounded-full ${connected ? "bg-[#33c758] animate-pulse" : "bg-[#999999]"}`} />
                {connected ? "LIVE FEED" : "SNAPSHOT"}
              </span>

              {/* Search Pill Input */}
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  placeholder="Search coin (e.g. BTC, Solana)..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-[#f5f5f5] focus:bg-white border border-[#e8e8e8] focus:border-[#918df6] rounded-full py-2 px-4 pl-10 text-xs sm:text-sm text-[#181925] placeholder-[#999999] tracking-[-0.32px] outline-none transition-all"
                />
                <HugeiconsIcon icon={Search01Icon} size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999999]" />
              </div>
            </div>
          </div>

          {/* Category Navigation Pill Tabs */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 flex items-center gap-2 tracking-[-0.32px] ${
                    isActive
                      ? "bg-[#181925] text-white font-semibold shadow-xs"
                      : "bg-[#f5f5f5] text-[#666666] hover:bg-[#e8e8e8] hover:text-[#181925]"
                  }`}
                >
                  {cat === "Favorites" && <HugeiconsIcon icon={StarIcon} size={14} className={isActive ? "text-[#ffa600]" : "text-[#999999]"} />}
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>

          {/* Visitors Engineered Data Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-6 space-y-4">
                {[...Array(6)].map((_, idx) => (
                  <div key={idx} className="flex justify-between items-center py-4 border-b border-[#e8e8e8]">
                    <Skeleton className="h-4 w-8 rounded-full" />
                    <Skeleton className="h-4 w-24 rounded-full" />
                    <Skeleton className="h-4 w-20 rounded-full" />
                    <Skeleton className="h-4 w-16 rounded-full" />
                    <Skeleton className="h-4 w-24 rounded-full" />
                    <Skeleton className="h-9 w-24 rounded-full" />
                  </div>
                ))}
              </div>
            ) : (
              <table className="w-full text-left border-collapse font-openrunde">
                <thead>
                  <tr className="border-b border-[#e8e8e8] text-xs font-semibold text-[#999999] uppercase tracking-wider">
                    <th className="pb-4 px-2 text-center w-8">
                      <HugeiconsIcon icon={StarIcon} size={14} className="inline opacity-60" />
                    </th>
                    <th className="pb-4 px-3"># Rank</th>
                    <th className="pb-4 px-4">Name & Symbol</th>
                    <th className="pb-4 px-4 text-right">Price</th>
                    <th className="pb-4 px-4 text-right">24h Change</th>
                    <th className="pb-4 px-4 text-right">24h High / Low</th>
                    <th className="pb-4 px-4 text-right">Market Cap</th>
                    <th className="pb-4 px-4 text-right">24h Volume</th>
                    <th className="pb-4 px-4 text-center">7D Trend</th>
                    <th className="pb-4 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e8e8e8] text-sm font-medium">
                  {filteredPrices.map((price, idx) => {
                    const isUp = Number(price.percentChange24h) >= 0;
                    const isFav = favorites.has(price.symbol);
                    const fullName = cryptoFullNameMap[price.symbol] || price.symbol;
                    const marketCapVal = price.marketCap || (Number(price.currentPrice || 0) * 19700000);

                    return (
                      <tr
                        key={price.symbol}
                        className="hover:bg-[#fafafa] transition-colors duration-150 cursor-pointer group"
                        onClick={() => navigate(`/trade/spot?symbol=${price.symbol}`)}
                      >
                        {/* Star Favorite */}
                        <td className="py-4.5 px-2 text-center" onClick={(e) => toggleFavorite(price.symbol, e)}>
                          <div className="flex items-center justify-center cursor-pointer">
                            <HugeiconsIcon
                              icon={FavouriteIcon}
                              size={16}
                              className={`transition-colors ${isFav ? "text-[#ffa600] fill-[#ffa600]" : "text-[#999999] opacity-40 group-hover:opacity-100"}`}
                            />
                          </div>
                        </td>

                        {/* Rank */}
                        <td className="py-4.5 px-3 text-[#999999] font-medium text-xs sm:text-sm">{idx + 1}</td>

                        {/* Name & Symbol using UniversalCoinIcon */}
                        <td className="py-4.5 px-4">
                          <div className="flex items-center gap-3.5">
                            <UniversalCoinIcon symbol={price.symbol} size="w-8 h-8" className="drop-shadow-xs" />
                            <div>
                              <span className="font-semibold text-[#181925] text-sm sm:text-base block tracking-[-0.32px] group-hover:text-[#918df6] transition-colors">
                                {fullName}
                              </span>
                              <span className="text-xs text-[#999999] block uppercase tracking-wider">{price.symbol}</span>
                            </div>
                          </div>
                        </td>

                        {/* Last Price */}
                        <td className="py-4.5 px-4 text-right font-semibold text-[#181925] text-sm sm:text-base tracking-[-0.32px]">
                          {formatCurrency(price.currentPrice)}
                        </td>

                        {/* 24h Change */}
                        <td className="py-4.5 px-4 text-right">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold tracking-tight ${
                              isUp ? "bg-[#def6e4] text-[#33c758]" : "bg-[#fff0f0] text-[#ff3e00]"
                            }`}
                          >
                            <HugeiconsIcon icon={isUp ? ArrowUp01Icon : ArrowDown01Icon} size={12} />
                            {formatPercent(price.percentChange24h)}
                          </span>
                        </td>

                        {/* 24h High / Low */}
                        <td className="py-4.5 px-4 text-right text-xs tracking-[-0.32px]">
                          <div>
                            <span className="text-[#181925] font-semibold">{formatCurrency(price.highPrice || price.currentPrice)}</span>
                            <span className="block text-[#999999]">{formatCurrency(price.lowPrice || price.currentPrice)}</span>
                          </div>
                        </td>

                        {/* Market Cap */}
                        <td className="py-4.5 px-4 text-right text-[#181925] font-semibold text-xs sm:text-sm tracking-[-0.32px]">
                          {formatCurrency(marketCapVal, { notation: "compact" })}
                        </td>

                        {/* 24h Volume */}
                        <td className="py-4.5 px-4 text-right text-[#666666] text-xs sm:text-sm tracking-[-0.32px]">
                          {formatCompactNumber(price.volume24h)}
                        </td>

                        {/* 7D Trend Sparkline */}
                        <td className="py-4.5 px-4 text-center">
                          <SparklineChart isPositive={isUp} width={100} height={32} />
                        </td>

                        {/* Action Trade Button: Lavender Pill Button */}
                        <td className="py-4.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            className="bg-[#918df6] hover:bg-[#807be8] text-white font-medium rounded-full px-5 py-2 text-xs sm:text-sm tracking-[-0.32px] transition-all transform hover:scale-[1.03] active:scale-[0.97] shadow-[0_1px_1px_1px_rgba(0,0,0,0.08),0_0_0_0.5px_rgba(0,0,0,0.06)]"
                            onClick={() => navigate(`/trade/spot?symbol=${price.symbol}`)}
                          >
                            Trade
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredPrices.length === 0 && (
                    <tr>
                      <td colSpan={10} className="py-16 text-center text-sm text-[#999999]">
                        No cryptocurrencies match your filter or search query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

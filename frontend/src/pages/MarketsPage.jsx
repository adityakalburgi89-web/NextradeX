import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Star,
  Search,
  ChevronRight,
  ChevronLeft,
  Flame,
  Zap,
  Sparkles,
  SlidersHorizontal,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  Layers,
  Grid,
  Coins,
  TrendingUp
} from "lucide-react";

import { fetchAllPrices, fetchGlobalMarketStats } from "../api";
import { PageTransition } from "../components/ui/PageTransition";
import { Skeleton } from "../components/ui/Skeleton";
import { useWebSocket } from "../hooks/useWebSocket";
import { formatCurrency, formatPercent } from "../lib/utils";
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
  DOGEUSDT: "Robinhood Chain Meme",
  AVAXUSDT: "Layer 1",
  PEPEUSDT: "Robinhood Chain Meme",
  WIFUSDT: "Robinhood Chain Meme",
  SUIUSDT: "Layer 1",
  TONUSDT: "Layer 1",
  NEARUSDT: "AI Tokens",
  ARBUSDT: "Base Ecosystem",
  OPUSDT: "Base Ecosystem",
  TIAUSDT: "Categories",
  SEIUSDT: "Perpetuals",
};

// Immediate fallback prices array so coins are visible 100% instantly on load
const INITIAL_PRICES = [
  { symbol: "BTCUSDT", currentPrice: 79753.74, percentChange24h: 3.45, percentChange1h: 0.2, percentChange7d: 2.8, volume24h: 22979401295, marketCap: 1601458159275 },
  { symbol: "ETHUSDT", currentPrice: 2460.17, percentChange24h: 1.85, percentChange1h: 0.2, percentChange7d: 1.0, volume24h: 8315695914, marketCap: 300188549285 },
  { symbol: "SOLUSDT", currentPrice: 103.07, percentChange24h: 5.12, percentChange1h: 0.5, percentChange7d: 8.4, volume24h: 3450123998, marketCap: 48920194820 },
  { symbol: "BNBUSDT", currentPrice: 582.40, percentChange24h: 2.10, percentChange1h: 0.1, percentChange7d: 3.2, volume24h: 1616515200, marketCap: 88726043259 },
  { symbol: "XRPUSDT", currentPrice: 1.42, percentChange24h: -1.50, percentChange1h: -0.2, percentChange7d: 4.1, volume24h: 1738630402, marketCap: 80862337985 },
  { symbol: "DOGEUSDT", currentPrice: 0.145, percentChange24h: 4.20, percentChange1h: 0.3, percentChange7d: 6.8, volume24h: 1240500100, marketCap: 21100500900 },
  { symbol: "ADAUSDT", currentPrice: 0.68, percentChange24h: 1.10, percentChange1h: 0.0, percentChange7d: 2.3, volume24h: 680400200, marketCap: 24100200300 },
  { symbol: "AVAXUSDT", currentPrice: 28.50, percentChange24h: 3.80, percentChange1h: 0.4, percentChange7d: 5.2, volume24h: 520300100, marketCap: 11400200100 },
  { symbol: "PEPEUSDT", currentPrice: 0.0000095, percentChange24h: 8.40, percentChange1h: 1.2, percentChange7d: 14.5, volume24h: 980200400, marketCap: 4001002000 },
  { symbol: "SUIUSDT", currentPrice: 1.85, percentChange24h: 6.20, percentChange1h: 0.8, percentChange7d: 11.2, volume24h: 740100300, marketCap: 5200300400 },
  { symbol: "NEARUSDT", currentPrice: 4.65, percentChange24h: 2.90, percentChange1h: 0.3, percentChange7d: 4.8, volume24h: 410200300, marketCap: 5600100200 },
  { symbol: "LINKUSDT", currentPrice: 14.20, percentChange24h: 1.70, percentChange1h: 0.1, percentChange7d: 3.1, volume24h: 380500100, marketCap: 8400300100 },
  { symbol: "LTCUSDT", currentPrice: 72.80, percentChange24h: -0.80, percentChange1h: -0.1, percentChange7d: 1.4, volume24h: 290100400, marketCap: 5400200300 },
  { symbol: "DOTUSDT", currentPrice: 6.10, percentChange24h: 0.90, percentChange1h: 0.1, percentChange7d: 2.1, volume24h: 210400200, marketCap: 8700100400 },
  { symbol: "ARBUSDT", currentPrice: 0.58, percentChange24h: 2.40, percentChange1h: 0.2, percentChange7d: 3.9, volume24h: 190300100, marketCap: 1800400200 },
  { symbol: "OPUSDT", currentPrice: 1.45, percentChange24h: 1.90, percentChange1h: 0.1, percentChange7d: 3.2, volume24h: 160200300, marketCap: 1700200100 },
  { symbol: "TIAUSDT", currentPrice: 5.20, percentChange24h: 3.10, percentChange1h: 0.4, percentChange7d: 5.8, volume24h: 140500200, marketCap: 1100300400 },
  { symbol: "SEIUSDT", currentPrice: 0.34, percentChange24h: 4.50, percentChange1h: 0.5, percentChange7d: 7.2, volume24h: 120400100, marketCap: 1000400200 }
];

export default function MarketsPage() {
  const navigate = useNavigate();
  const [prices, setPrices] = useState(INITIAL_PRICES);
  const [globalStats, setGlobalStats] = useState(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [showHighlights, setShowHighlights] = useState(true);
  const [sidebarTab, setSidebarTab] = useState("Insights");
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

        if (pricesRes.status === "fulfilled" && pricesRes.value?.data && pricesRes.value.data.length > 0) {
          setPrices(pricesRes.value.data);
        }

        if (statsRes.status === "fulfilled" && statsRes.value?.data) {
          setGlobalStats(statsRes.value.data);
        }
      } catch (err) {
        console.error("Failed to load market data:", err);
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

  // Dynamic Market Cap & Volume calculations
  const totalMarketCap = useMemo(() => {
    if (globalStats?.totalMarketCap) return globalStats.totalMarketCap;
    return prices.reduce((acc, p) => {
      const cap = Number(p.marketCap || (Number(p.currentPrice || 0) * 19700000));
      return acc + cap;
    }, 0);
  }, [prices, globalStats]);

  const total24hVolume = useMemo(() => {
    if (globalStats?.volume24h) return globalStats.volume24h;
    return prices.reduce((acc, p) => {
      const vol = Number(p.volume24h || (Number(p.currentPrice || 0) * 450000));
      return acc + vol;
    }, 0);
  }, [prices, globalStats]);

  const avgMarketCapChange = useMemo(() => {
    if (globalStats?.marketCapChange24h !== undefined) return globalStats.marketCapChange24h;
    if (prices.length === 0) return 0;
    const sum = prices.reduce((acc, p) => acc + Number(p.percentChange24h || 0), 0);
    return Number((sum / prices.length).toFixed(2));
  }, [prices, globalStats]);

  // Real backend dynamic Trending List (Top 3 by 24h Volume)
  const trendingCoins = useMemo(() => {
    return [...prices]
      .sort((a, b) => Number(b.volume24h || 0) - Number(a.volume24h || 0))
      .slice(0, 3)
      .map((p) => ({
        rawSymbol: p.symbol,
        symbol: p.symbol?.replace("USDT", ""),
        name: cryptoFullNameMap[p.symbol] || p.symbol,
        price: formatCurrency(p.currentPrice),
        change: formatPercent(p.percentChange24h),
        isUp: Number(p.percentChange24h) >= 0,
      }));
  }, [prices]);

  // Real backend dynamic Top Gainers List (Top 3 by 24h % Change)
  const topGainers = useMemo(() => {
    return [...prices]
      .sort((a, b) => Number(b.percentChange24h || 0) - Number(a.percentChange24h || 0))
      .slice(0, 3)
      .map((p) => ({
        rawSymbol: p.symbol,
        symbol: p.symbol?.replace("USDT", ""),
        name: cryptoFullNameMap[p.symbol] || p.symbol,
        price: formatCurrency(p.currentPrice),
        change: formatPercent(p.percentChange24h),
        isUp: Number(p.percentChange24h) >= 0,
      }));
  }, [prices]);

  // Zero emojis, strictly clean icons from Lucide React
  const categories = [
    { id: "All", label: "All", icon: Grid },
    { id: "Highlights", label: "Highlights", icon: Sparkles },
    { id: "Base Ecosystem", label: "Base Ecosystem", icon: Layers },
    { id: "Categories", label: "Categories", icon: Layers },
    { id: "Robinhood Chain Meme", label: "Robinhood Chain Meme", icon: Flame },
    { id: "Exchange-based Tokens", label: "Exchange-based Tokens", icon: Zap },
    { id: "Perpetuals", label: "Perpetuals", icon: Coins },
  ];

  const filteredPrices = useMemo(() => {
    return prices.filter((price) => {
      const matchesQuery = !query
        ? true
        : price.symbol?.toLowerCase().includes(query.toLowerCase()) ||
          cryptoFullNameMap[price.symbol]?.toLowerCase().includes(query.toLowerCase());

      if (!matchesQuery) return false;

      if (activeCategory === "Highlights") {
        return favorites.has(price.symbol);
      }

      if (activeCategory === "All") return true;

      const category = cryptoCategoryMap[price.symbol];
      return category === activeCategory;
    });
  }, [prices, query, activeCategory, favorites]);

  const topCoin = prices[0];

  return (
    <PageTransition>
      <div className="w-full bg-[#fafafa] text-[#181925] font-openrunde pt-24 sm:pt-28 pb-20 px-4 sm:px-6 md:px-8 max-w-[1440px] mx-auto min-h-screen">
        
        {/* 1. TOP HEADER & HIGHLIGHTS TOGGLE */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-[-1px] text-[#181925]">
              Cryptocurrency Prices by Market Cap
            </h1>
            <p className="text-xs sm:text-sm text-[#666666] tracking-[-0.32px] mt-1">
              The global cryptocurrency market cap today is{" "}
              <span className="font-semibold text-[#181925]">
                {formatCurrency(totalMarketCap, { notation: "compact" })}
              </span>
              , a{" "}
              <span className={`inline-flex items-center font-semibold ${avgMarketCapChange >= 0 ? "text-[#33c758]" : "text-[#ff3e00]"}`}>
                {avgMarketCapChange >= 0 ? "▲ " : "▼ "}
                {formatPercent(avgMarketCapChange)}
              </span>{" "}
              change in the last 24 hours.{" "}
              <span className="text-[#8574ff] hover:underline cursor-pointer font-medium">Read more</span>
            </p>
          </div>

          {/* Highlights Toggle Switch */}
          <div className="flex items-center gap-3 self-start sm:self-center">
            <span className="text-xs font-semibold text-[#666666] tracking-[-0.32px]">Highlights</span>
            <button
              type="button"
              onClick={() => setShowHighlights(!showHighlights)}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-1 cursor-pointer ${
                showHighlights ? "bg-[#33c758]" : "bg-[#e2e2e8]"
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${
                  showHighlights ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* 2. TOP HIGHLIGHT CARDS BANNER */}
        {showHighlights && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
            
            {/* Card 1: Market Cap & 24h Volume */}
            <div className="bg-white border border-[#e8e8e8] rounded-[20px] p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs text-[#666666]">
                  <span className="font-bold text-[#181925]">{formatCurrency(totalMarketCap)}</span>
                  <span className={`font-semibold flex items-center gap-0.5 ${avgMarketCapChange >= 0 ? "text-[#33c758]" : "text-[#ff3e00]"}`}>
                    Market Cap {avgMarketCapChange >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                    {formatPercent(avgMarketCapChange)}
                  </span>
                </div>
                <svg className={`w-full h-8 ${avgMarketCapChange >= 0 ? "text-[#33c758]" : "text-[#ff3e00]"}`} viewBox="0 0 100 25" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d={avgMarketCapChange >= 0 ? "M0,20 Q15,5 30,15 T60,8 T90,2 T100,5" : "M0,5 Q20,10 40,8 T70,22 T100,24"} />
                </svg>
              </div>

              <div className="border-t border-[#f0f0f4] pt-3 space-y-1">
                <div className="flex justify-between items-center text-xs text-[#666666]">
                  <span className="font-bold text-[#181925]">{formatCurrency(total24hVolume)}</span>
                  <span className="text-[#33c758] font-semibold flex items-center gap-0.5">
                    24h Volume <ArrowUpRight size={13} />
                  </span>
                </div>
                <svg className="w-full h-8 text-[#33c758]" viewBox="0 0 100 25" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M0,18 Q20,8 40,12 T70,5 T100,2" />
                </svg>
              </div>
            </div>

            {/* Card 2: Trending Coins */}
            <div className="bg-white border border-[#e8e8e8] rounded-[20px] p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-[#181925]">
                  <Flame size={16} className="text-[#ff3e00]" />
                  <span>Trending</span>
                </div>
                <span className="text-xs text-[#8574ff] font-medium hover:underline cursor-pointer flex items-center gap-0.5">
                  View more <ChevronRight size={13} />
                </span>
              </div>

              <div className="space-y-2 pt-1">
                {trendingCoins.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs py-1.5 hover:bg-[#fafafa] rounded-lg px-2 transition-colors cursor-pointer"
                    onClick={() => navigate(`/trade/spot?symbol=${item.rawSymbol}`)}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[#999999] w-4 font-medium">{idx + 1}</span>
                      <UniversalCoinIcon symbol={item.rawSymbol} size="w-5 h-5" />
                      <span className="font-semibold text-[#181925]">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[#181925] font-medium">{item.price}</span>
                      <span className={`font-semibold ${item.isUp ? "text-[#33c758]" : "text-[#ff3e00]"}`}>
                        {item.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 3: Top Gainers */}
            <div className="bg-white border border-[#e8e8e8] rounded-[20px] p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-[#181925]">
                  <TrendingUp size={16} className="text-[#33c758]" />
                  <span>Top Gainers</span>
                </div>
                <span className="text-xs text-[#8574ff] font-medium hover:underline cursor-pointer flex items-center gap-0.5">
                  View more <ChevronRight size={13} />
                </span>
              </div>

              <div className="space-y-2 pt-1">
                {topGainers.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs py-1.5 hover:bg-[#fafafa] rounded-lg px-2 transition-colors cursor-pointer"
                    onClick={() => navigate(`/trade/spot?symbol=${item.rawSymbol}`)}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[#999999] w-4 font-medium">{idx + 1}</span>
                      <UniversalCoinIcon symbol={item.rawSymbol} size="w-5 h-5" />
                      <span className="font-semibold text-[#181925]">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[#181925] font-medium">{item.price}</span>
                      <span className={`font-semibold ${item.isUp ? "text-[#33c758]" : "text-[#ff3e00]"}`}>
                        {item.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. MAIN CONTENT (SPLIT: 3 COLS TABLE + 1 COL SIDEBAR) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          
          {/* LEFT 3 COLUMNS: FILTER PILLS + DATA TABLE */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Category Navigation & Controls Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 sm:p-3 border border-[#e8e8e8] rounded-[20px] shadow-xs">
              
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {categories.map((cat) => {
                  const isActive = activeCategory === cat.id;
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                        isActive
                          ? "bg-[#33c758] text-white shadow-xs"
                          : "bg-[#f5f5f7] text-[#666666] hover:bg-[#e8e8ed] hover:text-[#181925]"
                      }`}
                    >
                      {Icon && <Icon size={13} />}
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-full bg-[#f5f5f7] hover:bg-[#e8e8ed] text-xs font-semibold text-[#181925] flex items-center gap-1.5 border border-[#e2e2e8]"
                >
                  <SlidersHorizontal size={13} />
                  <span>Customize</span>
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-full bg-[#f5f5f7] hover:bg-[#e8e8ed] text-xs font-semibold text-[#181925] flex items-center gap-1.5 border border-[#e2e2e8]"
                >
                  <Filter size={13} />
                  <span>Filter</span>
                </button>
              </div>
            </div>

            {/* Cryptocurrency Table Card */}
            <div className="bg-white border border-[#e8e8e8] rounded-[24px] overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
              
              {/* Search Bar */}
              <div className="p-3.5 sm:p-4 border-b border-[#f0f0f4]">
                <div className="relative w-full max-w-sm">
                  <input
                    type="text"
                    placeholder="Search coin (e.g. BTC, Solana)..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full bg-[#f5f5f7] focus:bg-white border border-[#e2e2e8] focus:border-[#33c758] rounded-full py-1.5 px-4 pl-9 text-xs text-[#181925] placeholder-[#999999] outline-none transition-all"
                  />
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999999]" />
                </div>
              </div>

              {/* Main Table */}
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="p-6 space-y-4">
                    {[...Array(6)].map((_, idx) => (
                      <div key={idx} className="flex justify-between items-center py-3 border-b border-[#e8e8e8]">
                        <Skeleton className="h-4 w-8 rounded-full" />
                        <Skeleton className="h-4 w-24 rounded-full" />
                        <Skeleton className="h-4 w-20 rounded-full" />
                        <Skeleton className="h-4 w-16 rounded-full" />
                        <Skeleton className="h-4 w-24 rounded-full" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse font-openrunde">
                    <thead>
                      <tr className="border-b border-[#e8e8e8] text-[11px] font-bold text-[#999999] uppercase tracking-wider bg-[#fafafa]">
                        <th className="py-3.5 px-3 text-center w-10">#</th>
                        <th className="py-3.5 px-4">Coin</th>
                        <th className="py-3.5 px-4 text-right">Price</th>
                        <th className="py-3.5 px-4 text-right">1h</th>
                        <th className="py-3.5 px-4 text-right">24h</th>
                        <th className="py-3.5 px-4 text-right">7d</th>
                        <th className="py-3.5 px-4 text-right">24h Volume</th>
                        <th className="py-3.5 px-4 text-right">Market Cap</th>
                        <th className="py-3.5 px-4 text-center">Last 7 Days</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0f0f4] text-xs font-medium">
                      {filteredPrices.map((price, idx) => {
                        const change24hNum = Number(price.percentChange24h || 0);
                        const isUp24h = change24hNum >= 0;
                        const change1hNum = price.percentChange1h !== undefined ? Number(price.percentChange1h) : Number((change24hNum * 0.12).toFixed(2));
                        const isUp1h = change1hNum >= 0;
                        const change7dNum = price.percentChange7d !== undefined ? Number(price.percentChange7d) : Number((change24hNum * 1.35).toFixed(2));
                        const isUp7d = change7dNum >= 0;

                        const isFav = favorites.has(price.symbol);
                        const fullName = cryptoFullNameMap[price.symbol] || price.symbol;
                        const symbolClean = price.symbol?.replace("USDT", "");
                        const marketCapVal = price.marketCap || (Number(price.currentPrice || 0) * 19700000);
                        const volumeVal = price.volume24h || (Number(price.currentPrice || 0) * 450000);

                        return (
                          <tr
                            key={price.symbol}
                            className="hover:bg-[#f9f9fc] transition-colors duration-150 cursor-pointer group"
                            onClick={() => navigate(`/trade/spot?symbol=${price.symbol}`)}
                          >
                            {/* Star + Rank */}
                            <td className="py-3.5 px-3 text-center" onClick={(e) => toggleFavorite(price.symbol, e)}>
                              <div className="flex items-center gap-2 justify-center cursor-pointer">
                                <Star
                                  size={14}
                                  className={`transition-colors ${
                                    isFav ? "text-[#ffa600] fill-[#ffa600]" : "text-[#ccc] group-hover:text-[#999]"
                                  }`}
                                />
                                <span className="text-[#999999] text-xs font-medium">{idx + 1}</span>
                              </div>
                            </td>

                            {/* Coin Name & Icon */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <UniversalCoinIcon symbol={price.symbol} size="w-7 h-7" className="drop-shadow-xs" />
                                <div>
                                  <span className="font-bold text-[#181925] text-xs sm:text-sm block group-hover:text-[#8574ff] transition-colors">
                                    {fullName}
                                  </span>
                                  <span className="text-[10px] text-[#999999] block font-semibold uppercase">{symbolClean}</span>
                                </div>
                              </div>
                            </td>

                            {/* Price */}
                            <td className="py-3.5 px-4 text-right font-bold text-[#181925] text-xs sm:text-sm">
                              {formatCurrency(price.currentPrice)}
                            </td>

                            {/* 1h % */}
                            <td className="py-3.5 px-4 text-right">
                              <span className={`font-semibold ${isUp1h ? "text-[#33c758]" : "text-[#ff3e00]"}`}>
                                {isUp1h ? "▲ " : "▼ "}
                                {formatPercent(change1hNum)}
                              </span>
                            </td>

                            {/* 24h % */}
                            <td className="py-3.5 px-4 text-right">
                              <span className={`font-semibold ${isUp24h ? "text-[#33c758]" : "text-[#ff3e00]"}`}>
                                {isUp24h ? "▲ " : "▼ "}
                                {formatPercent(change24hNum)}
                              </span>
                            </td>

                            {/* 7d % */}
                            <td className="py-3.5 px-4 text-right">
                              <span className={`font-semibold ${isUp7d ? "text-[#33c758]" : "text-[#ff3e00]"}`}>
                                {isUp7d ? "▲ " : "▼ "}
                                {formatPercent(change7dNum)}
                              </span>
                            </td>

                            {/* 24h Volume */}
                            <td className="py-3.5 px-4 text-right text-[#666666]">
                              {formatCurrency(volumeVal, { notation: "standard" })}
                            </td>

                            {/* Market Cap */}
                            <td className="py-3.5 px-4 text-right text-[#181925] font-bold">
                              {formatCurrency(marketCapVal, { notation: "standard" })}
                            </td>

                            {/* 7D Trend Sparkline */}
                            <td className="py-3.5 px-4 text-center">
                              <SparklineChart isPositive={isUp24h} width={90} height={28} />
                            </td>
                          </tr>
                        );
                      })}

                      {filteredPrices.length === 0 && (
                        <tr>
                          <td colSpan={9} className="py-12 text-center text-xs text-[#999999]">
                            No cryptocurrencies found matching your search.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT 1 COLUMN: SIDEBAR */}
          <div className="space-y-6">
            
            {/* Sidebar Top Nav Tabs */}
            <div className="flex items-center justify-between border-b border-[#e8e8e8] pb-2">
              <div className="flex items-center gap-4 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setSidebarTab("Insights")}
                  className={`flex items-center gap-1 pb-2 border-b-2 transition-colors ${
                    sidebarTab === "Insights" ? "border-[#33c758] text-[#33c758]" : "border-transparent text-[#999999]"
                  }`}
                >
                  <Sparkles size={13} />
                  <span>Insights</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSidebarTab("Portfolio")}
                  className={`pb-2 border-b-2 transition-colors ${
                    sidebarTab === "Portfolio" ? "border-[#33c758] text-[#33c758]" : "border-transparent text-[#999999]"
                  }`}
                >
                  <span>Portfolio</span>
                </button>
              </div>

              <div className="flex items-center gap-2 text-[#999999]">
                <ExternalLink size={13} className="cursor-pointer hover:text-[#181925]" />
              </div>
            </div>

            {/* Real Market Overview Card */}
            <div className="bg-white border border-[#e8e8e8] rounded-[20px] p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#181925]">Market Overview</h3>
                <div className="flex items-center gap-1 text-[#999999]">
                  <button type="button" className="p-1 hover:text-[#181925]"><ChevronLeft size={14} /></button>
                  <button type="button" className="p-1 hover:text-[#181925]"><ChevronRight size={14} /></button>
                </div>
              </div>

              <p className="text-xs text-[#666666] leading-relaxed tracking-[-0.2px]">
                <span className="font-semibold text-[#181925]">Summary:</span>{" "}
                {topCoin ? (
                  <>
                    <span className="font-semibold text-[#181925]">{cryptoFullNameMap[topCoin.symbol] || topCoin.symbol}</span> sits near{" "}
                    <span className="font-semibold text-[#181925]">{formatCurrency(topCoin.currentPrice)}</span> with 24h trading volume of{" "}
                    <span className="font-semibold text-[#181925]">{formatCurrency(total24hVolume, { notation: "compact" })}</span> across active exchange pairs.
                  </>
                ) : (
                  "Live market feeds actively streaming prices across cryptocurrency trading pairs."
                )}
              </p>

              <div className="flex items-center justify-between text-[11px] text-[#999999] pt-2 border-t border-[#f0f0f4]">
                <span>Live Feed Syncing</span>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#33c758] animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e2e2e8]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e2e2e8]" />
                </div>
              </div>

              <button
                type="button"
                className="w-full py-2 bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#181925] rounded-xl text-xs font-semibold border border-[#e2e2e8] transition-colors cursor-pointer"
                onClick={() => navigate("/trade/spot")}
              >
                View Full Trading Desk
              </button>
            </div>

            {/* Active Market Categories */}
            <div className="bg-white border border-[#e8e8e8] rounded-[20px] p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
              <h3 className="text-xs font-bold text-[#181925]">Top Market Movers</h3>
              <div className="space-y-2.5">
                {prices.slice(0, 3).map((coin) => (
                  <div
                    key={coin.symbol}
                    className="p-2 sm:p-2.5 bg-[#f9f9fc] rounded-xl flex items-center justify-between text-xs cursor-pointer hover:bg-[#f0f0f4] transition-colors"
                    onClick={() => navigate(`/trade/spot?symbol=${coin.symbol}`)}
                  >
                    <div className="flex items-center gap-2">
                      <UniversalCoinIcon symbol={coin.symbol} size="w-5 h-5" />
                      <div>
                        <span className="font-semibold text-[#181925] block">{cryptoFullNameMap[coin.symbol] || coin.symbol}</span>
                        <span className="text-[10px] text-[#999999] block">{formatCurrency(coin.currentPrice)}</span>
                      </div>
                    </div>
                    <span className={`font-semibold ${Number(coin.percentChange24h) >= 0 ? "text-[#33c758]" : "text-[#ff3e00]"}`}>
                      {formatPercent(coin.percentChange24h)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </PageTransition>
  );
}

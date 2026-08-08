import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  StarIcon,
  FavouriteIcon,
} from "@hugeicons/core-free-icons";

import { fetchAllPrices, fetchGlobalMarketStats } from "../api";
import { Input } from "../components/ui/Input";
import { PageTransition } from "../components/ui/PageTransition";
import { Skeleton } from "../components/ui/Skeleton";
import { useWebSocket } from "../hooks/useWebSocket";
import { formatCompactNumber, formatCurrency, formatPercent } from "../lib/utils";

import GlobalMarketHeader from "../components/markets/GlobalMarketHeader";
import MarketHighlightCard from "../components/markets/MarketHighlightCard";
import SparklineChart from "../components/markets/SparklineChart";
import { ALL_COINS } from "../utils/constants";
import UniversalCoinIcon from "../lib/coinIcons";

import btcIcon from "../assets/Icons/btc.svg";
import ethIcon from "../assets/Icons/eth.svg";
import solIcon from "../assets/Icons/sol.svg";
import bnbIcon from "../assets/Icons/bnb.svg";
import dotIcon from "../assets/Icons/dot.svg";
import linkIcon from "../assets/Icons/link.svg";
import ltcIcon from "../assets/Icons/ltc.svg";
import arbIcon from "../assets/Icons/arb.svg";
import opIcon from "../assets/Icons/op.svg";
import suiIcon from "../assets/Icons/sui.svg";
import tiaIcon from "../assets/Icons/tia.svg";
import seiIcon from "../assets/Icons/sei.svg";

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
  LINK: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/link.png",
  LTC: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/ltc.png",
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
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pb-16 space-y-8 font-openrunde">
        {/* Global Market Telemetry Header fetched from Backend */}
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

        {/* Market Table Controls & Category Filter Header */}
        <div className="bg-white border border-fog rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-fog">
            <div>
              <h2 className="text-2xl font-bold text-carbon tracking-tight">Cryptocurrency Prices by Market Cap</h2>
              <p className="text-xs text-graphite mt-1">
                Real-time streaming paper market data, 24h metrics, and 7-day sparkline charts.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${connected ? "bg-mint-wash text-mint" : "bg-mist text-ash"}`}>
                <span className={`w-2 h-2 rounded-full ${connected ? "bg-mint animate-pulse" : "bg-ash"}`} />
                {connected ? "LIVE FEED" : "SNAPSHOT"}
              </span>

              <div className="w-full sm:w-64">
                <Input
                  placeholder="Search coin (e.g. BTC, Solana)..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full text-xs"
                />
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isActive
                      ? "bg-carbon text-white shadow-sm"
                      : "bg-linen text-graphite hover:bg-mist hover:text-carbon"
                  }`}
                >
                  {cat === "Favorites" && <HugeiconsIcon icon={StarIcon} size={13} className={isActive ? "text-amber" : "text-ash"} />}
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>

          {/* High-density Price Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-6 space-y-4">
                {[...Array(6)].map((_, idx) => (
                  <div key={idx} className="flex justify-between items-center py-3 border-b border-fog">
                    <Skeleton className="h-4 w-8 rounded-full" />
                    <Skeleton className="h-4 w-24 rounded-full" />
                    <Skeleton className="h-4 w-20 rounded-full" />
                    <Skeleton className="h-4 w-16 rounded-full" />
                    <Skeleton className="h-4 w-24 rounded-full" />
                    <Skeleton className="h-8 w-24 rounded-full" />
                  </div>
                ))}
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-fog text-xs font-semibold text-ash uppercase tracking-wider">
                    <th className="pb-3 px-2 text-center w-8">
                      <HugeiconsIcon icon={StarIcon} size={14} className="inline opacity-60" />
                    </th>
                    <th className="pb-3 px-3"># Rank</th>
                    <th className="pb-3 px-4">Name & Symbol</th>
                    <th className="pb-3 px-4 text-right">Price</th>
                    <th className="pb-3 px-4 text-right">24h Change</th>
                    <th className="pb-3 px-4 text-right">24h High / Low</th>
                    <th className="pb-3 px-4 text-right">Market Cap</th>
                    <th className="pb-3 px-4 text-right">24h Volume</th>
                    <th className="pb-3 px-4 text-center">7D Trend</th>
                    <th className="pb-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-fog text-xs font-medium">
                  {filteredPrices.map((price, idx) => {
                    const isUp = Number(price.percentChange24h) >= 0;
                    const isFav = favorites.has(price.symbol);
                    const fullName = cryptoFullNameMap[price.symbol] || price.symbol;
                    const marketCapVal = price.marketCap || (Number(price.currentPrice || 0) * 19700000);

                    return (
                      <tr
                        key={price.symbol}
                        className="hover:bg-mist transition-colors cursor-pointer group"
                        onClick={() => navigate(`/trade/spot?symbol=${price.symbol}`)}
                      >
                        {/* Star Favorite */}
                        <td className="py-4 px-2 text-center" onClick={(e) => toggleFavorite(price.symbol, e)}>
                          <div className="flex items-center justify-center cursor-pointer">
                            <HugeiconsIcon
                              icon={FavouriteIcon}
                              size={15}
                              className={`transition-colors ${isFav ? "text-amber fill-amber" : "text-ash opacity-40 group-hover:opacity-100"}`}
                            />
                          </div>
                        </td>

                        {/* Rank */}
                        <td className="py-4 px-3 text-ash font-medium">{idx + 1}</td>

                        {/* Name & Symbol using Real Colored Crypto Brand SVG Logos */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={getCryptoIcon(price.symbol)}
                              alt={price.symbol}
                              className="w-7 h-7 object-contain rounded-full bg-white border border-fog p-0.5 shadow-xs"
                              onError={(e) => {
                                e.target.src = "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/generic.png";
                              }}
                            />
                            <div>
                              <span className="font-bold text-carbon block group-hover:text-lavender transition-colors">
                                {fullName}
                              </span>
                              <span className="text-[11px] text-ash block uppercase tracking-wider">{price.symbol}</span>
                            </div>
                          </div>
                        </td>

                        {/* Last Price */}
                        <td className="py-4 px-4 text-right font-bold text-carbon text-sm">
                          {formatCurrency(price.currentPrice)}
                        </td>

                        {/* 24h Change */}
                        <td className="py-4 px-4 text-right">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                              isUp ? "bg-mint-wash text-mint" : "bg-red-50 text-ember"
                            }`}
                          >
                            <HugeiconsIcon icon={isUp ? ArrowUp01Icon : ArrowDown01Icon} size={12} />
                            {formatPercent(price.percentChange24h)}
                          </span>
                        </td>

                        {/* 24h High / Low */}
                        <td className="py-4 px-4 text-right text-ash text-[11px]">
                          <div>
                            <span className="text-carbon font-semibold">{formatCurrency(price.highPrice || price.currentPrice)}</span>
                            <span className="block text-ash">{formatCurrency(price.lowPrice || price.currentPrice)}</span>
                          </div>
                        </td>

                        {/* Market Cap */}
                        <td className="py-4 px-4 text-right text-carbon font-semibold">
                          {formatCurrency(marketCapVal, { notation: "compact" })}
                        </td>

                        {/* 24h Volume */}
                        <td className="py-4 px-4 text-right text-graphite">
                          {formatCompactNumber(price.volume24h)}
                        </td>

                        {/* 7D Trend Sparkline */}
                        <td className="py-4 px-4 text-center">
                          <SparklineChart isPositive={isUp} width={100} height={32} />
                        </td>

                        {/* Action Trade Button */}
                        <td className="py-4 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            className="btn-primary-lavender text-xs px-4 py-1.5 shadow-sm hover:shadow transition-all"
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
                      <td colSpan={10} className="py-12 text-center text-sm text-ash">
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

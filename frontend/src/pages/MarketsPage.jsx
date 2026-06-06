import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllPrices, fetchCandlestickData } from "../api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { PageTransition } from "../components/ui/PageTransition";
import { Skeleton } from "../components/ui/Skeleton";
import { TradingChartPanel } from "../components/ui/TradingChartPanel";
import { useWebSocket } from "../hooks/useWebSocket";
import { formatCompactNumber, formatCurrency, formatPercent } from "../lib/utils";

// Offline Cryptocurrency SVG Icons
import btcIcon from "../assets/Icons/btc.svg";
import ethIcon from "../assets/Icons/eth.svg";
import solIcon from "../assets/Icons/sol.svg";
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
  LINK: linkIcon,
  LTC: ltcIcon,
  ARB: arbIcon,
  OP: opIcon,
  SUI: suiIcon,
  TIA: tiaIcon,
  SEI: seiIcon,
};

const getCryptoIcon = (symbol) => {
  const base = (symbol?.endsWith("USDT") ? symbol.slice(0, -4) : symbol)?.toUpperCase();
  if (localIconMap[base]) {
    return localIconMap[base];
  }
  const mapper = {
    BTC: "https://cryptologos.cc/logos/bitcoin-btc-logo.svg",
    ETH: "https://cryptologos.cc/logos/ethereum-eth-logo.svg",
    BNB: "https://cryptologos.cc/logos/bnb-bnb-logo.svg",
    SOL: "https://cryptologos.cc/logos/solana-sol-logo.svg",
    LTC: "https://cryptologos.cc/logos/litecoin-ltc-logo.svg",
    LINK: "https://cryptologos.cc/logos/chainlink-link-logo.svg",
    XRP: "https://cryptologos.cc/logos/xrp-xrp-logo.svg",
    ADA: "https://cryptologos.cc/logos/cardano-ada-logo.svg",
    DOGE: "https://cryptologos.cc/logos/dogecoin-doge-logo.svg",
    DOT: "https://cryptologos.cc/logos/polkadot-new-dot-logo.svg"
  };
  return mapper[base] || `https://cryptologos.cc/logos/${base?.toLowerCase()}-${base?.toLowerCase()}-logo.svg`;
};

export default function MarketsPage() {
  const navigate = useNavigate();
  const [prices, setPrices] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT");
  const [candleData, setCandleData] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [chartInterval, setChartInterval] = useState("1h");
  const [showAllPrices, setShowAllPrices] = useState(false);
  const [activeTab, setActiveTab] = useState("ALL"); // ALL | GAINERS | LOSERS | HOT
  const [sortKey, setSortKey] = useState("volume24h"); // symbol | currentPrice | percentChange24h | volume24h
  const [sortDir, setSortDir] = useState("desc"); // asc | desc

  const handlePriceUpdate = (payload) => {
    let update = null;
    if (Array.isArray(payload)) {
      setPrices(payload);
      if (selectedSymbol) {
        update = payload.find((p) => p.symbol === selectedSymbol);
      }
    } else if (payload?.symbol) {
      setPrices((previousPrices) => {
        const existingIndex = previousPrices.findIndex((price) => price.symbol === payload.symbol);
        if (existingIndex >= 0) {
          const nextPrices = [...previousPrices];
          nextPrices[existingIndex] = payload;
          return nextPrices;
        }

        return [...previousPrices, payload];
      });

      if (payload.symbol === selectedSymbol) {
        update = payload;
      }
    }

    if (update) {
      const newPrice = Number(update.currentPrice);
      setCandleData((prev) => {
        if (!prev || prev.length === 0) return prev;
        const lastIndex = prev.length - 1;
        const lastCandle = { ...prev[lastIndex] };
        
        lastCandle.close = newPrice;
        if (newPrice > lastCandle.high) lastCandle.high = newPrice;
        if (newPrice < lastCandle.low) lastCandle.low = newPrice;
        
        const next = [...prev];
        next[lastIndex] = lastCandle;
        return next;
      });
    }
  };

  const { connected } = useWebSocket("/topic/prices", handlePriceUpdate, true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetchAllPrices();
        const nextPrices = response?.data || [];
        setPrices(nextPrices);

        if (nextPrices.length) {
          setSelectedSymbol((currentSymbol) => currentSymbol || nextPrices[0].symbol);
        }
      } catch {
        setPrices([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filteredPrices = useMemo(() => {
    const searched = prices.filter((price) =>
      !query ? true : price.symbol?.toLowerCase().includes(query.toLowerCase())
    );

    const tabbed = searched.filter((price) => {
      const change = Number(price.percentChange24h) || 0;
      if (activeTab === "GAINERS") return change > 0;
      if (activeTab === "LOSERS") return change < 0;
      if (activeTab === "HOT") return Math.abs(change) >= 3;
      return true;
    });

    const sorted = [...tabbed].sort((a, b) => {
      let av;
      let bv;
      if (sortKey === "symbol") {
        av = (a.symbol || "").toUpperCase();
        bv = (b.symbol || "").toUpperCase();
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      av = Number(a[sortKey]) || 0;
      bv = Number(b[sortKey]) || 0;
      return sortDir === "asc" ? av - bv : bv - av;
    });

    return sorted;
  }, [prices, query, activeTab, sortKey, sortDir]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  useEffect(() => {
    if (!filteredPrices.length) {
      return;
    }

    const selectedStillVisible = filteredPrices.some((price) => price.symbol === selectedSymbol);
    if (!selectedStillVisible) {
      setSelectedSymbol(filteredPrices[0].symbol);
    }
  }, [filteredPrices, selectedSymbol]);

  useEffect(() => {
    const loadCandles = async () => {
      if (!selectedSymbol) {
        return;
      }

      setChartLoading(true);
      try {
        const nextCandles = await fetchCandlestickData(selectedSymbol, chartInterval, 120);
        setCandleData(nextCandles);
      } catch {
        setCandleData([]);
      } finally {
        setChartLoading(false);
      }
    };

    loadCandles();
  }, [chartInterval, selectedSymbol]);

  const selectedMarket = prices.find((price) => price.symbol === selectedSymbol);
  const marketStats = selectedMarket ? [
    {
      label: "Last price",
      value: selectedMarket.currentPrice,
      kind: "currency",
      icon: "price",
      hint: "Realtime paper-market mark",
    },
    {
      label: "24H change",
      value: selectedMarket.percentChange24h,
      kind: "percent",
      icon: "change",
      hint: `${formatCurrency(selectedMarket.priceChange24h || 0)} move`,
    },
    {
      label: "24H volume",
      value: selectedMarket.volume24h,
      kind: "compact",
      icon: "volume",
      hint: "Liquidity simulation",
    },
    {
      label: "Session range",
      value: `${formatCurrency(selectedMarket.lowPrice || selectedMarket.currentPrice)} - ${formatCurrency(selectedMarket.highPrice || selectedMarket.currentPrice)}`,
      icon: "momentum",
      hint: "Intraday envelope",
    },
  ] : [];

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Trading Chart Panel */}
        <TradingChartPanel
          title="Market Pulse"
          description="Live charting powered by the NexTradeX backend, tuned for paper trading flows and ready for a production-grade trading shell."
          symbol={selectedSymbol}
          interval={chartInterval}
          onIntervalChange={setChartInterval}
          loading={chartLoading}
          data={candleData}
          status={{ label: connected ? "Live feed" : "Snapshot", tone: connected ? "active" : "neutral" }}
          stats={marketStats}
        />

        {/* Page Header */}
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            Markets
            <span className="text-[10px] font-mono font-bold bg-primary/15 text-primary px-1.5 py-0.5 rounded uppercase tracking-wider">
              {connected ? "Live" : "Snapshot"}
            </span>
          </h1>
          <p className="text-sm leading-relaxed text-muted">
            Browse supported pairs, inspect simulated depth, and route any market straight into the trading workspace.
          </p>
        </div>

        {/* High-density price table board */}
        <Card className="bg-surface-card-dark border border-hairline-on-dark rounded-xl shadow-elevation-md overflow-hidden">
          {/* Filter tabs + search toolbar */}
          <CardHeader className="border-b border-hairline-on-dark bg-canvas-dark/20 py-3 px-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-1 font-heading text-xs font-bold uppercase tracking-wider">
              {[
                { id: "ALL", label: "All" },
                { id: "GAINERS", label: "Gainers" },
                { id: "LOSERS", label: "Losers" },
                { id: "HOT", label: "Hot" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    activeTab === tab.id
                      ? "bg-primary/15 text-primary"
                      : "text-muted hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className={`status-badge text-[10px] font-bold ${connected ? "status-badge--active" : "status-badge--neutral"}`}>
                {connected ? "LIVE" : "PAUSED"}
              </div>
              <div className="w-full sm:w-64">
                <Input
                  placeholder="Search pair (e.g. BTC)"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="bg-canvas-dark border-hairline-on-dark text-white font-mono text-sm rounded-lg w-full"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-4">
                {[...Array(6)].map((_, idx) => (
                  <div key={idx} className="flex justify-between items-center py-4 border-b border-hairline-on-dark last:border-0">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-hairline-on-dark text-[11px] font-bold text-muted uppercase tracking-wider font-mono bg-canvas-dark/10 select-none">
                      <th className="py-4 px-6">
                        <button type="button" onClick={() => handleSort("symbol")} className="inline-flex items-center gap-1 hover:text-white transition-colors uppercase tracking-wider">
                          Asset Pair
                          <span className="text-[8px]">{sortKey === "symbol" ? (sortDir === "asc" ? "▲" : "▼") : "↕"}</span>
                        </button>
                      </th>
                      <th className="py-4 px-6 text-right">
                        <button type="button" onClick={() => handleSort("currentPrice")} className="inline-flex items-center gap-1 hover:text-white transition-colors uppercase tracking-wider">
                          Last Price
                          <span className="text-[8px]">{sortKey === "currentPrice" ? (sortDir === "asc" ? "▲" : "▼") : "↕"}</span>
                        </button>
                      </th>
                      <th className="py-4 px-6 text-right">
                        <button type="button" onClick={() => handleSort("percentChange24h")} className="inline-flex items-center gap-1 hover:text-white transition-colors uppercase tracking-wider">
                          24H Change
                          <span className="text-[8px]">{sortKey === "percentChange24h" ? (sortDir === "asc" ? "▲" : "▼") : "↕"}</span>
                        </button>
                      </th>
                      <th className="py-4 px-6 text-right">24H High / Low</th>
                      <th className="py-4 px-6 text-right">
                        <button type="button" onClick={() => handleSort("volume24h")} className="inline-flex items-center gap-1 hover:text-white transition-colors uppercase tracking-wider">
                          24H Volume
                          <span className="text-[8px]">{sortKey === "volume24h" ? (sortDir === "asc" ? "▲" : "▼") : "↕"}</span>
                        </button>
                      </th>
                      <th className="py-4 px-6 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline-on-dark">
                    {(showAllPrices ? filteredPrices : filteredPrices.slice(0, 5)).map((price) => {
                      const isUp = Number(price.percentChange24h) >= 0;
                      const isSelected = selectedSymbol === price.symbol;
                      return (
                        <tr
                          key={price.id || price.symbol}
                          className={`group transition-all hover:bg-canvas-dark/25 cursor-pointer ${isSelected ? "bg-primary/[0.04] border-l-2 border-l-primary" : ""
                            }`}
                          onClick={() => setSelectedSymbol(price.symbol)}
                        >
                          <td className="py-4 px-6 font-mono text-sm text-white">
                            <div className="flex items-center gap-3">
                              <div className="relative w-7 h-7 flex-shrink-0 flex items-center justify-center">
                                <img
                                  src={getCryptoIcon(price.symbol)}
                                  alt={price.symbol}
                                  className="w-7 h-7 object-contain rounded-full bg-white/5 p-0.5"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                                <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-[8px] font-mono hidden">
                                  {price.symbol?.replace("USDT", "")}
                                </div>
                              </div>
                              <div>
                                <span className="group-hover:text-primary transition-colors text-white font-bold">{price.symbol}</span>
                                <span className="block text-[10px] text-muted font-normal tracking-wide">SPOT</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right font-mono text-sm font-semibold text-white">
                            {formatCurrency(price.currentPrice)}
                          </td>
                          <td className={`py-4 px-6 text-right font-mono text-sm font-semibold ${isUp ? "text-trading-up" : "text-trading-down"
                            }`}>
                            <div className="flex items-center justify-end gap-1.5">
                              <span>{isUp ? "▲" : "▼"}</span>
                              <span>{formatPercent(price.percentChange24h)}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right font-mono text-xs text-muted">
                            {formatCurrency(price.highPrice || price.currentPrice)} / {formatCurrency(price.lowPrice || price.currentPrice)}
                          </td>
                          <td className="py-4 px-6 text-right font-mono text-sm text-white">
                            {formatCompactNumber(price.volume24h)}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <button
                              type="button"
                              className="px-4 py-1.5 text-xs font-bold font-mono tracking-wide rounded bg-primary text-on-primary hover:bg-[#f0b90b] transition-all"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/trade/spot?symbol=${price.symbol}`);
                              }}
                            >
                              TRADE
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredPrices.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-sm text-muted">
                          No markets match this filter.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
                {filteredPrices.length > 5 && (
                  <div className="border-t border-hairline-on-dark bg-canvas-dark/10 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => setShowAllPrices(!showAllPrices)}
                      className="text-xs font-bold font-mono text-primary hover:text-white transition-colors"
                    >
                      {showAllPrices ? "▲ VIEW LESS" : "▼ VIEW MORE"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}

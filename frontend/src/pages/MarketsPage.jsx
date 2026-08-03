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
  const [interval, setInterval] = useState("1h");
  const [showAllPrices, setShowAllPrices] = useState(false);

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

  const filteredPrices = useMemo(() => prices.filter((price) =>
    !query ? true : price.symbol?.toLowerCase().includes(query.toLowerCase())
  ), [prices, query]);

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
        const nextCandles = await fetchCandlestickData(selectedSymbol, interval, 120);
        setCandleData(nextCandles);
      } catch {
        setCandleData([]);
      } finally {
        setChartLoading(false);
      }
    };

    loadCandles();
  }, [interval, selectedSymbol]);

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
      <div className="max-w-[1200px] mx-auto px-6 py-8 space-y-8 font-openrunde">
        {/* Trading Chart Panel */}
        <TradingChartPanel
          title="Market Pulse"
          description="Live charting powered by the NexTradeX engine, tuned for paper trading telemetry."
          symbol={selectedSymbol}
          interval={interval}
          onIntervalChange={setInterval}
          loading={chartLoading}
          data={candleData}
          status={{ label: connected ? "Live feed" : "Snapshot", tone: connected ? "active" : "neutral" }}
          stats={marketStats}
        />

        {/* Page Header and search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="font-openrunde text-3xl font-medium text-carbon tracking-[-0.61px]">Markets</h1>
            <p className="text-sm text-graphite tracking-[-0.32px] mt-1">
              Browse supported pairs, inspect simulated depth, and choose the market you want to route into trading.
            </p>
          </div>

          <div className="w-full sm:w-72">
            <Input
              placeholder="Filter by symbol (e.g. BTC)"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {/* High-density price table board */}
        <div className="table-container-visitors">
          <div className="bg-white border-b border-fog py-4 px-6 flex flex-row items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-carbon tracking-[-0.31px]">Price Board</h3>
              <p className="mt-0.5 text-xs text-ash tracking-[-0.32px]">
                Streaming symbol prices with instant selection and real-time websocket updates.
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${connected ? "bg-mint-wash text-mint" : "bg-mist text-ash"}`}>
              {connected ? "LIVE" : "PAUSED"}
            </span>
          </div>

          <div className="p-0">
            {loading ? (
              <div className="p-6 space-y-4">
                {[...Array(6)].map((_, idx) => (
                  <div key={idx} className="flex justify-between items-center py-3 border-b border-fog">
                    <Skeleton className="h-4 w-24 rounded-full" />
                    <Skeleton className="h-4 w-20 rounded-full" />
                    <Skeleton className="h-4 w-16 rounded-full" />
                    <Skeleton className="h-4 w-24 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                ))}
              </div>
            ) : (
              <table className="table-visitors">
                <thead>
                  <tr>
                    <th>Asset Pair</th>
                    <th className="text-right">Last Price</th>
                    <th className="text-right">24H Change</th>
                    <th className="text-right">24H High / Low</th>
                    <th className="text-right">24H Volume</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(showAllPrices ? filteredPrices : filteredPrices.slice(0, 5)).map((price) => {
                    const isUp = Number(price.percentChange24h) >= 0;
                    const isSelected = selectedSymbol === price.symbol;
                    return (
                      <tr
                        key={price.id || price.symbol}
                        className={`cursor-pointer transition-colors ${isSelected ? "bg-mist" : "hover:bg-linen"}`}
                        onClick={() => setSelectedSymbol(price.symbol)}
                      >
                        <td>
                          <div className="flex items-center gap-2.5">
                            <img
                              src={getCryptoIcon(price.symbol)}
                              alt={price.symbol}
                              className="w-6 h-6 object-contain rounded-full"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                            <div>
                              <span className="font-medium text-carbon block">{price.symbol}</span>
                              <span className="text-xs text-ash">SPOT</span>
                            </div>
                          </div>
                        </td>
                        <td className="text-right font-medium text-carbon">
                          {formatCurrency(price.currentPrice)}
                        </td>
                        <td className="text-right font-medium">
                          <span className={isUp ? "delta-positive" : "delta-negative"}>
                            {isUp ? "+" : ""}{formatPercent(price.percentChange24h)}
                          </span>
                        </td>
                        <td className="text-right text-xs text-ash">
                          {formatCurrency(price.highPrice || price.currentPrice)} / {formatCurrency(price.lowPrice || price.currentPrice)}
                        </td>
                        <td className="text-right text-graphite text-xs">
                          {formatCompactNumber(price.volume24h)}
                        </td>
                        <td className="text-center">
                          <button
                            type="button"
                            className="btn-primary-lavender text-xs px-3 py-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/trade/spot?symbol=${price.symbol}`);
                            }}
                          >
                            Trade
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredPrices.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-sm text-ash">
                        No markets match this filter.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            )}

            {filteredPrices.length > 5 && (
              <div className="border-t border-fog bg-linen py-3 text-center">
                <button
                  type="button"
                  onClick={() => setShowAllPrices(!showAllPrices)}
                  className="text-xs font-medium text-lavender hover:text-carbon transition-colors"
                >
                  {showAllPrices ? "▲ Show Less" : "▼ Show All Markets"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

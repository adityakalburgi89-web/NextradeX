import React, { useEffect, useMemo, useState } from "react";
import { fetchAllPrices, fetchCandlestickData } from "../api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { PageTransition } from "../components/ui/PageTransition";
import { Skeleton } from "../components/ui/Skeleton";
import { TradingChartPanel } from "../components/ui/TradingChartPanel";
import { useWebSocket } from "../hooks/useWebSocket";
import { formatCompactNumber, formatCurrency, formatPercent } from "../lib/utils";

export default function MarketsPage() {
  const [prices, setPrices] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT");
  const [candleData, setCandleData] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [interval, setInterval] = useState("1h");

  const handlePriceUpdate = (payload) => {
    if (Array.isArray(payload)) {
      setPrices(payload);
      return;
    }

    if (payload?.symbol) {
      setPrices((previousPrices) => {
        const existingIndex = previousPrices.findIndex((price) => price.symbol === payload.symbol);
        if (existingIndex >= 0) {
          const nextPrices = [...previousPrices];
          nextPrices[existingIndex] = payload;
          return nextPrices;
        }

        return [...previousPrices, payload];
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
      hint: `${formatCurrency(selectedMarket.priceChange24h || 0)} net move`,
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
      <div className="space-y-8 py-12">
        <TradingChartPanel
          title="Market Pulse"
          description="Live charting powered by the NexTradeX backend, tuned for paper trading flows and ready for a production-grade trading shell."
          symbol={selectedSymbol}
          interval={interval}
          onIntervalChange={setInterval}
          loading={chartLoading}
          data={candleData}
          status={{ label: connected ? "Live feed" : "Snapshot", tone: connected ? "active" : "neutral" }}
          stats={marketStats}
        />

        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="stagger-children">
            <h1 className="mb-2 font-heading text-3xl font-bold tracking-tight">Markets</h1>
            <p className="text-sm leading-relaxed text-muted">
              Browse supported pairs, inspect simulated depth, and choose the market you want to route into the trading workspace.
            </p>
          </div>

          <div className="w-full sm:w-72">
            <Input
              placeholder="Filter by symbol (e.g. BTC)"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>

        <Card className="panel-shine">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>Price Board</CardTitle>
                <CardDescription className="mt-1.5">
                  Streaming symbol cards with instant selection, smoother hover states, and backend-driven pricing.
                </CardDescription>
              </div>

              <div className={`status-badge ${connected ? "status-badge--active" : "status-badge--neutral"}`}>
                {connected ? "Live" : "Paused"}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[...Array(8)].map((_, index) => (
                  <div key={index} className="rounded-[24px] border border-white/[0.06] p-4 space-y-3">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {filteredPrices.map((price) => (
                  <button
                    key={price.id || price.symbol}
                    type="button"
                    onClick={() => setSelectedSymbol(price.symbol)}
                    className={`market-card text-left ${
                      selectedSymbol === price.symbol
                        ? "border-primary/40 bg-primary/[0.08] shadow-glow-soft"
                        : "border-white/[0.06] bg-white/[0.02] hover:border-primary/25 hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted">{price.symbol}</div>
                        <div className="mt-2 font-heading text-2xl font-semibold text-white">
                          {formatCurrency(price.currentPrice)}
                        </div>
                      </div>
                      <span className={`status-badge ${Number(price.percentChange24h) >= 0 ? "status-badge--active" : "status-badge--error"}`}>
                        {formatPercent(price.percentChange24h)}
                      </span>
                    </div>

                    <div className="mt-5 flex items-center justify-between text-xs text-muted">
                      <span>Vol {formatCompactNumber(price.volume24h)}</span>
                      <span>High {formatCurrency(price.highPrice || price.currentPrice)}</span>
                    </div>
                  </button>
                ))}

                {filteredPrices.length === 0 ? (
                  <p className="col-span-full py-8 text-center text-sm text-muted">
                    No markets match this filter.
                  </p>
                ) : null}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}

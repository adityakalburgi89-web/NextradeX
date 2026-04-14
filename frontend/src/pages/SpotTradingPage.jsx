import React, { useEffect, useMemo, useState } from "react";
import { createSpotOrder, fetchPrice, fetchCandlestickData } from "../api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Button } from "../components/ui/Button";
import { PageTransition } from "../components/ui/PageTransition";
import { TradingChartPanel } from "../components/ui/TradingChartPanel";
import { useWebSocket } from "../hooks/useWebSocket";
import { formatCurrency, formatPercent } from "../lib/utils";

const initialForm = {
  symbol: "BTCUSDT",
  side: "BUY",
  orderType: "MARKET",
  quantity: "0.001",
  price: "",
};

export default function SpotTradingPage() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [currentPrice, setCurrentPrice] = useState(null);
  const [priceSnapshot, setPriceSnapshot] = useState(null);
  const [candleData, setCandleData] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [interval, setInterval] = useState("1h");

  const handlePriceUpdate = (data) => {
    if (Array.isArray(data)) {
      const symbolPrice = data.find((p) => p.symbol === form.symbol);
      if (symbolPrice) {
        setCurrentPrice(symbolPrice.currentPrice);
        setPriceSnapshot(symbolPrice);
      }
    } else if (data && data.symbol === form.symbol) {
      setCurrentPrice(data.currentPrice);
      setPriceSnapshot(data);
    }
  };

  const { connected } = useWebSocket("/topic/prices", handlePriceUpdate, true);

  const loadPrice = async () => {
    try {
      const res = await fetchPrice(form.symbol);
      if (res?.data) {
        setCurrentPrice(res.data.currentPrice);
        setPriceSnapshot(res.data);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadPrice();
  }, [form.symbol]);

  useEffect(() => {
    const loadCandles = async () => {
      setChartLoading(true);
      try {
        const data = await fetchCandlestickData(form.symbol, interval, 120);
        setCandleData(data);
      } catch {
        setCandleData([]);
      } finally {
        setChartLoading(false);
      }
    };
    loadCandles();
  }, [form.symbol, interval]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const payload = {
        symbol: form.symbol,
        side: form.side,
        orderType: form.orderType,
        quantity: parseFloat(form.quantity),
        price: form.orderType === "LIMIT" ? parseFloat(form.price) : null,
      };
      const res = await createSpotOrder(payload);
      setMessage(res?.message || "Spot order created");
    } catch (err) {
      setError(err.message || "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  const estimatedNotional = useMemo(() => {
    const quantity = Number(form.quantity || 0);
    const price = form.orderType === "LIMIT" ? Number(form.price || 0) : Number(currentPrice || 0);
    return quantity * price;
  }, [currentPrice, form.orderType, form.price, form.quantity]);

  const chartStats = [
    {
      label: "Last price",
      value: currentPrice || priceSnapshot?.currentPrice || 0,
      kind: "currency",
      icon: "price",
      hint: connected ? "Live websocket updates" : "Latest REST snapshot",
    },
    {
      label: "24H change",
      value: priceSnapshot?.percentChange24h || 0,
      kind: "percent",
      icon: "change",
      hint: `${formatCurrency(priceSnapshot?.priceChange24h || 0)} session move`,
    },
    {
      label: "Session high",
      value: priceSnapshot?.highPrice || currentPrice || 0,
      kind: "currency",
      icon: "volume",
      hint: `Low ${formatCurrency(priceSnapshot?.lowPrice || currentPrice || 0)}`,
    },
    {
      label: "Order notional",
      value: estimatedNotional,
      kind: "currency",
      icon: "momentum",
      hint: `${form.side} ${form.quantity || 0} ${form.symbol}`,
    },
  ];

  return (
    <PageTransition>
      <div className="mx-auto max-w-5xl space-y-8 py-12">
        <TradingChartPanel
          title="Spot Workspace"
          description="Execute clean spot orders with backend candles, live pricing, and a calmer SaaS-grade order entry flow."
          symbol={form.symbol}
          interval={interval}
          onIntervalChange={setInterval}
          loading={chartLoading}
          data={candleData}
          status={{ label: connected ? "Live market" : "Snapshot", tone: connected ? "active" : "neutral" }}
          stats={chartStats}
        />

        <Card>
          <CardHeader>
            <CardTitle>Spot Trading</CardTitle>
            <CardDescription>Place a spot buy or sell order using the currently selected symbol and execution style.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5">
              <div>
                <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-2.5 block">
                  Symbol
                </label>
                <Input name="symbol" value={form.symbol} onChange={handleChange} required />
              </div>
              {currentPrice && (
                <div className="interactive-surface rounded-[24px] border border-white/[0.06] bg-white/[0.02] px-5 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted">Current Price</span>
                      <p className="mt-1 font-heading text-2xl font-semibold text-white">
                        {formatCurrency(currentPrice)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`status-badge ${Number(priceSnapshot?.percentChange24h) >= 0 ? "status-badge--active" : "status-badge--error"}`}>
                        {formatPercent(priceSnapshot?.percentChange24h || 0)}
                      </div>
                      {connected && (
                        <div className="mt-2 text-[11px] uppercase tracking-[0.24em] text-muted">streaming</div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-muted sm:grid-cols-3">
                    <div>High {formatCurrency(priceSnapshot?.highPrice || currentPrice)}</div>
                    <div>Low {formatCurrency(priceSnapshot?.lowPrice || currentPrice)}</div>
                    <div>Notional {formatCurrency(estimatedNotional)}</div>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-2.5 block">
                    Side
                  </label>
                  <Select name="side" value={form.side} onChange={handleChange}>
                    <option value="BUY">Buy</option>
                    <option value="SELL">Sell</option>
                  </Select>
                </div>
                <div>
                  <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-2.5 block">
                    Order Type
                  </label>
                  <Select name="orderType" value={form.orderType} onChange={handleChange}>
                    <option value="MARKET">Market</option>
                    <option value="LIMIT">Limit</option>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-2.5 block">
                    Quantity
                  </label>
                  <Input
                    type="number"
                    step="0.0001"
                    name="quantity"
                    value={form.quantity}
                    onChange={handleChange}
                    required
                  />
                </div>
                {form.orderType === "LIMIT" && (
                  <div className="animate-slide-down">
                    <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-2.5 block">
                      Limit Price
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      name="price"
                      value={form.price}
                      onChange={handleChange}
                      required={form.orderType === "LIMIT"}
                    />
                  </div>
                )}
              </div>
              {message && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-accent-green/10 border border-accent-green/20 animate-slide-down">
                  <p className="text-accent-green text-sm font-mono">{message}</p>
                </div>
              )}
              {error && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-accent-red/10 border border-accent-red/20 animate-slide-down">
                  <p className="text-accent-red text-sm font-mono">{error}</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full font-mono" loading={loading}>
                Place Spot Order
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </PageTransition>
  );
}

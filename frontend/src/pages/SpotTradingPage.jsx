import React, { useEffect, useMemo, useState } from "react";
import { createSpotOrder, fetchPrice, fetchCandlestickData } from "../api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Button } from "../components/ui/Button";
import { PageTransition } from "../components/ui/PageTransition";
import { TradingChartPanel } from "../components/ui/TradingChartPanel";
import { OrderBook } from "../components/ui/OrderBook";
import { useWebSocket } from "../hooks/useWebSocket";
import { formatCurrency, formatPercent } from "../lib/utils";

const initialForm = {
  symbol: "BTCUSDT",
  side: "BUY",
  orderType: "MARKET",
  quantity: "0.001",
  price: "",
  stopPrice: "",
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
    console.log("[WS] 📡 Price update received:", data);
    let update = null;
    const currentSymbol = form.symbol.toUpperCase();

    if (Array.isArray(data)) {
      update = data.find((p) => p.symbol.toUpperCase() === currentSymbol);
    } else if (data && data.symbol.toUpperCase() === currentSymbol) {
      update = data;
    }

    if (update) {
      console.log("[WS] ✅ Match found for", currentSymbol, "Price:", update.currentPrice);
      const newPrice = Number(update.currentPrice);
      setCurrentPrice(newPrice);
      setPriceSnapshot(update);

      // Real-time chart update: modify the last candle
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
      const isLimitPriceType = ["LIMIT", "STOP_LIMIT", "TAKE_PROFIT_LIMIT"].includes(form.orderType);
      const isTriggerPriceType = ["STOP_LIMIT", "STOP_MARKET", "TAKE_PROFIT_LIMIT", "TAKE_PROFIT_MARKET"].includes(form.orderType);
      const payload = {
        symbol: form.symbol,
        side: form.side,
        orderType: form.orderType,
        quantity: parseFloat(form.quantity),
        price: isLimitPriceType ? parseFloat(form.price) : null,
        stopPrice: isTriggerPriceType ? parseFloat(form.stopPrice) : null,
      };
      const res = await createSpotOrder(payload);
      setMessage(res?.message || "Spot order created successfully");
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
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Page Header banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-hairline-on-dark pb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white font-heading">Spot Trading</h1>
            <p className="text-sm text-muted">Execute real-time spot orders with high-density workspace controls and streaming prices.</p>
          </div>
          {currentPrice && (
            <div className="flex items-center gap-4 bg-surface-card-dark px-4 py-2 rounded-lg border border-hairline-on-dark">
              <div>
                <span className="text-[10px] text-muted uppercase tracking-wider block font-mono">BTC/USDT Live</span>
                <span className="text-lg font-bold font-mono text-white">{formatCurrency(currentPrice)}</span>
              </div>
              <span className={`text-sm font-mono font-semibold px-2 py-0.5 rounded ${Number(priceSnapshot?.percentChange24h) >= 0 ? "text-trading-up bg-trading-up/10" : "text-trading-down bg-trading-down/10"}`}>
                {Number(priceSnapshot?.percentChange24h) >= 0 ? "+" : ""}{formatPercent(priceSnapshot?.percentChange24h || 0)}
              </span>
            </div>
          )}
        </div>

        {/* Three-Column Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Chart Panel (6-cols) */}
          <div className="lg:col-span-6 space-y-6">
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
          </div>

          {/* Order Book Panel (3-cols) */}
          <div className="lg:col-span-3">
            <OrderBook 
              symbol={form.symbol} 
              currentPrice={currentPrice} 
              onSelectPrice={(p) => setForm((prev) => ({ ...prev, price: p.toFixed(2), orderType: "LIMIT" }))} 
            />
          </div>

          {/* Order Entry Panel (3-cols) */}
          <div className="lg:col-span-3">
            <Card className="border border-hairline-on-dark bg-surface-card-dark rounded-xl overflow-hidden shadow-elevation-md">
              <form onSubmit={handleSubmit}>
                {/* Binance Style Side Tabs */}
                <div className="flex border-b border-hairline-on-dark p-1 bg-canvas-dark/40">
                  <button
                    type="button"
                    className={`flex-1 py-3 text-center text-xs font-bold tracking-wider rounded transition-all ${
                      form.side === "BUY"
                        ? "bg-trading-up text-white shadow-sm"
                        : "text-muted hover:text-white"
                    }`}
                    onClick={() => setForm((prev) => ({ ...prev, side: "BUY" }))}
                  >
                    BUY
                  </button>
                  <button
                    type="button"
                    className={`flex-1 py-3 text-center text-xs font-bold tracking-wider rounded transition-all ${
                      form.side === "SELL"
                        ? "bg-trading-down text-white shadow-sm"
                        : "text-muted hover:text-white"
                    }`}
                    onClick={() => setForm((prev) => ({ ...prev, side: "SELL" }))}
                  >
                    SELL
                  </button>
                </div>

                <CardContent className="space-y-4 pt-4">
                  <div>
                    <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-1.5 block">
                      Symbol
                    </label>
                    <Input 
                      name="symbol" 
                      value={form.symbol} 
                      onChange={handleChange} 
                      required 
                      className="bg-canvas-dark border-hairline-on-dark font-mono text-sm uppercase text-white w-full rounded-md" 
                    />
                  </div>

                  <div>
                    <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-1.5 block">
                      Order Type
                    </label>
                    <Select 
                      name="orderType" 
                      value={form.orderType} 
                      onChange={handleChange} 
                      className="bg-canvas-dark border-hairline-on-dark font-mono text-sm text-white w-full rounded-md"
                    >
                      <option value="MARKET">Market</option>
                      <option value="LIMIT">Limit</option>
                      <option value="STOP_MARKET">Stop Market</option>
                      <option value="STOP_LIMIT">Stop Limit</option>
                      <option value="TAKE_PROFIT_MARKET">Take Profit Market</option>
                      <option value="TAKE_PROFIT_LIMIT">Take Profit Limit</option>
                    </Select>
                  </div>

                  <div>
                    <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-1.5 block">
                      Quantity
                    </label>
                    <Input
                      type="number"
                      step="0.0001"
                      name="quantity"
                      value={form.quantity}
                      onChange={handleChange}
                      required
                      className="bg-canvas-dark border-hairline-on-dark font-mono text-sm text-white w-full rounded-md"
                    />
                  </div>

                  {["STOP_LIMIT", "STOP_MARKET", "TAKE_PROFIT_LIMIT", "TAKE_PROFIT_MARKET"].includes(form.orderType) && (
                    <div className="animate-slide-down">
                      <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-1.5 block">
                        Trigger Price
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        name="stopPrice"
                        value={form.stopPrice}
                        onChange={handleChange}
                        required
                        className="bg-canvas-dark border-hairline-on-dark font-mono text-sm text-white w-full rounded-md"
                      />
                    </div>
                  )}

                  {["LIMIT", "STOP_LIMIT", "TAKE_PROFIT_LIMIT"].includes(form.orderType) && (
                    <div className="animate-slide-down">
                      <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-1.5 block">
                        Limit Price
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        name="price"
                        value={form.price}
                        onChange={handleChange}
                        required
                        className="bg-canvas-dark border-hairline-on-dark font-mono text-sm text-white w-full rounded-md"
                      />
                    </div>
                  )}

                  {/* High/Low/Notional Summary */}
                  {currentPrice && (
                    <div className="border border-hairline-on-dark bg-canvas-dark/40 rounded-lg p-3 space-y-2">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-muted">Current Price</span>
                        <span className="text-white font-semibold">{formatCurrency(currentPrice)}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-muted font-mono">24H High</span>
                        <span className="text-white font-semibold">{formatCurrency(priceSnapshot?.highPrice || currentPrice)}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-muted font-mono">24H Low</span>
                        <span className="text-white font-semibold">{formatCurrency(priceSnapshot?.lowPrice || currentPrice)}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-mono border-t border-hairline-on-dark pt-2">
                        <span className="text-muted">Est. Notional</span>
                        <span className="text-white font-semibold font-mono">{formatCurrency(estimatedNotional)}</span>
                      </div>
                    </div>
                  )}

                  {message && (
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-trading-up/10 border border-trading-up/20 animate-slide-down">
                      <p className="text-trading-up text-xs font-mono">{message}</p>
                    </div>
                  )}
                  {error && (
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-trading-down/10 border border-trading-down/20 animate-slide-down">
                      <p className="text-trading-down text-xs font-mono">{error}</p>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="pt-2 pb-4">
                  <Button
                    type="submit"
                    className="w-full font-mono text-sm uppercase py-3 font-bold rounded-md"
                    variant={form.side === "BUY" ? "tradingUp" : "tradingDown"}
                    loading={loading}
                  >
                    {form.side === "BUY" ? "BUY" : "SELL"} {form.symbol}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

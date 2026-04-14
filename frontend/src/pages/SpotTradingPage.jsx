import React, { useState, useEffect } from "react";
import { createSpotOrder, fetchPrice, fetchCandlestickData } from "../api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Button } from "../components/ui/Button";
import { PageTransition } from "../components/ui/PageTransition";
import { useWebSocket } from "../hooks/useWebSocket";
import CandlestickChart from "../components/ui/CandlestickChart";

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
  const [candleData, setCandleData] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);

  const handlePriceUpdate = (data) => {
    if (Array.isArray(data)) {
      const symbolPrice = data.find((p) => p.symbol === form.symbol);
      if (symbolPrice) {
        setCurrentPrice(symbolPrice.currentPrice);
      }
    } else if (data && data.symbol === form.symbol) {
      setCurrentPrice(data.currentPrice);
    }
  };

  const { connected } = useWebSocket("/topic/prices", handlePriceUpdate, true);

  const loadPrice = async () => {
    try {
      const res = await fetchPrice(form.symbol);
      if (res?.data) {
        setCurrentPrice(res.data.currentPrice);
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
        const data = await fetchCandlestickData(form.symbol);
        setCandleData(data);
      } catch {
        // ignore
      } finally {
        setChartLoading(false);
      }
    };
    loadCandles();
  }, [form.symbol]);

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

  return (
    <PageTransition>
      <div className="py-12 max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Chart</CardTitle>
            <CardDescription>BTC/USDT Price</CardDescription>
          </CardHeader>
          <CardContent>
            {chartLoading ? (
              <div className="h-[400px] flex items-center justify-center text-muted font-mono text-sm">
                Loading chart...
              </div>
            ) : (
              <CandlestickChart data={candleData} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Spot Trading</CardTitle>
            <CardDescription>Place a basic spot buy/sell order using your spot wallet.</CardDescription>
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
                <div className="text-center py-4 rounded-xl border border-white/[0.06] bg-white/[0.02] animate-fade-in">
                  <span className="font-mono text-[10px] text-muted uppercase tracking-wider">Current Price</span>
                  <p className="font-heading text-2xl text-primary mt-1 font-semibold">
                    {currentPrice}
                    {connected && (
                      <span className="ml-2 status-badge status-badge--active text-[8px]">LIVE</span>
                    )}
                  </p>
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

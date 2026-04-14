import React, { useState, useEffect } from "react";
import { createSpotOrder, fetchPrice } from "../api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { useWebSocket } from "../hooks/useWebSocket";

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
    <div className="py-10 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Spot Trading</CardTitle>
          <CardDescription>Place a basic spot buy/sell order using your spot wallet.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div>
              <label className="font-mono text-xs text-muted uppercase tracking-widest mb-2 block">
                Symbol
              </label>
              <Input name="symbol" value={form.symbol} onChange={handleChange} required />
            </div>
            {currentPrice && (
              <div className="text-center py-2 border border-white/5 rounded bg-black/20">
                <span className="font-mono text-xs text-muted uppercase">Current Price</span>
                <p className="font-heading text-xl text-primary">
                  {currentPrice} {connected && <span className="text-[10px] text-emerald-400 align-top">LIVE</span>}
                </p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-xs text-muted uppercase tracking-widest mb-2 block">
                  Side
                </label>
                <select
                  name="side"
                  value={form.side}
                  onChange={handleChange}
                  className="w-full bg-transparent border border-white/10 rounded px-3 py-2 text-sm"
                >
                  <option value="BUY">Buy</option>
                  <option value="SELL">Sell</option>
                </select>
              </div>
              <div>
                <label className="font-mono text-xs text-muted uppercase tracking-widest mb-2 block">
                  Order Type
                </label>
                <select
                  name="orderType"
                  value={form.orderType}
                  onChange={handleChange}
                  className="w-full bg-transparent border border-white/10 rounded px-3 py-2 text-sm"
                >
                  <option value="MARKET">Market</option>
                  <option value="LIMIT">Limit</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-xs text-muted uppercase tracking-widest mb-2 block">
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
                <div>
                  <label className="font-mono text-xs text-muted uppercase tracking-widest mb-2 block">
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
            {message && <p className="text-emerald-400 text-sm font-mono">{message}</p>}
            {error && <p className="text-red-400 text-sm font-mono">{error}</p>}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full font-mono" disabled={loading}>
              {loading ? "Placing..." : "Place Spot Order"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

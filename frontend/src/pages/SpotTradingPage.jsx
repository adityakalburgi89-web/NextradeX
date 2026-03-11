import React, { useState } from "react";
import { createSpotOrder } from "../api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

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


import React, { useState, useEffect } from "react";
import { openFuturesPosition, fetchOpenFuturesPositions } from "../api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

const initialForm = {
  symbol: "BTCUSDT",
  side: "BUY",
  quantity: "0.001",
  leverage: "10",
};

export default function FuturesTradingPage() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [positions, setPositions] = useState([]);

  const loadPositions = async () => {
    try {
      const res = await fetchOpenFuturesPositions();
      setPositions(res?.data || []);
    } catch {
      // ignore if not logged in
    }
  };

  useEffect(() => {
    loadPositions();
  }, []);

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
        quantity: parseFloat(form.quantity),
        leverage: parseFloat(form.leverage),
      };
      const res = await openFuturesPosition(payload);
      setMessage(res?.message || "Futures position opened");
      await loadPositions();
    } catch (err) {
      setError(err.message || "Failed to open position");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-10 space-y-8 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Futures Trading</CardTitle>
          <CardDescription>Open a simple leveraged futures position.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-xs text-muted uppercase tracking-widest mb-2 block">
                  Symbol
                </label>
                <Input name="symbol" value={form.symbol} onChange={handleChange} required />
              </div>
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
                  <option value="BUY">Long</option>
                  <option value="SELL">Short</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
              <div>
                <label className="font-mono text-xs text-muted uppercase tracking-widest mb-2 block">
                  Leverage
                </label>
                <Input
                  type="number"
                  step="1"
                  name="leverage"
                  value={form.leverage}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            {message && <p className="text-emerald-400 text-sm font-mono">{message}</p>}
            {error && <p className="text-red-400 text-sm font-mono">{error}</p>}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full font-mono" disabled={loading}>
              {loading ? "Opening..." : "Open Futures Position"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Open Positions</CardTitle>
          <CardDescription>List of your current futures positions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {positions.length === 0 && (
              <p className="text-muted text-sm">No open positions or not logged in.</p>
            )}
            {positions.map((p) => (
              <div
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-2 border border-white/5 rounded px-3 py-2"
              >
                <span className="font-mono">{p.symbol}</span>
                <span className="font-mono text-xs text-muted">
                  {p.positionMode} • {p.quantity} @ {p.entryPrice}
                </span>
                <span className="font-mono text-primary">
                  PnL: {p.unrealizedPnL} • {p.leverage}x
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


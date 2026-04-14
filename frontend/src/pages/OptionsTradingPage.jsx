import React, { useState, useEffect } from "react";
import { buyOption, settleOption, fetchOptionsPositions } from "../api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

const initialForm = {
  symbol: "BTCUSDT",
  optionType: "CALL",
  strikePrice: "50000",
  premium: "100",
  quantity: "1",
  expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
};

export default function OptionsTradingPage() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [positions, setPositions] = useState([]);

  const loadPositions = async () => {
    try {
      const res = await fetchOptionsPositions();
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
        optionType: form.optionType,
        strikePrice: form.strikePrice,
        premium: form.premium,
        quantity: form.quantity,
        expiryDate: form.expiryDate + "T00:00:00",
      };
      const res = await buyOption(payload);
      setMessage(res?.message || "Option contract created");
      await loadPositions();
    } catch (err) {
      setError(err.message || "Failed to buy option");
    } finally {
      setLoading(false);
    }
  };

  const handleSettle = async (contractId) => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await settleOption(contractId);
      setMessage(res?.message || "Option settled");
      await loadPositions();
    } catch (err) {
      setError(err.message || "Failed to settle option");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-10 space-y-8 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Options Trading</CardTitle>
          <CardDescription>Buy and trade cryptocurrency options contracts.</CardDescription>
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
                  Option Type
                </label>
                <select
                  name="optionType"
                  value={form.optionType}
                  onChange={handleChange}
                  className="w-full bg-transparent border border-white/10 rounded px-3 py-2 text-sm"
                >
                  <option value="CALL">Call (Bullish)</option>
                  <option value="PUT">Put (Bearish)</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-xs text-muted uppercase tracking-widest mb-2 block">
                  Strike Price
                </label>
                <Input
                  type="number"
                  step="0.01"
                  name="strikePrice"
                  value={form.strikePrice}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="font-mono text-xs text-muted uppercase tracking-widest mb-2 block">
                  Premium (per contract)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  name="premium"
                  value={form.premium}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-xs text-muted uppercase tracking-widest mb-2 block">
                  Quantity (contracts)
                </label>
                <Input
                  type="number"
                  step="1"
                  name="quantity"
                  value={form.quantity}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="font-mono text-xs text-muted uppercase tracking-widest mb-2 block">
                  Expiry Date
                </label>
                <Input
                  type="date"
                  name="expiryDate"
                  value={form.expiryDate}
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
              {loading ? "Creating..." : "Buy Option Contract"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Open Positions</CardTitle>
          <CardDescription>Your active options contracts.</CardDescription>
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
                  {p.optionType} • Strike: {p.strikePrice} • Premium: {p.premium}
                </span>
                <span className="font-mono text-xs">
                  Qty: {p.quantity} • Expires: {p.expiryDate?.split("T")[0]}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSettle(p.id)}
                  disabled={loading}
                >
                  Settle
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { buyOption, settleOption, fetchOptionsPositions } from "../api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Button } from "../components/ui/Button";
import { PageTransition } from "../components/ui/PageTransition";
import { SkeletonRow } from "../components/ui/Skeleton";

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
  const [loadingPositions, setLoadingPositions] = useState(true);

  const loadPositions = async () => {
    try {
      const res = await fetchOptionsPositions();
      setPositions(res?.data || []);
    } catch {
      // ignore if not logged in
    } finally {
      setLoadingPositions(false);
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
    <PageTransition>
      <div className="py-12 space-y-8 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Options Trading</CardTitle>
            <CardDescription>Buy and trade cryptocurrency options contracts.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-2.5 block">
                    Symbol
                  </label>
                  <Input name="symbol" value={form.symbol} onChange={handleChange} required />
                </div>
                <div>
                  <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-2.5 block">
                    Option Type
                  </label>
                  <Select name="optionType" value={form.optionType} onChange={handleChange}>
                    <option value="CALL">Call (Bullish)</option>
                    <option value="PUT">Put (Bearish)</option>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-2.5 block">
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
                  <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-2.5 block">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-2.5 block">
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
                  <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-2.5 block">
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
                Buy Option Contract
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
            <div className="space-y-0.5">
              {loadingPositions ? (
                <>
                  <SkeletonRow /><SkeletonRow /><SkeletonRow />
                </>
              ) : positions.length === 0 ? (
                <p className="text-muted text-sm py-6 text-center">No open positions or not logged in.</p>
              ) : (
                <div className="stagger-children">
                  {positions.map((p) => (
                    <div
                      key={p.id}
                      className="data-row flex-wrap gap-3"
                    >
                      <span className="font-mono text-sm font-medium">{p.symbol}</span>
                      <span className="font-mono text-xs text-muted">
                        {p.optionType} · Strike: {p.strikePrice} · Premium: {p.premium}
                      </span>
                      <span className="font-mono text-xs text-muted">
                        Qty: {p.quantity} · Expires: {p.expiryDate?.split("T")[0]}
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
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}

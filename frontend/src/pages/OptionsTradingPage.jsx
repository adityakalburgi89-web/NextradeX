import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { buyOption, settleOption, fetchOptionsPositions, hasAuthToken } from "../api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Button } from "../components/ui/Button";
import { PageTransition } from "../components/ui/PageTransition";
import { SkeletonRow } from "../components/ui/Skeleton";
import { Lock } from "lucide-react";

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

  const mockStrikes = [
    { strike: "90000", callPremium: "3450", putPremium: "1280", expiry: "2026-05-29" },
    { strike: "93000", callPremium: "2120", putPremium: "1950", expiry: "2026-05-29" },
    { strike: "96000", callPremium: "1150", putPremium: "2820", expiry: "2026-05-29" },
    { strike: "99000", callPremium: "620", putPremium: "4100", expiry: "2026-05-29" },
    { strike: "102000", callPremium: "310", putPremium: "5850", expiry: "2026-05-29" },
  ];

  const handleSelectStrike = (strike, type, premium) => {
    setForm((prev) => ({
      ...prev,
      strikePrice: strike,
      optionType: type,
      premium: premium,
    }));
  };

  const estimatedTotalCost = useMemo(() => {
    const qty = Number(form.quantity || 0);
    const premium = Number(form.premium || 0);
    return qty * premium;
  }, [form.quantity, form.premium]);

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-hairline-on-dark pb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white font-heading">Options Trading</h1>
            <p className="text-sm text-muted">Hedge your positions or speculate on market outcomes with highly structured options contracts.</p>
          </div>
          <span className="text-xs font-mono font-semibold text-muted bg-surface-card-dark px-3 py-1.5 rounded-lg border border-hairline-on-dark uppercase tracking-wider">
            Simulated Expirations · European Style
          </span>
        </div>

        {/* 8/4 Grid Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (8-cols): Options Chain & Positions */}
          <div className="lg:col-span-8 space-y-6">
            {/* Options Chain Board */}
            <Card className="bg-surface-card-dark border border-hairline-on-dark rounded-xl shadow-elevation-md overflow-hidden">
              <CardHeader className="border-b border-hairline-on-dark bg-canvas-dark/20 py-3 px-5">
                <CardTitle className="text-sm font-bold text-white uppercase tracking-wider">Options Chain (BTC/USDT)</CardTitle>
                <CardDescription className="text-xs text-muted">Click Call or Put premium to automatically configure order entry form.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-hairline-on-dark text-[10px] font-bold text-muted uppercase tracking-wider font-mono bg-canvas-dark/10">
                        <th className="py-2.5 px-4 text-center text-trading-up bg-trading-up/5">Call Premium</th>
                        <th className="py-2.5 px-4 text-center">Strike Price</th>
                        <th className="py-2.5 px-4 text-center text-trading-down bg-trading-down/5">Put Premium</th>
                        <th className="py-2.5 px-4 text-right">Expiration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-hairline-on-dark font-mono text-center">
                      {mockStrikes.map((s) => (
                        <tr key={s.strike} className="hover:bg-canvas-dark/20 transition-colors">
                          <td className="py-3 px-4 bg-trading-up/5">
                            <button
                              type="button"
                              onClick={() => handleSelectStrike(s.strike, "CALL", s.callPremium)}
                              className="px-3 py-1 font-bold rounded bg-trading-up/10 text-trading-up border border-trading-up/20 hover:bg-trading-up hover:text-white transition-all w-full text-center"
                            >
                              ${s.callPremium}
                            </button>
                          </td>
                          <td className="py-3 px-4 text-white font-bold text-sm bg-canvas-dark/10">
                            ${s.strike}
                          </td>
                          <td className="py-3 px-4 bg-trading-down/5">
                            <button
                              type="button"
                              onClick={() => handleSelectStrike(s.strike, "PUT", s.putPremium)}
                              className="px-3 py-1 font-bold rounded bg-trading-down/10 text-trading-down border border-trading-down/20 hover:bg-trading-down hover:text-white transition-all w-full text-center"
                            >
                              ${s.putPremium}
                            </button>
                          </td>
                          <td className="py-3 px-4 text-right text-muted">{s.expiry}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Open Positions Card */}
            <Card className="bg-surface-card-dark border border-hairline-on-dark rounded-xl shadow-elevation-md overflow-hidden">
              <CardHeader className="border-b border-hairline-on-dark bg-canvas-dark/20 py-3 px-5 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-white uppercase tracking-wider">Active Contracts</CardTitle>
                  <CardDescription className="text-xs text-muted font-sans">Options contracts held in simulated portfolio.</CardDescription>
                </div>
                <span className="text-[10px] font-mono text-muted bg-canvas-dark px-2 py-0.5 rounded border border-hairline-on-dark font-bold">
                  HELD CONT.: {positions.length}
                </span>
              </CardHeader>
              <CardContent className="p-0">
                {loadingPositions ? (
                  <div className="p-6 space-y-3">
                    <div className="h-6 bg-canvas-dark/40 rounded animate-pulse w-full" />
                    <div className="h-6 bg-canvas-dark/40 rounded animate-pulse w-full" />
                  </div>
                ) : positions.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-muted text-sm font-mono">No active options contracts. Select a strike to buy a contract.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-hairline-on-dark text-[10px] font-bold text-muted uppercase tracking-wider font-mono bg-canvas-dark/10">
                          <th className="py-3 px-5">Symbol</th>
                          <th className="py-3 px-5">Type</th>
                          <th className="py-3 px-5 text-right">Strike</th>
                          <th className="py-3 px-5 text-right">Premium Paid</th>
                          <th className="py-3 px-5 text-right">Quantity</th>
                          <th className="py-3 px-5 text-right">Expiry Date</th>
                          <th className="py-3 px-5 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-hairline-on-dark font-mono text-xs">
                        {positions.map((p) => (
                          <tr key={p.id} className="hover:bg-canvas-dark/25 transition-colors">
                            <td className="py-3 px-5 font-bold text-white">{p.symbol}</td>
                            <td className="py-3 px-5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${p.optionType === "CALL" ? "bg-trading-up/10 text-trading-up" : "bg-trading-down/10 text-trading-down"}`}>
                                {p.optionType}
                              </span>
                            </td>
                            <td className="py-3 px-5 text-right font-semibold text-white">${p.strikePrice}</td>
                            <td className="py-3 px-5 text-right text-muted">${p.premium}</td>
                            <td className="py-3 px-5 text-right text-white font-bold">{p.quantity}</td>
                            <td className="py-3 px-5 text-right text-muted">{p.expiryDate?.split("T")[0]}</td>
                            <td className="py-3 px-5 text-center">
                              <button
                                type="button"
                                className="px-3 py-1 font-bold text-[10px] font-mono rounded border border-hairline-on-dark hover:border-primary hover:text-primary transition-all uppercase"
                                onClick={() => handleSettle(p.id)}
                                disabled={loading}
                              >
                                Settle
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column (4-cols): Order Entry Form */}
          <div className="lg:col-span-4">
            <Card className="border border-hairline-on-dark bg-surface-card-dark rounded-xl overflow-hidden shadow-elevation-md relative">
              {!hasAuthToken() && (
                <div className="absolute inset-0 bg-[#0a0a0f]/85 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4">
                    <Lock size={20} className="text-primary" />
                  </div>
                  <h3 className="font-heading text-sm font-bold text-white mb-2 uppercase tracking-wide">Login Required</h3>
                  <p className="text-xs text-muted leading-relaxed mb-6 max-w-[200px]">
                    Access your simulated wallet and start trading by connecting your account.
                  </p>
                  <Button variant="default" className="w-full text-xs font-semibold py-2.5 rounded-lg shadow-glow-primary" asChild>
                    <Link to="/auth">Sign In / Connect Wallet</Link>
                  </Button>
                </div>
              )}
              <form onSubmit={handleSubmit}>
                {/* CALL/PUT Switcher Tabs */}
                <div className="flex border-b border-hairline-on-dark p-1 bg-canvas-dark/40">
                  <button
                    type="button"
                    className={`flex-1 py-3 text-center text-xs font-bold tracking-wider rounded transition-all ${
                      form.optionType === "CALL"
                        ? "bg-trading-up text-white shadow-sm"
                        : "text-muted hover:text-white"
                    }`}
                    onClick={() => setForm((prev) => ({ ...prev, optionType: "CALL" }))}
                  >
                    CALL (BULLISH)
                  </button>
                  <button
                    type="button"
                    className={`flex-1 py-3 text-center text-xs font-bold tracking-wider rounded transition-all ${
                      form.optionType === "PUT"
                        ? "bg-trading-down text-white shadow-sm"
                        : "text-muted hover:text-white"
                    }`}
                    onClick={() => setForm((prev) => ({ ...prev, optionType: "PUT" }))}
                  >
                    PUT (BEARISH)
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
                      Strike Price
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      name="strikePrice"
                      value={form.strikePrice}
                      onChange={handleChange}
                      required
                      className="bg-canvas-dark border-hairline-on-dark font-mono text-sm text-white w-full rounded-md"
                    />
                  </div>

                  <div>
                    <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-1.5 block">
                      Premium (per contract)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      name="premium"
                      value={form.premium}
                      onChange={handleChange}
                      required
                      className="bg-canvas-dark border-hairline-on-dark font-mono text-sm text-white w-full rounded-md"
                    />
                  </div>

                  <div>
                    <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-1.5 block">
                      Quantity (contracts)
                    </label>
                    <Input
                      type="number"
                      step="1"
                      name="quantity"
                      value={form.quantity}
                      onChange={handleChange}
                      required
                      className="bg-canvas-dark border-hairline-on-dark font-mono text-sm text-white w-full rounded-md"
                    />
                  </div>

                  <div>
                    <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-1.5 block">
                      Expiry Date
                    </label>
                    <Input
                      type="date"
                      name="expiryDate"
                      value={form.expiryDate}
                      onChange={handleChange}
                      required
                      className="bg-canvas-dark border-hairline-on-dark font-mono text-sm text-white w-full rounded-md"
                    />
                  </div>

                  {/* High/Low/Notional Summary */}
                  <div className="border border-hairline-on-dark bg-canvas-dark/40 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-muted">Total Premium Cost</span>
                      <span className="text-primary font-bold">${estimatedTotalCost}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-mono border-t border-hairline-on-dark pt-2">
                      <span className="text-muted">Option Style</span>
                      <span className="text-white font-semibold uppercase">{form.optionType} Options</span>
                    </div>
                  </div>

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
                    variant={form.optionType === "CALL" ? "tradingUp" : "tradingDown"}
                    loading={loading}
                  >
                    Buy {form.optionType === "CALL" ? "CALL" : "PUT"} Contract
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

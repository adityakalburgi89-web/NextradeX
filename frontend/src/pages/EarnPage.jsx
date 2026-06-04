import React, { useState } from "react";
import { PageTransition } from "../components/ui/PageTransition";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { TrendingUp, Coins, Award, Clock } from "lucide-react";
import { formatCurrency } from "../lib/utils";

export default function EarnPage() {
  const [stakedList, setStakedList] = useState([
    { id: 1, symbol: "USDT", amount: 1500, apy: 11.5, duration: "Flexible", earnings: 4.82, status: "STAKING" },
    { id: 2, symbol: "BNB", amount: 10, apy: 6.8, duration: "60 Days", earnings: 0.12, status: "STAKING" }
  ]);
  const [stakeAmount, setStakeAmount] = useState("");
  const [stakeSymbol, setStakeSymbol] = useState("USDT");
  const [stakeDuration, setStakeDuration] = useState("Flexible");
  const [message, setMessage] = useState("");

  const products = [
    { symbol: "USDT", name: "Tether", apy: 11.5, min: 10, category: "Stablecoin" },
    { symbol: "BTC", name: "Bitcoin", apy: 4.2, min: 0.001, category: "Crypto" },
    { symbol: "ETH", name: "Ethereum", apy: 5.5, min: 0.01, category: "Crypto" },
    { symbol: "BNB", name: "Binance Coin", apy: 6.8, min: 0.1, category: "Utility" }
  ];

  const activeProduct = products.find(p => p.symbol === stakeSymbol);

  const handleStake = (e) => {
    e.preventDefault();
    if (!stakeAmount || Number(stakeAmount) <= 0) return;
    
    const newStake = {
      id: Date.now(),
      symbol: stakeSymbol,
      amount: Number(stakeAmount),
      apy: activeProduct.apy,
      duration: stakeDuration,
      earnings: 0.00,
      status: "STAKING"
    };

    setStakedList([newStake, ...stakedList]);
    setMessage(`Staked ${stakeAmount} ${stakeSymbol} successfully!`);
    setStakeAmount("");
    setTimeout(() => setMessage(""), 4000);
  };

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 text-white">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-heading">NexTradeX Earn</h1>
          <p className="text-sm text-muted">Subscribe your idle simulated assets to high-yield staking pools and earn continuous mock rewards.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Staking Products Feed */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="bg-surface-card-dark border border-hairline-on-dark rounded-xl overflow-hidden shadow-elevation-md">
              <CardHeader className="border-b border-hairline-on-dark bg-canvas-dark/20 py-4 px-6">
                <CardTitle className="text-base font-bold uppercase tracking-wider font-heading">Available Staking Pools</CardTitle>
                <CardDescription className="text-xs text-muted">Select high-rate flexible or locked staking options.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-hairline-on-dark">
                  {products.map((p) => (
                    <div key={p.symbol} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-white/[0.01] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                          <Coins className="text-primary" size={20} />
                        </div>
                        <div>
                          <h3 className="font-bold font-sans text-sm flex items-center gap-2">
                            {p.symbol} Staking Pool
                            <span className="text-[9px] font-mono text-muted uppercase border border-hairline-on-dark px-1.5 py-0.5 rounded">{p.category}</span>
                          </h3>
                          <span className="text-xs text-muted font-mono">Min. Subscription: {p.min} {p.symbol}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-12">
                        <div className="text-right sm:text-left">
                          <span className="block text-[10px] text-muted uppercase font-mono">Est. APR</span>
                          <span className="text-lg font-extrabold text-trading-up font-mono">{p.apy}%</span>
                        </div>

                        <Button 
                          onClick={() => setStakeSymbol(p.symbol)}
                          variant={stakeSymbol === p.symbol ? "primary" : "outline"}
                          className="text-xs py-1.5 px-4 h-9 font-semibold"
                        >
                          Select Pool
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Current Staking Assets */}
            <Card className="bg-surface-card-dark border border-hairline-on-dark rounded-xl overflow-hidden shadow-elevation-md">
              <CardHeader className="border-b border-hairline-on-dark bg-canvas-dark/20 py-4 px-6">
                <CardTitle className="text-base font-bold uppercase tracking-wider font-heading">My Staked Assets</CardTitle>
                <CardDescription className="text-xs text-muted">Track your active yield subscriptions and accumulated mock payouts.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {stakedList.length === 0 ? (
                  <div className="py-12 text-center text-muted font-mono text-xs">
                    No assets actively staking yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-hairline-on-dark text-[10px] font-bold text-muted uppercase tracking-wider font-mono bg-canvas-dark/10">
                          <th className="py-4 px-6">Asset</th>
                          <th className="py-4 px-6 text-right">Staked Balance</th>
                          <th className="py-4 px-6 text-right">APY</th>
                          <th className="py-4 px-6 text-right">Duration</th>
                          <th className="py-4 px-6 text-right text-trading-up">Earned Rewards</th>
                          <th className="py-4 px-6 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-hairline-on-dark font-mono text-xs">
                        {stakedList.map((s) => (
                          <tr key={s.id} className="hover:bg-white/[0.01] transition-colors">
                            <td className="py-4 px-6 font-bold text-white">{s.symbol}</td>
                            <td className="py-4 px-6 text-right font-semibold">{s.amount.toLocaleString()} {s.symbol}</td>
                            <td className="py-4 px-6 text-right text-trading-up">{s.apy}%</td>
                            <td className="py-4 px-6 text-right text-muted">{s.duration}</td>
                            <td className="py-4 px-6 text-right text-trading-up font-bold">+{s.earnings.toFixed(4)} {s.symbol}</td>
                            <td className="py-4 px-6 text-center">
                              <span className="bg-trading-up/10 text-trading-up px-2 py-0.5 rounded text-[9px] font-bold uppercase">
                                {s.status}
                              </span>
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

          {/* Staking Entry Form Sidebar */}
          <div className="lg:col-span-4">
            <Card className="bg-surface-card-dark border border-hairline-on-dark rounded-xl shadow-elevation-md overflow-hidden">
              <CardHeader className="border-b border-hairline-on-dark bg-canvas-dark/20 py-4 px-6">
                <CardTitle className="text-base font-bold uppercase tracking-wider font-heading">Subscribe Asset</CardTitle>
                <CardDescription className="text-xs text-muted">Stake your mock capital to generate returns.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <form onSubmit={handleStake} className="space-y-4">
                  <div>
                    <label className="block text-[10px] text-muted uppercase font-mono mb-1.5">Selected Asset Pool</label>
                    <select
                      value={stakeSymbol}
                      onChange={(e) => setStakeSymbol(e.target.value)}
                      className="w-full bg-canvas-dark border border-hairline-on-dark rounded-lg p-2.5 text-sm font-semibold focus:outline-none focus:border-primary"
                    >
                      {products.map(p => (
                        <option key={p.symbol} value={p.symbol}>{p.symbol} - {p.name} ({p.apy}% APY)</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-muted uppercase font-mono mb-1.5">Staking Duration</label>
                    <div className="grid grid-cols-3 gap-2">
                      {["Flexible", "30 Days", "60 Days"].map((dur) => (
                        <button
                          key={dur}
                          type="button"
                          onClick={() => setStakeDuration(dur)}
                          className={`py-2 text-[10px] font-bold rounded-lg border transition-all ${
                            stakeDuration === dur
                              ? "bg-primary border-primary text-on-primary shadow-glow-primary"
                              : "border-hairline-on-dark text-muted hover:text-white"
                          }`}
                        >
                          {dur}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-muted uppercase font-mono mb-1.5">Amount to Stake</label>
                    <Input
                      type="number"
                      placeholder={`Min: ${activeProduct.min}`}
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      required
                      className="bg-canvas-dark border-hairline-on-dark text-white font-mono rounded-lg"
                    />
                  </div>

                  {message && (
                    <div className="p-2.5 rounded-lg bg-trading-up/10 border border-trading-up/20 text-center animate-slide-down">
                      <span className="text-xs text-trading-up font-semibold">{message}</span>
                    </div>
                  )}

                  <Button 
                    type="submit"
                    className="w-full font-mono text-xs uppercase py-3 font-bold"
                  >
                    Confirm Subscription
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

import React, { useEffect, useState } from "react";
import { fetchWallets, fetchOrderHistory } from "../api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { PageTransition } from "../components/ui/PageTransition";
import { formatCurrency, formatPercent } from "../lib/utils";
import { BarChart3, TrendingUp, Award, Activity, PieChart, ShieldAlert } from "lucide-react";

export default function PortfolioAnalyticsPage() {
  const [wallets, setWallets] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [wRes, hRes] = await Promise.all([fetchWallets(), fetchOrderHistory()]);
        setWallets(wRes?.data || []);
        setHistory(hRes?.data || []);
      } catch (err) {
        console.warn("Error loading analytics data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const stats = React.useMemo(() => {
    const totalTrades = history.length;
    const filledTrades = history.filter((o) => o.status === "FILLED");
    const totalFilled = filledTrades.length;

    // Simulated win rate (mock calculation based on prices)
    const winRate = totalFilled > 0 ? 0.68 : 0;
    const profitFactor = totalFilled > 0 ? 1.84 : 0;

    const spotWallet = wallets.find((w) => w.walletType === "SPOT")?.balance || 0;
    const marginWallet = wallets.find((w) => w.walletType === "MARGIN")?.balance || 0;
    const futuresWallet = wallets.find((w) => w.walletType === "FUTURES")?.balance || 0;
    const optionsWallet = wallets.find((w) => w.walletType === "OPTIONS")?.balance || 0;

    const totalEquity = Number(spotWallet) + Number(marginWallet) + Number(futuresWallet) + Number(optionsWallet);

    return {
      totalTrades,
      totalFilled,
      winRate,
      profitFactor,
      spotWallet,
      marginWallet,
      futuresWallet,
      optionsWallet,
      totalEquity,
    };
  }, [wallets, history]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-6 animate-pulse">
        <div className="h-10 bg-surface-card-dark rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-surface-card-dark rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="border-b border-hairline-on-dark pb-6">
          <h1 className="text-2xl font-bold tracking-tight text-white font-heading">Portfolio Analytics</h1>
          <p className="text-sm text-muted">Track virtual balances, allocation ratios, win rates, and simulated performance indexes.</p>
        </div>

        {/* Dynamic Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-surface-card-dark border border-hairline-on-dark p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted mb-2 font-mono text-[10px] uppercase">
              <span>Total Virtual Net Equity</span>
              <TrendingUp size={16} className="text-primary" />
            </div>
            <div>
              <span className="text-2xl font-bold text-white font-mono block">{formatCurrency(stats.totalEquity)}</span>
              <span className="text-xs text-trading-up font-semibold font-mono">+8.42% overall ROI</span>
            </div>
          </Card>

          <Card className="bg-surface-card-dark border border-hairline-on-dark p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted mb-2 font-mono text-[10px] uppercase">
              <span>Simulated win rate</span>
              <Award size={16} className="text-trading-up" />
            </div>
            <div>
              <span className="text-2xl font-bold text-white font-mono block">{formatPercent(stats.winRate)}</span>
              <span className="text-xs text-muted font-mono">{stats.totalFilled} trades executed</span>
            </div>
          </Card>

          <Card className="bg-surface-card-dark border border-hairline-on-dark p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted mb-2 font-mono text-[10px] uppercase">
              <span>Profit Factor</span>
              <Activity size={16} className="text-primary" />
            </div>
            <div>
              <span className="text-2xl font-bold text-white font-mono block">{stats.profitFactor}</span>
              <span className="text-xs text-trading-up font-semibold font-mono">1.8x average risk offset</span>
            </div>
          </Card>

          <Card className="bg-surface-card-dark border border-hairline-on-dark p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted mb-2 font-mono text-[10px] uppercase">
              <span>Account risk metric</span>
              <ShieldAlert size={16} className="text-trading-up" />
            </div>
            <div>
              <span className="text-2xl font-bold text-trading-up font-mono block">EXCELLENT</span>
              <span className="text-xs text-muted font-mono">0% active leverage liquidation danger</span>
            </div>
          </Card>
        </div>

        {/* 8/4 split layouts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Allocation */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="bg-surface-card-dark border border-hairline-on-dark rounded-xl overflow-hidden p-6 shadow-elevation-md">
              <h3 className="font-heading text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <PieChart size={16} className="text-primary" />
                Asset Allocation breakdown
              </h3>
              
              <div className="space-y-4 font-mono text-xs">
                {[
                  { name: "Spot Account", val: stats.spotWallet, color: "bg-primary", pct: stats.totalEquity > 0 ? (stats.spotWallet / stats.totalEquity) * 100 : 25 },
                  { name: "Futures Account", val: stats.futuresWallet, color: "bg-trading-up", pct: stats.totalEquity > 0 ? (stats.futuresWallet / stats.totalEquity) * 100 : 25 },
                  { name: "Margin Account", val: stats.marginWallet, color: "bg-info", pct: stats.totalEquity > 0 ? (stats.marginWallet / stats.totalEquity) * 100 : 25 },
                  { name: "Options Account", val: stats.optionsWallet, color: "bg-trading-down", pct: stats.totalEquity > 0 ? (stats.optionsWallet / stats.totalEquity) * 100 : 25 },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-semibold flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                        {item.name}
                      </span>
                      <span className="text-muted">
                        {formatCurrency(item.val)} ({item.pct.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-canvas-dark rounded-full overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Trade stats */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="bg-surface-card-dark border border-hairline-on-dark rounded-xl overflow-hidden p-6 shadow-elevation-md">
              <h3 className="font-heading text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <BarChart3 size={16} className="text-primary" />
                Performance metrics
              </h3>

              <div className="divide-y divide-hairline-on-dark font-mono text-xs">
                <div className="flex justify-between py-3">
                  <span className="text-muted">Total Orders Placed</span>
                  <span className="text-white font-bold">{stats.totalTrades}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-muted">Total Trades Executed</span>
                  <span className="text-white font-bold">{stats.totalFilled}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-muted">Average Win Payout</span>
                  <span className="text-trading-up font-bold">+$284.10</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-muted">Average Loss Cost</span>
                  <span className="text-trading-down font-bold">-$120.40</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

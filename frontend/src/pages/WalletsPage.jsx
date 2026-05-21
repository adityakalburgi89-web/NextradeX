import React, { useEffect, useState } from "react";
import { fetchWallets } from "../api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card";
import { PageTransition } from "../components/ui/PageTransition";
import { SkeletonCard } from "../components/ui/Skeleton";

export default function WalletsPage() {
  const [wallets, setWallets] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchWallets();
        setWallets(res?.data || []);
      } catch (e) {
        setError("Failed to load wallets. Make sure you are logged in.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-hairline-on-dark pb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white font-heading">Asset Overview</h1>
            <p className="text-sm text-muted">View balances, margin metrics, and locked allocations across your simulated wallets.</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 text-xs font-bold font-mono tracking-wide rounded bg-primary text-on-primary hover:bg-[#f0b90b] transition-all">
              DEPOSIT
            </button>
            <button className="px-4 py-2 text-xs font-bold font-mono tracking-wide rounded border border-hairline-on-dark text-white hover:bg-surface-elevated-dark transition-all">
              WITHDRAW
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-trading-down/10 border border-trading-down/20 animate-slide-down mb-8">
            <p className="text-trading-down text-sm font-mono">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-48 bg-surface-card-dark border border-hairline-on-dark rounded-xl animate-pulse" />
            <div className="h-48 bg-surface-card-dark border border-hairline-on-dark rounded-xl animate-pulse" />
            <div className="h-48 bg-surface-card-dark border border-hairline-on-dark rounded-xl animate-pulse" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-children">
            {wallets.map((w) => (
              <Card key={w.id} className="bg-surface-card-dark border border-hairline-on-dark rounded-xl overflow-hidden hover:border-primary/20 transition-all duration-300 shadow-elevation-sm">
                <div className="border-b border-hairline-on-dark bg-canvas-dark/20 py-4 px-5">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-sm font-bold text-white uppercase tracking-wider font-mono">{w.walletType}</CardTitle>
                    <span className="text-[10px] font-mono text-muted">ID: {w.id}</span>
                  </div>
                </div>
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-baseline justify-between border-b border-hairline-on-dark pb-3">
                    <span className="font-mono text-xs text-muted uppercase tracking-wider">Total Balance</span>
                    <span className="font-mono text-2xl text-primary font-bold">{w.balance}</span>
                  </div>
                  <div className="space-y-2 font-mono text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-muted">Available</span>
                      <span className="text-trading-up font-semibold">{w.availableBalance}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted">Locked Funds</span>
                      <span className="text-white">{w.lockedFunds}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted">Unrealized PnL</span>
                      <span className={`font-semibold ${parseFloat(w.unrealizedPnL || "0") >= 0 ? "text-trading-up" : "text-trading-down"}`}>
                        {w.unrealizedPnL}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {wallets.length === 0 && !error && (
              <p className="text-muted text-sm py-8 text-center col-span-full font-mono">No wallets associated with your account yet.</p>
            )}
          </div>
        )}
      </div>
    </PageTransition>
  );
}

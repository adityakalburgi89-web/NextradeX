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
      <div className="py-12">
        <div className="stagger-children mb-10">
          <h1 className="font-heading text-3xl font-bold mb-3 tracking-tight">Wallets</h1>
          <p className="text-muted leading-relaxed">
            View balances for your spot, margin, and futures wallets.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-accent-red/10 border border-accent-red/20 animate-slide-down mb-8">
            <p className="text-accent-red text-sm font-mono">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SkeletonCard /><SkeletonCard /><SkeletonCard />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-children">
            {wallets.map((w) => (
              <Card key={w.id} className="group relative">
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader>
                  <CardTitle className="text-lg">{w.walletType}</CardTitle>
                  <CardDescription>Wallet ID {w.id}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-muted uppercase tracking-wider">Balance</span>
                      <span className="font-heading text-lg text-gradient font-semibold">{w.balance}</span>
                    </div>
                    <div className="glow-line" />
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-muted uppercase tracking-wider">Locked</span>
                      <span className="font-mono text-sm text-white">{w.lockedFunds}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-muted uppercase tracking-wider">Available</span>
                      <span className="font-mono text-sm text-accent-green">{w.availableBalance}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-muted uppercase tracking-wider">Unrealized PnL</span>
                      <span className="font-mono text-sm text-primary">{w.unrealizedPnL}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {wallets.length === 0 && !error && (
              <p className="text-muted text-sm py-8 text-center col-span-full">No wallets found.</p>
            )}
          </div>
        )}
      </div>
    </PageTransition>
  );
}

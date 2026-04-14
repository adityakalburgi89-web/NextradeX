import React, { useEffect, useState } from "react";
import { fetchAllPrices, fetchWallets } from "../api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card";
import { PageTransition } from "../components/ui/PageTransition";
import { SkeletonRow } from "../components/ui/Skeleton";

export default function DashboardPage() {
  const [prices, setPrices] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [error, setError] = useState("");
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [loadingWallets, setLoadingWallets] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const pricesRes = await fetchAllPrices();
        setPrices(pricesRes?.data || []);
      } catch (e) {
        setError("Failed to load prices");
      } finally {
        setLoadingPrices(false);
      }
      try {
        const walletsRes = await fetchWallets();
        setWallets(walletsRes?.data || []);
      } catch {
        // wallets require auth; ignore if unauthorized
      } finally {
        setLoadingWallets(false);
      }
    };
    load();
  }, []);

  return (
    <PageTransition>
      <div className="py-12 space-y-10">
        <div className="stagger-children">
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-3 tracking-tight">Trading Dashboard</h1>
          <p className="text-muted leading-relaxed max-w-2xl">
            Overview of market prices and your wallets. Use the navigation to place spot or futures trades.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-accent-red/10 border border-accent-red/20 animate-slide-down">
            <p className="text-accent-red text-sm font-mono">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Market Prices</CardTitle>
              <CardDescription>Live prices for supported symbols.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-0.5">
                {loadingPrices ? (
                  <>
                    <SkeletonRow /><SkeletonRow /><SkeletonRow /><SkeletonRow />
                  </>
                ) : prices.length === 0 ? (
                  <p className="text-muted text-sm py-4 text-center">No price data yet.</p>
                ) : (
                  <div className="stagger-children">
                    {prices.map((p) => (
                      <div key={p.id || p.symbol} className="data-row">
                        <span className="font-mono text-sm">{p.symbol}</span>
                        <span className="font-mono text-sm text-primary font-medium">{p.currentPrice}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Wallets</CardTitle>
              <CardDescription>Spot, margin, and futures balances.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-0.5">
                {loadingWallets ? (
                  <>
                    <SkeletonRow /><SkeletonRow /><SkeletonRow />
                  </>
                ) : wallets.length === 0 ? (
                  <p className="text-muted text-sm py-4 text-center">Log in to view your wallets.</p>
                ) : (
                  <div className="stagger-children">
                    {wallets.map((w) => (
                      <div key={w.id} className="data-row">
                        <span className="font-mono text-sm">{w.walletType}</span>
                        <span className="font-mono text-sm text-primary font-medium">{w.availableBalance}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}

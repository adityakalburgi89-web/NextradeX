import React, { useEffect, useState } from "react";
import { fetchAllPrices, fetchWallets } from "../api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card";

export default function DashboardPage() {
  const [prices, setPrices] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const pricesRes = await fetchAllPrices();
        setPrices(pricesRes?.data || []);
      } catch (e) {
        setError("Failed to load prices");
      }
      try {
        const walletsRes = await fetchWallets();
        setWallets(walletsRes?.data || []);
      } catch {
        // wallets require auth; ignore if unauthorized
      }
    };
    load();
  }, []);

  return (
    <div className="py-10 space-y-8">
      <div>
        <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">Trading Dashboard</h1>
        <p className="text-muted">
          Overview of market prices and your wallets. Use the navigation to place spot or futures trades.
        </p>
      </div>

      {error && <p className="text-red-400 text-sm font-mono">{error}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Market Prices</CardTitle>
            <CardDescription>Live prices for supported symbols.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {prices.length === 0 && <p className="text-muted text-sm">No price data yet.</p>}
              {prices.map((p) => (
                <div key={p.id || p.symbol} className="flex items-center justify-between text-sm">
                  <span className="font-mono">{p.symbol}</span>
                  <span className="font-mono text-primary">{p.currentPrice}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Wallets</CardTitle>
            <CardDescription>Spot, margin, and futures balances.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {wallets.length === 0 && (
                <p className="text-muted text-sm">Log in to view your wallets.</p>
              )}
              {wallets.map((w) => (
                <div key={w.id} className="flex items-center justify-between text-sm">
                  <span className="font-mono">{w.walletType}</span>
                  <span className="font-mono text-primary">{w.availableBalance}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


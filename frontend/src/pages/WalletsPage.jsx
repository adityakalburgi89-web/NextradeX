import React, { useEffect, useState } from "react";
import { fetchWallets } from "../api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card";

export default function WalletsPage() {
  const [wallets, setWallets] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchWallets();
        setWallets(res?.data || []);
      } catch (e) {
        setError("Failed to load wallets. Make sure you are logged in.");
      }
    };
    load();
  }, []);

  return (
    <div className="py-10">
      <h1 className="font-heading text-3xl font-bold mb-2">Wallets</h1>
      <p className="text-muted mb-6">
        View balances for your spot, margin, and futures wallets.
      </p>

      {error && <p className="text-red-400 text-sm font-mono mb-4">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {wallets.map((w) => (
          <Card key={w.id}>
            <CardHeader>
              <CardTitle>{w.walletType}</CardTitle>
              <CardDescription>Wallet ID {w.id}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm font-mono">
                <p>Balance: {w.balance}</p>
                <p>Locked: {w.lockedFunds}</p>
                <p>Available: {w.availableBalance}</p>
                <p>Unrealized PnL: {w.unrealizedPnL}</p>
              </div>
            </CardContent>
          </Card>
        ))}
        {wallets.length === 0 && !error && (
          <p className="text-muted text-sm">No wallets found.</p>
        )}
      </div>
    </div>
  );
}


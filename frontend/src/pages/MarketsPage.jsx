import React, { useEffect, useState } from "react";
import { fetchAllPrices } from "../api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card";
import { Input } from "../components/ui/Input";

export default function MarketsPage() {
  const [prices, setPrices] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchAllPrices();
        setPrices(res?.data || []);
      } catch {
        // ignore simple errors
      }
    };
    load();
  }, []);

  const filtered = prices.filter((p) =>
    !query ? true : p.symbol?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="py-10 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-heading text-3xl font-bold mb-1">Markets</h1>
          <p className="text-muted text-sm">Browse available trading pairs and live prices.</p>
        </div>
        <div className="w-full sm:w-64">
          <Input
            placeholder="Filter by symbol (e.g. BTC)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Price Board</CardTitle>
          <CardDescription>Streaming-like snapshot from the backend price service.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {filtered.map((p) => (
              <div
                key={p.id || p.symbol}
                className="border border-white/5 rounded-lg px-3 py-2 bg-black/20 flex flex-col gap-1"
              >
                <span className="font-mono text-xs text-muted uppercase">{p.symbol}</span>
                <span className="font-heading text-lg text-primary">{p.currentPrice}</span>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-muted text-sm col-span-full">No markets match this filter.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


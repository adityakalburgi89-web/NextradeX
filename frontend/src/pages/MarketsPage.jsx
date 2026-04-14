import React, { useEffect, useState } from "react";
import { fetchAllPrices } from "../api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { PageTransition } from "../components/ui/PageTransition";
import { Skeleton } from "../components/ui/Skeleton";
import { useWebSocket } from "../hooks/useWebSocket";

export default function MarketsPage() {
  const [prices, setPrices] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const handlePriceUpdate = (data) => {
    if (Array.isArray(data)) {
      setPrices(data);
    } else if (data && data.symbol) {
      setPrices((prev) => {
        const existing = prev.findIndex((p) => p.symbol === data.symbol);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = data;
          return updated;
        }
        return [...prev, data];
      });
    }
  };

  const { connected } = useWebSocket("/topic/prices", handlePriceUpdate, true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchAllPrices();
        if (prices.length === 0) {
          setPrices(res?.data || []);
        }
      } catch {
        // ignore simple errors
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = prices.filter((p) =>
    !query ? true : p.symbol?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <PageTransition>
      <div className="py-12 space-y-8">
        <div className="flex items-center justify-between gap-6 flex-wrap">
          <div className="stagger-children">
            <h1 className="font-heading text-3xl font-bold mb-2 tracking-tight">Markets</h1>
            <p className="text-muted text-sm leading-relaxed">Browse available trading pairs and live prices.</p>
          </div>
          <div className="w-full sm:w-72">
            <Input
              placeholder="Filter by symbol (e.g. BTC)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Price Board</CardTitle>
                <CardDescription className="mt-1.5">
                  Streaming snapshot from the backend price service.
                </CardDescription>
              </div>
              {connected && (
                <div className="flex items-center gap-2 status-badge status-badge--active">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent-green" />
                  </span>
                  Live
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="rounded-xl border border-white/[0.06] p-4 space-y-3">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
                {filtered.map((p) => (
                  <div
                    key={p.id || p.symbol}
                    className="rounded-xl border border-white/[0.06] px-4 py-3.5 bg-white/[0.02] flex flex-col gap-1.5 hover:border-primary/30 hover:bg-white/[0.04] hover:shadow-glow-soft transition-all duration-300 gpu-accelerated cursor-default"
                  >
                    <span className="font-mono text-[10px] text-muted uppercase tracking-wider">{p.symbol}</span>
                    <span className="font-heading text-lg text-primary font-semibold">{p.currentPrice}</span>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <p className="text-muted text-sm col-span-full py-8 text-center">No markets match this filter.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}

import React, { useEffect, useState } from "react";
import { fetchActiveOrders, fetchOrderHistory } from "../api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card";

export default function OrdersPage() {
  const [active, setActive] = useState([]);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const a = await fetchActiveOrders();
        setActive(a?.data || []);
        const h = await fetchOrderHistory();
        setHistory(h?.data || []);
      } catch {
        setError("Failed to load orders. Make sure you are logged in.");
      }
    };
    load();
  }, []);

  return (
    <div className="py-10 space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold mb-2">Orders</h1>
        <p className="text-muted text-sm">Monitor your active and historical orders.</p>
      </div>

      {error && <p className="text-red-400 text-sm font-mono">{error}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Active Orders</CardTitle>
            <CardDescription>Orders that are currently open.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-xs md:text-sm font-mono">
              {active.length === 0 && <p className="text-muted text-sm">No active orders.</p>}
              {active.map((o) => (
                <div key={o.id} className="border border-white/5 rounded px-3 py-2 flex flex-col gap-1">
                  <span>
                    {o.symbol} • {o.side} • {o.orderType}
                  </span>
                  <span>
                    Qty {o.quantity} @ {o.price} • Status {o.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order History</CardTitle>
            <CardDescription>Previously executed, cancelled, or rejected orders.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-xs md:text-sm font-mono">
              {history.length === 0 && <p className="text-muted text-sm">No order history yet.</p>}
              {history.map((o) => (
                <div key={o.id} className="border border-white/5 rounded px-3 py-2 flex flex-col gap-1">
                  <span>
                    {o.symbol} • {o.tradeType} • {o.side}
                  </span>
                  <span>
                    Qty {o.quantity} @ {o.price} • Status {o.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


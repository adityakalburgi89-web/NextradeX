import React, { useEffect, useState } from "react";
import { fetchActiveOrders, fetchOrderHistory } from "../api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card";
import { PageTransition } from "../components/ui/PageTransition";
import { SkeletonRow } from "../components/ui/Skeleton";

function StatusBadge({ status }) {
  const statusMap = {
    FILLED: "status-badge--active",
    ACTIVE: "status-badge--active",
    OPEN: "status-badge--active",
    PENDING: "status-badge--pending",
    NEW: "status-badge--pending",
    CANCELLED: "status-badge--error",
    REJECTED: "status-badge--error",
    FAILED: "status-badge--error",
  };
  const cls = statusMap[status?.toUpperCase()] || "status-badge--neutral";
  return <span className={`status-badge ${cls}`}>{status}</span>;
}

export default function OrdersPage() {
  const [active, setActive] = useState([]);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const a = await fetchActiveOrders();
        setActive(a?.data || []);
        const h = await fetchOrderHistory();
        setHistory(h?.data || []);
      } catch {
        setError("Failed to load orders. Make sure you are logged in.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <PageTransition>
      <div className="py-12 space-y-8">
        <div className="stagger-children">
          <h1 className="font-heading text-3xl font-bold mb-3 tracking-tight">Orders</h1>
          <p className="text-muted text-sm leading-relaxed">Monitor your active and historical orders.</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-accent-red/10 border border-accent-red/20 animate-slide-down">
            <p className="text-accent-red text-sm font-mono">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Orders</CardTitle>
              <CardDescription>Orders that are currently open.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-0.5">
                {loading ? (
                  <>
                    <SkeletonRow /><SkeletonRow /><SkeletonRow />
                  </>
                ) : active.length === 0 ? (
                  <p className="text-muted text-sm py-6 text-center">No active orders.</p>
                ) : (
                  <div className="stagger-children">
                    {active.map((o) => (
                      <div key={o.id} className="data-row flex-col items-start gap-2">
                        <div className="flex items-center justify-between w-full">
                          <span className="font-mono text-sm font-medium">
                            {o.symbol} · {o.side} · {o.orderType}
                          </span>
                          <StatusBadge status={o.status} />
                        </div>
                        <span className="font-mono text-xs text-muted">
                          Qty {o.quantity} @ {o.price}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
              <CardDescription>Previously executed, cancelled, or rejected orders.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-0.5">
                {loading ? (
                  <>
                    <SkeletonRow /><SkeletonRow /><SkeletonRow />
                  </>
                ) : history.length === 0 ? (
                  <p className="text-muted text-sm py-6 text-center">No order history yet.</p>
                ) : (
                  <div className="stagger-children">
                    {history.map((o) => (
                      <div key={o.id} className="data-row flex-col items-start gap-2">
                        <div className="flex items-center justify-between w-full">
                          <span className="font-mono text-sm font-medium">
                            {o.symbol} · {o.tradeType} · {o.side}
                          </span>
                          <StatusBadge status={o.status} />
                        </div>
                        <span className="font-mono text-xs text-muted">
                          Qty {o.quantity} @ {o.price}
                        </span>
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

import React, { useEffect, useState, useMemo } from "react";
import { fetchActiveOrders, fetchOrderHistory, fetchOptionsHistory, cancelOrder } from "../api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card";
import { PageTransition } from "../components/ui/PageTransition";
import { formatCurrency } from "../lib/utils";
import { 
  Search, 
  Trash2, 
  Layers, 
  RefreshCw, 
  XCircle, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  History, 
  Calendar 
} from "lucide-react";
import { Button } from "../components/ui/Button";

function StatusBadge({ status }) {
  const statusMap = {
    FILLED: "bg-trading-up/10 text-trading-up border-trading-up/25",
    ACTIVE: "bg-trading-up/10 text-trading-up border-trading-up/25",
    OPEN: "bg-trading-up/10 text-trading-up border-trading-up/25",
    PENDING: "bg-primary/10 text-primary border-primary/25",
    NEW: "bg-primary/10 text-primary border-primary/25",
    CANCELLED: "bg-trading-down/10 text-trading-down border-trading-down/25",
    REJECTED: "bg-trading-down/10 text-trading-down border-trading-down/25",
    FAILED: "bg-trading-down/10 text-trading-down border-trading-down/25",
    SETTLED: "bg-[#a370f7]/10 text-[#a370f7] border-[#a370f7]/25",
  };
  
  const cls = statusMap[status?.toUpperCase()] || "bg-white/10 text-muted border-white/10";
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border uppercase tracking-wide ${cls}`}>
      {status}
    </span>
  );
}

export default function OrdersPage() {
  const [activeOrders, setActiveOrders] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [optionsHistory, setOptionsHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Tab State
  const [activeTab, setActiveTab] = useState("ACTIVE"); // ACTIVE, HISTORY, OPTIONS

  // Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [sideFilter, setSideFilter] = useState("ALL"); // ALL, BUY, SELL
  const [cancellingOrderId, setCancellingOrderId] = useState(null);

  const loadData = async () => {
    try {
      const [activeRes, historyRes, optionsRes] = await Promise.all([
        fetchActiveOrders().catch(() => ({ data: [] })),
        fetchOrderHistory().catch(() => ({ data: [] })),
        fetchOptionsHistory().catch(() => ({ data: [] }))
      ]);

      setActiveOrders(activeRes?.data || []);
      setOrderHistory(historyRes?.data || []);
      setOptionsHistory(optionsRes?.data || []);
      setError("");
    } catch (err) {
      setError("Failed to load order ledger indices. Ensure your authorization session is valid.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Cancel Order action handler
  const handleCancelOrder = async (orderId) => {
    try {
      setError("");
      setCancellingOrderId(orderId);
      await cancelOrder(orderId);
      setSuccessMessage(`Order #${orderId.toString().substring(0, 8)} cancelled successfully.`);
      await loadData();
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (e) {
      setError(e.message || "Failed to cancel order.");
    } finally {
      setCancellingOrderId(null);
    }
  };

  // Filter Active Orders
  const filteredActive = useMemo(() => {
    return activeOrders.filter((o) => {
      const matchesSearch = o.symbol.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSide = sideFilter === "ALL" || o.side?.toUpperCase() === sideFilter;
      return matchesSearch && matchesSide;
    });
  }, [activeOrders, searchQuery, sideFilter]);

  // Filter Spot History
  const filteredHistory = useMemo(() => {
    return orderHistory.filter((o) => {
      const matchesSearch = o.symbol.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSide = sideFilter === "ALL" || o.side?.toUpperCase() === sideFilter;
      return matchesSearch && matchesSide;
    });
  }, [orderHistory, searchQuery, sideFilter]);

  // Filter Options Settlements
  const filteredOptions = useMemo(() => {
    return optionsHistory.filter((o) => {
      const matchesSearch = o.symbol.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSide = sideFilter === "ALL" || o.optionType?.toUpperCase() === sideFilter;
      return matchesSearch && matchesSide;
    });
  }, [optionsHistory, searchQuery, sideFilter]);

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 bg-canvas-dark text-white min-h-screen font-body">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-hairline-on-dark pb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight font-heading flex items-center gap-2">
              <Clock className="text-primary" size={26} />
              Simulated Order Board
            </h1>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              Monitor active open fills, verify simulated spot execution histories, and audit options contract settlements.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`p-2.5 rounded-lg border border-hairline-on-dark hover:border-primary/30 bg-surface-card-dark hover:bg-surface-elevated-dark text-muted hover:text-white transition-all flex items-center justify-center ${
                refreshing ? "animate-spin text-primary" : ""
              }`}
              title="Sync Ledger"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* FEEDBACK BANNERS */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-trading-down/10 border border-trading-down/20 animate-slide-down">
            <p className="text-trading-down text-xs font-mono">{error}</p>
          </div>
        )}
        {successMessage && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-trading-up/10 border border-trading-up/20 animate-slide-down">
            <p className="text-trading-up text-xs font-mono">{successMessage}</p>
          </div>
        )}

        {/* FILTER TOOLBAR */}
        <div className="bg-[#121218] border border-hairline-on-dark rounded-xl p-4 flex flex-col md:flex-row justify-between gap-4 items-center shadow-sm">
          {/* Tabs Selector */}
          <div className="flex gap-2 p-1 bg-canvas-dark border border-hairline-on-dark rounded-lg w-full md:w-auto">
            <button
              onClick={() => setActiveTab("ACTIVE")}
              className={`flex-1 md:flex-initial px-4 py-1.5 text-center text-xs font-bold tracking-wide rounded transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "ACTIVE"
                  ? "bg-surface-elevated-dark text-primary border border-hairline-on-dark/50"
                  : "text-muted hover:text-white"
              }`}
            >
              <Clock size={13} />
              Open Orders ({activeOrders.length})
            </button>
            <button
              onClick={() => setActiveTab("HISTORY")}
              className={`flex-1 md:flex-initial px-4 py-1.5 text-center text-xs font-bold tracking-wide rounded transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "HISTORY"
                  ? "bg-surface-elevated-dark text-primary border border-hairline-on-dark/50"
                  : "text-muted hover:text-white"
              }`}
            >
              <History size={13} />
              Spot History ({orderHistory.length})
            </button>
            <button
              onClick={() => setActiveTab("OPTIONS")}
              className={`flex-1 md:flex-initial px-4 py-1.5 text-center text-xs font-bold tracking-wide rounded transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "OPTIONS"
                  ? "bg-surface-elevated-dark text-primary border border-hairline-on-dark/50"
                  : "text-muted hover:text-white"
              }`}
            >
              <Layers size={13} />
              Option Settlements ({optionsHistory.length})
            </button>
          </div>

          {/* Input filters */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
              <input
                type="text"
                placeholder="Search symbol..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-canvas-dark border border-hairline-on-dark rounded-lg pl-8 pr-3 py-2 text-xs font-mono w-full text-white placeholder-muted outline-none focus:border-primary transition-all"
              />
            </div>

            {/* Side Select */}
            <select
              value={sideFilter}
              onChange={(e) => setSideFilter(e.target.value)}
              className="bg-canvas-dark border border-hairline-on-dark rounded-lg px-3 py-2 font-mono text-xs text-white cursor-pointer outline-none focus:border-primary"
            >
              <option value="ALL">ALL SIDES</option>
              <option value="BUY">BUY / CALL</option>
              <option value="SELL">SELL / PUT</option>
            </select>
          </div>
        </div>

        {/* DATA CONTAINER */}
        <Card className="bg-[#121218] border border-hairline-on-dark rounded-xl overflow-hidden shadow-elevation-lg">
          <CardHeader className="bg-[#181822] px-6 py-4 border-b border-hairline-on-dark">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-white">
              {activeTab === "ACTIVE" && "Active Open Positions"}
              {activeTab === "HISTORY" && "Spot Trades Execution log"}
              {activeTab === "OPTIONS" && "European Option Settlements"}
            </CardTitle>
            <CardDescription className="text-[10px] text-muted font-sans mt-0.5">
              {activeTab === "ACTIVE" && "Active order books streaming simulated WebSocket match schedules."}
              {activeTab === "HISTORY" && "Chronological list of successfully executed spot pairs."}
              {activeTab === "OPTIONS" && "Simulated options contracts settled or expired under exercise conditions."}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="py-20 text-center animate-pulse flex flex-col items-center justify-center gap-3">
                <RefreshCw size={24} className="animate-spin text-primary" />
                <span className="text-xs text-muted font-mono">Synchronizing order matrices...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                {activeTab === "ACTIVE" && (
                  <table className="w-full text-left border-collapse font-mono text-xs">
                    <thead>
                      <tr className="border-b border-hairline-on-dark text-[9px] font-bold text-muted uppercase tracking-wider bg-canvas-dark/20 py-2.5">
                        <th className="py-3 px-6">Pair</th>
                        <th className="py-3 px-6">Side</th>
                        <th className="py-3 px-6">Type</th>
                        <th className="py-3 px-6 text-right">Price</th>
                        <th className="py-3 px-6 text-right">Size</th>
                        <th className="py-3 px-6 text-right">Filled %</th>
                        <th className="py-3 px-6 text-center">Status</th>
                        <th className="py-3 px-6 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-hairline-on-dark">
                      {filteredActive.map((o) => {
                        const isCancelling = cancellingOrderId === o.id;
                        const fillPct = (o.filledQuantity / o.quantity) * 100;
                        return (
                          <tr key={o.id} className="hover:bg-white/[0.01] transition-colors">
                            <td className="py-3.5 px-6 font-bold text-white">{o.symbol}</td>
                            <td className="py-3.5 px-6">
                              <span className={`font-bold ${o.side === "BUY" ? "text-trading-up" : "text-trading-down"}`}>
                                {o.side}
                              </span>
                            </td>
                            <td className="py-3.5 px-6 text-muted uppercase text-[10px]">{o.tradeType} {o.orderType}</td>
                            <td className="py-3.5 px-6 text-right font-semibold">{formatCurrency(o.price)}</td>
                            <td className="py-3.5 px-6 text-right">{o.quantity}</td>
                            <td className="py-3.5 px-6 text-right">{fillPct.toFixed(1)}%</td>
                            <td className="py-3.5 px-6 text-center">
                              <StatusBadge status={o.status} />
                            </td>
                            <td className="py-3.5 px-6 text-center">
                              <button
                                onClick={() => handleCancelOrder(o.id)}
                                disabled={isCancelling}
                                className={`text-trading-down hover:text-white transition-colors p-1.5 rounded hover:bg-trading-down/10 border border-transparent hover:border-trading-down/20 ${
                                  isCancelling ? "animate-pulse cursor-not-allowed" : ""
                                }`}
                                title="Cancel Order"
                              >
                                {isCancelling ? (
                                  <RefreshCw size={13} className="animate-spin" />
                                ) : (
                                  <Trash2 size={13} />
                                )}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredActive.length === 0 && (
                        <tr>
                          <td colSpan="8" className="py-16 text-center text-muted text-xs">
                            No open simulation orders currently match your filter settings.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}

                {activeTab === "HISTORY" && (
                  <table className="w-full text-left border-collapse font-mono text-xs">
                    <thead>
                      <tr className="border-b border-hairline-on-dark text-[9px] font-bold text-muted uppercase tracking-wider bg-canvas-dark/20 py-2.5">
                        <th className="py-3 px-6">Timestamp</th>
                        <th className="py-3 px-6">Pair</th>
                        <th className="py-3 px-6">Side</th>
                        <th className="py-3 px-6">Type</th>
                        <th className="py-3 px-6 text-right">Price</th>
                        <th className="py-3 px-6 text-right">Executed Size</th>
                        <th className="py-3 px-6 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-hairline-on-dark">
                      {filteredHistory.map((o) => (
                        <tr key={o.id} className="hover:bg-white/[0.01] transition-colors">
                          <td className="py-3.5 px-6 text-muted text-[10px]">
                            {o.createdAt ? new Date(o.createdAt).toLocaleString() : "--"}
                          </td>
                          <td className="py-3.5 px-6 font-bold text-white">{o.symbol}</td>
                          <td className="py-3.5 px-6">
                            <span className={`font-bold ${o.side === "BUY" ? "text-trading-up" : "text-trading-down"}`}>
                              {o.side}
                            </span>
                          </td>
                          <td className="py-3.5 px-6 text-muted uppercase text-[10px]">{o.tradeType} {o.orderType}</td>
                          <td className="py-3.5 px-6 text-right font-semibold">{formatCurrency(o.price)}</td>
                          <td className="py-3.5 px-6 text-right">{o.filledQuantity}</td>
                          <td className="py-3.5 px-6 text-center">
                            <StatusBadge status={o.status} />
                          </td>
                        </tr>
                      ))}
                      {filteredHistory.length === 0 && (
                        <tr>
                          <td colSpan="7" className="py-16 text-center text-muted text-xs">
                            No execution history registers match your filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}

                {activeTab === "OPTIONS" && (
                  <table className="w-full text-left border-collapse font-mono text-xs">
                    <thead>
                      <tr className="border-b border-hairline-on-dark text-[9px] font-bold text-muted uppercase tracking-wider bg-canvas-dark/20 py-2.5">
                        <th className="py-3 px-6">Expiration Date</th>
                        <th className="py-3 px-6">Symbol</th>
                        <th className="py-3 px-6">Option Type</th>
                        <th className="py-3 px-6 text-right">Strike Price</th>
                        <th className="py-3 px-6 text-right">Size</th>
                        <th className="py-3 px-6 text-right">Settled PnL</th>
                        <th className="py-3 px-6 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-hairline-on-dark">
                      {filteredOptions.map((o) => {
                        const pnl = Number(o.profitOrLoss || 0);
                        const isProfit = pnl >= 0;
                        return (
                          <tr key={o.id} className="hover:bg-white/[0.01] transition-colors">
                            <td className="py-3.5 px-6 text-muted text-[10px]">
                              {o.expirationDate ? new Date(o.expirationDate).toLocaleString() : "--"}
                            </td>
                            <td className="py-3.5 px-6 font-bold text-white">{o.symbol}</td>
                            <td className="py-3.5 px-6">
                              <span className={`font-bold ${o.optionType === "CALL" ? "text-trading-up" : "text-trading-down"}`}>
                                {o.optionType}
                              </span>
                            </td>
                            <td className="py-3.5 px-6 text-right font-semibold">{formatCurrency(o.strikePrice)}</td>
                            <td className="py-3.5 px-6 text-right text-muted">{o.quantity}</td>
                            <td className={`py-3.5 px-6 text-right font-bold ${isProfit ? "text-trading-up" : "text-trading-down"}`}>
                              {pnl !== 0 ? (isProfit ? "+" : "") : ""}
                              {pnl !== 0 ? formatCurrency(pnl) : "--"}
                            </td>
                            <td className="py-3.5 px-6 text-center">
                              <StatusBadge status={o.status} />
                            </td>
                          </tr>
                        );
                      })}
                      {filteredOptions.length === 0 && (
                        <tr>
                          <td colSpan="7" className="py-16 text-center text-muted text-xs">
                            No option contract settlements matched your selections.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </PageTransition>
  );
}

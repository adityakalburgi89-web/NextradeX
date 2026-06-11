import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { 
  fetchCandlestickData, 
  fetchOpenMarginPositions, 
  fetchPrice, 
  openMarginPosition, 
  closeMarginPosition,
  fetchActiveOrders,
  fetchOrderHistory,
  cancelOrder,
  fetchWallets,
  hasAuthToken
} from "../api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Button } from "../components/ui/Button";
import { PageTransition } from "../components/ui/PageTransition";
import { TradingChartPanel } from "../components/ui/TradingChartPanel";
import { OrderBook } from "../components/ui/OrderBook";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { useWebSocket } from "../hooks/useWebSocket";
import { formatCurrency, formatPercent } from "../lib/utils";
import { ArrowRightLeft, Info, Trash2, Activity, Coins, ClipboardList, Lock } from "lucide-react";

const initialForm = {
  symbol: "BTCUSDT",
  side: "BUY",
  quantity: "0.001",
  leverage: "5",
};

export default function MarginTradingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Set initial symbol from URL if present
  const getInitialSymbol = () => {
    const urlSym = searchParams.get("symbol");
    return urlSym ? urlSym.toUpperCase() : "BTCUSDT";
  };

  const [form, setForm] = useState({
    ...initialForm,
    symbol: getInitialSymbol()
  });

  // Read symbol from URL search parameters on URL change
  useEffect(() => {
    const urlSym = searchParams.get("symbol");
    if (urlSym && urlSym.toUpperCase() !== form.symbol) {
      setForm(prev => ({ ...prev, symbol: urlSym.toUpperCase() }));
    }
  }, [searchParams]);

  // Update URL search parameters when form.symbol changes
  useEffect(() => {
    if (form.symbol) {
      setSearchParams({ symbol: form.symbol });
    }
  }, [form.symbol]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [positions, setPositions] = useState([]);
  const [loadingPositions, setLoadingPositions] = useState(true);
  const [candleData, setCandleData] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [priceSnapshot, setPriceSnapshot] = useState(null);
  const [interval, setInterval] = useState("1h");

  // Bottom tabs & User account states
  const [activeBottomTab, setActiveBottomTab] = useState("POSITIONS"); // POSITIONS, ORDERS, HISTORY, ASSETS
  const [activeOrders, setActiveOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orderHistory, setOrderHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [marginWalletBalance, setMarginWalletBalance] = useState(0.00);
  const [loadingWallets, setLoadingWallets] = useState(true);
  const [pricesMap, setPricesMap] = useState({});
  const [recentTrades, setRecentTrades] = useState([]);

  // Pre-populate recent trades when priceSnapshot loads or symbol changes
  useEffect(() => {
    const basePrice = Number(priceSnapshot?.currentPrice || pricesMap[form.symbol.toUpperCase()] || 69969.3);
    if (basePrice) {
      const initialTrades = Array.from({ length: 6 }).map((_, idx) => {
        const diff = (Math.random() - 0.5) * (basePrice * 0.002);
        const tradePrice = basePrice + diff;
        const timeOffset = idx * 3;
        const timeStr = new Date(Date.now() - timeOffset * 1000).toTimeString().split(" ")[0];
        return {
          id: idx + "_" + form.symbol,
          price: parseFloat(tradePrice.toFixed(2)),
          amount: parseFloat((Math.random() * 1.5 + 0.01).toFixed(4)),
          time: timeStr,
          side: Math.random() > 0.48 ? "BUY" : "SELL"
        };
      });
      setRecentTrades(initialTrades);
    }
  }, [priceSnapshot?.currentPrice, form.symbol]);

  const loadPositions = async () => {
    try {
      const res = await fetchOpenMarginPositions();
      setPositions(res?.data || []);
    } catch (err) {
      console.warn("Could not retrieve margin positions:", err.message);
    } finally {
      setLoadingPositions(false);
    }
  };

  const loadActiveOrders = async () => {
    try {
      const activeRes = await fetchActiveOrders();
      const historyRes = await fetchOrderHistory();
      
      const activeFiltered = (activeRes?.data || []).filter(o => o.tradeType === "MARGIN");
      const historyFiltered = (historyRes?.data || []).filter(o => o.tradeType === "MARGIN");
      
      const combined = [...activeFiltered, ...historyFiltered];
      combined.sort((a, b) => b.id - a.id);
      
      setActiveOrders(combined.slice(0, 50));
    } catch (err) {
      console.warn("Could not retrieve active orders:", err.message);
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadOrderHistory = async () => {
    try {
      const res = await fetchOrderHistory();
      const filtered = (res?.data || []).filter(o => o.tradeType === "MARGIN");
      filtered.sort((a, b) => b.id - a.id);
      setOrderHistory(filtered);
    } catch (err) {
      console.warn("Could not retrieve order history:", err.message);
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadWallet = async () => {
    try {
      const res = await fetchWallets();
      const marginWallet = res?.data?.find(w => w.walletType === "MARGIN");
      if (marginWallet) {
        setMarginWalletBalance(Number(marginWallet.balance || 0));
      }
    } catch (err) {
      console.warn("Could not retrieve margin wallet balance:", err.message);
    } finally {
      setLoadingWallets(false);
    }
  };

  const loadAllUserData = () => {
    loadPositions();
    loadActiveOrders();
    loadOrderHistory();
    loadWallet();
  };

  useEffect(() => {
    loadAllUserData();
  }, [form.symbol]);

  useEffect(() => {
    const loadPrice = async () => {
      try {
        const response = await fetchPrice(form.symbol);
        setPriceSnapshot(response?.data || null);
      } catch {
        setPriceSnapshot(null);
      }
    };

    loadPrice();
  }, [form.symbol]);

  const handlePriceUpdate = (data) => {
    if (data) {
      setPricesMap((prev) => {
        const next = { ...prev };
        if (Array.isArray(data)) {
          data.forEach((p) => {
            next[p.symbol.toUpperCase()] = Number(p.currentPrice);
          });
        } else if (data.symbol) {
          next[data.symbol.toUpperCase()] = Number(data.currentPrice);
        }
        return next;
      });
    }

    let update = null;
    const currentSymbol = form.symbol.toUpperCase();

    if (Array.isArray(data)) {
      update = data.find((p) => p.symbol.toUpperCase() === currentSymbol);
    } else if (data && data.symbol.toUpperCase() === currentSymbol) {
      update = data;
    }

    if (update) {
      const newPrice = Number(update.currentPrice);
      setPriceSnapshot(update);

      // Add a new trade to recent trades list
      const newTrade = {
        id: Date.now(),
        price: parseFloat(newPrice.toFixed(2)),
        amount: parseFloat((Math.random() * 1.5 + 0.01).toFixed(4)),
        time: new Date().toTimeString().split(" ")[0],
        side: Math.random() > 0.48 ? "BUY" : "SELL"
      };
      setRecentTrades((trades) => [newTrade, ...trades.slice(0, 8)]);

      // Real-time chart update: modify the last candle
      setCandleData((prev) => {
        if (!prev || prev.length === 0) return prev;
        const lastIndex = prev.length - 1;
        const lastCandle = { ...prev[lastIndex] };
        
        lastCandle.close = newPrice;
        if (newPrice > lastCandle.high) lastCandle.high = newPrice;
        if (newPrice < lastCandle.low) lastCandle.low = newPrice;
        
        const next = [...prev];
        next[lastIndex] = lastCandle;
        return next;
      });
    }
  };

  const { connected } = useWebSocket("/topic/prices", handlePriceUpdate, true);

  useEffect(() => {
    const loadCandles = async () => {
      setChartLoading(true);
      try {
        const data = await fetchCandlestickData(form.symbol, interval, 120);
        setCandleData(data);
      } catch {
        setCandleData([]);
      } finally {
        setChartLoading(false);
      }
    };
    loadCandles();
  }, [form.symbol, interval]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const payload = {
        symbol: form.symbol,
        side: form.side,
        quantity: parseFloat(form.quantity),
        leverage: parseFloat(form.leverage),
      };
      const res = await openMarginPosition(payload);
      setMessage(res?.message || "Margin position opened successfully");
      loadAllUserData();
    } catch (err) {
      setError(err.message || "Failed to open margin position");
    } finally {
      setLoading(false);
    }
  };

  const handleClosePosition = async (positionId) => {
    try {
      await closeMarginPosition(positionId);
      setMessage("Margin position closed successfully");
      loadAllUserData();
    } catch (err) {
      setError(err.message || "Failed to close position");
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await cancelOrder(orderId);
      setMessage("Order cancelled successfully");
      loadAllUserData();
    } catch (err) {
      setError(err.message || "Failed to cancel order");
    }
  };

  const handleCloseAllPositions = async () => {
    if (positions.length === 0) return;
    setLoadingPositions(true);
    setError("");
    setMessage("");
    try {
      await Promise.all(positions.map((p) => closeMarginPosition(p.id)));
      setMessage("All margin positions closed successfully");
      loadAllUserData();
    } catch (err) {
      setError(err.message || "Failed to close all positions");
      loadAllUserData();
    } finally {
      setLoadingPositions(false);
    }
  };

  const handleCancelAllOrders = async () => {
    const ordersToCancel = activeOrders.filter(o => o.status === "OPEN" || o.status === "PARTIALLY_FILLED");
    if (ordersToCancel.length === 0) return;
    setLoadingOrders(true);
    setError("");
    setMessage("");
    try {
      await Promise.all(ordersToCancel.map((o) => cancelOrder(o.id)));
      setMessage("All open orders cancelled successfully");
      loadAllUserData();
    } catch (err) {
      setError(err.message || "Failed to cancel all orders");
      loadAllUserData();
    } finally {
      setLoadingOrders(false);
    }
  };

  // Sizing percentage handler
  const handlePercentSelect = (percent) => {
    const price = Number(priceSnapshot?.currentPrice || 1);
    const lev = Number(form.leverage || 1);
    const maxNotional = marginWalletBalance * lev;
    const targetNotional = maxNotional * (percent / 100);
    const targetQty = targetNotional / price;
    setForm(prev => ({ ...prev, quantity: targetQty.toFixed(4) }));
  };

  const marginDetails = useMemo(() => {
    const quantity = Number(form.quantity || 0);
    const leverage = Number(form.leverage || 1);
    const price = Number(priceSnapshot?.currentPrice || 0);
    const totalCost = quantity * price;
    const collateral = leverage > 0 ? totalCost / leverage : 0;
    const borrowed = totalCost - collateral;
    return { totalCost, collateral, borrowed };
  }, [form.leverage, form.quantity, priceSnapshot?.currentPrice]);

  const baseAsset = useMemo(() => form.symbol.replace("USDT", "").toUpperCase(), [form.symbol]);

  const chartStats = [
    {
      label: "Mark price",
      value: priceSnapshot?.currentPrice || 0,
      kind: "currency",
      icon: "price",
      hint: connected ? "Live websocket updates" : "Latest REST snapshot",
    },
    {
      label: "24H change",
      value: priceSnapshot?.percentChange24h || 0,
      kind: "percent",
      icon: "change",
      hint: `${formatCurrency(priceSnapshot?.priceChange24h || 0)} move`,
    },
    {
      label: "Required Collateral",
      value: marginDetails.collateral,
      kind: "currency",
      icon: "volume",
      hint: `Est. borrowed ${formatCurrency(marginDetails.borrowed)}`,
    },
    {
      label: "Margin positions",
      value: positions.length,
      icon: "momentum",
      hint: "Active leverage components",
    },
  ];

  return (
    <PageTransition>
      <div className="w-full bg-background text-foreground py-4 font-sans select-none min-h-screen">
        <div className="max-w-8xl mx-auto px-4 space-y-4">
          
          {/* HIGH-DENSITY HORIZONTAL TICKER BAR */}
          <div className="bg-background border border-transparent rounded-xl px-5 py-3.5 flex flex-wrap items-center justify-between gap-6 shadow-elevation-md">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-base font-extrabold font-heading flex items-center gap-1.5 text-foreground">
                  {form.symbol.toUpperCase()}
                  <span className="text-[9px] font-mono font-bold bg-primary/15 text-primary px-1 rounded uppercase">Margin {form.leverage}x</span>
                </h1>
                <span className="text-[10px] font-mono font-semibold text-muted">NexTradeX Margin</span>
              </div>

              {priceSnapshot && (
                <div className="border-l border-transparent pl-4 flex flex-col justify-center">
                  <span className="text-[10px] text-muted font-mono font-bold uppercase block">Index Price</span>
                  <span className="text-base font-extrabold font-mono text-trading-up">
                    {formatCurrency(priceSnapshot.currentPrice)}
                  </span>
                </div>
              )}
            </div>

            {priceSnapshot && (
              <div className="flex flex-wrap items-center gap-8 font-mono text-muted">
                <div className="min-w-[80px]">
                  <span className="block uppercase text-[9px]">24h Change</span>
                  <span className={`text-sm font-bold ${Number(priceSnapshot.percentChange24h) >= 0 ? "text-trading-up" : "text-trading-down"}`}>
                    {Number(priceSnapshot.percentChange24h) >= 0 ? "+" : ""}{priceSnapshot.percentChange24h}%
                  </span>
                </div>

                <div className="min-w-[100px]">
                  <span className="block uppercase text-[9px]">24H High</span>
                  <span className="text-sm font-bold text-foreground">{formatCurrency(priceSnapshot.highPrice || priceSnapshot.currentPrice)}</span>
                </div>

                <div className="min-w-[100px]">
                  <span className="block uppercase text-[9px]">24H Low</span>
                  <span className="text-sm font-bold text-foreground">{formatCurrency(priceSnapshot.lowPrice || priceSnapshot.currentPrice)}</span>
                </div>

                <div className="min-w-[110px]">
                  <span className="block uppercase text-[9px]">Collateral Ratio</span>
                  <span className="text-sm font-bold text-primary">{(marginDetails.collateral / (marginDetails.totalCost || 1) * 100).toFixed(1)}%</span>
                </div>

                <div className="min-w-[130px]">
                  <span className="block uppercase text-[9px]">Daily Borrow Interest</span>
                  <span className="text-sm font-bold text-foreground">0.05%</span>
                </div>
              </div>
            )}
          </div>

          {/* Three-Column Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            
            {/* Chart + Bottom Tab Panel (9-cols) & Bottom Sub-Grid Layout */}
            <div className="lg:col-span-9 space-y-4">
              <TradingChartPanel
                title="Margin Workspace"
                description="A leveraged Spot-Margin simulator that borrows capital from the pool to amplify trading outcomes."
                symbol={form.symbol}
                interval={interval}
                onIntervalChange={setInterval}
                loading={chartLoading}
                data={candleData}
                status={{ label: connected ? "Live market" : "Snapshot", tone: connected ? "active" : "neutral" }}
                stats={chartStats}
              />

              {/* Bottom Row Sub-Grid: Tabs (9-cols) + Order Book (3-cols) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-9 h-full">
                  <Tabs value={activeBottomTab} onValueChange={setActiveBottomTab} className="w-full h-full flex flex-col">
                    <Card className="bg-background border border-transparent rounded-xl overflow-hidden shadow-elevation-md h-full flex flex-col">
                      <div className="bg-background/30 border-b border-transparent px-4 flex items-center justify-between">
                        <TabsList className="flex gap-4 bg-transparent border-0 p-0 h-auto rounded-none">
                          {[
                            { id: "POSITIONS", label: "Margin Positions" },
                            { id: "ORDERS", label: "Open Orders" },
                            { id: "HISTORY", label: "Order History" },
                            { id: "ASSETS", label: "Assets" }
                          ].map((tab) => (
                            <TabsTrigger
                              key={tab.id}
                              value={tab.id}
                              className="pb-3 pt-3 bg-transparent border-0 rounded-none relative font-heading text-[10px] font-bold uppercase text-muted hover:text-foreground data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:font-bold transition-all cursor-pointer"
                            >
                              {tab.label}{" "}
                              {tab.id === "POSITIONS"
                                ? `(${positions.length})`
                                : tab.id === "ORDERS"
                                ? `(${activeOrders.filter(o => o.status === "OPEN" || o.status === "PARTIALLY_FILLED").length})`
                                : ""}
                              {activeBottomTab === tab.id && (
                                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full" />
                              )}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                        {activeBottomTab === "POSITIONS" && positions.length > 0 && (
                          <button
                            type="button"
                            onClick={handleCloseAllPositions}
                            className="px-2.5 py-1 bg-trading-down/10 hover:bg-trading-down/20 text-trading-down border border-trading-down/20 rounded text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 size={12} />
                            Close All
                          </button>
                        )}
                        {activeBottomTab === "ORDERS" && activeOrders.some(o => o.status === "OPEN" || o.status === "PARTIALLY_FILLED") && (
                          <button
                            type="button"
                            onClick={handleCancelAllOrders}
                            className="px-2.5 py-1 bg-trading-down/10 hover:bg-trading-down/20 text-trading-down border border-trading-down/20 rounded text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 size={12} />
                            Cancel All
                          </button>
                        )}
                      </div>

                    <CardContent className="p-0 min-h-[160px] flex-1 flex flex-col">
                      {activeBottomTab === "POSITIONS" && (
                        loadingPositions ? (
                          <div className="p-6 space-y-2">
                            <div className="h-6 bg-background/[0.02] rounded animate-pulse w-full" />
                          </div>
                        ) : positions.length === 0 ? (
                          <div className="py-12 text-center text-muted font-mono text-xs">
                            No active margin positions. Open a position using the entry card.
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="border-b border-transparent text-[10px] font-bold text-muted uppercase font-mono bg-background/10">
                                  <th className="py-3 px-5">Symbol</th>
                                  <th className="py-3 px-5">Side</th>
                                  <th className="py-3 px-5 text-right">Size</th>
                                  <th className="py-3 px-5 text-right">Entry</th>
                                  <th className="py-3 px-5 text-right">Ratio</th>
                                  <th className="py-3 px-5 text-right">PnL (Unrealized)</th>
                                  <th className="py-3 px-5 text-center">Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-hairline-on-dark font-mono text-xs">
                                {positions.map((p) => {
                                  const currentPrice = pricesMap[p.symbol.toUpperCase()] || Number(p.entryPrice);
                                  const entryPrice = Number(p.entryPrice);
                                  const qty = Number(p.quantity);
                                  
                                  let pnlValue;
                                  if (p.side === "BUY") {
                                    pnlValue = (currentPrice - entryPrice) * qty;
                                  } else { // SELL
                                    pnlValue = (entryPrice - currentPrice) * qty;
                                  }
                                  
                                  const isProfit = pnlValue >= 0;
                                  return (
                                    <tr key={p.id} className="hover:bg-background/25 transition-colors">
                                      <td className="py-3 px-5 font-bold text-foreground">{p.symbol}</td>
                                      <td className="py-3 px-5">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.side === "BUY" ? "bg-trading-up/10 text-trading-up" : "bg-trading-down/10 text-trading-down"}`}>
                                          {p.side}
                                        </span>
                                      </td>
                                      <td className="py-3 px-5 text-right font-semibold text-foreground">{p.quantity}</td>
                                      <td className="py-3 px-5 text-right text-muted">{formatCurrency(p.entryPrice)}</td>
                                      <td className="py-3 px-5 text-right text-primary font-bold">{p.marginRatio}</td>
                                      <td className={`py-3 px-5 text-right font-bold text-sm ${isProfit ? "text-trading-up" : "text-trading-down"}`}>
                                        {isProfit ? "+" : ""}{formatCurrency(pnlValue)}
                                      </td>
                                      <td className="py-3 px-5 text-center">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleClosePosition(p.id)}
                                          className="text-[10px] h-7 px-2 border-trading-down hover:bg-trading-down text-trading-down hover:text-foreground"
                                        >
                                          CLOSE
                                        </Button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )
                      )}

                      {activeBottomTab === "ORDERS" && (
                        loadingOrders ? (
                          <div className="p-6 space-y-2">
                            <div className="h-6 bg-background/[0.02] rounded animate-pulse w-full" />
                          </div>
                        ) : activeOrders.length === 0 ? (
                          <div className="py-12 text-center text-muted font-mono text-xs">
                            No orders found.
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse font-mono text-xs">
                              <thead>
                                <tr className="border-b border-transparent text-[9px] font-bold text-muted uppercase bg-background/20 py-2.5">
                                  <th className="py-2.5 px-4">Symbol</th>
                                  <th className="py-2.5 px-4">Side</th>
                                  <th className="py-2.5 px-4">Type</th>
                                  <th className="py-2.5 px-4 text-right">Quantity</th>
                                  <th className="py-2.5 px-4 text-right">Price</th>
                                  <th className="py-2.5 px-4 text-center">Action / Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-hairline-on-dark">
                                {activeOrders.map((o) => (
                                  <tr key={o.id} className="hover:bg-background/[0.01] transition-colors">
                                    <td className="py-3 px-4 font-bold text-foreground uppercase">{o.symbol}</td>
                                    <td className="py-3 px-4">
                                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                        o.side === "BUY" ? "bg-trading-up/10 text-trading-up" : "bg-trading-down/10 text-trading-down"
                                      }`}>
                                        {o.side}
                                      </span>
                                    </td>
                                    <td className="py-3 px-4 text-muted">{o.orderType}</td>
                                    <td className="py-3 px-4 text-right font-semibold">{o.quantity}</td>
                                    <td className="py-3 px-4 text-right font-semibold">{formatCurrency(o.price)}</td>
                                    <td className="py-3 px-4 text-center">
                                      {o.status === "OPEN" || o.status === "PARTIALLY_FILLED" ? (
                                        <button
                                          type="button"
                                          onClick={() => handleCancelOrder(o.id)}
                                          className="px-2.5 py-1 bg-trading-down/10 hover:bg-trading-down/20 text-trading-down border border-trading-down/20 rounded text-[10px] font-bold transition-all"
                                        >
                                          Cancel
                                        </button>
                                      ) : (
                                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                          o.status === "FILLED" ? "bg-trading-up/10 text-trading-up" : "bg-background text-muted"
                                        }`}>
                                          {o.status}
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )
                      )}

                      {activeBottomTab === "HISTORY" && (
                        loadingHistory ? (
                          <div className="p-6 space-y-2">
                            <div className="h-6 bg-background/[0.02] rounded animate-pulse w-full" />
                          </div>
                        ) : orderHistory.length === 0 ? (
                          <div className="py-12 text-center text-muted font-mono text-xs">
                            No order logs found.
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse font-mono text-xs">
                              <thead>
                                <tr className="border-b border-transparent text-[9px] font-bold text-muted uppercase bg-background/20 py-2.5">
                                  <th className="py-2.5 px-4">Symbol</th>
                                  <th className="py-2.5 px-4">Side</th>
                                  <th className="py-2.5 px-4">Type</th>
                                  <th className="py-2.5 px-4 text-right">Quantity</th>
                                  <th className="py-2.5 px-4 text-right">Price</th>
                                  <th className="py-2.5 px-4 text-right">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-hairline-on-dark">
                                {orderHistory.map((o) => (
                                  <tr key={o.id} className="hover:bg-background/[0.01] transition-colors">
                                    <td className="py-3 px-4 font-bold text-foreground">{o.symbol}</td>
                                    <td className="py-3 px-4">
                                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                        o.side === "BUY" ? "bg-trading-up/10 text-trading-up" : "bg-trading-down/10 text-trading-down"
                                      }`}>
                                        {o.side}
                                      </span>
                                    </td>
                                    <td className="py-3 px-4 text-muted">{o.orderType}</td>
                                    <td className="py-3 px-4 text-right font-semibold">{o.quantity}</td>
                                    <td className="py-3 px-4 text-right font-semibold">{formatCurrency(o.price)}</td>
                                    <td className="py-3 px-4 text-right">
                                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                        o.status === "FILLED" ? "bg-trading-up/10 text-trading-up" : o.status === "CANCELED" ? "bg-background text-muted" : "bg-primary/15 text-primary"
                                      }`}>
                                        {o.status}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )
                      )}

                      {activeBottomTab === "ASSETS" && (
                        loadingWallets ? (
                          <div className="p-6 space-y-2">
                            <div className="h-6 bg-background/[0.02] rounded animate-pulse w-full" />
                          </div>
                        ) : (
                          <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                            <div className="border border-transparent rounded-2xl p-3 bg-background/20">
                              <span className="text-muted text-[10px] uppercase block">Total Margin USDT Equity</span>
                              <span className="text-lg font-bold text-foreground block mt-1">{formatCurrency(marginWalletBalance)}</span>
                            </div>
                            <div className="border border-transparent rounded-2xl p-3 bg-background/20">
                              <span className="text-muted text-[10px] uppercase block">Borrow Power Cap</span>
                              <span className="text-sm font-bold text-primary block mt-1">10x Leverage Leverage</span>
                            </div>
                            <div className="border border-transparent rounded-2xl p-3 bg-background/20 flex items-center justify-between">
                              <div>
                                <span className="text-muted text-[10px] uppercase block">Daily Interest Accrual</span>
                                <span className="text-[10px] text-foreground font-bold block mt-1">0.05% Compounded Daily</span>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                     </CardContent>
                  </Card>
                </Tabs>
              </div>

              {/* Order Book Panel (3-cols) */}
              <div className="md:col-span-3 h-full">
                <OrderBook
                  symbol={form.symbol}
                  currentPrice={priceSnapshot?.currentPrice}
                  onSelectPrice={(p) => setForm((prev) => ({ ...prev, price: p.toFixed(2) }))}
                />
              </div>
            </div>
          </div>

            {/* Order Entry Form (3-cols) */}
            <div className="lg:col-span-3 space-y-4">
              <Card className="border border-transparent bg-background rounded-xl overflow-hidden shadow-elevation-md relative">
                {!hasAuthToken() && (
                  <div className="absolute inset-0 bg-background/85 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4">
                      <Lock size={20} className="text-primary" />
                    </div>
                    <h3 className="font-heading text-sm font-bold text-foreground mb-2 uppercase">Login Required</h3>
                    <p className="text-xs text-muted leading-relaxed mb-6 max-w-[200px]">
                      Access your simulated wallet and start trading by connecting your account.
                    </p>
                    <Button variant="default" className="w-full text-xs font-semibold py-2.5 rounded-2xl shadow-glow-primary" asChild>
                      <Link to="/auth">Sign In / Connect Wallet</Link>
                    </Button>
                  </div>
                )}
                <form onSubmit={handleSubmit}>
                  <div className="flex border-b border-transparent p-1 bg-background/40">
                    <button
                      type="button"
                      aria-pressed={form.side === "BUY"}
                      className={`flex-1 min-h-[44px] text-center text-xs font-bold rounded transition-all ${form.side === "BUY"
                        ? "bg-trading-up text-foreground shadow-sm"
                        : "text-muted hover:text-foreground"
                        }`}
                      onClick={() => setForm((prev) => ({ ...prev, side: "BUY" }))}
                    >
                      BUY / LONG
                    </button>
                    <button
                      type="button"
                      aria-pressed={form.side === "SELL"}
                      className={`flex-1 min-h-[44px] text-center text-xs font-bold rounded transition-all ${form.side === "SELL"
                        ? "bg-trading-down text-foreground shadow-sm"
                        : "text-muted hover:text-foreground"
                        }`}
                      onClick={() => setForm((prev) => ({ ...prev, side: "SELL" }))}
                    >
                      SELL / SHORT
                    </button>
                  </div>

                  <CardContent className="space-y-4 pt-4">
                    <div>
                      <label className="font-mono text-[10px] text-muted uppercase mb-1.5 block">
                        Symbol
                      </label>
                      <Select
                        name="symbol"
                        value={form.symbol}
                        onChange={handleChange}
                        className="bg-background border-transparent font-mono text-sm text-foreground w-full rounded-2xl"
                      >
                        <option value="BTCUSDT">BTC/USDT</option>
                        <option value="ETHUSDT">ETH/USDT</option>
                        <option value="BNBUSDT">BNB/USDT</option>
                        <option value="SOLUSDT">SOL/USDT</option>
                        <option value="DOTUSDT">DOT/USDT</option>
                      </Select>
                    </div>

                    <div>
                      <label className="font-mono text-[10px] text-muted uppercase mb-1.5 block">
                        Quantity
                      </label>
                      <div className="relative">
                        <Input
                          type="number"
                          step="0.0001"
                          name="quantity"
                          value={form.quantity}
                          onChange={handleChange}
                          required
                          className="bg-background border-transparent font-mono text-sm text-foreground w-full rounded-2xl pr-12"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-[10px] font-mono">{baseAsset}</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="font-mono text-[10px] text-muted uppercase block">
                          Leverage ({form.leverage}x)
                        </label>
                        <span className="text-[10px] text-primary font-mono font-bold uppercase">Margin cap 10x</span>
                      </div>
                      <Input
                        type="number"
                        step="1"
                        name="leverage"
                        min="2"
                        max="10"
                        value={form.leverage}
                        onChange={handleChange}
                        required
                        className="bg-background border-transparent font-mono text-sm text-foreground w-full rounded-2xl mb-2"
                      />

                      <div className="flex gap-2 justify-between">
                        {["2", "3", "5", "8", "10"].map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => setForm((prev) => ({ ...prev, leverage: lvl }))}
                            aria-pressed={form.leverage === lvl}
                            className={`flex-1 min-h-[44px] py-2 font-mono text-[10px] font-bold rounded border transition-all ${form.leverage === lvl
                              ? "bg-primary border-primary text-on-primary shadow-sm"
                              : "border-transparent text-muted hover:text-foreground hover:border-muted"
                              }`}
                          >
                            {lvl}x
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sizing Percentage dot-slider chips — 44px touch targets */}
                    <div className="flex gap-2">
                      {[25, 50, 75, 100].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => handlePercentSelect(pct)}
                          className="flex-1 min-h-[44px] min-w-[44px] px-3 py-2 bg-background hover:bg-background border border-transparent text-muted hover:text-foreground rounded font-mono text-[10px] font-bold"
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>

                    {/* Calculations summary */}
                    <div className="border border-transparent bg-background/40 rounded-2xl p-3 space-y-2">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-muted">Required Collateral</span>
                        <span className="text-primary font-bold">{formatCurrency(marginDetails.collateral)}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-muted">Borrowed Amount</span>
                        <span className="text-foreground font-semibold">{formatCurrency(marginDetails.borrowed)}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-mono border-t border-transparent pt-2">
                        <span className="text-muted">Daily Interest Rate</span>
                        <span className="text-foreground font-semibold font-mono">0.05%</span>
                      </div>
                    </div>

                    {message && (
                      <div role="status" className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-trading-up/10 border border-trading-up/20 animate-slide-down">
                        <p className="text-trading-up text-xs font-mono">{message}</p>
                      </div>
                    )}
                    {error && (
                      <div role="alert" className="text-trading-down text-xs mt-1 px-3 py-2.5 rounded-2xl bg-trading-down/10 border border-trading-down/20 animate-slide-down">
                        {error}
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="pt-2 pb-4">
                    <Button
                      type="submit"
                      className="w-full font-mono text-sm uppercase py-3 font-bold rounded-2xl min-h-[48px]"
                      variant={form.side === "BUY" ? "tradingUp" : "tradingDown"}
                      loading={loading}
                    >
                      Open {form.side === "BUY" ? "BUY" : "SELL"} Margin
                    </Button>
                  </CardFooter>
                </form>
              </Card>

              {/* Margin Assets & Risk Gauge Card */}
              <Card className="border border-transparent bg-background rounded-xl p-4 space-y-4 shadow-elevation-md">
                <div className="flex justify-between items-center border-b border-transparent pb-2 mb-1">
                  <h4 className="font-heading text-xs font-bold text-foreground uppercase flex items-center gap-1.5">
                    <Coins size={14} className="text-primary" />
                    Margin Account
                  </h4>
                  <span className="text-[9px] font-mono font-bold bg-[#6C63FF]/15 text-[#6C63FF] px-1 rounded uppercase">Risk Level</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-muted font-mono uppercase block">Estimated Equity</span>
                  <div className="text-lg font-bold font-mono text-foreground flex items-baseline gap-1.5">
                    {marginWalletBalance.toFixed(2)} <span className="text-xs text-muted font-normal">USDT</span>
                  </div>
                </div>

                {/* Margin Level progress indicator */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-muted">Margin Level Risk</span>
                    <span className="text-trading-up font-bold">99.9% SAFE</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
                    <div className="h-full bg-trading-up rounded-full" style={{ width: "12%" }} />
                  </div>
                </div>

                {/* Mini debt/borrow details */}
                <div className="border border-transparent bg-background/40 rounded-2xl p-2.5 space-y-2 text-[10px] font-mono">
                  <div className="flex justify-between items-center text-muted">
                    <span>Collateral Value</span>
                    <span className="text-foreground font-bold">{formatCurrency(marginWalletBalance)}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-transparent pt-1.5">
                    <span className="text-muted">Total Borrowed Debt</span>
                    <span className="text-foreground font-bold">{formatCurrency(positions.reduce((sum, p) => sum + Number(p.borrowed || 0), 0))}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-transparent pt-1.5">
                    <span className="text-muted">Daily Borrow Rate</span>
                    <span className="text-primary font-bold">0.05%</span>
                  </div>
                </div>

                {/* Quick actions grid */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <Link to="/wallets" className="flex-1">
                    <button className="w-full py-2 bg-[#6C63FF] hover:bg-[#6C63FF]/90 text-[#3D4852] rounded font-mono text-[9px] font-bold text-center transition-all hover:scale-[1.02] active:scale-[0.98]">
                      BORROW
                    </button>
                  </Link>
                  <Link to="/wallets" className="flex-1">
                    <button className="w-full py-2 bg-background hover:bg-background border border-transparent text-foreground rounded font-mono text-[9px] font-bold text-center transition-all hover:scale-[1.02] active:scale-[0.98]">
                      REPAY
                    </button>
                  </Link>
                  <Link to="/wallets" className="flex-1">
                    <button className="w-full py-2 bg-background hover:bg-background border border-transparent text-foreground rounded font-mono text-[9px] font-bold text-center transition-all hover:scale-[1.02] active:scale-[0.98]">
                      TRANSFER
                    </button>
                  </Link>
                </div>
              </Card>

              {/* Streaming Real-Time matched Trades Panel */}
              <Card className="bg-background border border-transparent rounded-xl p-4 font-mono text-xs shadow-elevation-md">
                <div className="flex justify-between items-center border-b border-transparent pb-2 mb-3">
                  <h4 className="font-heading text-xs font-bold text-foreground uppercase flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-trading-up animate-ping"></span>
                    Recent Trades
                  </h4>
                  <span className="text-[10px] text-muted">{form.symbol} Live</span>
                </div>

                <div className="flex justify-between text-muted text-[10px] uppercase font-semibold pb-1 border-b border-transparent mb-1.5">
                  <span>Price(USDT)</span>
                  <span>Amount({baseAsset})</span>
                  <span className="text-right">Time</span>
                </div>

                <div className="space-y-1">
                  {recentTrades.length === 0 ? (
                    <div className="py-4 text-center text-muted text-[10px]">Waiting for market ticks...</div>
                  ) : (
                    recentTrades.slice(0, 5).map((t) => (
                      <div key={t.id} className="flex justify-between items-center h-5 px-1 hover:bg-background/[0.02] rounded transition-colors">
                        <span className={`font-bold ${t.side === "BUY" ? "text-trading-up" : "text-trading-down"}`}>
                          {formatCurrency(t.price)}
                        </span>
                        <span className="text-foreground font-medium">{t.amount}</span>
                        <span className="text-muted text-[10px] text-right">{t.time}</span>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

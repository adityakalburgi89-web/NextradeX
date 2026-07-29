import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { 
  createSpotOrder, 
  fetchPrice, 
  fetchCandlestickData,
  fetchActiveOrders,
  fetchOrderHistory,
  cancelOrder,
  fetchWallets,
  fetchSpotHoldings,
  hasAuthToken,
  fetchAllPrices
} from "../api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Button } from "../components/ui/Button";
import { PageTransition } from "../components/ui/PageTransition";
import { TradingChartPanel } from "../components/ui/TradingChartPanel";
import { OrderBook } from "../components/ui/OrderBook";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "../components/ui/tooltip";
import { useWebSocket } from "../hooks/useWebSocket";
import { formatCurrency, formatPercent } from "../lib/utils";
import { ArrowRightLeft, Info, Trash2, Activity, Coins, ClipboardList, Lock, Wallet } from "lucide-react";

const initialForm = {
  symbol: "BTCUSDT",
  side: "BUY",
  orderType: "MARKET",
  quantity: "0.001",
  price: "",
  stopPrice: "",
};

export default function SpotTradingPage() {
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
  const [currentPrice, setCurrentPrice] = useState(null);
  const [priceSnapshot, setPriceSnapshot] = useState(null);
  const [candleData, setCandleData] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [interval, setInterval] = useState("1h");

  // Bottom tabs & User account states
  const [activeBottomTab, setActiveBottomTab] = useState("POSITIONS"); // POSITIONS, ORDERS, HISTORY, ASSETS
  const [activeOrders, setActiveOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orderHistory, setOrderHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [spotWalletBalance, setSpotWalletBalance] = useState(0.00);
  const [loadingWallets, setLoadingWallets] = useState(true);
  const [pricesMap, setPricesMap] = useState({});
  const [recentTrades, setRecentTrades] = useState([]);
  const [spotHoldings, setSpotHoldings] = useState([]);

  // Pre-populate recent trades when currentPrice is loaded or symbol changes
  useEffect(() => {
    if (currentPrice) {
      const basePrice = Number(currentPrice);
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
  }, [currentPrice, form.symbol]);

  const handlePriceUpdate = (data) => {
    if (data) {
      setPricesMap((prev) => {
        const next = { ...prev };
        if (Array.isArray(data)) {
          data.forEach((p) => {
            if (p && p.symbol) {
              next[p.symbol.toUpperCase()] = Number(p.currentPrice);
            }
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
      update = data.find((p) => p && p.symbol && p.symbol.toUpperCase() === currentSymbol);
    } else if (data && data.symbol && data.symbol.toUpperCase() === currentSymbol) {
      update = data;
    }

    if (update) {
      const newPrice = Number(update.currentPrice);
      setCurrentPrice(newPrice);
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

  const loadPrice = async () => {
    try {
      const res = await fetchPrice(form.symbol);
      if (res?.data) {
        setCurrentPrice(res.data.currentPrice);
        setPriceSnapshot(res.data);
      }
    } catch {
      // ignore
    }
  };

  const loadPricesMap = async () => {
    try {
      const res = await fetchAllPrices();
      if (res?.data) {
        const pMap = {};
        res.data.forEach((p) => {
          pMap[p.symbol.toUpperCase()] = Number(p.currentPrice);
        });
        setPricesMap(pMap);
      }
    } catch (err) {
      console.warn("Could not retrieve all prices:", err.message);
    }
  };

  const loadActiveOrders = async () => {
    try {
      const activeRes = await fetchActiveOrders();
      const activeFiltered = (activeRes?.data || []).filter(o => o.tradeType === "SPOT");
      setActiveOrders(activeFiltered);
    } catch (err) {
      console.warn("Could not retrieve active orders:", err.message);
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadOrderHistory = async () => {
    try {
      const res = await fetchOrderHistory();
      const filtered = (res?.data || []).filter(o => o.tradeType === "SPOT");
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
      const spotWallet = res?.data?.find(w => w.walletType === "SPOT");
      if (spotWallet) {
        setSpotWalletBalance(Number(spotWallet.balance || 0));
      }
    } catch (err) {
      console.warn("Could not retrieve spot wallet balance:", err.message);
    } finally {
      setLoadingWallets(false);
    }
  };

  const loadSpotHoldings = async () => {
    try {
      const res = await fetchSpotHoldings();
      setSpotHoldings(res?.data || []);
    } catch (err) {
      console.warn("Could not retrieve spot holdings:", err.message);
      setSpotHoldings([]);
    }
  };

  const loadAllUserData = () => {
    loadActiveOrders();
    loadOrderHistory();
    loadWallet();
    loadSpotHoldings();
  };

  useEffect(() => {
    loadPrice();
    loadPricesMap();
    loadAllUserData();
  }, [form.symbol]);

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
      const qty = parseFloat(form.quantity);
      if (isNaN(qty) || qty <= 0) {
        setError("Quantity must be greater than zero");
        setLoading(false);
        return;
      }
      if (form.symbol === "BTCUSDT" && qty > 11) {
        setError("Quantity cannot exceed 11 BTC for BTC trading");
        setLoading(false);
        return;
      }
      const checkPrice = ["LIMIT", "STOP_LIMIT", "TAKE_PROFIT_LIMIT"].includes(form.orderType) && form.price
        ? parseFloat(form.price)
        : (currentPrice || priceSnapshot?.currentPrice || 0);
      const totalCost = qty * checkPrice;
      if (totalCost > 99999999999.99999999) {
        setError("Total order value exceeds maximum allowed precision");
        setLoading(false);
        return;
      }

      const isLimitPriceType = ["LIMIT", "STOP_LIMIT", "TAKE_PROFIT_LIMIT"].includes(form.orderType);
      const isTriggerPriceType = ["STOP_LIMIT", "STOP_MARKET", "TAKE_PROFIT_LIMIT", "TAKE_PROFIT_MARKET"].includes(form.orderType);
      const payload = {
        symbol: form.symbol,
        side: form.side,
        orderType: form.orderType,
        quantity: qty,
        price: isLimitPriceType ? parseFloat(form.price) : null,
        stopPrice: isTriggerPriceType ? parseFloat(form.stopPrice) : null,
      };
      const res = await createSpotOrder(payload);
      setMessage(res?.message || "Spot order created successfully");
      setTimeout(() => setMessage(""), 4000);
      loadAllUserData();
    } catch (err) {
      setError(err.message || "Failed to create order");
      setTimeout(() => setError(""), 4000);
    } finally {
      setLoading(false);
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
    }
  };

  // Use the server ledger as the authoritative source for spot inventory.
  const spotPositions = useMemo(() => {
    return spotHoldings
      .map((holding) => ({
        symbol: `${holding.asset}USDT`,
        quantity: Number(holding.quantity || 0),
        averageEntryPrice: Number(holding.averageEntryPrice || 0),
        totalCost: Number(holding.quantity || 0) * Number(holding.averageEntryPrice || 0),
      }))
      .filter((position) => position.quantity > 0.00001);
  }, [spotHoldings]);

  const handleCloseSpotPosition = (pos) => {
    setForm({
      symbol: pos.symbol,
      side: "SELL",
      orderType: "MARKET",
      quantity: pos.quantity.toString(),
      price: "",
      stopPrice: "",
    });
    
    const formCard = document.querySelector("form");
    if (formCard) {
      formCard.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Sizing percentage handler
  const handlePercentSelect = (percent) => {
    const priceToUse = ["LIMIT", "STOP_LIMIT", "TAKE_PROFIT_LIMIT"].includes(form.orderType) && form.price
      ? Number(form.price)
      : (currentPrice || priceSnapshot?.currentPrice || 1);
    
    if (form.side === "BUY") {
      const maxBuyQty = spotWalletBalance / priceToUse;
      const targetQty = maxBuyQty * (percent / 100);
      setForm(prev => ({ ...prev, quantity: targetQty.toFixed(4) }));
    } else {
      const currentPos = spotPositions.find(p => p.symbol.toUpperCase() === form.symbol.toUpperCase());
      const holdingQty = currentPos ? currentPos.quantity : 0;
      const targetQty = holdingQty * (percent / 100);
      setForm(prev => ({ ...prev, quantity: targetQty.toFixed(4) }));
    }
  };

  const estimatedNotional = useMemo(() => {
    const quantity = Number(form.quantity || 0);
    const price = form.orderType === "LIMIT" ? Number(form.price || 0) : Number(currentPrice || 0);
    return quantity * price;
  }, [currentPrice, form.orderType, form.price, form.quantity]);

  const baseAsset = useMemo(() => form.symbol.replace("USDT", "").toUpperCase(), [form.symbol]);

  const chartStats = [
    {
      label: "Last price",
      value: currentPrice || priceSnapshot?.currentPrice || 0,
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
      label: "Session high",
      value: priceSnapshot?.highPrice || currentPrice || 0,
      kind: "currency",
      icon: "volume",
      hint: `Low ${formatCurrency(priceSnapshot?.lowPrice || currentPrice || 0)}`,
    },
    {
      label: "Order notional",
      value: estimatedNotional,
      kind: "currency",
      icon: "momentum",
      hint: `${form.side} ${form.quantity || 0} ${form.symbol}`,
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
                  <span className="text-[9px] font-mono font-bold bg-primary/15 text-primary px-1 rounded uppercase">Spot</span>
                </h1>
                <span className="text-[10px] font-mono font-semibold text-muted">NexTradeX Exchange</span>
              </div>

              {(currentPrice || priceSnapshot?.currentPrice) && (
                <div className="border-l border-transparent pl-4 flex flex-col justify-center">
                  <span className="text-[10px] text-muted font-mono font-bold uppercase block">Price</span>
                  <span className="text-base font-extrabold font-mono text-trading-up">
                    {formatCurrency(currentPrice || priceSnapshot.currentPrice)}
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
                  <span className="block uppercase text-[9px]">24h High</span>
                  <span className="text-sm font-bold text-foreground">{formatCurrency(priceSnapshot.highPrice || currentPrice)}</span>
                </div>

                <div className="min-w-[100px]">
                  <span className="block uppercase text-[9px]">24h Low</span>
                  <span className="text-sm font-bold text-foreground">{formatCurrency(priceSnapshot.lowPrice || currentPrice)}</span>
                </div>

                <div className="min-w-[160px]">
                  <span className="block uppercase text-[9px]">24h Volume</span>
                  <span className="text-sm font-bold text-foreground">
                    {priceSnapshot.volume24h
                      ? `${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(priceSnapshot.volume24h)} ${form.symbol.replace("USDT", "").toUpperCase()}`
                      : `148,250.00 ${form.symbol.replace("USDT", "").toUpperCase()}`}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Three-Column Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            
            {/* Main Chart Panel (9-cols) & Bottom Sub-Grid Layout */}
            <div className="lg:col-span-9 space-y-4">
              <TradingChartPanel
                title="Spot Workspace"
                description="Execute clean spot orders with backend candles, live pricing, and a calmer SaaS-grade order entry flow."
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
                        { id: "POSITIONS", label: "Positions" },
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
                            ? `(${spotPositions.length})`
                            : tab.id === "ORDERS"
                            ? `(${activeOrders.filter(o => o.status === "OPEN" || o.status === "PARTIALLY_FILLED").length})`
                            : ""}
                          {activeBottomTab === tab.id && (
                            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full" />
                          )}
                        </TabsTrigger>
                      ))}
                    </TabsList>
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
                    spotPositions.length === 0 ? (
                      <div className="py-12 text-center text-muted font-mono text-xs">
                        No active spot positions. Buy assets to open a position.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-transparent text-[10px] font-bold text-muted uppercase font-mono bg-background/10">
                              <th className="py-3 px-5">Symbol</th>
                              <th className="py-3 px-5 text-right">Holdings (Size)</th>
                              <th className="py-3 px-5 text-right">Avg Entry Price</th>
                              <th className="py-3 px-5 text-right">Current Price</th>
                              <th className="py-3 px-5 text-right">Market Value</th>
                              <th className="py-3 px-5 text-right">Unrealized PnL</th>
                              <th className="py-3 px-5 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-hairline-on-dark font-mono text-xs">
                            {spotPositions.map((pos) => {
                              const currentPrice = pricesMap[pos.symbol.toUpperCase()] || Number(pos.averageEntryPrice);
                              const entryPrice = Number(pos.averageEntryPrice);
                              const qty = Number(pos.quantity);
                              
                              const marketValue = qty * currentPrice;
                              const pnlValue = (currentPrice - entryPrice) * qty;
                              const pnlPercent = entryPrice > 0 ? (pnlValue / (entryPrice * qty)) * 100 : 0;
                              
                              const isProfit = pnlValue >= 0;
                              const baseAsset = pos.symbol.replace("USDT", "").toUpperCase();
                              
                              return (
                                <tr key={pos.symbol} className="hover:bg-background/25 transition-colors">
                                  <td className="py-3 px-5 font-bold text-foreground uppercase">{pos.symbol}</td>
                                  <td className="py-3 px-5 text-right font-semibold text-foreground">
                                    {qty.toFixed(4)} <span className="text-[10px] text-muted">{baseAsset}</span>
                                  </td>
                                  <td className="py-3 px-5 text-right text-muted">{formatCurrency(entryPrice)}</td>
                                  <td className="py-3 px-5 text-right text-foreground font-semibold">{formatCurrency(currentPrice)}</td>
                                  <td className="py-3 px-5 text-right text-foreground font-semibold">{formatCurrency(marketValue)}</td>
                                  <td className={`py-3 px-5 text-right font-bold text-sm ${isProfit ? "text-trading-up" : "text-trading-down"}`}>
                                    {isProfit ? "+" : ""}{formatCurrency(pnlValue)} ({isProfit ? "+" : ""}{pnlPercent.toFixed(2)}%)
                                  </td>
                                  <td className="py-3 px-5 text-center">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleCloseSpotPosition(pos)}
                                      className="text-[10px] h-7 px-2 border-trading-down hover:bg-trading-down text-trading-down hover:text-foreground transition-all font-bold"
                                    >
                                      SELL / CLOSE
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
                          <span className="text-muted text-[10px] uppercase block">Total Spot USDT Equity</span>
                          <span className="text-lg font-bold text-foreground block mt-1">{formatCurrency(spotWalletBalance)}</span>
                        </div>
                        <div className="border border-transparent rounded-2xl p-3 bg-background/20">
                          <span className="text-muted text-[10px] uppercase block">Asset Sizing Base</span>
                          <span className="text-sm font-bold text-primary block mt-1">USDT (Tether)</span>
                        </div>
                        <div className="border border-transparent rounded-2xl p-3 bg-background/20 flex items-center justify-between">
                          <div>
                            <span className="text-muted text-[10px] uppercase block">Wallet Connection</span>
                            <span className="text-[10px] text-trading-up font-bold block mt-1">● ONLINE (Simulated)</span>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </CardContent>                </Card>
              </Tabs>
              </div>

              {/* Order Book Panel (3-cols) */}
              <div className="md:col-span-3 h-full">
                <OrderBook 
                  symbol={form.symbol} 
                  currentPrice={currentPrice} 
                  onSelectPrice={(p) => setForm((prev) => ({ ...prev, price: p.toFixed(2), orderType: "LIMIT" }))} 
                />
              </div>
            </div>
          </div>

            {/* Order Entry Panel (3-cols) */}
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
                  {/* BUY / SELL Switch Tabs — 44px touch targets */}
                  <div className="flex border-b border-transparent p-1 bg-background/40">
                    <button
                      type="button"
                      aria-pressed={form.side === "BUY"}
                      className={`flex-1 min-h-[44px] text-center text-xs font-bold rounded transition-all ${
                        form.side === "BUY"
                          ? "bg-trading-up text-white shadow-sm"
                          : "text-muted hover:text-foreground"
                      }`}
                      onClick={() => setForm((prev) => ({ ...prev, side: "BUY" }))}
                    >
                      BUY
                    </button>
                    <button
                      type="button"
                      aria-pressed={form.side === "SELL"}
                      className={`flex-1 min-h-[44px] text-center text-xs font-bold rounded transition-all ${
                        form.side === "SELL"
                          ? "bg-trading-down text-white shadow-sm"
                          : "text-muted hover:text-foreground"
                      }`}
                      onClick={() => setForm((prev) => ({ ...prev, side: "SELL" }))}
                    >
                      SELL
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
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <label className="font-mono text-[10px] text-muted uppercase block">
                          Order Type
                        </label>
                        <TooltipProvider delayDuration={200}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-muted hover:text-foreground cursor-pointer"><Info size={11} /></span>
                            </TooltipTrigger>
                            <TooltipContent className="bg-background border border-transparent text-xs p-2 text-foreground max-w-[200px] rounded-2xl">
                              Choose Market to buy/sell instantly at current price, or Limit to set a specific target price.
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Select 
                        name="orderType" 
                        value={form.orderType} 
                        onChange={handleChange} 
                        className="bg-background border-transparent font-mono text-sm text-foreground w-full rounded-2xl"
                      >
                        <option value="MARKET">Market</option>
                        <option value="LIMIT">Limit</option>
                        <option value="STOP_MARKET">Stop Market</option>
                        <option value="STOP_LIMIT">Stop Limit</option>
                        <option value="TAKE_PROFIT_MARKET">Take Profit Market</option>
                        <option value="TAKE_PROFIT_LIMIT">Take Profit Limit</option>
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
                          max={form.symbol === "BTCUSDT" ? "11" : "99999999999.99999999"}
                          name="quantity"
                          value={form.quantity}
                          onChange={handleChange}
                          required
                          className="bg-background border-transparent font-mono text-sm text-foreground w-full rounded-2xl pr-12"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-[10px] font-mono">{baseAsset}</span>
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

                    {["STOP_LIMIT", "STOP_MARKET", "TAKE_PROFIT_LIMIT", "TAKE_PROFIT_MARKET"].includes(form.orderType) && (
                      <div className="animate-slide-down">
                        <label className="font-mono text-[10px] text-muted uppercase mb-1.5 block">
                          Trigger Price
                        </label>
                        <div className="relative">
                          <Input
                            type="number"
                            step="0.01"
                            max="99999999999.99999999"
                            name="stopPrice"
                            value={form.stopPrice}
                            onChange={handleChange}
                            required
                            className="bg-background border-transparent font-mono text-sm text-foreground w-full rounded-2xl pr-12"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-[10px] font-mono">USDT</span>
                        </div>
                      </div>
                    )}

                    {["LIMIT", "STOP_LIMIT", "TAKE_PROFIT_LIMIT"].includes(form.orderType) && (
                      <div className="animate-slide-down">
                        <label className="font-mono text-[10px] text-muted uppercase mb-1.5 block">
                          Limit Price
                        </label>
                        <div className="relative">
                          <Input
                            type="number"
                            step="0.01"
                            max="99999999999.99999999"
                            name="price"
                            value={form.price}
                            onChange={handleChange}
                            required
                            className="bg-background border-transparent font-mono text-sm text-foreground w-full rounded-2xl pr-12"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-[10px] font-mono">USDT</span>
                        </div>
                      </div>
                    )}

                    {/* High/Low/Notional Summary */}
                    {(currentPrice || priceSnapshot?.currentPrice) && (
                      <div className="border border-transparent bg-background/40 rounded-2xl p-3 space-y-2">
                        <div aria-label={`Available balance: ${formatCurrency(spotWalletBalance)} USDT`} className="flex justify-between items-center text-xs font-mono">
                          <span className="text-muted">Available Balance</span>
                          <span className="text-foreground font-semibold">{formatCurrency(spotWalletBalance)} USDT</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-mono">
                          <span className="text-muted">Current Price</span>
                          <span className="text-foreground font-semibold">{formatCurrency(currentPrice || priceSnapshot.currentPrice)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-mono border-t border-transparent pt-2">
                          <span className="text-muted">Est. Notional</span>
                          <span className="text-foreground font-semibold font-mono">{formatCurrency(estimatedNotional)}</span>
                        </div>
                      </div>
                    )}

                    {/* Feedback overlays with reserved space to prevent layout shifts */}
                    <div className="h-[46px] flex items-center justify-center">
                      {message ? (
                        <div role="status" className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-2xl bg-trading-up/10 border border-trading-up/20 animate-slide-down">
                          <p className="text-trading-up text-xs font-mono">{message}</p>
                        </div>
                      ) : error ? (
                        <div role="alert" className="w-full text-trading-down text-xs px-3 py-2 rounded-2xl bg-trading-down/10 border border-trading-down/20 animate-slide-down text-center">
                          {error}
                        </div>
                      ) : null}
                    </div>
                  </CardContent>

                  <CardFooter className="pt-2 pb-4">
                    <Button
                      type="submit"
                      className="w-full font-mono text-sm uppercase py-3 font-bold rounded-2xl min-h-[48px]"
                      variant={form.side === "BUY" ? "tradingUp" : "tradingDown"}
                      loading={loading}
                    >
                      {form.side === "BUY" ? "BUY" : "SELL"} {form.symbol}
                    </Button>
                  </CardFooter>
                </form>
              </Card>

              {/* Spot Assets & Quick Actions Card */}
              <Card className="border border-transparent bg-background rounded-xl p-4 space-y-4 shadow-elevation-md">
                <div className="flex justify-between items-center border-b border-transparent pb-2 mb-1">
                  <h4 className="font-heading text-xs font-bold text-foreground uppercase flex items-center gap-1.5">
                    <Wallet size={14} className="text-primary" />
                    Spot Assets
                  </h4>
                  <span className="text-[9px] font-mono font-bold bg-[#6C63FF]/15 text-[#6C63FF] px-1 rounded uppercase">Account</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-muted font-mono uppercase block">Estimated Value</span>
                  <div className="text-lg font-bold font-mono text-foreground flex items-baseline gap-1.5">
                    {spotWalletBalance.toFixed(2)} <span className="text-xs text-muted font-normal">USDT</span>
                  </div>
                  <div className="text-[10px] font-mono text-muted">
                    ≈ ₹{(spotWalletBalance * 83).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>

                {/* Asset holdings mini list */}
                <div className="border border-transparent bg-background/40 rounded-2xl p-2.5 space-y-2 text-[10px] font-mono">
                  <div className="flex justify-between items-center text-muted">
                    <span>Asset</span>
                    <span className="text-right">Balance</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-transparent pt-1.5">
                    <span className="text-foreground font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#6C63FF]"></span>
                      USDT
                    </span>
                    <span className="text-foreground font-bold">{spotWalletBalance.toFixed(2)}</span>
                  </div>
                  {baseAsset !== "USDT" && (
                    <div className="flex justify-between items-center border-t border-transparent pt-1.5">
                      <span className="text-foreground font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        {baseAsset}
                      </span>
                      <span className="text-foreground font-bold">
                        {(() => {
                          const pos = spotPositions.find(p => p.symbol.toUpperCase() === form.symbol.toUpperCase());
                          return pos ? pos.quantity.toFixed(4) : "0.0000";
                        })()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Quick Actions Buttons */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <Link to="/wallets" className="flex-1">
                    <button className="w-full py-2 bg-[#6C63FF] hover:bg-[#6C63FF]/90 text-white rounded font-mono text-[9px] font-bold text-center transition-all hover:scale-[1.02] active:scale-[0.98]">
                      DEPOSIT
                    </button>
                  </Link>
                  <Link to="/wallets" className="flex-1">
                    <button className="w-full py-2 bg-[#3D4852] hover:bg-[#3D4852]/90 text-white rounded font-mono text-[9px] font-bold text-center transition-all hover:scale-[1.02] active:scale-[0.98]">
                      WITHDRAW
                    </button>
                  </Link>
                  <Link to="/wallets" className="flex-1">
                    <button className="w-full py-2 bg-[#3D4852] hover:bg-[#3D4852]/90 text-white rounded font-mono text-[9px] font-bold text-center transition-all hover:scale-[1.02] active:scale-[0.98]">
                      TRANSFER
                    </button>
                  </Link>
                </div>
              </Card>

              {/* Streaming Real-Time matched Trades Panel */}
              <Card className="bg-background border border-transparent rounded-xl p-4 font-mono text-xs shadow-elevation-md">
                <div className="flex justify-between items-center border-b border-transparent pb-2 mb-3">
                  <h4 className="font-heading text-xs font-bold text-foreground uppercase flex items-center gap-1.5">
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

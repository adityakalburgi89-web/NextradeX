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
import { Card, CardContent } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Button } from "../components/ui/Button";
import { PageTransition } from "../components/ui/PageTransition";
import { TradingChartPanel } from "../components/ui/TradingChartPanel";
import { OrderBook } from "../components/ui/OrderBook";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "../components/ui/tooltip";
import { useWebSocket } from "../hooks/useWebSocket";
import { formatCurrency, formatPercent } from "../lib/utils";
import { 
  ChevronDown, 
  Info, 
  Trash2, 
  Lock, 
  Wallet, 
  Headphones, 
  ShieldCheck, 
  Bell, 
  FileText,
  HelpCircle,
  Settings,
  TrendingUp,
  TrendingDown
} from "lucide-react";

const initialForm = {
  symbol: "BTCUSDT",
  side: "BUY",
  orderType: "MARKET",
  quantity: "0.001",
  price: "",
  stopPrice: "",
};

// Popular pairs ticker marquee list matching KuCoin screenshot
const POPULAR_PAIRS = [
  { symbol: "1H/USDT", change: "+0.55%", price: "1,868.14", isUp: true },
  { symbol: "BTC/USDT", change: "+1.10%", price: "63,812.7", isUp: true },
  { symbol: "ZEC/USDT", change: "+3.71%", price: "489.393", isUp: true },
  { symbol: "GRVT/USDT", change: "+8.13%", price: "0.2873", isUp: true },
  { symbol: "XRP/USDT", change: "+0.00%", price: "1.08191", isUp: true },
  { symbol: "ADA/USDT", change: "+2.22%", price: "0.1932", isUp: true },
  { symbol: "BNB/USDT", change: "+1.04%", price: "591.741", isUp: true },
  { symbol: "LINK/USDT", change: "-0.14%", price: "8.27", isUp: false },
];

export default function SpotTradingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const getInitialSymbol = () => {
    const urlSym = searchParams.get("symbol");
    return urlSym ? urlSym.toUpperCase() : "BTCUSDT";
  };

  const [form, setForm] = useState({
    ...initialForm,
    symbol: getInitialSymbol()
  });

  useEffect(() => {
    const urlSym = searchParams.get("symbol");
    if (urlSym && urlSym.toUpperCase() !== form.symbol) {
      setForm(prev => ({ ...prev, symbol: urlSym.toUpperCase() }));
    }
  }, [searchParams]);

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
  const [interval, setInterval] = useState("15m");

  // Terminal navigation states
  const [orderEntryTab, setOrderEntryTab] = useState("MANUAL"); // MANUAL | BOT
  const [marginSubTab, setMarginSubTab] = useState("SPOT"); // SPOT | ISOLATED | CROSS | ALPHA
  const [sliderPercent, setSliderPercent] = useState(0);

  // Bottom tabs state
  const [activeBottomTab, setActiveBottomTab] = useState("OPEN_ORDERS");
  const [activeOrders, setActiveOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orderHistory, setOrderHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [spotWalletBalance, setSpotWalletBalance] = useState(0.00);
  const [loadingWallets, setLoadingWallets] = useState(true);
  const [pricesMap, setPricesMap] = useState({});
  const [recentTrades, setRecentTrades] = useState([]);
  const [spotHoldings, setSpotHoldings] = useState([]);

  useEffect(() => {
    if (currentPrice) {
      const basePrice = Number(currentPrice);
      const initialTrades = Array.from({ length: 7 }).map((_, idx) => {
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

      const newTrade = {
        id: Date.now(),
        price: parseFloat(newPrice.toFixed(2)),
        amount: parseFloat((Math.random() * 1.5 + 0.01).toFixed(4)),
        time: new Date().toTimeString().split(" ")[0],
        side: Math.random() > 0.48 ? "BUY" : "SELL"
      };
      setRecentTrades((trades) => [newTrade, ...trades.slice(0, 8)]);

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

  const handleSliderChange = (e) => {
    const percent = Number(e.target.value);
    setSliderPercent(percent);
    handlePercentSelect(percent);
  };

  const handlePercentSelect = (percent) => {
    setSliderPercent(percent);
    const priceToUse = ["LIMIT", "STOP_LIMIT", "TAKE_PROFIT_LIMIT"].includes(form.orderType) && form.price
      ? Number(form.price)
      : (currentPrice || priceSnapshot?.currentPrice || 63812.7);
    
    if (form.side === "BUY") {
      const availableUsdt = spotWalletBalance || 10000;
      const maxBuyQty = availableUsdt / priceToUse;
      const targetQty = maxBuyQty * (percent / 100);
      setForm(prev => ({ ...prev, quantity: targetQty.toFixed(4) }));
    } else {
      const currentPos = spotPositions.find(p => p.symbol.toUpperCase() === form.symbol.toUpperCase());
      const holdingQty = currentPos ? currentPos.quantity : 1.5;
      const targetQty = holdingQty * (percent / 100);
      setForm(prev => ({ ...prev, quantity: targetQty.toFixed(4) }));
    }
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
      setMessage(res?.message || "Order executed successfully");
      setTimeout(() => setMessage(""), 4000);
      loadAllUserData();
    } catch (err) {
      setError(err.message || "Failed to execute order");
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

  const estimatedNotional = useMemo(() => {
    const quantity = Number(form.quantity || 0);
    const price = ["LIMIT", "STOP_LIMIT"].includes(form.orderType) && form.price ? Number(form.price) : Number(currentPrice || 63812.7);
    return quantity * price;
  }, [currentPrice, form.orderType, form.price, form.quantity]);

  const baseAsset = useMemo(() => form.symbol.replace("USDT", "").toUpperCase(), [form.symbol]);

  const handleQuickTrade = (side, targetPrice) => {
    setForm(prev => ({
      ...prev,
      side,
      orderType: "MARKET",
      price: targetPrice
    }));
  };

  return (
    <PageTransition>
      <div className="w-full bg-background text-foreground py-2 font-sans select-none min-h-screen">
        <div className="max-w-[1720px] mx-auto px-2 space-y-2">
          
          {/* ========================================================================= */}
          {/* 1. KUCOIN TICKER HEADER BAR & POPULAR PAIRS MARQUEE                       */}
          {/* ========================================================================= */}
          <div className="bg-background border border-transparent rounded-xl p-3 shadow-elevation-md space-y-2">
            
            {/* Top Row: Symbol Selector & Metrics */}
            <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
              <div className="flex items-center gap-4">
                {/* Symbol Switcher Dropdown */}
                <div className="flex items-center gap-2">
                  <Select
                    name="symbol"
                    value={form.symbol}
                    onChange={handleChange}
                    className="bg-background border border-transparent font-bold text-base text-foreground rounded px-2 py-1 cursor-pointer"
                  >
                    <option value="BTCUSDT">BTC/USDT</option>
                    <option value="ETHUSDT">ETH/USDT</option>
                    <option value="SOLUSDT">SOL/USDT</option>
                    <option value="BNBUSDT">BNB/USDT</option>
                    <option value="DOTUSDT">DOT/USDT</option>
                    <option value="ZECUSDT">ZEC/USDT</option>
                  </Select>
                </div>

                {/* Main 24h Live Price */}
                <div className="flex items-baseline gap-2 border-l border-transparent pl-4">
                  <span className="text-xl font-extrabold text-trading-up">
                    {(currentPrice || priceSnapshot?.currentPrice || 63812.7).toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-[11px] text-trading-up font-bold">
                    +1.1% +696.9
                  </span>
                </div>
              </div>

              {/* 24h Market Metrics */}
              <div className="flex items-center gap-6 text-muted text-[11px]">
                <div>
                  <span className="block text-[9px] uppercase">24h High</span>
                  <span className="text-foreground font-bold">
                    {(priceSnapshot?.highPrice || 63976.7).toLocaleString("en-US", { minimumFractionDigits: 1 })}
                  </span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase">24h Low</span>
                  <span className="text-foreground font-bold">
                    {(priceSnapshot?.lowPrice || 62294.1).toLocaleString("en-US", { minimumFractionDigits: 1 })}
                  </span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase">24h Volume ({baseAsset})</span>
                  <span className="text-foreground font-bold">1.55K</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase">24h Volume (USDT)</span>
                  <span className="text-foreground font-bold">97.95M</span>
                </div>

                <div className="border-l border-transparent pl-4">
                  <button type="button" className="flex items-center gap-1 text-muted hover:text-foreground font-bold">
                    <FileText size={13} />
                    <span>Trading Info</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Sub-Header Row: Popular Ticker Marquee Bar */}
            <div className="border-t border-transparent pt-2 flex items-center gap-4 font-mono text-[11px] overflow-x-auto scrollbar-none text-muted">
              <span className="font-bold text-foreground flex items-center gap-1 shrink-0">
                Popular <ChevronDown size={12} />
              </span>
              <div className="flex items-center gap-6 shrink-0">
                {POPULAR_PAIRS.map((pair, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, symbol: pair.symbol.replace("/", "") }))}
                    className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer"
                  >
                    <span className="font-semibold text-foreground">{pair.symbol}</span>
                    <span className={`font-bold ${pair.isUp ? "text-trading-up" : "text-trading-down"}`}>
                      {pair.change}
                    </span>
                    <span className="text-foreground/80">{pair.price}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 2. THREE-COLUMN KUCOIN TRADING TERMINAL GRID                              */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-start">
            
            {/* LEFT / MIDDLE COLUMN: Main Chart Workspace (6-cols) */}
            <div className="lg:col-span-6 space-y-2">
              <TradingChartPanel
                symbol={form.symbol}
                interval={interval}
                onIntervalChange={setInterval}
                loading={chartLoading}
                data={candleData}
                onQuickTrade={handleQuickTrade}
              />
            </div>

            {/* MIDDLE COLUMN: Order Book & Recent Trades (3-cols) */}
            <div className="lg:col-span-3 space-y-2 h-[520px]">
              <OrderBook 
                symbol={form.symbol} 
                currentPrice={currentPrice || 63812.7} 
                recentTrades={recentTrades}
                onSelectPrice={(p) => setForm((prev) => ({ ...prev, price: p.toFixed(2), orderType: "LIMIT" }))} 
              />
            </div>

            {/* RIGHT COLUMN: KuCoin Manual / Bot Order Form & Asset Overview (3-cols) */}
            <div className="lg:col-span-3 space-y-2">
              <Card className="bg-background border border-transparent rounded-xl overflow-hidden shadow-elevation-md relative p-3 font-mono text-xs">
                {!hasAuthToken() && (
                  <div className="absolute inset-0 bg-background/85 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3">
                      <Lock size={18} />
                    </div>
                    <h3 className="font-heading text-sm font-bold text-foreground mb-1 uppercase">Login Required</h3>
                    <p className="text-[11px] text-muted leading-relaxed mb-4">
                      Connect your account to trade spot and margin markets.
                    </p>
                    <div className="w-full space-y-2">
                      <Button variant="default" className="w-full text-xs font-bold py-2 rounded-xl bg-foreground text-background" asChild>
                        <Link to="/auth">Log In</Link>
                      </Button>
                      <Button variant="outline" className="w-full text-xs font-bold py-2 rounded-xl border-foreground/20 text-foreground" asChild>
                        <Link to="/auth">Sign Up</Link>
                      </Button>
                    </div>
                  </div>
                )}

                {/* KuCoin Top Mode Tabs: Manual | Bot */}
                <div className="flex items-center justify-between border-b border-transparent pb-2 mb-2">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setOrderEntryTab("MANUAL")}
                      className={`text-xs font-bold uppercase pb-0.5 border-b-2 transition-all ${
                        orderEntryTab === "MANUAL" ? "text-foreground border-primary" : "text-muted border-transparent hover:text-foreground"
                      }`}
                    >
                      Manual
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderEntryTab("BOT")}
                      className={`text-xs font-bold uppercase pb-0.5 border-b-2 transition-all ${
                        orderEntryTab === "BOT" ? "text-foreground border-primary" : "text-muted border-transparent hover:text-foreground"
                      }`}
                    >
                      Bot
                    </button>
                  </div>
                  <Settings size={14} className="text-muted cursor-pointer hover:text-foreground" />
                </div>

                {/* KuCoin Sub-tabs: Spot | Isolated Margin 10x | Cross | Alpha */}
                <div className="flex items-center gap-2 border-b border-transparent pb-2 mb-3 text-[10px]">
                  {["SPOT", "MARGIN_10X", "ALPHA"].map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => setMarginSubTab(sub)}
                      className={`px-2 py-0.5 rounded font-bold transition-all ${
                        marginSubTab === sub ? "bg-background/80 text-foreground shadow-xs" : "text-muted hover:text-foreground"
                      }`}
                    >
                      {sub === "MARGIN_10X" ? "Isolated Margin 10x" : sub}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  {/* BUY (GREEN) / SELL (RED) ACTION SWITCHER */}
                  <div className="grid grid-cols-2 gap-1 p-0.5 bg-background/40 rounded border border-transparent">
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, side: "BUY" }))}
                      className={`py-2 text-center text-xs font-extrabold rounded uppercase transition-all ${
                        form.side === "BUY" ? "bg-trading-up text-white shadow-sm" : "text-muted hover:text-foreground"
                      }`}
                    >
                      Buy
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, side: "SELL" }))}
                      className={`py-2 text-center text-xs font-extrabold rounded uppercase transition-all ${
                        form.side === "SELL" ? "bg-trading-down text-white shadow-sm" : "text-muted hover:text-foreground"
                      }`}
                    >
                      Sell
                    </button>
                  </div>

                  {/* ORDER TYPE SELECTION (Limit / Market / Advanced Limit) */}
                  <div className="flex items-center justify-between gap-1 text-[11px] font-bold text-muted">
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, orderType: "LIMIT" }))}
                      className={`hover:text-foreground ${form.orderType === "LIMIT" ? "text-foreground font-extrabold" : ""}`}
                    >
                      Limit
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, orderType: "MARKET" }))}
                      className={`hover:text-foreground ${form.orderType === "MARKET" ? "text-foreground font-extrabold" : ""}`}
                    >
                      Market
                    </button>
                    <Select
                      name="orderType"
                      value={form.orderType}
                      onChange={handleChange}
                      className="bg-transparent border-0 text-[10px] text-muted font-bold p-0 w-auto cursor-pointer"
                    >
                      <option value="MARKET">Market Order</option>
                      <option value="LIMIT">Limit Order</option>
                      <option value="STOP_MARKET">Stop Market</option>
                      <option value="STOP_LIMIT">Stop Limit</option>
                    </Select>
                  </div>

                  {/* PRICE INPUT FIELD (IF LIMIT ORDER) */}
                  {["LIMIT", "STOP_LIMIT"].includes(form.orderType) && (
                    <div className="space-y-1">
                      <label className="text-[10px] text-muted uppercase block font-semibold">Price</label>
                      <div className="relative">
                        <Input
                          type="number"
                          step="0.1"
                          name="price"
                          placeholder="63,815"
                          value={form.price}
                          onChange={handleChange}
                          className="bg-background/40 border-transparent font-mono text-xs text-foreground w-full rounded pr-12"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted text-[10px]">USDT</span>
                      </div>
                    </div>
                  )}

                  {/* AMOUNT INPUT FIELD */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-muted uppercase block font-semibold">Amount</label>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.0001"
                        name="quantity"
                        placeholder="Minimum: 0.00001"
                        value={form.quantity}
                        onChange={handleChange}
                        required
                        className="bg-background/40 border-transparent font-mono text-xs text-foreground w-full rounded pr-12"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted text-[10px]">{baseAsset}</span>
                    </div>
                  </div>

                  {/* PERCENTAGE RANGE SLIDER WITH STEP MARKS (0%, 25%, 50%, 75%, 100%) */}
                  <div className="space-y-1 pt-1">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="25"
                      value={sliderPercent}
                      onChange={handleSliderChange}
                      className="w-full accent-primary h-1.5 bg-background rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-muted font-mono font-bold px-0.5">
                      <span onClick={() => handlePercentSelect(0)} className="cursor-pointer hover:text-foreground">0%</span>
                      <span onClick={() => handlePercentSelect(25)} className="cursor-pointer hover:text-foreground">25%</span>
                      <span onClick={() => handlePercentSelect(50)} className="cursor-pointer hover:text-foreground">50%</span>
                      <span onClick={() => handlePercentSelect(75)} className="cursor-pointer hover:text-foreground">75%</span>
                      <span onClick={() => handlePercentSelect(100)} className="cursor-pointer hover:text-foreground">100%</span>
                    </div>
                  </div>

                  {/* TOTAL ORDER VALUE INPUT FIELD */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-muted uppercase block font-semibold">Total</label>
                    <div className="relative">
                      <Input
                        type="number"
                        readOnly
                        value={estimatedNotional.toFixed(2)}
                        placeholder="Minimum: 0.1"
                        className="bg-background/20 border-transparent font-mono text-xs text-foreground w-full rounded pr-12"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted text-[10px]">USDT</span>
                    </div>
                  </div>

                  {/* AVAILABLE BALANCE ROW */}
                  <div className="flex justify-between items-center text-[10px] text-muted font-bold pt-1 border-t border-transparent">
                    <span>Available</span>
                    <span className="text-foreground">{spotWalletBalance.toFixed(2)} USDT <span className="text-primary cursor-pointer">+</span></span>
                  </div>

                  {/* FEEDBACK MESSAGES */}
                  {message && (
                    <p className="text-trading-up text-[10px] text-center bg-trading-up/10 py-1 rounded border border-trading-up/20">{message}</p>
                  )}
                  {error && (
                    <p className="text-trading-down text-[10px] text-center bg-trading-down/10 py-1 rounded border border-trading-down/20">{error}</p>
                  )}

                  {/* SUBMIT ORDER BUTTON */}
                  <Button
                    type="submit"
                    className={`w-full text-xs uppercase py-2.5 font-extrabold rounded min-h-[42px] ${
                      form.side === "BUY" ? "bg-trading-up text-white" : "bg-trading-down text-white"
                    }`}
                    loading={loading}
                  >
                    {form.side === "BUY" ? "BUY" : "SELL"} {baseAsset}
                  </Button>
                </form>
              </Card>

              {/* KUCOIN ASSET OVERVIEW BOX */}
              <Card className="bg-background border border-transparent rounded-xl p-3 font-mono text-xs shadow-elevation-md space-y-2">
                <div className="flex justify-between items-center border-b border-transparent pb-1">
                  <span className="font-bold text-foreground text-[11px] uppercase">Asset Overview</span>
                  <span className="text-[10px] text-primary cursor-pointer hover:underline">Trading Account</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-muted">Total USDT Balance</span>
                  <span className="font-bold text-foreground">{spotWalletBalance.toFixed(2)} USDT</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-muted">Fee Discounts</span>
                  <span className="text-trading-up font-bold">KCS Pay (-20%)</span>
                </div>
              </Card>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3. KUCOIN BOTTOM DATA TABLE PANEL & TABS                                   */}
          {/* ========================================================================= */}
          <div className="bg-background border border-transparent rounded-xl overflow-hidden shadow-elevation-md p-3 font-mono text-xs">
            {/* Tabs List matching KuCoin screenshot */}
            <div className="flex items-center gap-6 border-b border-transparent pb-2 mb-3 overflow-x-auto scrollbar-none">
              {[
                { id: "OPEN_ORDERS", label: `Open Orders (${activeOrders.length})` },
                { id: "POSITIONS", label: `Positions (${spotPositions.length})` },
                { id: "ASSETS", label: "Assets" },
                { id: "ORDER_HISTORY", label: "Order History" },
                { id: "TRADE_HISTORY", label: "Trade History" },
                { id: "POSITION_HISTORY", label: "Position History" },
                { id: "ALGORITHM", label: "Trading Algorithm (0)" },
                { id: "RUNNING_BOTS", label: "Running Bots" },
                { id: "PROFITS", label: "Profits" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveBottomTab(tab.id)}
                  className={`text-xs font-bold uppercase pb-1 border-b-2 whitespace-nowrap transition-all ${
                    activeBottomTab === tab.id
                      ? "text-foreground border-primary font-extrabold"
                      : "text-muted border-transparent hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}

              {activeBottomTab === "OPEN_ORDERS" && activeOrders.length > 0 && (
                <button
                  type="button"
                  onClick={handleCancelAllOrders}
                  className="ml-auto px-2 py-0.5 bg-trading-down/10 text-trading-down text-[10px] font-bold rounded border border-trading-down/20 flex items-center gap-1"
                >
                  <Trash2 size={11} /> Cancel All
                </button>
              )}
            </div>

            {/* TAB CONTENT TABLES */}
            <div className="min-h-[140px]">
              {activeBottomTab === "OPEN_ORDERS" && (
                activeOrders.length === 0 ? (
                  <div className="py-10 text-center text-muted text-xs">No open orders in spot workspace.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse font-mono text-xs">
                      <thead>
                        <tr className="border-b border-transparent text-[10px] font-bold text-muted uppercase">
                          <th className="py-2 px-3">Symbol</th>
                          <th className="py-2 px-3">Side</th>
                          <th className="py-2 px-3">Type</th>
                          <th className="py-2 px-3 text-right">Quantity</th>
                          <th className="py-2 px-3 text-right">Price</th>
                          <th className="py-2 px-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-transparent">
                        {activeOrders.map((o) => (
                          <tr key={o.id} className="hover:bg-background/40">
                            <td className="py-2 px-3 font-bold text-foreground uppercase">{o.symbol}</td>
                            <td className="py-2 px-3">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${o.side === "BUY" ? "bg-trading-up/10 text-trading-up" : "bg-trading-down/10 text-trading-down"}`}>
                                {o.side}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-muted">{o.orderType}</td>
                            <td className="py-2 px-3 text-right font-semibold">{o.quantity}</td>
                            <td className="py-2 px-3 text-right font-semibold">{formatCurrency(o.price)}</td>
                            <td className="py-2 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleCancelOrder(o.id)}
                                className="px-2 py-0.5 bg-trading-down/10 text-trading-down border border-trading-down/20 rounded text-[10px] font-bold hover:bg-trading-down hover:text-white transition-all"
                              >
                                Cancel
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              )}

              {activeBottomTab === "POSITIONS" && (
                spotPositions.length === 0 ? (
                  <div className="py-10 text-center text-muted text-xs">No active spot positions.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse font-mono text-xs">
                      <thead>
                        <tr className="border-b border-transparent text-[10px] font-bold text-muted uppercase">
                          <th className="py-2 px-3">Symbol</th>
                          <th className="py-2 px-3 text-right">Holdings</th>
                          <th className="py-2 px-3 text-right">Avg Entry</th>
                          <th className="py-2 px-3 text-right">Market Price</th>
                          <th className="py-2 px-3 text-right">Market Value</th>
                          <th className="py-2 px-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-transparent">
                        {spotPositions.map((pos) => {
                          const mPrice = pricesMap[pos.symbol.toUpperCase()] || Number(pos.averageEntryPrice);
                          const mValue = pos.quantity * mPrice;
                          return (
                            <tr key={pos.symbol} className="hover:bg-background/40">
                              <td className="py-2 px-3 font-bold text-foreground">{pos.symbol}</td>
                              <td className="py-2 px-3 text-right font-semibold">{pos.quantity.toFixed(4)}</td>
                              <td className="py-2 px-3 text-right text-muted">{formatCurrency(pos.averageEntryPrice)}</td>
                              <td className="py-2 px-3 text-right font-semibold">{formatCurrency(mPrice)}</td>
                              <td className="py-2 px-3 text-right font-semibold">{formatCurrency(mValue)}</td>
                              <td className="py-2 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => setForm(prev => ({ ...prev, symbol: pos.symbol, side: "SELL" }))}
                                  className="px-2 py-0.5 bg-trading-down/10 text-trading-down border border-trading-down/20 rounded text-[10px] font-bold"
                                >
                                  Close
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )
              )}

              {activeBottomTab === "ORDER_HISTORY" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse font-mono text-xs">
                    <thead>
                      <tr className="border-b border-transparent text-[10px] font-bold text-muted uppercase">
                        <th className="py-2 px-3">Symbol</th>
                        <th className="py-2 px-3">Side</th>
                        <th className="py-2 px-3">Type</th>
                        <th className="py-2 px-3 text-right">Quantity</th>
                        <th className="py-2 px-3 text-right">Price</th>
                        <th className="py-2 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-transparent">
                      {orderHistory.map((o) => (
                        <tr key={o.id} className="hover:bg-background/40">
                          <td className="py-2 px-3 font-bold text-foreground">{o.symbol}</td>
                          <td className="py-2 px-3">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${o.side === "BUY" ? "bg-trading-up/10 text-trading-up" : "bg-trading-down/10 text-trading-down"}`}>
                              {o.side}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-muted">{o.orderType}</td>
                          <td className="py-2 px-3 text-right font-semibold">{o.quantity}</td>
                          <td className="py-2 px-3 text-right font-semibold">{formatCurrency(o.price)}</td>
                          <td className="py-2 px-3 text-right">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${o.status === "FILLED" ? "bg-trading-up/10 text-trading-up" : "bg-background text-muted"}`}>
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {["ASSETS", "TRADE_HISTORY", "POSITION_HISTORY", "ALGORITHM", "RUNNING_BOTS", "PROFITS"].includes(activeBottomTab) && (
                <div className="py-8 text-center text-muted font-mono text-xs">
                  No records in {activeBottomTab.replace("_", " ")}. Trading engine active.
                </div>
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 4. KUCOIN BOTTOM STATUS FOOTER BAR                                        */}
          {/* ========================================================================= */}
          <div className="flex flex-wrap items-center justify-between border-t border-transparent pt-2 text-[10px] font-mono text-muted">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-trading-up font-bold">
                <span className="w-2 h-2 rounded-full bg-trading-up animate-pulse" />
                Live Socket Connection
              </span>
              <span>NexTradeX Engine v2.4</span>
            </div>

            <div className="flex items-center gap-6">
              <button type="button" className="hover:text-foreground transition-colors">Announcements</button>
              <button type="button" className="hover:text-foreground transition-colors">Cookie Preferences</button>
              <button type="button" className="hover:text-foreground transition-colors flex items-center gap-1">
                <Headphones size={12} /> Online Support
              </button>
            </div>
          </div>

        </div>
      </div>
    </PageTransition>
  );
}

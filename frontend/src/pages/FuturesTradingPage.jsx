import React, { useEffect, useMemo, useState, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { fetchCandlestickData, fetchOpenFuturesPositions, fetchPrice, openFuturesPosition, fetchWallets, closeFuturesPosition, updateFuturesSlTp, hasAuthToken, fetchBinanceSymbols } from "../api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Button } from "../components/ui/Button";
import { PageTransition } from "../components/ui/PageTransition";
import { TradingChartPanel } from "../components/ui/TradingChartPanel";
import { OrderBook } from "../components/ui/OrderBook";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "../components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { useWebSocket } from "../hooks/useWebSocket";
import { formatCurrency, formatPercent } from "../lib/utils";
import { ArrowRightLeft, Info, HelpCircle, Lock, Trash2, Search, ChevronDown, Shield } from "lucide-react";

const FALLBACK_SYMBOLS = [
  "BTCUSDT", "ETHUSDT", "SOLUSDT", "LINKUSDT", "LTCUSDT",
  "ARBUSDT", "OPUSDT", "SUIUSDT", "TIAUSDT", "SEIUSDT"
];

export default function FuturesTradingPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Set initial symbol from URL if present
  const getInitialSymbol = () => {
    const urlSym = searchParams.get("symbol");
    return urlSym ? urlSym.toUpperCase() : "BTCUSDT";
  };

  // Page core states
  const [symbol, setSymbol] = useState(getInitialSymbol());
  const [symbolsList, setSymbolsList] = useState([]);
  const [symbolSearch, setSymbolSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Read symbol from URL search parameters on URL change
  useEffect(() => {
    const urlSym = searchParams.get("symbol");
    if (urlSym && urlSym.toUpperCase() !== symbol) {
      setSymbol(urlSym.toUpperCase());
    }
  }, [searchParams]);

  // Update URL search parameters when symbol changes
  useEffect(() => {
    if (symbol) {
      setSearchParams({ symbol: symbol });
    }
  }, [symbol]);
  const [side, setSide] = useState("BUY"); // BUY = LONG, SELL = SHORT
  const [orderMode, setOrderMode] = useState("OPEN"); // OPEN or CLOSE tab
  const [orderType, setOrderType] = useState("LIMIT"); // LIMIT, MARKET, CONDITIONAL
  const [quantity, setQuantity] = useState("0.001");
  const [price, setPrice] = useState("69969.3");
  const [stopPrice, setStopPrice] = useState("69900.0");
  const [leverage, setLeverage] = useState("7");
  const [marginMode, setMarginMode] = useState("ISOLATED");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [positions, setPositions] = useState([]);
  const [loadingPositions, setLoadingPositions] = useState(true);
  const [selectedPositionForSlTp, setSelectedPositionForSlTp] = useState(null);
  const [slInput, setSlInput] = useState("");
  const [tpInput, setTpInput] = useState("");
  const [isUpdatingSlTp, setIsUpdatingSlTp] = useState(false);
  const [slTpError, setSlTpError] = useState("");
  const [candleData, setCandleData] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [priceSnapshot, setPriceSnapshot] = useState(null);
  const [chartInterval, setChartInterval] = useState("1h");
  const [activeBottomTab, setActiveBottomTab] = useState("POSITIONS");
  const [usdtWalletBalance, setUsdtWalletBalance] = useState(0.00);
  const [pricesMap, setPricesMap] = useState({});

  // Load available trading symbols
  useEffect(() => {
    const getSymbols = async () => {
      try {
        const res = await fetchBinanceSymbols();
        if (res?.data && res.data.length > 0) {
          const usdtSymbols = res.data.filter(s => s.toUpperCase().endsWith("USDT"));
          setSymbolsList(usdtSymbols.length > 0 ? usdtSymbols : res.data);
        } else {
          setSymbolsList(FALLBACK_SYMBOLS);
        }
      } catch (err) {
        console.warn("[Futures] Failed to fetch symbols, using fallback:", err.message);
        setSymbolsList(FALLBACK_SYMBOLS);
      }
    };
    getSymbols();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredSymbols = useMemo(() => {
    if (!symbolSearch.trim()) return symbolsList;
    return symbolsList.filter((s) =>
      s.toLowerCase().includes(symbolSearch.toLowerCase())
    );
  }, [symbolsList, symbolSearch]);
  
  // Real-time streaming mock recent trades
  const [recentTrades, setRecentTrades] = useState([]);

  // Pre-populate recent trades when priceSnapshot loads or symbol changes
  useEffect(() => {
    const basePrice = Number(priceSnapshot?.currentPrice || pricesMap[symbol.toUpperCase()] || 69969.3);
    if (basePrice) {
      const initialTrades = Array.from({ length: 6 }).map((_, idx) => {
        const diff = (Math.random() - 0.5) * (basePrice * 0.002);
        const tradePrice = basePrice + diff;
        const timeOffset = idx * 3;
        const timeStr = new Date(Date.now() - timeOffset * 1000).toTimeString().split(" ")[0];
        return {
          id: idx + "_" + symbol,
          price: parseFloat(tradePrice.toFixed(2)),
          amount: parseFloat((Math.random() * 1.5 + 0.01).toFixed(4)),
          time: timeStr,
          side: Math.random() > 0.48 ? "BUY" : "SELL"
        };
      });
      setRecentTrades(initialTrades);
    }
  }, [priceSnapshot?.currentPrice, symbol]);

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
    const currentSymbol = symbol.toUpperCase();

    if (Array.isArray(data)) {
      update = data.find((p) => p.symbol.toUpperCase() === currentSymbol);
    } else if (data && data.symbol.toUpperCase() === currentSymbol) {
      update = data;
    }

    if (update) {
      const newPrice = Number(update.currentPrice);
      setPriceSnapshot(update);

      // Add a new row to recent trades
      const newTrade = {
        id: Date.now(),
        price: parseFloat(newPrice.toFixed(1)),
        amount: parseFloat((Math.random() * 1.5 + 0.01).toFixed(3)),
        time: new Date().toTimeString().split(" ")[0],
        side: Math.random() > 0.48 ? "BUY" : "SELL"
      };
      setRecentTrades((trades) => [newTrade, ...trades.slice(0, 12)]);

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

  // Load wallet balance
  useEffect(() => {
    const loadWallet = async () => {
      try {
        const walletsRes = await fetchWallets();
        const usdtWallet = walletsRes?.data?.find(w => w.walletType === "FUTURES");
        if (usdtWallet) {
          setUsdtWalletBalance(Number(usdtWallet.balance || 0));
        }
      } catch {
        // Fallback to default mock
      }
    };
    loadWallet();
  }, []);

  const loadPositions = async () => {
    try {
      const res = await fetchOpenFuturesPositions();
      setPositions(res?.data || []);
    } catch {
      // ignore if not logged in
    } finally {
      setLoadingPositions(false);
    }
  };

  useEffect(() => {
    loadPositions();
  }, []);

  useEffect(() => {
    const loadPrice = async () => {
      try {
        const response = await fetchPrice(symbol);
        setPriceSnapshot(response?.data || null);
        if (response?.data?.currentPrice) {
          setPrice(response.data.currentPrice.toString());
        }
      } catch {
        setPriceSnapshot(null);
      }
    };

    loadPrice();
  }, [symbol]);

  useEffect(() => {
    const loadCandles = async () => {
      setChartLoading(true);
      try {
        const data = await fetchCandlestickData(symbol, chartInterval, 120);
        setCandleData(data);
      } catch {
        setCandleData([]);
      } finally {
        setChartLoading(false);
      }
    };
    loadCandles();
  }, [symbol, chartInterval]);

  const handleSubmitOrder = async (orderSide) => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const payload = {
        symbol: symbol,
        side: orderSide,
        quantity: parseFloat(quantity),
        leverage: parseFloat(leverage),
      };
      const res = await openFuturesPosition(payload);
      setMessage(res?.message || `Futures ${orderSide} position opened successfully`);
      await loadPositions();
    } catch (err) {
      setError(err.message || "Failed to open position");
    } finally {
      setLoading(false);
    }
  };
  
  const handleClosePosition = async (positionId) => {
    setLoadingPositions(true);
    setError("");
    setMessage("");
    try {
      const res = await closeFuturesPosition(positionId);
      setMessage(res?.message || "Position closed successfully");
      await loadPositions();
      
      // Update balance
      const walletsRes = await fetchWallets();
      const usdtWallet = walletsRes?.data?.find(w => w.walletType === "FUTURES");
      if (usdtWallet) {
        setUsdtWalletBalance(Number(usdtWallet.balance || 0));
      }
    } catch (err) {
      setError(err.message || "Failed to close position");
    } finally {
      setLoadingPositions(false);
    }
  };

  const handleCloseAllPositions = async () => {
    if (positions.length === 0) return;
    setLoadingPositions(true);
    setError("");
    setMessage("");
    try {
      await Promise.all(positions.map((p) => closeFuturesPosition(p.id)));
      setMessage("All open positions closed successfully");
      await loadPositions();
      
      // Update balance
      const walletsRes = await fetchWallets();
      const usdtWallet = walletsRes?.data?.find(w => w.walletType === "FUTURES");
      if (usdtWallet) {
        setUsdtWalletBalance(Number(usdtWallet.balance || 0));
      }
    } catch (err) {
      setError(err.message || "Failed to close all positions");
      await loadPositions();
    } finally {
      setLoadingPositions(false);
    }
  };

  const handleOpenSlTpModal = (position) => {
    setSelectedPositionForSlTp(position);
    setSlInput(position.stopLoss ? position.stopLoss.toString() : "");
    setTpInput(position.takeProfit ? position.takeProfit.toString() : "");
    setSlTpError("");
  };

  const handleSaveSlTp = async () => {
    if (!selectedPositionForSlTp) return;
    setIsUpdatingSlTp(true);
    setSlTpError("");
    try {
      const payload = {
        stopLoss: slInput ? parseFloat(slInput) : null,
        takeProfit: tpInput ? parseFloat(tpInput) : null
      };
      await updateFuturesSlTp(selectedPositionForSlTp.id, payload);
      await loadPositions();
      setSelectedPositionForSlTp(null);
    } catch (err) {
      setSlTpError(err.message || "Failed to update Stop Loss / Take Profit");
    } finally {
      setIsUpdatingSlTp(false);
    }
  };

  const estimatedMargin = useMemo(() => {
    const qty = Number(quantity || 0);
    const lev = Number(leverage || 1);
    const markPrice = Number(priceSnapshot?.currentPrice || 0);
    return lev > 0 ? (qty * markPrice) / lev : 0;
  }, [leverage, quantity, priceSnapshot?.currentPrice]);

  const baseAsset = useMemo(() => symbol.replace("USDT", "").toUpperCase(), [symbol]);

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
      label: "Est. margin",
      value: estimatedMargin,
      kind: "currency",
      icon: "volume",
      hint: `${leverage}x leverage`,
    },
    {
      label: "Open positions",
      value: positions.length,
      icon: "momentum",
      hint: "Current exposure count",
    },
  ];

  // Fast select size percentage handler
  const handlePercentSelect = (percent) => {
    if (!priceSnapshot?.currentPrice) return;
    const maxNotional = usdtWalletBalance * Number(leverage);
    const targetNotional = maxNotional * (percent / 100);
    const targetQty = targetNotional / priceSnapshot.currentPrice;
    setQuantity(targetQty.toFixed(4));
  };

  return (
    <PageTransition>
      <div className="w-full bg-background text-foreground py-4 font-sans select-none min-h-screen">
        <div className="max-w-8xl mx-auto px-4 space-y-4">
          
          {/* HIGH-DENSITY TICKER HEADER PANEL */}
          <div className="bg-background border border-transparent rounded-xl px-5 py-3.5 flex flex-wrap items-center justify-between gap-6 shadow-elevation-md">
            
            {/* Asset Symbol & Base Stats */}
            <div className="flex items-center gap-4 relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => {
                  setIsDropdownOpen(!isDropdownOpen);
                  setSymbolSearch("");
                }}
                className="text-left group flex items-center gap-3 px-3 py-1.5 rounded-2xl border border-transparent bg-background/40 hover:bg-background/80 hover:border-primary/30 transition-all duration-200"
              >
                <div>
                  <h1 className="text-base font-extrabold font-heading flex items-center gap-1.5 text-foreground">
                    {symbol.toUpperCase()}
                    <span className="text-[9px] font-mono font-bold bg-primary/15 text-primary px-1 rounded uppercase">Perp</span>
                    <ChevronDown size={14} className="text-muted group-hover:text-primary transition-transform duration-200 group-hover:translate-y-0.5" />
                  </h1>
                  <span className="text-[10px] font-mono font-semibold text-muted">Binance Futures</span>
                </div>
              </button>

              {/* Glassmorphic Dropdown Popover */}
              {isDropdownOpen && (
                <div className="absolute left-0 top-[110%] w-72 bg-background backdrop-blur-md border border-transparent rounded-xl shadow-neo-hover overflow-hidden z-50 animate-fade-in-fast font-sans">
                  {/* Search input header */}
                  <div className="p-3 border-b border-transparent flex items-center gap-2">
                    <Search size={14} className="text-muted" />
                    <input
                      type="text"
                      value={symbolSearch}
                      onChange={(e) => setSymbolSearch(e.target.value)}
                      placeholder="Search pair..."
                      className="bg-transparent text-foreground placeholder-muted text-xs outline-none w-full font-mono"
                      autoFocus
                    />
                  </div>
                  {/* Scrollable list */}
                  <div className="overflow-y-auto max-h-64 divide-y divide-white/[0.02]">
                    {filteredSymbols.length === 0 ? (
                      <div className="p-4 text-center text-xs text-muted">No symbols found</div>
                    ) : (
                      filteredSymbols.map((sym) => {
                        const isSelected = sym.toUpperCase() === symbol.toUpperCase();
                        return (
                          <button
                            key={sym}
                            type="button"
                            onClick={() => {
                              setSymbol(sym.toUpperCase());
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-xs font-mono font-semibold flex items-center justify-between hover:bg-background transition-colors ${
                              isSelected ? "text-primary bg-primary/[0.05]" : "text-foreground"
                            }`}
                          >
                            <span>{sym.toUpperCase()}</span>
                            {isSelected && <span className="text-[9px] font-bold bg-primary/20 px-1.5 py-0.5 rounded text-primary uppercase">Active</span>}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {priceSnapshot && (
                <div className="border-l border-transparent pl-4 flex flex-col justify-center">
                  <span className="text-[10px] text-muted font-mono font-bold uppercase block">Mark Price</span>
                  <span className="text-base font-extrabold font-mono text-trading-up">
                    {formatCurrency(priceSnapshot.currentPrice)}
                  </span>
                </div>
              )}
            </div>

            {priceSnapshot && (
              <div className="flex flex-wrap items-center gap-8 font-mono text-muted">
                <div className="min-w-[100px]">
                  <span className="block uppercase text-[9px]">Index Price</span>
                  <span className="text-sm font-bold text-foreground">{(Number(priceSnapshot.currentPrice) * 1.0005).toFixed(2)}</span>
                </div>

                <div className="min-w-[160px]">
                  <span className="block uppercase text-[9px] text-primary">Funding (8h) / Countdown</span>
                  <span className="text-sm font-bold text-primary">0.0055% / 07:49:10</span>
                </div>

                <div className="min-w-[80px]">
                  <span className="block uppercase text-[9px]">24h Change</span>
                  <span className={`text-sm font-bold ${Number(priceSnapshot.percentChange24h) >= 0 ? "text-trading-up" : "text-trading-down"}`}>
                    {Number(priceSnapshot.percentChange24h) >= 0 ? "+" : ""}{priceSnapshot.percentChange24h}%
                  </span>
                </div>

                <div className="min-w-[100px]">
                  <span className="block uppercase text-[9px]">24h High</span>
                  <span className="text-sm font-bold text-foreground">{(Number(priceSnapshot.currentPrice) * 1.025).toFixed(2)}</span>
                </div>

                <div className="min-w-[100px]">
                  <span className="block uppercase text-[9px]">24h Low</span>
                  <span className="text-sm font-bold text-foreground">{(Number(priceSnapshot.currentPrice) * 0.975).toFixed(2)}</span>
                </div>

                <div className="min-w-[120px]">
                  <span className="block uppercase text-[9px]">24h Vol({symbol.replace("USDT", "").toUpperCase()})</span>
                  <span className="text-sm font-bold text-foreground">
                    {priceSnapshot.volume24h
                      ? new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(priceSnapshot.volume24h)
                      : "246,500.27"}
                  </span>
                </div>

                <div className="min-w-[140px]">
                  <span className="block uppercase text-[9px]">24h Vol(USDT)</span>
                  <span className="text-sm font-bold text-foreground">
                    {priceSnapshot.volume24h
                      ? new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(priceSnapshot.volume24h) * Number(priceSnapshot.currentPrice))
                      : "15,286,470,643.58"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* MAIN PRO TRADING WORKSPACE CONTAINER */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            
            {/* LEFT AREA: Chart (col-span-9) + Bottom Analytics */}
            <div className="lg:col-span-9 space-y-4">
              <TradingChartPanel
                title="Futures Real-Time Workspace"
                description="High-fidelity futures execution engine featuring real-time candle matching and leverage modifiers."
                symbol={symbol}
                interval={chartInterval}
                onIntervalChange={setChartInterval}
                loading={chartLoading}
                data={candleData}
                status={{ label: connected ? "Live market" : "Snapshot", tone: connected ? "active" : "neutral" }}
                stats={chartStats}
              />

              {/* Bottom Row Sub-Grid: Tabs (9-cols) + Order Book (3-cols) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-9 h-full">
                  {/* HIGH-FIDELITY POSITIONS AND BALANCES BOTTOM TAB GRID */}
                  <Tabs value={activeBottomTab} onValueChange={setActiveBottomTab} className="w-full h-full flex flex-col">
                    <Card className="bg-background border border-transparent rounded-xl overflow-hidden shadow-elevation-md h-full flex flex-col">
                      <div className="bg-background/30 border-b border-transparent px-4 flex items-center justify-between">
                        <TabsList className="flex gap-4 bg-transparent border-0 p-0 h-auto rounded-none">
                          {[
                            { id: "POSITIONS", label: "Positions" },
                            { id: "OPEN ORDERS", label: "Open Orders" },
                            { id: "ORDER HISTORY", label: "Order History" },
                            { id: "TRADE HISTORY", label: "Trade History" },
                            { id: "ASSETS", label: "Assets" }
                          ].map((tab) => (
                            <TabsTrigger
                              key={tab.id}
                              value={tab.id}
                              className="pb-3 pt-3 bg-transparent border-0 rounded-none relative font-heading text-[10px] font-bold uppercase text-muted hover:text-foreground data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:font-bold transition-all cursor-pointer"
                            >
                              {tab.label}{" "}
                              {tab.id === "POSITIONS" ? `(${positions.length})` : "(0)"}
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
                      </div>

                      <CardContent className="p-0 min-h-[160px] flex-1 flex flex-col">
                      {activeBottomTab === "POSITIONS" ? (
                        loadingPositions ? (
                          <div className="p-6 space-y-2">
                            <div className="h-6 bg-background/[0.02] rounded animate-pulse w-full" />
                            <div className="h-6 bg-background/[0.02] rounded animate-pulse w-full" />
                          </div>
                        ) : positions.length === 0 ? (
                          <div className="py-12 text-center text-muted font-mono text-xs">
                            No active leveraged exposures.
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse font-mono text-xs">
                              <thead>
                                <tr className="border-b border-transparent text-[9px] font-bold text-muted uppercase bg-background/20 py-2.5">
                                  <th className="py-2.5 px-4">Symbol</th>
                                  <th className="py-2.5 px-4">Mode</th>
                                  <th className="py-2.5 px-4 text-right">Size</th>
                                  <th className="py-2.5 px-4 text-right">Entry Price</th>
                                  <th className="py-2.5 px-4 text-right">Leverage</th>
                                  <th className="py-2.5 px-4 text-right">Unrealized PnL</th>
                                  <th className="py-2.5 px-4 text-center">TP / SL</th>
                                  <th className="py-2.5 px-4 text-center">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-hairline-on-dark">
                                {positions.map((p) => {
                                  const currentPrice = pricesMap[p.symbol.toUpperCase()] || Number(p.markPrice || p.entryPrice);
                                  const entryPrice = Number(p.entryPrice);
                                  const qty = Number(p.quantity);
                                  
                                  let pnlVal;
                                  if (p.positionMode === "LONG") {
                                    pnlVal = (currentPrice - entryPrice) * qty;
                                  } else { // SHORT
                                    pnlVal = (entryPrice - currentPrice) * qty;
                                  }
                                  
                                  const isProfit = pnlVal >= 0;
                                  return (
                                    <tr key={p.id} className="hover:bg-background/[0.01] transition-colors">
                                      <td className="py-3 px-4 font-bold text-foreground">{p.symbol}</td>
                                      <td className="py-3 px-4">
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                          p.positionMode === "LONG" ? "bg-trading-up/10 text-trading-up" : "bg-trading-down/10 text-trading-down"
                                        }`}>
                                          {p.positionMode}
                                        </span>
                                      </td>
                                      <td className="py-3 px-4 text-right font-semibold">{p.quantity}</td>
                                      <td className="py-3 px-4 text-right text-muted">{p.entryPrice}</td>
                                      <td className="py-3 px-4 text-right text-primary font-bold">{p.leverage}x</td>
                                      <td className={`py-3 px-4 text-right font-bold text-sm ${isProfit ? "text-trading-up" : "text-trading-down"}`}>
                                        {isProfit ? "+" : ""}{pnlVal.toFixed(2)} USDT
                                      </td>
                                      <td className="py-3 px-4 text-center">
                                        <div className="flex flex-col items-center gap-0.5">
                                          <span className={p.takeProfit ? "text-trading-up text-[10px]" : "text-muted text-[10px]"}>
                                            TP: {p.takeProfit ? `${p.takeProfit}` : "---"}
                                          </span>
                                          <span className={p.stopLoss ? "text-trading-down text-[10px]" : "text-muted text-[10px]"}>
                                            SL: {p.stopLoss ? `${p.stopLoss}` : "---"}
                                          </span>
                                        </div>
                                      </td>
                                      <td className="py-3 px-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                          <button
                                            type="button"
                                            onClick={() => handleOpenSlTpModal(p)}
                                            className="px-2 py-1 bg-background hover:bg-primary/15 hover:text-primary border border-transparent rounded text-[10px] font-semibold transition-all"
                                          >
                                            Set TP/SL
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleClosePosition(p.id)}
                                            className="px-2 py-1 bg-trading-down/10 hover:bg-trading-down/25 text-trading-down border border-trading-down/20 rounded text-[10px] font-semibold transition-all"
                                          >
                                            Close
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )
                      ) : activeBottomTab === "ASSETS" ? (
                        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                          <div className="border border-transparent rounded-2xl p-3 bg-background/20">
                            <span className="text-muted text-[10px] uppercase block">Total Futures Equity</span>
                            <span className="text-lg font-bold text-foreground block mt-1">{formatCurrency(usdtWalletBalance)}</span>
                          </div>
                          <div className="border border-transparent rounded-2xl p-3 bg-background/20">
                            <span className="text-muted text-[10px] uppercase block">Asset Sizing Base</span>
                            <span className="text-sm font-bold text-primary block mt-1">USDT (Perpetual Margin)</span>
                          </div>
                          <div className="border border-transparent rounded-2xl p-3 bg-background/20 flex items-center justify-between">
                            <div>
                              <span className="text-muted text-[10px] uppercase block">Wallet Connection</span>
                              <span className="text-[10px] text-trading-up font-bold block mt-1">● ONLINE (Simulated Perp)</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="py-12 text-center text-muted font-mono text-xs">
                          No active {activeBottomTab.toLowerCase()} records.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Tabs>
                </div>

                {/* Order Book component (col-span-3) */}
                <div className="md:col-span-3 h-full">
                  <OrderBook
                    symbol={symbol}
                    currentPrice={priceSnapshot?.currentPrice}
                    onSelectPrice={(p) => setPrice(p.toFixed(2))}
                  />
                </div>
              </div>
            </div>

            {/* RIGHT AREA: Full Professional Order Entry Form (col-span-3) */}
            <div className="lg:col-span-3 space-y-4">
              <Card className="border border-transparent bg-background rounded-xl overflow-hidden shadow-elevation-lg relative">
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
                
                {/* Isolated/Leverage Config Bar */}
                <div className="bg-background/30 px-4 py-2 border-b border-transparent flex items-center justify-between text-[10px] font-mono">
                  <div className="flex gap-2">
                    <select
                      value={marginMode}
                      onChange={(e) => setMarginMode(e.target.value)}
                      className="bg-background border border-transparent rounded px-1.5 py-0.5 text-foreground font-bold outline-none uppercase cursor-pointer"
                    >
                      <option value="ISOLATED">Isolated</option>
                      <option value="CROSS">Cross</option>
                    </select>
                    
                    <select
                      value={leverage}
                      onChange={(e) => setLeverage(e.target.value)}
                      className="bg-background border border-transparent rounded px-1.5 py-0.5 text-primary font-extrabold outline-none cursor-pointer"
                    >
                      {["1", "3", "5", "7", "10", "20", "50", "100", "125"].map(lvl => (
                        <option key={lvl} value={lvl}>{lvl}x</option>
                      ))}
                    </select>
                  </div>
                  
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-muted flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors">
                          <Info size={11} className="text-primary" />
                          Margin Mode
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="bg-background border border-transparent text-xs p-2 text-foreground max-w-[200px] rounded-2xl">
                        Isolated restricts margin to a single position, while Cross shares margin across all positions to prevent liquidation.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {/* Open / Close Order Tabs — 44px touch targets */}
                <div className="flex border-b border-transparent p-1 bg-background/40">
                  <button
                    type="button"
                    aria-pressed={orderMode === "OPEN"}
                    className={`flex-1 min-h-[44px] text-center text-xs font-bold rounded transition-all ${
                      orderMode === "OPEN" ? "bg-background text-foreground font-bold" : "text-muted hover:text-foreground"
                    }`}
                    onClick={() => setOrderMode("OPEN")}
                  >
                    Open
                  </button>
                  <button
                    type="button"
                    aria-pressed={orderMode === "CLOSE"}
                    className={`flex-1 min-h-[44px] text-center text-xs font-bold rounded transition-all ${
                      orderMode === "CLOSE" ? "bg-background text-foreground font-bold" : "text-muted hover:text-foreground"
                    }`}
                    onClick={() => setOrderMode("CLOSE")}
                  >
                    Close
                  </button>
                </div>

                {/* Order Type Selector Sub-Tabs */}
                <div className="flex justify-between items-center px-4 py-2 border-b border-transparent font-heading text-[10px] text-muted">
                  {["LIMIT", "MARKET", "CONDITIONAL"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setOrderType(type)}
                      className={`font-bold pb-0.5 ${orderType === type ? "text-primary border-b border-primary" : "hover:text-foreground"}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <div className="p-4 space-y-4">
                  {/* Available Capital balance */}
                  <div aria-label={`Available wallet balance: ${usdtWalletBalance.toFixed(2)} USDT`} className="flex justify-between items-center text-[10px] font-mono text-muted">
                    <span>Avbl Wallet Balance</span>
                    <span className="text-foreground font-semibold flex items-center gap-1">
                      {usdtWalletBalance.toFixed(2)} USDT
                      <ArrowRightLeft size={10} className="text-primary cursor-pointer" />
                    </span>
                  </div>

                  {/* Stop price (Conditional Order only) */}
                  {orderType === "CONDITIONAL" && (
                    <div className="animate-slide-down">
                      <label className="font-mono text-[9px] text-muted uppercase mb-1 block">Stop Price</label>
                      <div className="relative">
                        <Input
                          type="number"
                          step="0.1"
                          value={stopPrice}
                          onChange={(e) => setStopPrice(e.target.value)}
                          className="bg-background border-transparent text-foreground font-mono text-xs rounded w-full pr-12"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-[10px] font-mono">USDT</span>
                      </div>
                    </div>
                  )}

                  {/* Limit Price */}
                  {orderType !== "MARKET" && (
                    <div>
                      <label className="font-mono text-[9px] text-muted uppercase mb-1 block">Price</label>
                      <div className="relative">
                        <Input
                          type="number"
                          step="0.1"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          className="bg-background border-transparent text-foreground font-mono text-xs rounded w-full pr-12"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-[10px] font-mono">USDT</span>
                      </div>
                    </div>
                  )}

                  {/* Order quantity sizing */}
                  <div>
                    <label className="font-mono text-[9px] text-muted uppercase mb-1 block">Size</label>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.001"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="bg-background border-transparent text-foreground font-mono text-xs rounded w-full pr-12"
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

                  {/* Financials & Risks summary */}
                  <div className="border border-transparent bg-background/40 rounded-2xl p-2.5 space-y-1.5 text-[10px] font-mono">
                    <div className="flex justify-between items-center text-muted">
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-pointer border-b border-dashed border-transparent/20 hover:text-foreground transition-colors">Order Value Notional</span>
                          </TooltipTrigger>
                          <TooltipContent className="bg-background border border-transparent text-xs p-2 text-foreground max-w-[200px] rounded-2xl">
                            Total position size in USDT, calculated as Quantity × Mark Price.
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <span className="text-foreground font-semibold">
                        {formatCurrency(Number(quantity || 0) * (priceSnapshot?.currentPrice || 0))}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-muted">
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-pointer border-b border-dashed border-transparent/20 hover:text-foreground transition-colors">Initial Margin Cost</span>
                          </TooltipTrigger>
                          <TooltipContent className="bg-background border border-transparent text-xs p-2 text-foreground max-w-[200px] rounded-2xl">
                            The minimum collateral required to open this leveraged position.
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <span className="text-primary font-bold">{formatCurrency(estimatedMargin)}</span>
                    </div>
                    <div className="flex justify-between items-center text-muted">
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-pointer border-b border-dashed border-transparent/20 hover:text-foreground transition-colors">Liq. Price (Est)</span>
                          </TooltipTrigger>
                          <TooltipContent className="bg-background border border-transparent text-xs p-2 text-foreground max-w-[200px] rounded-2xl">
                            The estimated price at which the position's margin is exhausted and liquidation is triggered.
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <span className="text-trading-down font-bold">
                        {formatCurrency((priceSnapshot?.currentPrice || 0) * (side === "BUY" ? 0.85 : 1.15))}
                      </span>
                    </div>
                  </div>

                  {/* Feedback overlays */}
                  {message && (
                    <div role="status" className="p-2.5 rounded bg-trading-up/10 border border-trading-up/20 text-center animate-slide-down">
                      <p className="text-trading-up text-xs font-semibold">{message}</p>
                    </div>
                  )}
                  {error && (
                    <div role="alert" className="text-trading-down text-xs mt-1 p-2.5 rounded bg-trading-down/10 border border-trading-down/20 text-center animate-slide-down">
                      {error}
                    </div>
                  )}

                  {/* Side-by-side Buy/Sell Buttons — 48px touch targets */}
                  {orderMode === "OPEN" ? (
                    <div className="flex gap-3 pt-2">
                      <Button
                        type="button"
                        onClick={() => handleSubmitOrder("BUY")}
                        className="flex-1 font-mono text-xs uppercase py-3 font-bold min-h-[48px] text-foreground rounded-2xl shadow-elevation-sm"
                        variant="tradingUp"
                        loading={loading}
                      >
                        Buy / Long
                      </Button>
                      <Button
                        type="button"
                        onClick={() => handleSubmitOrder("SELL")}
                        className="flex-1 font-mono text-xs uppercase py-3 font-bold min-h-[48px] text-foreground rounded-2xl shadow-elevation-sm"
                        variant="tradingDown"
                        loading={loading}
                      >
                        Sell / Short
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-3 pt-2">
                      <Button
                        type="button"
                        onClick={() => handleSubmitOrder("SELL")}
                        className="flex-1 font-mono text-xs uppercase py-3 font-bold min-h-[48px] text-foreground rounded-2xl shadow-elevation-sm"
                        variant="tradingDown"
                        loading={loading}
                      >
                        Close Long
                      </Button>
                      <Button
                        type="button"
                        onClick={() => handleSubmitOrder("BUY")}
                        className="flex-1 font-mono text-xs uppercase py-3 font-bold min-h-[48px] text-foreground rounded-2xl shadow-elevation-sm"
                        variant="tradingUp"
                        loading={loading}
                      >
                        Close Short
                      </Button>
                    </div>
                  )}

                </div>
              </Card>

              {/* Futures Assets & Risk Margin Card */}
              <Card className="border border-transparent bg-background rounded-xl p-4 space-y-4 shadow-elevation-md">
                <div className="flex justify-between items-center border-b border-transparent pb-2 mb-1">
                  <h4 className="font-heading text-xs font-bold text-foreground uppercase flex items-center gap-1.5">
                    <Shield size={14} className="text-primary" />
                    Futures Account
                  </h4>
                  <span className="text-[9px] font-mono font-bold bg-[#6C63FF]/15 text-[#6C63FF] px-1 rounded uppercase">Risk Level</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-muted font-mono uppercase block">Estimated Equity</span>
                  <div className="text-lg font-bold font-mono text-foreground flex items-baseline gap-1.5">
                    {usdtWalletBalance.toFixed(2)} <span className="text-xs text-muted font-normal">USDT</span>
                  </div>
                </div>

                {/* Margin Ratio progress indicator */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-muted">Margin Ratio</span>
                    <span className="text-trading-up font-bold">0.0% SAFE</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
                    <div className="h-full bg-trading-up rounded-full" style={{ width: "0%" }} />
                  </div>
                </div>

                {/* Mini risk/margin details */}
                <div className="border border-transparent bg-background/40 rounded-2xl p-2.5 space-y-2 text-[10px] font-mono">
                  <div className="flex justify-between items-center text-muted">
                    <span>Margin Balance</span>
                    <span className="text-foreground font-bold">{formatCurrency(usdtWalletBalance)}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-transparent pt-1.5">
                    <span className="text-muted">Maintenance Margin</span>
                    <span className="text-foreground font-bold">0.00 USDT</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-transparent pt-1.5">
                    <span className="text-muted">Active Leverage Mode</span>
                    <span className="text-primary font-bold">{marginMode} {leverage}x</span>
                  </div>
                </div>

                {/* Quick actions grid */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link to="/wallets" className="flex-1">
                    <button className="w-full py-2 bg-[#6C63FF] hover:bg-[#6C63FF]/90 text-[#3D4852] rounded font-mono text-[9px] font-bold text-center transition-all hover:scale-[1.02] active:scale-[0.98]">
                      DEPOSIT
                    </button>
                  </Link>
                  <Link to="/wallets" className="flex-1">
                    <button className="w-full py-2 bg-background hover:bg-background border border-transparent text-foreground rounded font-mono text-[9px] font-bold text-center transition-all hover:scale-[1.02] active:scale-[0.98]">
                      TRANSFER
                    </button>
                  </Link>
                </div>

                {/* Streaming Real-Time matched Trades Panel */}
                <div className="border-t border-transparent pt-4">
                  <div className="flex justify-between items-center pb-2 mb-3">
                    <h4 className="font-heading text-[10px] font-bold text-muted uppercase flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-trading-up animate-ping"></span>
                      Recent Trades
                    </h4>
                    <span className="text-[9px] text-muted">{symbol} Live</span>
                  </div>

                  <div className="flex justify-between text-muted text-[9px] uppercase font-semibold pb-1 border-b border-transparent mb-1.5">
                    <span>Price(USDT)</span>
                    <span>Amount({baseAsset})</span>
                    <span className="text-right">Time</span>
                  </div>

                  <div className="space-y-1">
                    {recentTrades.length === 0 ? (
                      <div className="py-2 text-center text-muted text-[9px]">Waiting...</div>
                    ) : (
                      recentTrades.slice(0, 5).map((t) => (
                        <div key={t.id} className="flex justify-between items-center h-5 px-1 hover:bg-background/[0.02] rounded transition-colors text-[10px]">
                          <span className={`font-bold ${t.side === "BUY" ? "text-trading-up" : "text-trading-down"}`}>
                            {formatCurrency(t.price)}
                          </span>
                          <span className="text-foreground font-medium">{t.amount}</span>
                          <span className="text-muted text-[9px] text-right">{t.time}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </Card>
            </div>

          </div>
        </div>
      </div>

      {/* GLASSMORPHIC STOP LOSS & TAKE PROFIT PORTAL MODAL */}
      <Dialog open={!!selectedPositionForSlTp} onOpenChange={(open) => { if (!open) setSelectedPositionForSlTp(null); }}>
        <DialogContent className="bg-background border-transparent max-w-md w-full p-0 overflow-hidden shadow-neo-hover text-foreground">
          {selectedPositionForSlTp && (
            <>
              <DialogHeader className="bg-background/30 px-6 py-4 border-b border-transparent flex flex-row justify-between items-center space-y-0">
                <DialogTitle className="font-heading font-extrabold text-sm text-foreground flex items-center gap-2">
                  <span>Manage Trade Risk: {selectedPositionForSlTp.symbol}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                    selectedPositionForSlTp.positionMode === "LONG" ? "bg-trading-up/10 text-trading-up" : "bg-trading-down/10 text-trading-down"
                  }`}>
                    {selectedPositionForSlTp.positionMode} {selectedPositionForSlTp.leverage}x
                  </span>
                </DialogTitle>
              </DialogHeader>

              <div className="p-6 space-y-6">
                {/* Entry Price & Current Mark Price Display */}
                <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-background/40 p-3 rounded-2xl border border-transparent">
                  <div>
                    <span className="text-muted block text-[10px] uppercase">Entry Price</span>
                    <span className="text-foreground font-bold">{selectedPositionForSlTp.entryPrice} USDT</span>
                  </div>
                  <div>
                    <span className="text-muted block text-[10px] uppercase">Mark Price</span>
                    <span className="text-primary font-bold">{selectedPositionForSlTp.markPrice || selectedPositionForSlTp.entryPrice} USDT</span>
                  </div>
                </div>

                {/* Take Profit Inputs */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="font-heading text-[10px] text-muted uppercase font-bold">Take Profit (TP)</label>
                    <span className="text-[10px] text-trading-up font-mono">Trigger profit target</span>
                  </div>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.01"
                      value={tpInput}
                      onChange={(e) => setTpInput(e.target.value)}
                      placeholder="e.g. 75000.00"
                      className="bg-background border-transparent text-foreground font-mono text-xs rounded w-full pr-12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-[10px] font-mono">USDT</span>
                  </div>
                  {/* Preset Buttons */}
                  <div className="flex gap-2">
                    {[5, 10, 25].map((pct) => {
                      const entry = Number(selectedPositionForSlTp.entryPrice);
                      const isLong = selectedPositionForSlTp.positionMode === "LONG";
                      const target = isLong 
                        ? entry * (1 + (pct / 100) / Number(selectedPositionForSlTp.leverage))
                        : entry * (1 - (pct / 100) / Number(selectedPositionForSlTp.leverage));
                      return (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setTpInput(target.toFixed(2))}
                          className="flex-1 py-1.5 bg-background hover:bg-trading-up/10 hover:text-trading-up border border-primary/20 hover:border-trading-up/40 text-muted rounded font-mono text-[9px] font-bold transition-all cursor-pointer"
                        >
                          +{pct}% ROE
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Stop Loss Inputs */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="font-heading text-[10px] text-muted uppercase font-bold">Stop Loss (SL)</label>
                    <span className="text-[10px] text-trading-down font-mono">Trigger stop exit</span>
                  </div>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.01"
                      value={slInput}
                      onChange={(e) => setSlInput(e.target.value)}
                      placeholder="e.g. 65000.00"
                      className="bg-background border-transparent text-foreground font-mono text-xs rounded w-full pr-12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-[10px] font-mono">USDT</span>
                  </div>
                  {/* Preset Buttons */}
                  <div className="flex gap-2">
                    {[2, 5, 10].map((pct) => {
                      const entry = Number(selectedPositionForSlTp.entryPrice);
                      const isLong = selectedPositionForSlTp.positionMode === "LONG";
                      const target = isLong 
                        ? entry * (1 - (pct / 100) / Number(selectedPositionForSlTp.leverage))
                        : entry * (1 + (pct / 100) / Number(selectedPositionForSlTp.leverage));
                      return (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setSlInput(target.toFixed(2))}
                          className="flex-1 py-1.5 bg-background hover:bg-trading-down/10 hover:text-trading-down border border-primary/20 hover:border-trading-down/40 text-muted rounded font-mono text-[9px] font-bold transition-all cursor-pointer"
                        >
                          -{pct}% ROE
                        </button>
                      );
                    })}
                  </div>
                </div>

                {slTpError && (
                  <div role="alert" className="text-trading-down text-xs mt-1 p-3 rounded bg-trading-down/10 border border-trading-down/20 text-center animate-slide-down">
                    {slTpError}
                  </div>
                )}
              </div>

              <div className="bg-background/30 px-6 py-4 border-t border-transparent flex justify-end gap-3">
                <Button
                  type="button"
                  onClick={() => setSelectedPositionForSlTp(null)}
                  className="font-mono text-xs px-4 py-2 border border-transparent bg-transparent text-muted hover:text-foreground rounded"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveSlTp}
                  className="font-mono text-xs px-4 py-2 bg-primary hover:bg-primary-active text-black font-bold rounded shadow-elevation-sm"
                  loading={isUpdatingSlTp}
                >
                  Confirm Targets
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}

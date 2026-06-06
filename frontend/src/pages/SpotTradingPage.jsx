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
  hasAuthToken,
  fetchAllPrices
} from "../api";
import { Card, CardContent, CardFooter } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Button } from "../components/ui/Button";
import { PageTransition } from "../components/ui/PageTransition";
import { TradingChartPanel } from "../components/ui/TradingChartPanel";
import { OrderBook } from "../components/ui/OrderBook";
import { useWebSocket } from "../hooks/useWebSocket";
import { formatCurrency } from "../lib/utils";
import { Trash2, Lock } from "lucide-react";

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

  // Update URL search parameters when form.symbol changes (replace, don't spam history)
  useEffect(() => {
    if (form.symbol && searchParams.get("symbol") !== form.symbol) {
      setSearchParams({ symbol: form.symbol }, { replace: true });
    }
  }, [form.symbol]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [currentPrice, setCurrentPrice] = useState(null);
  const [priceSnapshot, setPriceSnapshot] = useState(null);
  const [candleData, setCandleData] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [chartInterval, setChartInterval] = useState("1h");

  // Bottom tabs & User account states
  const [activeBottomTab, setActiveBottomTab] = useState("POSITIONS"); // POSITIONS, ORDERS, HISTORY, ASSETS
  const [activeOrders, setActiveOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orderHistory, setOrderHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [spotWalletBalance, setSpotWalletBalance] = useState(0.00);
  const [loadingWallets, setLoadingWallets] = useState(true);
  const [pricesMap, setPricesMap] = useState({});

  const handlePriceUpdate = (data) => {
    if (data) {
      setPricesMap((prev) => {
        const next = { ...prev };
        if (Array.isArray(data)) {
          data.forEach((p) => {
            if (p?.symbol) next[p.symbol.toUpperCase()] = Number(p.currentPrice);
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
      update = data.find((p) => p?.symbol?.toUpperCase() === currentSymbol);
    } else if (data && data?.symbol?.toUpperCase() === currentSymbol) {
      update = data;
    }

    if (update) {
      const newPrice = Number(update.currentPrice);
      setCurrentPrice(newPrice);
      setPriceSnapshot(update);

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
          if (p?.symbol) pMap[p.symbol.toUpperCase()] = Number(p.currentPrice);
        });
        setPricesMap(pMap);
      }
    } catch (err) {
      console.warn("Could not retrieve all prices:", err.message);
    }
  };

  const loadActiveOrders = async () => {
    try {
      const res = await fetchActiveOrders();
      const filtered = (res?.data || []).filter(o => o.tradeType === "SPOT");
      filtered.sort((a, b) => b.id - a.id);
      setActiveOrders(filtered);
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

  const loadAllUserData = () => {
    loadActiveOrders();
    loadOrderHistory();
    loadWallet();
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
        const data = await fetchCandlestickData(form.symbol, chartInterval, 120);
        setCandleData(data);
      } catch {
        setCandleData([]);
      } finally {
        setChartLoading(false);
      }
    };
    loadCandles();
  }, [form.symbol, chartInterval]);

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
      const isLimitPriceType = ["LIMIT", "STOP_LIMIT", "TAKE_PROFIT_LIMIT"].includes(form.orderType);
      const isTriggerPriceType = ["STOP_LIMIT", "STOP_MARKET", "TAKE_PROFIT_LIMIT", "TAKE_PROFIT_MARKET"].includes(form.orderType);
      const payload = {
        symbol: form.symbol,
        side: form.side,
        orderType: form.orderType,
        quantity: parseFloat(form.quantity),
        price: isLimitPriceType ? parseFloat(form.price) : null,
        stopPrice: isTriggerPriceType ? parseFloat(form.stopPrice) : null,
      };
      const res = await createSpotOrder(payload);
      setMessage(res?.message || "Spot order created successfully");
      loadAllUserData();
    } catch (err) {
      setError(err.message || "Failed to create order");
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

  // Calculate spot positions dynamically from order history
  const spotPositions = useMemo(() => {
    const allOrdersMap = new Map();
    activeOrders.forEach(o => {
      if (o.tradeType === "SPOT") {
        allOrdersMap.set(o.id, o);
      }
    });
    orderHistory.forEach(o => {
      if (o.tradeType === "SPOT") {
        allOrdersMap.set(o.id, o);
      }
    });

    const uniqueOrders = Array.from(allOrdersMap.values());
    uniqueOrders.sort((a, b) => a.id - b.id);

    const posMap = {};

    uniqueOrders.forEach((o) => {
      const filledQty = Number(o.filledQuantity || 0);
      const avgPrice = Number(o.averagePrice || o.price || 0);
      if (filledQty <= 0) return;

      const symbol = o.symbol.toUpperCase();
      if (!posMap[symbol]) {
        posMap[symbol] = {
          symbol,
          quantity: 0,
          averageEntryPrice: 0,
          totalCost: 0,
        };
      }

      const pos = posMap[symbol];
      if (o.side === "BUY") {
        const newQty = pos.quantity + filledQty;
        const newCost = pos.totalCost + (filledQty * avgPrice);
        pos.averageEntryPrice = newQty > 0 ? newCost / newQty : 0;
        pos.quantity = newQty;
        pos.totalCost = newCost;
      } else if (o.side === "SELL") {
        const newQty = Math.max(0, pos.quantity - filledQty);
        pos.quantity = newQty;
        pos.totalCost = newQty * pos.averageEntryPrice;
      }
    });

    return Object.values(posMap).filter(pos => pos.quantity > 0.00001);
  }, [activeOrders, orderHistory]);

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

  const changePositive = Number(priceSnapshot?.percentChange24h) >= 0;

  // ── Order entry form (shared between top-row column) ───────────────────────
  const orderEntry = (
    <Card className="border border-hairline-on-dark bg-surface-card-dark rounded-xl overflow-hidden shadow-elevation-md relative">
      {!hasAuthToken() && (
        <div className="absolute inset-0 bg-[#0a0a0f]/85 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4">
            <Lock size={20} className="text-primary" />
          </div>
          <h3 className="font-heading text-sm font-bold text-white mb-2 uppercase tracking-wide">Login Required</h3>
          <p className="text-xs text-muted leading-relaxed mb-6 max-w-[200px]">
            Access your simulated wallet and start trading by connecting your account.
          </p>
          <Button variant="default" className="w-full text-xs font-semibold py-2.5 rounded-lg shadow-glow-primary" asChild>
            <Link to="/auth">Sign In / Connect Wallet</Link>
          </Button>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        {/* BUY / SELL Switch Tabs */}
        <div className="flex border-b border-hairline-on-dark p-1 bg-canvas-dark/40 gap-1">
          <button
            type="button"
            className={`flex-1 py-3 text-center text-xs font-bold tracking-wider rounded transition-all ${
              form.side === "BUY"
                ? "bg-trading-up text-white shadow-sm"
                : "text-muted hover:text-white"
            }`}
            onClick={() => setForm((prev) => ({ ...prev, side: "BUY" }))}
          >
            BUY
          </button>
          <button
            type="button"
            className={`flex-1 py-3 text-center text-xs font-bold tracking-wider rounded transition-all ${
              form.side === "SELL"
                ? "bg-trading-down text-white shadow-sm"
                : "text-muted hover:text-white"
            }`}
            onClick={() => setForm((prev) => ({ ...prev, side: "SELL" }))}
          >
            SELL
          </button>
        </div>

        <CardContent className="space-y-4 pt-4">
          <div>
            <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-1.5 block">
              Symbol
            </label>
            <Select
              name="symbol"
              value={form.symbol}
              onChange={handleChange}
              className="bg-canvas-dark border-hairline-on-dark font-mono text-sm text-white w-full rounded-md"
            >
              <option value="BTCUSDT">BTC/USDT</option>
              <option value="ETHUSDT">ETH/USDT</option>
              <option value="BNBUSDT">BNB/USDT</option>
              <option value="SOLUSDT">SOL/USDT</option>
              <option value="DOTUSDT">DOT/USDT</option>
            </Select>
          </div>

          <div>
            <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-1.5 block">
              Order Type
            </label>
            <Select
              name="orderType"
              value={form.orderType}
              onChange={handleChange}
              className="bg-canvas-dark border-hairline-on-dark font-mono text-sm text-white w-full rounded-md"
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
            <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-1.5 block">
              Quantity
            </label>
            <Input
              type="number"
              step="0.0001"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              required
              className="bg-canvas-dark border-hairline-on-dark font-mono text-sm text-white w-full rounded-md"
            />
          </div>

          {/* Sizing Percentage dot-slider chips */}
          <div className="flex gap-2">
            {[25, 50, 75, 100].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => handlePercentSelect(pct)}
                className="flex-1 py-1.5 bg-canvas-dark hover:bg-white/[0.04] border border-hairline-on-dark text-muted hover:text-white rounded font-mono text-[9px] font-bold transition-colors"
              >
                {pct}%
              </button>
            ))}
          </div>

          {["STOP_LIMIT", "STOP_MARKET", "TAKE_PROFIT_LIMIT", "TAKE_PROFIT_MARKET"].includes(form.orderType) && (
            <div className="animate-slide-down">
              <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-1.5 block">
                Trigger Price
              </label>
              <Input
                type="number"
                step="0.01"
                name="stopPrice"
                value={form.stopPrice}
                onChange={handleChange}
                required
                className="bg-canvas-dark border-hairline-on-dark font-mono text-sm text-white w-full rounded-md"
              />
            </div>
          )}

          {["LIMIT", "STOP_LIMIT", "TAKE_PROFIT_LIMIT"].includes(form.orderType) && (
            <div className="animate-slide-down">
              <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-1.5 block">
                Limit Price
              </label>
              <Input
                type="number"
                step="0.01"
                name="price"
                value={form.price}
                onChange={handleChange}
                required
                className="bg-canvas-dark border-hairline-on-dark font-mono text-sm text-white w-full rounded-md"
              />
            </div>
          )}

          {/* High/Low/Notional Summary */}
          {(currentPrice || priceSnapshot?.currentPrice) && (
            <div className="border border-hairline-on-dark bg-canvas-dark/40 rounded-lg p-3 space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-muted">Available Balance</span>
                <span className="text-white font-semibold">{formatCurrency(spotWalletBalance)} USDT</span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-muted">Current Price</span>
                <span className="text-white font-semibold">{formatCurrency(currentPrice || priceSnapshot.currentPrice)}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono border-t border-hairline-on-dark pt-2">
                <span className="text-muted">Est. Notional</span>
                <span className="text-white font-semibold font-mono">{formatCurrency(estimatedNotional)}</span>
              </div>
            </div>
          )}

          {message && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-trading-up/10 border border-trading-up/20 animate-slide-down">
              <p className="text-trading-up text-xs font-mono">{message}</p>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-trading-down/10 border border-trading-down/20 animate-slide-down">
              <p className="text-trading-down text-xs font-mono">{error}</p>
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-2 pb-4">
          <Button
            type="submit"
            className="w-full font-mono text-sm uppercase py-3 font-bold rounded-md"
            variant={form.side === "BUY" ? "tradingUp" : "tradingDown"}
            loading={loading}
          >
            {form.side === "BUY" ? "BUY" : "SELL"} {form.symbol}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );

  // ── Full-width positions / orders / history / assets panel ─────────────────
  const bottomPanel = (
    <Card className="bg-surface-card-dark border border-hairline-on-dark rounded-xl overflow-hidden shadow-elevation-md">
      <div className="bg-canvas-dark/30 border-b border-hairline-on-dark px-4 flex items-center justify-between">
        <div className="flex gap-4 font-heading text-[10px] font-bold uppercase tracking-wider py-3 select-none">
          {[
            { id: "POSITIONS", label: "Positions" },
            { id: "ORDERS", label: "Open Orders" },
            { id: "HISTORY", label: "Order History" },
            { id: "ASSETS", label: "Assets" }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveBottomTab(tab.id)}
              className={`pb-1.5 relative transition-colors ${
                activeBottomTab === tab.id ? "text-primary font-bold" : "text-muted hover:text-white"
              }`}
            >
              {tab.label}{" "}
              {tab.id === "POSITIONS"
                ? `(${spotPositions.length})`
                : tab.id === "ORDERS"
                ? `(${activeOrders.filter(o => o.status === "OPEN" || o.status === "PARTIALLY_FILLED").length})`
                : ""}
              {activeBottomTab === tab.id && (
                <span className="absolute bottom-[-13px] left-0 right-0 h-[2px] bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>
        {activeBottomTab === "ORDERS" && activeOrders.some(o => o.status === "OPEN" || o.status === "PARTIALLY_FILLED") && (
          <button
            type="button"
            onClick={handleCancelAllOrders}
            className="px-2.5 py-1 bg-trading-down/10 hover:bg-trading-down/20 text-trading-down border border-trading-down/20 rounded text-[10px] font-bold transition-all flex items-center gap-1"
          >
            <Trash2 size={12} />
            Cancel All
          </button>
        )}
      </div>

      <CardContent className="p-0 min-h-[160px]">
        {activeBottomTab === "POSITIONS" && (
          spotPositions.length === 0 ? (
            <div className="py-12 text-center text-muted font-mono text-xs">
              No active spot positions. Buy assets to open a position.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-hairline-on-dark text-[10px] font-bold text-muted uppercase tracking-wider font-mono bg-canvas-dark/10">
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
                    const livePrice = pricesMap[pos.symbol.toUpperCase()] || Number(pos.averageEntryPrice);
                    const entryPrice = Number(pos.averageEntryPrice);
                    const qty = Number(pos.quantity);

                    const marketValue = qty * livePrice;
                    const pnlValue = (livePrice - entryPrice) * qty;
                    const pnlPercent = entryPrice > 0 ? (pnlValue / (entryPrice * qty)) * 100 : 0;

                    const isProfit = pnlValue >= 0;
                    const baseAsset = pos.symbol.replace("USDT", "").toUpperCase();

                    return (
                      <tr key={pos.symbol} className="hover:bg-canvas-dark/25 transition-colors">
                        <td className="py-3 px-5 font-bold text-white uppercase">{pos.symbol}</td>
                        <td className="py-3 px-5 text-right font-semibold text-white">
                          {qty.toFixed(4)} <span className="text-[10px] text-muted">{baseAsset}</span>
                        </td>
                        <td className="py-3 px-5 text-right text-muted">{formatCurrency(entryPrice)}</td>
                        <td className="py-3 px-5 text-right text-white font-semibold">{formatCurrency(livePrice)}</td>
                        <td className="py-3 px-5 text-right text-white font-semibold">{formatCurrency(marketValue)}</td>
                        <td className={`py-3 px-5 text-right font-bold text-sm ${isProfit ? "text-trading-up" : "text-trading-down"}`}>
                          {isProfit ? "+" : ""}{formatCurrency(pnlValue)} ({isProfit ? "+" : ""}{pnlPercent.toFixed(2)}%)
                        </td>
                        <td className="py-3 px-5 text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCloseSpotPosition(pos)}
                            className="text-[10px] h-7 px-2 border-trading-down hover:bg-trading-down text-trading-down hover:text-white transition-all font-bold"
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
              <div className="h-6 bg-white/[0.02] rounded animate-pulse w-full" />
            </div>
          ) : activeOrders.filter(o => o.status === "OPEN" || o.status === "PARTIALLY_FILLED").length === 0 ? (
            <div className="py-12 text-center text-muted font-mono text-xs">
              No open orders.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono text-xs">
                <thead>
                  <tr className="border-b border-hairline-on-dark text-[9px] font-bold text-muted uppercase tracking-wider bg-canvas-dark/20 py-2.5">
                    <th className="py-2.5 px-4">Symbol</th>
                    <th className="py-2.5 px-4">Side</th>
                    <th className="py-2.5 px-4">Type</th>
                    <th className="py-2.5 px-4 text-right">Quantity</th>
                    <th className="py-2.5 px-4 text-right">Price</th>
                    <th className="py-2.5 px-4 text-center">Action / Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline-on-dark">
                  {activeOrders.filter(o => o.status === "OPEN" || o.status === "PARTIALLY_FILLED").map((o) => (
                    <tr key={o.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="py-3 px-4 font-bold text-white uppercase">{o.symbol}</td>
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
                        <button
                          type="button"
                          onClick={() => handleCancelOrder(o.id)}
                          className="px-2.5 py-1 bg-trading-down/10 hover:bg-trading-down/20 text-trading-down border border-trading-down/20 rounded text-[10px] font-bold transition-all"
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

        {activeBottomTab === "HISTORY" && (
          loadingHistory ? (
            <div className="p-6 space-y-2">
              <div className="h-6 bg-white/[0.02] rounded animate-pulse w-full" />
            </div>
          ) : orderHistory.length === 0 ? (
            <div className="py-12 text-center text-muted font-mono text-xs">
              No order logs found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono text-xs">
                <thead>
                  <tr className="border-b border-hairline-on-dark text-[9px] font-bold text-muted uppercase tracking-wider bg-canvas-dark/20 py-2.5">
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
                    <tr key={o.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="py-3 px-4 font-bold text-white">{o.symbol}</td>
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
                          o.status === "FILLED" ? "bg-trading-up/10 text-trading-up" : o.status === "CANCELED" ? "bg-white/10 text-muted" : "bg-primary/15 text-primary"
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
              <div className="h-6 bg-white/[0.02] rounded animate-pulse w-full" />
            </div>
          ) : (
            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              <div className="border border-hairline-on-dark rounded-lg p-3 bg-canvas-dark/20">
                <span className="text-muted text-[10px] uppercase block">Total Spot USDT Equity</span>
                <span className="text-lg font-bold text-white block mt-1">{formatCurrency(spotWalletBalance)}</span>
              </div>
              <div className="border border-hairline-on-dark rounded-lg p-3 bg-canvas-dark/20">
                <span className="text-muted text-[10px] uppercase block">Asset Sizing Base</span>
                <span className="text-sm font-bold text-primary block mt-1">USDT (Tether)</span>
              </div>
              <div className="border border-hairline-on-dark rounded-lg p-3 bg-canvas-dark/20 flex items-center justify-between">
                <div>
                  <span className="text-muted text-[10px] uppercase block">Wallet Connection</span>
                  <span className="text-[10px] text-trading-up font-bold block mt-1">● ONLINE (Simulated)</span>
                </div>
              </div>
            </div>
          )
        )}
      </CardContent>
    </Card>
  );

  return (
    <PageTransition>
      <div className="w-full bg-canvas-dark text-white py-4 font-sans select-none min-h-screen">
        <div className="max-w-[1600px] mx-auto px-4 space-y-4">

          {/* HIGH-DENSITY HORIZONTAL TICKER BAR */}
          <div className="bg-surface-card-dark border border-hairline-on-dark rounded-xl px-5 py-3.5 flex flex-wrap items-center justify-between gap-6 shadow-elevation-md">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-base font-extrabold tracking-tight font-heading flex items-center gap-1.5 text-white">
                  {form.symbol.toUpperCase()}
                  <span className="text-[9px] font-mono font-bold bg-primary/15 text-primary px-1 rounded uppercase tracking-wider">Spot</span>
                </h1>
                <span className="text-[10px] font-mono font-semibold text-muted">NexTradeX Exchange</span>
              </div>

              {(currentPrice || priceSnapshot?.currentPrice) && (
                <div className="border-l border-hairline-on-dark pl-4 flex flex-col justify-center">
                  <span className="text-[10px] text-muted font-mono font-bold uppercase tracking-wider block">Price</span>
                  <span className={`text-base font-extrabold font-mono ${changePositive ? "text-trading-up" : "text-trading-down"}`}>
                    {formatCurrency(currentPrice || priceSnapshot.currentPrice)}
                  </span>
                </div>
              )}
            </div>

            {priceSnapshot && (
              <div className="flex flex-wrap items-center gap-8 font-mono text-muted">
                <div className="min-w-[80px]">
                  <span className="block uppercase text-[9px] tracking-wider">24h Change</span>
                  <span className={`text-sm font-bold ${changePositive ? "text-trading-up" : "text-trading-down"}`}>
                    {changePositive ? "+" : ""}{Number(priceSnapshot.percentChange24h).toFixed(2)}%
                  </span>
                </div>

                <div className="min-w-[100px]">
                  <span className="block uppercase text-[9px] tracking-wider">24h High</span>
                  <span className="text-sm font-bold text-white">{formatCurrency(priceSnapshot.highPrice || currentPrice)}</span>
                </div>

                <div className="min-w-[100px]">
                  <span className="block uppercase text-[9px] tracking-wider">24h Low</span>
                  <span className="text-sm font-bold text-white">{formatCurrency(priceSnapshot.lowPrice || currentPrice)}</span>
                </div>

                <div className="min-w-[160px]">
                  <span className="block uppercase text-[9px] tracking-wider">24h Volume</span>
                  <span className="text-sm font-bold text-white">
                    {priceSnapshot.volume24h
                      ? `${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(priceSnapshot.volume24h)} ${form.symbol.replace("USDT", "").toUpperCase()}`
                      : `148,250.00 ${form.symbol.replace("USDT", "").toUpperCase()}`}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* TOP ROW — Chart + Order Book + Order Entry (Binance terminal layout) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            <div className="lg:col-span-6">
              <TradingChartPanel
                title="Spot Workspace"
                description="Execute clean spot orders with backend candles, live pricing, and a calmer SaaS-grade order entry flow."
                symbol={form.symbol}
                interval={chartInterval}
                onIntervalChange={setChartInterval}
                loading={chartLoading}
                data={candleData}
                status={{ label: connected ? "Live market" : "Snapshot", tone: connected ? "active" : "neutral" }}
                stats={chartStats}
              />
            </div>

            {/* Order Book Panel */}
            <div className="lg:col-span-3">
              <OrderBook
                symbol={form.symbol}
                currentPrice={currentPrice}
                onSelectPrice={(p) => setForm((prev) => ({ ...prev, price: p.toFixed(2), orderType: "LIMIT" }))}
              />
            </div>

            {/* Order Entry Panel */}
            <div className="lg:col-span-3">
              {orderEntry}
            </div>
          </div>

          {/* FULL-WIDTH POSITIONS / ORDERS / HISTORY / ASSETS */}
          {bottomPanel}
        </div>
      </div>
    </PageTransition>
  );
}

import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  buyOption,
  settleOption,
  fetchOptionsPositions,
  fetchOptionsHistory,
  fetchPrice,
  fetchCandlestickData,
  fetchAllPrices,
  fetchWallets,
  hasAuthToken,
} from "../api";
import { Card, CardContent, CardFooter } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Button } from "../components/ui/Button";
import { PageTransition } from "../components/ui/PageTransition";
import { TradingChartPanel } from "../components/ui/TradingChartPanel";
import { useWebSocket } from "../hooks/useWebSocket";
import { formatCurrency } from "../lib/utils";
import { Lock } from "lucide-react";

const initialForm = {
  symbol: "BTCUSDT",
  optionType: "CALL",
  strikePrice: "",
  premium: "",
  quantity: "1",
  expiry: "1D",
};

const OptionsTradingPage = () => {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [currentPrice, setCurrentPrice] = useState(null);
  const [priceSnapshot, setPriceSnapshot] = useState(null);
  const [candleData, setCandleData] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [chartInterval, setChartInterval] = useState("1h");

  const [activeBottomTab, setActiveBottomTab] = useState("POSITIONS"); // POSITIONS, HISTORY
  const [positions, setPositions] = useState([]);
  const [loadingPositions, setLoadingPositions] = useState(true);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [optionsWalletBalance, setOptionsWalletBalance] = useState(0.0);
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

  const loadPositions = async () => {
    try {
      const res = await fetchOptionsPositions();
      const list = res?.data || [];
      list.sort((a, b) => b.id - a.id);
      setPositions(list);
    } catch (err) {
      console.warn("Could not retrieve options positions:", err.message);
    } finally {
      setLoadingPositions(false);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await fetchOptionsHistory();
      const list = res?.data || [];
      list.sort((a, b) => b.id - a.id);
      setHistory(list);
    } catch (err) {
      console.warn("Could not retrieve options history:", err.message);
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadWallet = async () => {
    try {
      const res = await fetchWallets();
      const optionsWallet = res?.data?.find((w) => w.walletType === "OPTIONS") || res?.data?.find((w) => w.walletType === "SPOT");
      if (optionsWallet) {
        setOptionsWalletBalance(Number(optionsWallet.balance || 0));
      }
    } catch (err) {
      console.warn("Could not retrieve options wallet balance:", err.message);
    } finally {
      setLoadingWallets(false);
    }
  };

  const loadAllUserData = () => {
    loadPositions();
    loadHistory();
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
      const payload = {
        symbol: form.symbol,
        optionType: form.optionType,
        strikePrice: parseFloat(form.strikePrice),
        premium: parseFloat(form.premium),
        quantity: parseFloat(form.quantity),
        expiry: form.expiry,
      };
      const res = await buyOption(payload);
      setMessage(res?.message || "Option contract opened successfully");
      loadAllUserData();
    } catch (err) {
      setError(err.message || "Failed to buy option");
    } finally {
      setLoading(false);
    }
  };

  const handleSettleOption = async (contractId) => {
    setError("");
    setMessage("");
    try {
      const res = await settleOption(contractId);
      setMessage(res?.message || "Option settled successfully");
      loadAllUserData();
    } catch (err) {
      setError(err.message || "Failed to settle option");
    }
  };

  // Auto-fill strike with the live price when empty
  const handleUseMarketStrike = () => {
    const price = currentPrice || priceSnapshot?.currentPrice;
    if (price) {
      setForm((prev) => ({ ...prev, strikePrice: Number(price).toFixed(2) }));
    }
  };

  const estimatedCost = useMemo(() => {
    const quantity = Number(form.quantity || 0);
    const premium = Number(form.premium || 0);
    return quantity * premium;
  }, [form.quantity, form.premium]);

  const changePositive = Number(priceSnapshot?.percentChange24h) >= 0;

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
      label: "Strike price",
      value: Number(form.strikePrice || 0),
      kind: "currency",
      icon: "volume",
      hint: `${form.optionType} option`,
    },
    {
      label: "Premium cost",
      value: estimatedCost,
      kind: "currency",
      icon: "momentum",
      hint: `${form.quantity || 0} contracts @ ${formatCurrency(Number(form.premium || 0))}`,
    },
  ];

  // ── Option entry form ──────────────────────────────────────────────────────
  const orderEntry = (
    <Card className="border border-hairline-on-dark bg-surface-card-dark rounded-xl overflow-hidden shadow-elevation-md relative">
      {!hasAuthToken() && (
        <div className="absolute inset-0 bg-[#0a0a0f]/85 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4">
            <Lock size={20} className="text-primary" />
          </div>
          <h3 className="font-heading text-sm font-bold text-white mb-2 uppercase tracking-wide">Login Required</h3>
          <p className="text-xs text-muted leading-relaxed mb-6 max-w-[200px]">
            Access your simulated wallet and start trading options by connecting your account.
          </p>
          <Button variant="default" className="w-full text-xs font-semibold py-2.5 rounded-lg shadow-glow-primary" asChild>
            <Link to="/auth">Sign In / Connect Wallet</Link>
          </Button>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        {/* CALL / PUT Switch Tabs */}
        <div className="flex border-b border-hairline-on-dark p-1 bg-canvas-dark/40 gap-1">
          <button
            type="button"
            className={`flex-1 py-3 text-center text-xs font-bold tracking-wider rounded transition-all ${
              form.optionType === "CALL"
                ? "bg-trading-up text-white shadow-sm"
                : "text-muted hover:text-white"
            }`}
            onClick={() => setForm((prev) => ({ ...prev, optionType: "CALL" }))}
          >
            CALL
          </button>
          <button
            type="button"
            className={`flex-1 py-3 text-center text-xs font-bold tracking-wider rounded transition-all ${
              form.optionType === "PUT"
                ? "bg-trading-down text-white shadow-sm"
                : "text-muted hover:text-white"
            }`}
            onClick={() => setForm((prev) => ({ ...prev, optionType: "PUT" }))}
          >
            PUT
          </button>
        </div>

        <CardContent className="space-y-4 pt-4">
          <div>
            <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-1.5 block">
              Underlying
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
              Expiry
            </label>
            <Select
              name="expiry"
              value={form.expiry}
              onChange={handleChange}
              className="bg-canvas-dark border-hairline-on-dark font-mono text-sm text-white w-full rounded-md"
            >
              <option value="1H">1 Hour</option>
              <option value="4H">4 Hours</option>
              <option value="1D">1 Day</option>
              <option value="7D">7 Days</option>
              <option value="30D">30 Days</option>
            </Select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-mono text-[10px] text-muted uppercase tracking-widest block">
                Strike Price
              </label>
              <button
                type="button"
                onClick={handleUseMarketStrike}
                className="font-mono text-[9px] font-bold text-primary hover:text-white transition-colors uppercase"
              >
                Use market
              </button>
            </div>
            <Input
              type="number"
              step="0.01"
              name="strikePrice"
              value={form.strikePrice}
              onChange={handleChange}
              required
              placeholder="0.00"
              className="bg-canvas-dark border-hairline-on-dark font-mono text-sm text-white w-full rounded-md"
            />
          </div>

          <div>
            <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-1.5 block">
              Premium
            </label>
            <Input
              type="number"
              step="0.01"
              name="premium"
              value={form.premium}
              onChange={handleChange}
              required
              placeholder="0.00"
              className="bg-canvas-dark border-hairline-on-dark font-mono text-sm text-white w-full rounded-md"
            />
          </div>

          <div>
            <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-1.5 block">
              Quantity (Contracts)
            </label>
            <Input
              type="number"
              step="1"
              min="1"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              required
              className="bg-canvas-dark border-hairline-on-dark font-mono text-sm text-white w-full rounded-md"
            />
          </div>

          {/* Cost summary */}
          <div className="border border-hairline-on-dark bg-canvas-dark/40 rounded-lg p-3 space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-muted">Available Balance</span>
              <span className="text-white font-semibold">{formatCurrency(optionsWalletBalance)} USDT</span>
            </div>
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-muted">Current Price</span>
              <span className="text-white font-semibold">
                {formatCurrency(currentPrice || priceSnapshot?.currentPrice || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs font-mono border-t border-hairline-on-dark pt-2">
              <span className="text-muted">Est. Total Premium</span>
              <span className="text-white font-semibold font-mono">{formatCurrency(estimatedCost)}</span>
            </div>
          </div>

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
            variant={form.optionType === "CALL" ? "tradingUp" : "tradingDown"}
            loading={loading}
          >
            BUY {form.optionType} {form.symbol}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );

  // ── Full-width positions / history panel ───────────────────────────────────
  const openPositions = positions.filter((p) => (p.status || "").toUpperCase() === "OPEN" || !p.status);

  const bottomPanel = (
    <Card className="bg-surface-card-dark border border-hairline-on-dark rounded-xl overflow-hidden shadow-elevation-md">
      <div className="bg-canvas-dark/30 border-b border-hairline-on-dark px-4 flex items-center justify-between">
        <div className="flex gap-4 font-heading text-[10px] font-bold uppercase tracking-wider py-3 select-none">
          {[
            { id: "POSITIONS", label: "Positions" },
            { id: "HISTORY", label: "Contract History" },
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
              {tab.id === "POSITIONS" ? `(${openPositions.length})` : ""}
              {activeBottomTab === tab.id && (
                <span className="absolute bottom-[-13px] left-0 right-0 h-[2px] bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      <CardContent className="p-0 min-h-[160px]">
        {activeBottomTab === "POSITIONS" &&
          (loadingPositions ? (
            <div className="p-6 space-y-2">
              <div className="h-6 bg-white/[0.02] rounded animate-pulse w-full" />
            </div>
          ) : openPositions.length === 0 ? (
            <div className="py-12 text-center text-muted font-mono text-xs">
              No open option contracts. Buy a CALL or PUT to open a position.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-hairline-on-dark text-[10px] font-bold text-muted uppercase tracking-wider font-mono bg-canvas-dark/10">
                    <th className="py-3 px-5">Symbol</th>
                    <th className="py-3 px-5">Type</th>
                    <th className="py-3 px-5 text-right">Strike</th>
                    <th className="py-3 px-5 text-right">Mark Price</th>
                    <th className="py-3 px-5 text-right">Qty</th>
                    <th className="py-3 px-5 text-right">Premium Paid</th>
                    <th className="py-3 px-5 text-right">Unrealized PnL</th>
                    <th className="py-3 px-5">Expiry</th>
                    <th className="py-3 px-5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline-on-dark font-mono text-xs">
                  {openPositions.map((pos) => {
                    const livePrice = pricesMap[(pos.symbol || "").toUpperCase()] || Number(pos.currentPrice || 0);
                    const strike = Number(pos.strikePrice || 0);
                    const qty = Number(pos.quantity || 0);
                    const premium = Number(pos.premium || 0);
                    const totalPremium = premium * qty;
                    const isCall = (pos.optionType || "").toUpperCase() === "CALL";

                    const intrinsic = isCall
                      ? Math.max(0, livePrice - strike)
                      : Math.max(0, strike - livePrice);
                    const pnlValue = intrinsic * qty - totalPremium;
                    const isProfit = pnlValue >= 0;

                    return (
                      <tr key={pos.id} className="hover:bg-canvas-dark/25 transition-colors">
                        <td className="py-3 px-5 font-bold text-white uppercase">{pos.symbol}</td>
                        <td className="py-3 px-5">
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              isCall ? "bg-trading-up/10 text-trading-up" : "bg-trading-down/10 text-trading-down"
                            }`}
                          >
                            {pos.optionType}
                          </span>
                        </td>
                        <td className="py-3 px-5 text-right text-muted">{formatCurrency(strike)}</td>
                        <td className="py-3 px-5 text-right text-white font-semibold">{formatCurrency(livePrice)}</td>
                        <td className="py-3 px-5 text-right text-white">{qty}</td>
                        <td className="py-3 px-5 text-right text-muted">{formatCurrency(totalPremium)}</td>
                        <td
                          className={`py-3 px-5 text-right font-bold text-sm ${
                            isProfit ? "text-trading-up" : "text-trading-down"
                          }`}
                        >
                          {isProfit ? "+" : ""}
                          {formatCurrency(pnlValue)}
                        </td>
                        <td className="py-3 px-5 text-muted">{pos.expiry || "--"}</td>
                        <td className="py-3 px-5 text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSettleOption(pos.id)}
                            className="text-[10px] h-7 px-2 border-primary hover:bg-primary text-primary hover:text-on-primary transition-all font-bold"
                          >
                            SETTLE
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}

        {activeBottomTab === "HISTORY" &&
          (loadingHistory ? (
            <div className="p-6 space-y-2">
              <div className="h-6 bg-white/[0.02] rounded animate-pulse w-full" />
            </div>
          ) : history.length === 0 ? (
            <div className="py-12 text-center text-muted font-mono text-xs">No settled contracts found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono text-xs">
                <thead>
                  <tr className="border-b border-hairline-on-dark text-[9px] font-bold text-muted uppercase tracking-wider bg-canvas-dark/20">
                    <th className="py-2.5 px-4">Symbol</th>
                    <th className="py-2.5 px-4">Type</th>
                    <th className="py-2.5 px-4 text-right">Strike</th>
                    <th className="py-2.5 px-4 text-right">Qty</th>
                    <th className="py-2.5 px-4 text-right">Premium</th>
                    <th className="py-2.5 px-4 text-right">Realized PnL</th>
                    <th className="py-2.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline-on-dark">
                  {history.map((o) => {
                    const isCall = (o.optionType || "").toUpperCase() === "CALL";
                    const pnl = Number(o.profitLoss ?? o.pnl ?? 0);
                    const isProfit = pnl >= 0;
                    return (
                      <tr key={o.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="py-3 px-4 font-bold text-white uppercase">{o.symbol}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              isCall ? "bg-trading-up/10 text-trading-up" : "bg-trading-down/10 text-trading-down"
                            }`}
                          >
                            {o.optionType}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-muted">{formatCurrency(o.strikePrice)}</td>
                        <td className="py-3 px-4 text-right text-white">{o.quantity}</td>
                        <td className="py-3 px-4 text-right text-muted">{formatCurrency(o.premium)}</td>
                        <td
                          className={`py-3 px-4 text-right font-bold ${
                            isProfit ? "text-trading-up" : "text-trading-down"
                          }`}
                        >
                          {isProfit ? "+" : ""}
                          {formatCurrency(pnl)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              (o.status || "").toUpperCase() === "SETTLED"
                                ? "bg-trading-up/10 text-trading-up"
                                : (o.status || "").toUpperCase() === "EXPIRED"
                                ? "bg-white/10 text-muted"
                                : "bg-primary/15 text-primary"
                            }`}
                          >
                            {o.status || "CLOSED"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
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
                  <span className="text-[9px] font-mono font-bold bg-primary/15 text-primary px-1 rounded uppercase tracking-wider">Options</span>
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

                <div className="min-w-[120px]">
                  <span className="block uppercase text-[9px] tracking-wider">Open Contracts</span>
                  <span className="text-sm font-bold text-white">{openPositions.length}</span>
                </div>
              </div>
            )}
          </div>

          {/* TOP ROW — Chart + Option Entry (Binance terminal layout) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            <div className="lg:col-span-8">
              <TradingChartPanel
                title="Options Workspace"
                description="Buy CALL / PUT contracts against live backend candles with real-time underlying pricing and a clean options entry flow."
                symbol={form.symbol}
                interval={chartInterval}
                onIntervalChange={setChartInterval}
                loading={chartLoading}
                data={candleData}
                status={{ label: connected ? "Live market" : "Snapshot", tone: connected ? "active" : "neutral" }}
                stats={chartStats}
              />
            </div>

            {/* Option Entry Panel */}
            <div className="lg:col-span-4">
              {orderEntry}
            </div>
          </div>

          {/* FULL-WIDTH POSITIONS / HISTORY */}
          {bottomPanel}
        </div>
      </div>
    </PageTransition>
  );
};

export default OptionsTradingPage;

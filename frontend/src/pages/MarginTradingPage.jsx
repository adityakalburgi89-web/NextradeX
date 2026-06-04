import React, { useEffect, useMemo, useState } from "react";
import { fetchCandlestickData, fetchOpenMarginPositions, fetchPrice, openMarginPosition, closeMarginPosition } from "../api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Button } from "../components/ui/Button";
import { PageTransition } from "../components/ui/PageTransition";
import { SkeletonRow } from "../components/ui/Skeleton";
import { TradingChartPanel } from "../components/ui/TradingChartPanel";
import { OrderBook } from "../components/ui/OrderBook";
import { formatCurrency, formatPercent } from "../lib/utils";

const initialForm = {
  symbol: "BTCUSDT",
  side: "BUY",
  quantity: "0.001",
  leverage: "5",
};

export default function MarginTradingPage() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [positions, setPositions] = useState([]);
  const [loadingPositions, setLoadingPositions] = useState(true);
  const [candleData, setCandleData] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [priceSnapshot, setPriceSnapshot] = useState(null);
  const [interval, setInterval] = useState("1h");

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

  useEffect(() => {
    loadPositions();
  }, []);

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
      await loadPositions();
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
      await loadPositions();
    } catch (err) {
      setError(err.message || "Failed to close position");
    }
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

  const chartStats = [
    {
      label: "Mark price",
      value: priceSnapshot?.currentPrice || 0,
      kind: "currency",
      icon: "price",
      hint: "Live margin index reference",
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
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-hairline-on-dark pb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white font-heading">Margin Trading</h1>
            <p className="text-sm text-muted">Trade with simulated leverage, interest accruals, custom margin offsets, and dynamic liquidation thresholds.</p>
          </div>
          {priceSnapshot && (
            <div className="flex items-center gap-4 bg-surface-card-dark px-4 py-2 rounded-lg border border-hairline-on-dark">
              <div>
                <span className="text-[10px] text-muted uppercase tracking-wider block font-mono">BTC/USDT index</span>
                <span className="text-lg font-bold font-mono text-white">{formatCurrency(priceSnapshot.currentPrice)}</span>
              </div>
              <span className={`text-sm font-mono font-semibold px-2 py-0.5 rounded ${Number(priceSnapshot.percentChange24h) >= 0 ? "text-trading-up bg-trading-up/10" : "text-trading-down bg-trading-down/10"}`}>
                {Number(priceSnapshot.percentChange24h) >= 0 ? "+" : ""}{priceSnapshot.percentChange24h}%
              </span>
            </div>
          )}
        </div>

        {/* Three-Column Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Chart + Positions (6-cols) */}
          <div className="lg:col-span-6 space-y-6">
            <TradingChartPanel
              title="Margin Workspace"
              description="A leveraged Spot-Margin simulator that borrows capital from the pool to amplify trading outcomes."
              symbol={form.symbol}
              interval={interval}
              onIntervalChange={setInterval}
              loading={chartLoading}
              data={candleData}
              status={{ label: "Margin Active", tone: "neutral" }}
              stats={chartStats}
            />

            {/* Positions Table */}
            <Card className="bg-surface-card-dark border border-hairline-on-dark rounded-xl shadow-elevation-md overflow-hidden">
              <CardHeader className="border-b border-hairline-on-dark bg-canvas-dark/20 py-3 px-5 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-white uppercase tracking-wider">Margin Positions</CardTitle>
                  <CardDescription className="text-xs text-muted">Leveraged Spot positions requiring daily borrow interest fee calculations.</CardDescription>
                </div>
                <span className="text-[10px] font-mono font-semibold text-muted bg-canvas-dark px-2.5 py-1 rounded border border-hairline-on-dark">
                  ACTIVE EXPOSURES: {positions.length}
                </span>
              </CardHeader>

              <CardContent className="p-0">
                {loadingPositions ? (
                  <div className="p-6 space-y-3">
                    <div className="h-6 bg-canvas-dark/40 rounded animate-pulse w-full" />
                  </div>
                ) : positions.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-muted text-sm font-mono">No active margin positions. Open a position using the entry card.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-hairline-on-dark text-[10px] font-bold text-muted uppercase tracking-wider font-mono bg-canvas-dark/10">
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
                          const pnlValue = parseFloat(p.unrealizedPnL || "0");
                          const isProfit = pnlValue >= 0;
                          return (
                            <tr key={p.id} className="hover:bg-canvas-dark/25 transition-colors">
                              <td className="py-3 px-5 font-bold text-white">{p.symbol}</td>
                              <td className="py-3 px-5">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.side === "BUY" ? "bg-trading-up/10 text-trading-up" : "bg-trading-down/10 text-trading-down"}`}>
                                  {p.side}
                                </span>
                              </td>
                              <td className="py-3 px-5 text-right font-semibold text-white">{p.quantity}</td>
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
                                  className="text-[10px] h-7 px-2 border-trading-down hover:bg-trading-down text-trading-down hover:text-white"
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
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Book (3-cols) */}
          <div className="lg:col-span-3">
            <OrderBook
              symbol={form.symbol}
              currentPrice={priceSnapshot?.currentPrice}
              onSelectPrice={(p) => setForm((prev) => ({ ...prev, price: p.toFixed(2) }))}
            />
          </div>

          {/* Order Entry Form (3-cols) */}
          <div className="lg:col-span-3">
            <Card className="border border-hairline-on-dark bg-surface-card-dark rounded-xl overflow-hidden shadow-elevation-md">
              <form onSubmit={handleSubmit}>
                <div className="flex border-b border-hairline-on-dark p-1 bg-canvas-dark/40">
                  <button
                    type="button"
                    className={`flex-1 py-3 text-center text-xs font-bold tracking-wider rounded transition-all ${form.side === "BUY"
                      ? "bg-trading-up text-white shadow-sm"
                      : "text-muted hover:text-white"
                      }`}
                    onClick={() => setForm((prev) => ({ ...prev, side: "BUY" }))}
                  >
                    BUY / LONG
                  </button>
                  <button
                    type="button"
                    className={`flex-1 py-3 text-center text-xs font-bold tracking-wider rounded transition-all ${form.side === "SELL"
                      ? "bg-trading-down text-white shadow-sm"
                      : "text-muted hover:text-white"
                      }`}
                    onClick={() => setForm((prev) => ({ ...prev, side: "SELL" }))}
                  >
                    SELL / SHORT
                  </button>
                </div>

                <CardContent className="space-y-4 pt-4">
                  <div>
                    <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-1.5 block">
                      Symbol
                    </label>
                    <Input
                      name="symbol"
                      value={form.symbol}
                      onChange={handleChange}
                      required
                      className="bg-canvas-dark border-hairline-on-dark font-mono text-sm uppercase text-white w-full rounded-md"
                    />
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

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="font-mono text-[10px] text-muted uppercase tracking-widest block">
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
                      className="bg-canvas-dark border-hairline-on-dark font-mono text-sm text-white w-full rounded-md mb-2"
                    />

                    <div className="flex gap-2 justify-between">
                      {["2", "3", "5", "8", "10"].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, leverage: lvl }))}
                          className={`flex-1 py-1 font-mono text-[10px] font-bold rounded border transition-all ${form.leverage === lvl
                            ? "bg-primary border-primary text-on-primary shadow-sm"
                            : "border-hairline-on-dark text-muted hover:text-white hover:border-muted"
                            }`}
                        >
                          {lvl}x
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Calculations summary */}
                  <div className="border border-hairline-on-dark bg-canvas-dark/40 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-muted">Required Collateral</span>
                      <span className="text-primary font-bold">{formatCurrency(marginDetails.collateral)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-muted">Borrowed Amount</span>
                      <span className="text-white font-semibold">{formatCurrency(marginDetails.borrowed)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-mono border-t border-hairline-on-dark pt-2">
                      <span className="text-muted">Daily Interest Rate</span>
                      <span className="text-white font-semibold font-mono">0.05%</span>
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
                    variant={form.side === "BUY" ? "tradingUp" : "tradingDown"}
                    loading={loading}
                  >
                    Open {form.side === "BUY" ? "BUY" : "SELL"} Margin
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

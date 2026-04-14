import React, { useEffect, useMemo, useState } from "react";
import { fetchCandlestickData, fetchOpenFuturesPositions, fetchPrice, openFuturesPosition } from "../api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Button } from "../components/ui/Button";
import { PageTransition } from "../components/ui/PageTransition";
import { SkeletonRow } from "../components/ui/Skeleton";
import { TradingChartPanel } from "../components/ui/TradingChartPanel";
import { formatCurrency } from "../lib/utils";

const initialForm = {
  symbol: "BTCUSDT",
  side: "BUY",
  quantity: "0.001",
  leverage: "10",
};

export default function FuturesTradingPage() {
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
      const res = await openFuturesPosition(payload);
      setMessage(res?.message || "Futures position opened");
      await loadPositions();
    } catch (err) {
      setError(err.message || "Failed to open position");
    } finally {
      setLoading(false);
    }
  };

  const estimatedMargin = useMemo(() => {
    const quantity = Number(form.quantity || 0);
    const leverage = Number(form.leverage || 1);
    const markPrice = Number(priceSnapshot?.currentPrice || 0);
    return leverage > 0 ? (quantity * markPrice) / leverage : 0;
  }, [form.leverage, form.quantity, priceSnapshot?.currentPrice]);

  const chartStats = [
    {
      label: "Mark price",
      value: priceSnapshot?.currentPrice || 0,
      kind: "currency",
      icon: "price",
      hint: "Live futures reference",
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
      hint: `${form.leverage}x leverage`,
    },
    {
      label: "Open positions",
      value: positions.length,
      icon: "momentum",
      hint: "Current exposure count",
    },
  ];

  return (
    <PageTransition>
      <div className="py-12 space-y-8 max-w-5xl mx-auto">
        <TradingChartPanel
          title="Futures Workspace"
          description="A leverage-aware terminal with backend candle history, smoother interaction states, and clearer exposure math."
          symbol={form.symbol}
          interval={interval}
          onIntervalChange={setInterval}
          loading={chartLoading}
          data={candleData}
          status={{ label: "Risk aware", tone: "neutral" }}
          stats={chartStats}
        />

        <Card>
          <CardHeader>
            <CardTitle>Futures Trading</CardTitle>
            <CardDescription>Configure direction, position size, and leverage before opening a simulated futures trade.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-2.5 block">
                    Symbol
                  </label>
                  <Input name="symbol" value={form.symbol} onChange={handleChange} required />
                </div>
                <div>
                  <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-2.5 block">
                    Side
                  </label>
                  <Select name="side" value={form.side} onChange={handleChange}>
                    <option value="BUY">Long</option>
                    <option value="SELL">Short</option>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-2.5 block">
                    Quantity
                  </label>
                  <Input
                    type="number"
                    step="0.0001"
                    name="quantity"
                    value={form.quantity}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-2.5 block">
                    Leverage
                  </label>
                  <Input
                    type="number"
                    step="1"
                    name="leverage"
                    value={form.leverage}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="interactive-surface grid grid-cols-1 gap-3 rounded-[24px] border border-white/[0.06] bg-white/[0.02] px-5 py-4 text-sm text-muted sm:grid-cols-3">
                <div>Mark {formatCurrency(priceSnapshot?.currentPrice || 0)}</div>
                <div>Est. margin {formatCurrency(estimatedMargin)}</div>
                <div>Notional {formatCurrency(Number(form.quantity || 0) * Number(priceSnapshot?.currentPrice || 0))}</div>
              </div>
              {message && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-accent-green/10 border border-accent-green/20 animate-slide-down">
                  <p className="text-accent-green text-sm font-mono">{message}</p>
                </div>
              )}
              {error && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-accent-red/10 border border-accent-red/20 animate-slide-down">
                  <p className="text-accent-red text-sm font-mono">{error}</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full font-mono" loading={loading}>
                Open Futures Position
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Open Positions</CardTitle>
            <CardDescription>List of your current futures positions.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-0.5">
              {loadingPositions ? (
                <>
                  <SkeletonRow /><SkeletonRow /><SkeletonRow />
                </>
              ) : positions.length === 0 ? (
                <p className="text-muted text-sm py-6 text-center">No open positions or not logged in.</p>
              ) : (
                <div className="stagger-children">
                  {positions.map((p) => (
                    <div
                      key={p.id}
                      className="data-row flex-wrap gap-3"
                    >
                      <span className="font-mono text-sm font-medium">{p.symbol}</span>
                      <span className="font-mono text-xs text-muted">
                        {p.positionMode} · {p.quantity} @ {p.entryPrice}
                      </span>
                      <span className="font-mono text-sm text-primary">
                        PnL: {p.unrealizedPnL} · {p.leverage}x
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}

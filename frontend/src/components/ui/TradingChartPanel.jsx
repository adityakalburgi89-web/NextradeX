import React, { useState } from "react";
import { Activity, BarChart3, CandlestickChart as CandlestickChartIcon, Waves, Sliders, Expand, Eye, Layers } from "lucide-react";
import { Card, CardContent } from "./Card";
import CandlestickChart from "./CandlestickChart";
import { cn, formatCompactNumber, formatCurrency, formatPercent } from "../../lib/utils";

export const DEFAULT_INTERVALS = ["15m", "1h", "4h", "1D", "1W"];

export function TradingChartPanel({
  symbol = "BTCUSDT",
  interval = "15m",
  onIntervalChange,
  loading,
  data = [],
  status,
  onQuickTrade
}) {
  const [activeTab, setActiveTab] = useState("CHART"); // CHART | FEED | COIN_INFO
  const [chartViewMode, setChartViewMode] = useState("CANDLE"); // CANDLE | DEPTH

  const currentPrice = data.length > 0 ? data[data.length - 1].close : 63812.7;
  const buyPrice = (currentPrice * 0.9998).toFixed(1);
  const sellPrice = (currentPrice * 1.0002).toFixed(1);

  return (
    <Card className="bg-background border border-transparent rounded-xl overflow-hidden shadow-elevation-md flex flex-col select-none">
      {/* Top Header: Sub-tabs (Chart, Feed, Coin Info) & Chart Tools */}
      <div className="flex flex-wrap items-center justify-between border-b border-transparent px-4 py-2 bg-background/50 gap-2">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setActiveTab("CHART")}
            className={`text-xs font-bold font-heading uppercase py-1 border-b-2 transition-all ${
              activeTab === "CHART" ? "text-foreground border-primary" : "text-muted border-transparent hover:text-foreground"
            }`}
          >
            Chart
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("FEED")}
            className={`text-xs font-bold font-heading uppercase py-1 border-b-2 transition-all ${
              activeTab === "FEED" ? "text-foreground border-primary" : "text-muted border-transparent hover:text-foreground"
            }`}
          >
            Feed
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("COIN_INFO")}
            className={`text-xs font-bold font-heading uppercase py-1 border-b-2 transition-all ${
              activeTab === "COIN_INFO" ? "text-foreground border-primary" : "text-muted border-transparent hover:text-foreground"
            }`}
          >
            Coin Info
          </button>
        </div>

        {activeTab === "CHART" && (
          <div className="flex flex-wrap items-center gap-4 font-mono text-xs">
            {/* Timeframe Selectors */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-muted uppercase font-bold mr-1">Time</span>
              {DEFAULT_INTERVALS.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onIntervalChange?.(value)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                    interval === value
                      ? "bg-primary/15 text-primary"
                      : "text-muted hover:text-foreground hover:bg-background/40"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>

            {/* Indicator Tools & View Mode Switcher */}
            <div className="flex items-center gap-2 border-l border-transparent pl-3">
              <button
                type="button"
                title="Technical Indicators"
                className="p-1 rounded text-muted hover:text-foreground hover:bg-background/40"
              >
                <Sliders size={14} />
              </button>
              <button
                type="button"
                title="Layers"
                className="p-1 rounded text-muted hover:text-foreground hover:bg-background/40"
              >
                <Layers size={14} />
              </button>

              {/* Chart vs Market Depth Toggle */}
              <div className="flex items-center bg-background/50 rounded p-0.5 border border-transparent text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setChartViewMode("CANDLE")}
                  className={`px-2 py-0.5 rounded ${chartViewMode === "CANDLE" ? "bg-background text-foreground shadow-sm" : "text-muted hover:text-foreground"}`}
                >
                  Chart
                </button>
                <button
                  type="button"
                  onClick={() => setChartViewMode("DEPTH")}
                  className={`px-2 py-0.5 rounded ${chartViewMode === "DEPTH" ? "bg-background text-foreground shadow-sm" : "text-muted hover:text-foreground"}`}
                >
                  Market Depth
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Chart Canvas Area */}
      <CardContent className="p-3 relative">
        {activeTab === "CHART" ? (
          <>
            {/* Quick Market Order Buttons Overlay (as seen on KuCoin terminal) */}
            <div className="absolute top-5 left-5 z-20 flex items-center gap-2 font-mono text-xs">
              <button
                type="button"
                onClick={() => onQuickTrade?.("BUY", buyPrice)}
                className="flex items-center gap-2 bg-trading-up hover:bg-trading-up/90 text-white px-3 py-1.5 rounded shadow-elevation-md transition-all active:scale-95 cursor-pointer"
              >
                <span className="text-[10px] font-bold uppercase">Market Buy</span>
                <span className="font-extrabold">{buyPrice}</span>
              </button>

              <div className="w-[120px] bg-background/80 backdrop-blur-xs border border-transparent rounded px-2 py-1 flex flex-col justify-center text-center text-[10px] text-muted">
                <span>Amount({symbol.replace("USDT", "")})</span>
                <span className="text-foreground font-bold">Enter amount</span>
              </div>

              <button
                type="button"
                onClick={() => onQuickTrade?.("SELL", sellPrice)}
                className="flex items-center gap-2 bg-trading-down hover:bg-trading-down/90 text-white px-3 py-1.5 rounded shadow-elevation-md transition-all active:scale-95 cursor-pointer"
              >
                <span className="text-[10px] font-bold uppercase">Market Sell</span>
                <span className="font-extrabold">{sellPrice}</span>
              </button>
            </div>

            {loading ? (
              <div className="flex h-[440px] items-center justify-center rounded-xl bg-background/20 font-mono text-xs text-muted">
                Syncing {symbol} market candles...
              </div>
            ) : chartViewMode === "CANDLE" ? (
              <CandlestickChart data={data} height={440} />
            ) : (
              /* Market Depth Visualizer Representation */
              <div className="h-[440px] flex flex-col items-center justify-center bg-background/20 rounded-xl p-6 text-center font-mono">
                <div className="w-full max-w-lg h-48 flex items-end justify-center gap-1 border-b border-transparent pb-1">
                  <div className="w-1/2 h-full bg-trading-up/20 border-t-2 border-trading-up rounded-tl flex items-center justify-center text-trading-up text-xs font-bold">
                    Buy Liquidity Depth (36%)
                  </div>
                  <div className="w-1/2 h-[80%] bg-trading-down/20 border-t-2 border-trading-down rounded-tr flex items-center justify-center text-trading-down text-xs font-bold">
                    Sell Liquidity Depth (64%)
                  </div>
                </div>
                <span className="text-xs text-muted mt-3">Live Orderbook Market Depth Visualization</span>
              </div>
            )}
          </>
        ) : activeTab === "FEED" ? (
          <div className="h-[440px] p-6 font-mono text-xs space-y-4 overflow-y-auto">
            <h4 className="font-heading font-bold text-sm text-foreground uppercase">{symbol} Live Feed & News</h4>
            <div className="p-3 bg-background/40 rounded border border-transparent space-y-1">
              <span className="text-[10px] text-primary font-bold">ANNOUNCEMENT</span>
              <p className="text-foreground">KuCoin Spot Liquidity Mining Rewards update for {symbol} trading pairs.</p>
              <span className="text-[10px] text-muted">10 mins ago</span>
            </div>
            <div className="p-3 bg-background/40 rounded border border-transparent space-y-1">
              <span className="text-[10px] text-trading-up font-bold">MARKET METRICS</span>
              <p className="text-foreground">24h Net inflow increases by +$14.2M across spot markets.</p>
              <span className="text-[10px] text-muted">42 mins ago</span>
            </div>
          </div>
        ) : (
          <div className="h-[440px] p-6 font-mono text-xs space-y-4 overflow-y-auto">
            <h4 className="font-heading font-bold text-sm text-foreground uppercase">{symbol} Asset Profile</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-background/40 rounded border border-transparent">
                <span className="text-muted text-[10px]">Market Cap</span>
                <p className="text-foreground font-bold text-sm mt-1">$1.26 Trillion</p>
              </div>
              <div className="p-3 bg-background/40 rounded border border-transparent">
                <span className="text-muted text-[10px]">Circulating Supply</span>
                <p className="text-foreground font-bold text-sm mt-1">19,730,000 BTC</p>
              </div>
              <div className="p-3 bg-background/40 rounded border border-transparent">
                <span className="text-muted text-[10px]">All-Time High</span>
                <p className="text-foreground font-bold text-sm mt-1">$73,750.07</p>
              </div>
              <div className="p-3 bg-background/40 rounded border border-transparent">
                <span className="text-muted text-[10px]">Issue Date</span>
                <p className="text-foreground font-bold text-sm mt-1">2009-01-03</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

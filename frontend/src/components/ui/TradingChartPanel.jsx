import React, { useState, useRef, useEffect } from "react";
import { Activity, BarChart3, CandlestickChart as CandlestickChartIcon, Waves, Sliders, Expand, Eye, Layers, ArrowLeftRight, ChevronDown } from "lucide-react";
import { Card, CardContent } from "./Card";
import CandlestickChart from "./CandlestickChart";
import UniversalCoinIcon from "../../lib/coinIcons";
import { cn, formatCompactNumber, formatCurrency, formatPercent } from "../../lib/utils";

export const DEFAULT_INTERVALS = ["15m", "1h", "4h", "1D", "1W"];

const POPULAR_COINS = [
  { symbol: "BTCUSDT", label: "BTC/USDT", base: "BTC" },
  { symbol: "ETHUSDT", label: "ETH/USDT", base: "ETH" },
  { symbol: "SOLUSDT", label: "SOL/USDT", base: "SOL" },
  { symbol: "BNBUSDT", label: "BNB/USDT", base: "BNB" },
  { symbol: "XRPUSDT", label: "XRP/USDT", base: "XRP" },
  { symbol: "ADAUSDT", label: "ADA/USDT", base: "ADA" },
  { symbol: "DOTUSDT", label: "DOT/USDT", base: "DOT" },
  { symbol: "ZECUSDT", label: "ZEC/USDT", base: "ZEC" },
  { symbol: "LINKUSDT", label: "LINK/USDT", base: "LINK" },
];

export function TradingChartPanel({
  symbol = "BTCUSDT",
  onSymbolChange,
  interval = "15m",
  onIntervalChange,
  loading,
  data = [],
  status,
  onQuickTrade
}) {
  const [activeTab, setActiveTab] = useState("CHART"); // CHART | FEED | COIN_INFO
  const [chartViewMode, setChartViewMode] = useState("CANDLE"); // CANDLE | DEPTH
  const [isCoinSelectorOpen, setIsCoinSelectorOpen] = useState(false);
  const coinDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (coinDropdownRef.current && !coinDropdownRef.current.contains(event.target)) {
        setIsCoinSelectorOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentPrice = data.length > 0 ? data[data.length - 1].close : 63812.7;
  const baseSymbol = symbol.replace("USDT", "").toUpperCase();
  const formattedSymbol = `${baseSymbol}/USDT`;

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
            {/* Coin Switcher Overlay Badge (Replaces Quick Market Buy/Sell overlay) */}
            <div className="absolute top-5 left-5 z-20" ref={coinDropdownRef}>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsCoinSelectorOpen(!isCoinSelectorOpen)}
                  className="flex items-center gap-2 bg-background/90 backdrop-blur-md border border-white/10 hover:border-primary/40 px-3 py-1.5 rounded-xl shadow-elevation-md transition-all text-xs font-mono group cursor-pointer"
                  title="Switch Trading Pair"
                >
                  <UniversalCoinIcon symbol={baseSymbol} size="w-5 h-5" />
                  <span className="font-bold text-foreground">{formattedSymbol}</span>
                  <span className="text-trading-up font-extrabold text-xs ml-1">
                    ${currentPrice.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
                  </span>
                  <div className="flex items-center gap-1 ml-1 text-muted group-hover:text-primary transition-colors">
                    <ArrowLeftRight size={13} />
                    <ChevronDown size={12} />
                  </div>
                </button>

                {isCoinSelectorOpen && (
                  <div className="absolute top-full left-0 mt-1.5 w-60 bg-background/95 backdrop-blur-md border border-white/10 rounded-xl shadow-xl z-50 p-2 font-mono text-xs animate-fade-in-fast">
                    <div className="text-[10px] font-bold uppercase text-muted px-2 py-1 border-b border-white/10 mb-1 flex items-center justify-between">
                      <span>Select Coin</span>
                      <ArrowLeftRight size={12} className="text-primary" />
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-0.5 scrollbar-none">
                      {POPULAR_COINS.map((c) => {
                        const isSelected = symbol.toUpperCase() === c.symbol.toUpperCase();
                        return (
                          <button
                            key={c.symbol}
                            type="button"
                            onClick={() => {
                              onSymbolChange?.(c.symbol);
                              setIsCoinSelectorOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-all cursor-pointer ${
                              isSelected
                                ? "bg-primary/20 text-primary font-bold shadow-xs"
                                : "hover:bg-white/10 text-foreground/80 hover:text-foreground"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <UniversalCoinIcon symbol={c.base} size="w-5 h-5" />
                              <span className="font-bold">{c.label}</span>
                            </div>
                            {isSelected && (
                              <span className="text-[9px] bg-primary/30 px-1.5 py-0.5 rounded text-primary font-bold uppercase">
                                Active
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
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

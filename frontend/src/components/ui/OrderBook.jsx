import React, { useState, useMemo } from "react";
import { formatCurrency } from "../../lib/utils";

export function OrderBook({ symbol = "BTCUSDT", currentPrice, onSelectPrice, recentTrades = [] }) {
  const [activeTab, setActiveTab] = useState("ORDER_BOOK"); // ORDER_BOOK | RECENT_TRADES
  const [bookMode, setBookMode] = useState("BOTH"); // BOTH | ASKS_ONLY | BIDS_ONLY
  const [precision, setPrecision] = useState("0.1");

  const baseAsset = useMemo(() => symbol.replace("USDT", "").toUpperCase(), [symbol]);

  // Generate realistic order book rows centered around currentPrice
  const data = useMemo(() => {
    const price = currentPrice || 63815.0;
    const spreads = [
      0.0001, 0.0002, 0.0003, 0.0004, 0.0005, 0.0006, 0.0007, 0.0008
    ];
    
    const count = bookMode === "BOTH" ? 7 : 14;
    const activeSpreads = spreads.slice(0, count);

    const asks = activeSpreads.map((spread, idx) => {
      const askPrice = price * (1 + spread);
      const size = (Math.sin(idx + 1) * 0.4 + 0.45).toFixed(6);
      const total = (Number(size) * askPrice).toFixed(6);
      return { price: askPrice, size, total, percentage: Math.min(100, Math.max(15, (idx + 1) * 12)) };
    }).reverse();

    const bids = activeSpreads.map((spread, idx) => {
      const bidPrice = price * (1 - spread);
      const size = (Math.cos(idx + 1) * 0.4 + 0.45).toFixed(6);
      const total = (Number(size) * bidPrice).toFixed(6);
      return { price: bidPrice, size, total, percentage: Math.min(100, Math.max(15, (idx + 1) * 12)) };
    });

    return { asks, bids };
  }, [currentPrice, bookMode]);

  const priceFormatted = (currentPrice || 63815.0).toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 2 });
  const usdPriceFormatted = ((currentPrice || 63815.0) * 0.9987).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="bg-background border border-transparent rounded-xl p-3 font-mono text-xs shadow-elevation-md h-full flex flex-col select-none">
      {/* Top Header Tabs & Mode Toolbar */}
      <div className="flex justify-between items-center border-b border-transparent pb-2 mb-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveTab("ORDER_BOOK")}
            className={`text-xs font-bold font-heading uppercase pb-0.5 border-b-2 transition-all ${
              activeTab === "ORDER_BOOK" ? "text-foreground border-primary" : "text-muted border-transparent hover:text-foreground"
            }`}
          >
            Order Book
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("RECENT_TRADES")}
            className={`text-xs font-bold font-heading uppercase pb-0.5 border-b-2 transition-all ${
              activeTab === "RECENT_TRADES" ? "text-foreground border-primary" : "text-muted border-transparent hover:text-foreground"
            }`}
          >
            Recent Trades
          </button>
        </div>

        {activeTab === "ORDER_BOOK" && (
          <div className="flex items-center gap-2">
            {/* View Mode Toggle Buttons */}
            <div className="flex items-center gap-1 bg-background/40 p-0.5 rounded border border-transparent">
              <button
                type="button"
                title="Default (Asks & Bids)"
                onClick={() => setBookMode("BOTH")}
                className={`p-1 rounded text-[9px] font-bold ${bookMode === "BOTH" ? "bg-background text-foreground shadow-sm" : "text-muted hover:text-foreground"}`}
              >
                <div className="w-3 h-3 flex flex-col justify-between">
                  <span className="w-full h-1 bg-trading-down rounded-xs" />
                  <span className="w-full h-1 bg-trading-up rounded-xs" />
                </div>
              </button>
              <button
                type="button"
                title="Asks Only"
                onClick={() => setBookMode("ASKS_ONLY")}
                className={`p-1 rounded text-[9px] font-bold ${bookMode === "ASKS_ONLY" ? "bg-background text-foreground shadow-sm" : "text-muted hover:text-foreground"}`}
              >
                <div className="w-3 h-3 flex flex-col justify-between">
                  <span className="w-full h-1 bg-trading-down rounded-xs" />
                  <span className="w-full h-1 bg-trading-down rounded-xs" />
                </div>
              </button>
              <button
                type="button"
                title="Bids Only"
                onClick={() => setBookMode("BIDS_ONLY")}
                className={`p-1 rounded text-[9px] font-bold ${bookMode === "BIDS_ONLY" ? "bg-background text-foreground shadow-sm" : "text-muted hover:text-foreground"}`}
              >
                <div className="w-3 h-3 flex flex-col justify-between">
                  <span className="w-full h-1 bg-trading-up rounded-xs" />
                  <span className="w-full h-1 bg-trading-up rounded-xs" />
                </div>
              </button>
            </div>

            {/* Precision Select Dropdown */}
            <select
              value={precision}
              onChange={(e) => setPrecision(e.target.value)}
              className="bg-background/50 border border-transparent text-[10px] text-foreground font-mono rounded px-1 py-0.5"
            >
              <option value="0.1">0.1</option>
              <option value="0.01">0.01</option>
              <option value="0.001">0.001</option>
              <option value="1">1</option>
            </select>
          </div>
        )}
      </div>

      {activeTab === "ORDER_BOOK" ? (
        <>
          {/* Table Column Headers */}
          <div className="grid grid-cols-3 text-muted text-[10px] uppercase font-semibold pb-1 border-b border-transparent mb-1 px-1">
            <span className="text-left">Price (USDT)</span>
            <span className="text-right">Amount ({baseAsset})</span>
            <span className="text-right">Total ({baseAsset})</span>
          </div>

          <div className="flex-grow flex flex-col justify-between space-y-1">
            {/* ASKS (SELL ORDERS - RED) */}
            {(bookMode === "BOTH" || bookMode === "ASKS_ONLY") && (
              <div className="space-y-0.5">
                {data.asks.map((ask, idx) => (
                  <div
                    key={idx}
                    onClick={() => onSelectPrice && onSelectPrice(ask.price)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSelectPrice && onSelectPrice(ask.price); }}
                    className="relative grid grid-cols-3 items-center h-5 text-[11px] hover:bg-background/80 cursor-pointer rounded px-1 group transition-colors"
                  >
                    <div
                      className="absolute right-0 top-0 bottom-0 bg-trading-down/10 group-hover:bg-trading-down/20 transition-all rounded-r"
                      style={{ width: `${ask.percentage}%` }}
                    />
                    <span className="text-trading-down font-bold relative z-10 text-left">
                      {ask.price.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-foreground relative z-10 text-right font-medium">{ask.size}</span>
                    <span className="text-muted relative z-10 text-right text-[10px]">{ask.total}</span>
                  </div>
                ))}
              </div>
            )}

            {/* CENTER MARK PRICE DISPLAY */}
            <div className="py-2 my-1 border-y border-transparent bg-background/30 rounded flex items-center justify-between px-2">
              <div className="flex items-baseline gap-2">
                <span
                  onClick={() => onSelectPrice && onSelectPrice(currentPrice)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSelectPrice && onSelectPrice(currentPrice); }}
                  className="text-base font-extrabold text-trading-up cursor-pointer hover:underline"
                >
                  {priceFormatted}
                </span>
                <span className="text-[10px] text-muted font-normal">
                  ≈ ${usdPriceFormatted} USD
                </span>
              </div>
              <span className="text-[10px] text-trading-up font-bold bg-trading-up/10 px-1.5 py-0.5 rounded">
                ↑ Live
              </span>
            </div>

            {/* BIDS (BUY ORDERS - GREEN) */}
            {(bookMode === "BOTH" || bookMode === "BIDS_ONLY") && (
              <div className="space-y-0.5">
                {data.bids.map((bid, idx) => (
                  <div
                    key={idx}
                    onClick={() => onSelectPrice && onSelectPrice(bid.price)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSelectPrice && onSelectPrice(bid.price); }}
                    className="relative grid grid-cols-3 items-center h-5 text-[11px] hover:bg-background/80 cursor-pointer rounded px-1 group transition-colors"
                  >
                    <div
                      className="absolute right-0 top-0 bottom-0 bg-trading-up/10 group-hover:bg-trading-up/20 transition-all rounded-r"
                      style={{ width: `${bid.percentage}%` }}
                    />
                    <span className="text-trading-up font-bold relative z-10 text-left">
                      {bid.price.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-foreground relative z-10 text-right font-medium">{bid.size}</span>
                    <span className="text-muted relative z-10 text-right text-[10px]">{bid.total}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* BOTTOM VISUAL DEPTH PERCENTAGE BAR */}
          <div className="mt-2 pt-2 border-t border-transparent flex items-center justify-between text-[10px] font-bold">
            <span className="text-trading-up flex items-center gap-1">
              <span className="px-1 bg-trading-up/10 rounded">B</span> 36%
            </span>
            <div className="flex-1 mx-2 h-1.5 bg-background rounded-full overflow-hidden flex">
              <div className="bg-trading-up h-full" style={{ width: "36%" }} />
              <div className="bg-trading-down h-full" style={{ width: "64%" }} />
            </div>
            <span className="text-trading-down flex items-center gap-1">
              64% <span className="px-1 bg-trading-down/10 rounded">S</span>
            </span>
          </div>
        </>
      ) : (
        /* RECENT TRADES TAB VIEW */
        <div className="flex-1 flex flex-col">
          <div className="grid grid-cols-3 text-muted text-[10px] uppercase font-semibold pb-1 border-b border-transparent mb-1 px-1">
            <span className="text-left">Price (USDT)</span>
            <span className="text-right">Amount ({baseAsset})</span>
            <span className="text-right">Time</span>
          </div>
          <div className="flex-1 space-y-1">
            {recentTrades.length === 0 ? (
              <div className="py-8 text-center text-muted text-[10px]">No recent market ticks</div>
            ) : (
              recentTrades.map((t) => (
                <div key={t.id} className="grid grid-cols-3 items-center h-5 px-1 hover:bg-background/40 rounded text-[11px]">
                  <span className={`font-bold ${t.side === "BUY" ? "text-trading-up" : "text-trading-down"}`}>
                    {t.price ? t.price.toFixed(2) : priceFormatted}
                  </span>
                  <span className="text-foreground text-right font-medium">{t.amount}</span>
                  <span className="text-muted text-right text-[10px]">{t.time}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

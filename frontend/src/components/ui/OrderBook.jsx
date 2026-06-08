import React, { useMemo } from "react";
import { formatCurrency } from "../../lib/utils";

export function OrderBook({ symbol, currentPrice, onSelectPrice, limit = 4 }) {
  // Generate visual mock bids/asks centered around currentPrice
  const data = useMemo(() => {
    const price = currentPrice || 43250.5;
    const spreads = [0.0005, 0.0012, 0.0018, 0.0025, 0.0032].slice(0, limit);
    
    const asks = spreads.map((spread, idx) => {
      const askPrice = price * (1 + spread);
      const size = (Math.sin(idx + 1) * 0.8 + 1.2).toFixed(3);
      const total = (Number(size) * askPrice).toFixed(2);
      return { price: askPrice, size, total, percentage: (idx + 1) * 15 };
    }).reverse();

    const bids = spreads.map((spread, idx) => {
      const bidPrice = price * (1 - spread);
      const size = (Math.cos(idx + 1) * 0.8 + 1.2).toFixed(3);
      const total = (Number(size) * bidPrice).toFixed(2);
      return { price: bidPrice, size, total, percentage: (idx + 1) * 15 };
    });

    return { asks, bids };
  }, [currentPrice]);

  return (
    <div className="bg-surface-card-dark border border-hairline-on-dark rounded-xl p-4 font-mono text-xs shadow-elevation-md h-full flex flex-col justify-between">
      <div className="flex justify-between items-center border-b border-hairline-on-dark pb-2 mb-3">
        <h4 className="font-heading text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-trading-up animate-pulse"></span>
          Order Book
        </h4>
        <span className="text-[10px] text-muted">{symbol}</span>
      </div>

      <div className="flex justify-between text-muted text-[10px] uppercase font-semibold pb-1 border-b border-white/[0.03] mb-1">
        <span>Price(USDT)</span>
        <span>Size</span>
        <span className="text-right">Total</span>
      </div>

      {/* Asks (Sell Orders - Red) */}
      <div className="space-y-0.5">
        {data.asks.map((ask, idx) => (
          <div
            key={idx}
            onClick={() => onSelectPrice && onSelectPrice(ask.price)}
            className="relative flex justify-between items-center h-6 hover:bg-white/[0.03] cursor-pointer rounded px-1 group transition-colors"
          >
            <div
              className="absolute right-0 top-0 bottom-0 bg-trading-down/5 group-hover:bg-trading-down/10 transition-colors"
              style={{ width: `${ask.percentage}%` }}
            />
            <span className="text-trading-down font-bold relative z-10">{formatCurrency(ask.price)}</span>
            <span className="text-body relative z-10">{ask.size}</span>
            <span className="text-muted relative z-10 text-right">{ask.total}</span>
          </div>
        ))}
      </div>

      {/* Current Spread/Mark Price Banner */}
      <div className="border-y border-hairline-on-dark py-2.5 my-2 text-center bg-canvas-dark/30 rounded">
        <span className="text-[10px] text-muted uppercase tracking-wider block">Spread / Mark Price</span>
        <span
          onClick={() => onSelectPrice && onSelectPrice(currentPrice)}
          className="text-lg font-bold text-trading-up cursor-pointer hover:underline"
        >
          {formatCurrency(currentPrice || 0)}
        </span>
      </div>

      {/* Bids (Buy Orders - Green) */}
      <div className="space-y-0.5">
        {data.bids.map((bid, idx) => (
          <div
            key={idx}
            onClick={() => onSelectPrice && onSelectPrice(bid.price)}
            className="relative flex justify-between items-center h-6 hover:bg-white/[0.03] cursor-pointer rounded px-1 group transition-colors"
          >
            <div
              className="absolute right-0 top-0 bottom-0 bg-trading-up/5 group-hover:bg-trading-up/10 transition-colors"
              style={{ width: `${bid.percentage}%` }}
            />
            <span className="text-trading-up font-bold relative z-10">{formatCurrency(bid.price)}</span>
            <span className="text-body relative z-10">{bid.size}</span>
            <span className="text-muted relative z-10 text-right">{bid.total}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

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
    <div className="bg-background border border-transparent rounded-xl p-4 font-mono text-xs shadow-elevation-md h-full flex flex-col">
      <div className="flex justify-between items-center border-b border-transparent pb-2 mb-3">
        <h4 className="font-heading text-xs font-bold text-foreground uppercase flex items-center gap-1.5">
          Order Book
        </h4>
        <span className="text-[10px] text-muted">{symbol}</span>
      </div>

      <div className="grid grid-cols-3 text-muted text-[10px] uppercase font-semibold pb-1 border-b border-transparent mb-1">
        <span className="text-left">Price(USDT)</span>
        <span className="text-center">Size</span>
        <span className="text-right">Total</span>
      </div>

      {/* Centering container for book data */}
      <div className="flex-grow flex flex-col justify-center space-y-1.5">
        {/* Asks (Sell Orders - Red) */}
        <div aria-label="Ask orders (sell orders)" className="space-y-0.5">
          {data.asks.map((ask, idx) => (
            <div
              key={idx}
              onClick={() => onSelectPrice && onSelectPrice(ask.price)}
              aria-label={`Sell ${formatCurrency(ask.price)}, size ${ask.size}`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSelectPrice && onSelectPrice(ask.price); }}
              className="relative grid grid-cols-3 items-center h-6 min-h-[32px] hover:bg-background cursor-pointer rounded px-1 group transition-colors"
            >
              <div
                className="absolute right-0 top-0 bottom-0 bg-trading-down/5 group-hover:bg-trading-down/10 transition-colors"
                style={{ width: `${ask.percentage}%` }}
              />
              <span className="text-trading-down font-bold relative z-10 text-left">{formatCurrency(ask.price)}</span>
              <span className="text-foreground relative z-10 text-center">{ask.size}</span>
              <span className="text-muted relative z-10 text-right">{ask.total}</span>
            </div>
          ))}
        </div>

        {/* Current Spread/Mark Price Banner */}
        <div className="border-y border-transparent py-2 my-1 text-center bg-background/30 rounded">
          <span className="text-[10px] text-muted uppercase block">Spread / Mark Price</span>
          <span
            onClick={() => onSelectPrice && onSelectPrice(currentPrice)}
            role="button"
            tabIndex={0}
            aria-label={`Select mark price ${formatCurrency(currentPrice || 0)}`}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSelectPrice && onSelectPrice(currentPrice); }}
            className="text-lg font-bold text-trading-up cursor-pointer hover:underline"
          >
            {formatCurrency(currentPrice || 0)}
          </span>
        </div>

        {/* Bids (Buy Orders - Green) */}
        <div aria-label="Bid orders (buy orders)" className="space-y-0.5">
          {data.bids.map((bid, idx) => (
            <div
              key={idx}
              onClick={() => onSelectPrice && onSelectPrice(bid.price)}
              aria-label={`Buy ${formatCurrency(bid.price)}, size ${bid.size}`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSelectPrice && onSelectPrice(bid.price); }}
              className="relative grid grid-cols-3 items-center h-6 min-h-[32px] hover:bg-background cursor-pointer rounded px-1 group transition-colors"
            >
              <div
                className="absolute right-0 top-0 bottom-0 bg-trading-up/5 group-hover:bg-trading-up/10 transition-colors"
                style={{ width: `${bid.percentage}%` }}
              />
              <span className="text-trading-up font-bold relative z-10 text-left">{formatCurrency(bid.price)}</span>
              <span className="text-foreground relative z-10 text-center">{bid.size}</span>
              <span className="text-muted relative z-10 text-right">{bid.total}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

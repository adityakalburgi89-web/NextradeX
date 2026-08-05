import React from "react";
import { Link } from "react-router-dom";
import UniversalCoinIcon from "../../lib/coinIcons";

/**
 * Reusable MarketRow Component
 * Displays real cryptocurrency coin logo alongside trading symbol, contract type, price, and % change.
 */
export default function MarketRow({ row, onClick }) {
  const isPositive = row.positive ?? (row.change ? !row.change.startsWith("-") : true);
  const route = row.type === "Perp" ? "/trade/futures" : "/trade/spot";

  return (
    <Link
      to={route}
      onClick={onClick}
      className="crypto-market-row"
      role="menuitem"
    >
      <div className="crypto-market-row-left">
        {/* Real Universal Coin Logo */}
        <UniversalCoinIcon symbol={row.symbol} size="w-5 h-5" />

        <span className="crypto-market-row-symbol">{row.symbol}</span>
        {row.type && <span className="crypto-market-row-type">{row.type}</span>}
      </div>
      <div className="crypto-market-row-right">
        <span className="crypto-market-row-price">{row.price}</span>
        <span
          className={`crypto-market-row-change ${
            isPositive ? "is-positive" : "is-negative"
          }`}
        >
          {row.change}
        </span>
      </div>
    </Link>
  );
}

import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function TradeDropdown({ theme }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isTradeActive = location.pathname.startsWith("/trade");

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <span className={`nav-link cursor-pointer hover:text-primary transition-colors duration-200 ${isTradeActive ? "text-primary active" : ""}`}>
        Trade
      </span>
      {open && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 z-50 animate-fade-in-fast">
          <div className={`rounded-xl shadow-elevation-lg py-2 min-w-[160px] border ${
            theme === 'dark' 
              ? 'bg-background border-transparent text-foreground' 
              : 'bg-background border-transparent text-foreground'
          }`}>
            <Link
              to="/trade/spot"
              className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold hover:bg-background hover:text-primary transition-colors"
              onClick={() => setOpen(false)}
            >
              Spot
            </Link>
            <Link
              to="/trade/futures"
              className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold hover:bg-background hover:text-primary transition-colors"
              onClick={() => setOpen(false)}
            >
              Futures
            </Link>
            <Link
              to="/trade/margin"
              className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold hover:bg-background hover:text-primary transition-colors"
              onClick={() => setOpen(false)}
            >
              Margin
            </Link>
            <Link
              to="/trade/options"
              className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold hover:bg-background hover:text-primary transition-colors"
              onClick={() => setOpen(false)}
            >
              Options
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

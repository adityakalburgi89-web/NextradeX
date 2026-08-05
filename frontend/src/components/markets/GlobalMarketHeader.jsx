import React from "react";
import FearGreedGauge from "./FearGreedGauge";
import { formatCurrency, formatPercent } from "../../lib/utils";

/**
 * Global Market Telemetry Header Widget
 * Displays Total Market Cap, 24h Volume, Dominance, Gas Fees, and Fear & Greed Index Gauge.
 */
export function GlobalMarketHeader({
  globalStats = {
    totalMarketCap: 2480000000000,
    marketCapChange24h: 2.41,
    volume24h: 89600000000,
    btcDominance: 56.2,
    ethDominance: 15.4,
    ethGasGwei: 18,
    fearGreedScore: 74,
    fearGreedLabel: "Greed",
    btcPrice: 63627.4,
    btcChange: 1.61,
  },
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-openrunde mb-8">
      {/* Left 2 Columns: 4 Key Metric Cards */}
      <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card 1: Total Market Cap */}
        <div className="bg-white border border-fog rounded-2xl p-5 shadow-sm hover:border-lavender transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-ash uppercase tracking-wider">Total Market Cap</span>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                (globalStats.marketCapChange24h ?? 2.41) >= 0 ? "bg-mint-wash text-mint" : "bg-red-50 text-ember"
              }`}
            >
              {formatPercent(globalStats.marketCapChange24h ?? 2.41)}
            </span>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-bold text-carbon tracking-tight">
              {formatCurrency(globalStats.totalMarketCap ?? 2480000000000, { notation: "compact" })}
            </h2>
            <p className="text-xs text-graphite mt-1">
              Global market valuation across all listed cryptocurrencies.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-fog flex items-center justify-between text-xs text-ash">
            <span>24H Change</span>
            <span className={(globalStats.marketCapChange24h ?? 2.41) >= 0 ? "text-mint font-medium" : "text-ember font-medium"}>
              {(globalStats.marketCapChange24h ?? 2.41) >= 0 ? "+" : ""}
              {formatCurrency(((globalStats.totalMarketCap ?? 2480000000000) * ((globalStats.marketCapChange24h ?? 2.41) / 100)), { notation: "compact" })}
            </span>
          </div>
        </div>

        {/* Card 2: 24h Trading Volume */}
        <div className="bg-white border border-fog rounded-2xl p-5 shadow-sm hover:border-lavender transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-ash uppercase tracking-wider">24h Trading Volume</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-mist text-graphite">24H Spot & Perps</span>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-bold text-carbon tracking-tight">
              {formatCurrency(globalStats.volume24h ?? 89600000000, { notation: "compact" })}
            </h2>
            <p className="text-xs text-graphite mt-1">
              Total transaction volume registered across exchanges in the last 24 hours.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-fog flex items-center justify-between text-xs text-ash">
            <span>Market Activity</span>
            <span className="text-carbon font-medium">High Liquidity</span>
          </div>
        </div>

        {/* Card 3: Market Dominance */}
        <div className="bg-white border border-fog rounded-2xl p-5 shadow-sm hover:border-lavender transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-ash uppercase tracking-wider">Market Dominance</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-mist text-graphite">Top Assets</span>
          </div>
          <div className="mt-3 flex items-baseline gap-4">
            <div>
              <span className="text-xs text-ash block">BTC</span>
              <span className="text-xl font-bold text-carbon">{globalStats.btcDominance ?? 56.2}%</span>
            </div>
            <div className="h-6 w-[1px] bg-fog" />
            <div>
              <span className="text-xs text-ash block">ETH</span>
              <span className="text-xl font-bold text-carbon">{globalStats.ethDominance ?? 15.4}%</span>
            </div>
          </div>
          {/* Progress bar ratio */}
          <div className="mt-3 h-2 w-full bg-mist rounded-full overflow-hidden flex">
            <div style={{ width: `${globalStats.btcDominance ?? 56.2}%` }} className="bg-amber h-full" title="BTC Dominance" />
            <div style={{ width: `${globalStats.ethDominance ?? 15.4}%` }} className="bg-sky h-full" title="ETH Dominance" />
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-ash">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber inline-block" /> Bitcoin</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky inline-block" /> Ethereum</span>
            <span>Others ({(Math.max(0, 100 - (globalStats.btcDominance ?? 56.2) - (globalStats.ethDominance ?? 15.4))).toFixed(1)}%)</span>
          </div>
        </div>

        {/* Card 4: ETH Gas & Network Stats */}
        <div className="bg-white border border-fog rounded-2xl p-5 shadow-sm hover:border-lavender transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-ash uppercase tracking-wider">ETH Gas Tracker</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-mint-wash text-mint">Fast</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <h2 className="text-2xl font-bold text-carbon tracking-tight">{globalStats.ethGasGwei ?? 18} Gwei</h2>
            <span className="text-xs text-ash">≈ $0.42 / transfer</span>
          </div>
          <p className="text-xs text-graphite mt-1">
            Real-time Ethereum mainnet base gas fee estimation.
          </p>
          <div className="mt-4 pt-3 border-t border-fog flex items-center justify-between text-xs text-ash">
            <span>Network Congestion</span>
            <span className="text-mint font-medium">Optimal</span>
          </div>
        </div>
      </div>

      {/* Right Column: Sleek Reference Dark Fear & Greed Card */}
      <div className="lg:col-span-1">
        <FearGreedGauge
          score={globalStats.fearGreedScore ?? 74}
          label={globalStats.fearGreedLabel ?? "Greed"}
          btcPrice={globalStats.btcPrice ?? 63627.4}
          btcChange={globalStats.btcChange ?? 1.61}
          totalMarketCap={globalStats.totalMarketCap ?? 2480000000000}
          marketCapChange={globalStats.marketCapChange24h ?? 2.41}
          volume24h={globalStats.volume24h ?? 89600000000}
          volumeChange={-4.2}
        />
      </div>
    </div>
  );
}

export default GlobalMarketHeader;
